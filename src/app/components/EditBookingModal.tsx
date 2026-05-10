import React, { useState, useEffect } from 'react';
import { X, Download, Calendar } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { Booking } from '../types';
import { differenceInDays, format } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ReceiptContent } from './ReceiptContent';
import logoImage from '../../imports/555031729_122102984955033682_4637142757421852213_n.jpg';

interface EditBookingModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdate: () => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({ booking, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    client_name: booking.client_name,
    phone: booking.phone,
    cnic: booking.cnic,
    guests: booking.guests,
    check_in: booking.check_in,
    check_out: booking.check_out,
    nights: booking.nights,
    price_per_night: booking.price_per_night,
    discount: booking.discount,
    extra_charges: booking.extra_charges,
    total_amount: booking.total_amount,
    cash_amount: booking.cash_amount || 0,
    online_amount: booking.online_amount || 0,
    advance_payment: booking.advance_payment,
    balance: booking.balance,
    payment_method: booking.payment_method || 'cash',
    notes: booking.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>('');

  useEffect(() => {
    const loadLogoAsBase64 = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            setLogoBase64(dataURL);
            console.log('Logo converted to base64 successfully');
          }
        } catch (error) {
          console.error('Error converting logo to base64:', error);
          setLogoBase64(logoImage);
        }
      };
      img.onerror = (error) => {
        console.error('Failed to load logo image:', error);
        setLogoBase64(logoImage);
      };
      img.src = logoImage;
    };
    loadLogoAsBase64();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate dates
      if (formData.nights === 0) {
        throw new Error('Check-out date must be after check-in date');
      }

      // Calculate advance from cash + online
      const calculatedAdvance = formData.cash_amount + formData.online_amount;
      const calculatedBalance = formData.total_amount - calculatedAdvance;

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          client_name: formData.client_name,
          phone: formData.phone,
          cnic: formData.cnic,
          guests: formData.guests,
          check_in: formData.check_in,
          check_out: formData.check_out,
          nights: formData.nights,
          total_amount: formData.total_amount,
          cash_amount: formData.cash_amount,
          online_amount: formData.online_amount,
          advance_payment: calculatedAdvance,
          balance: calculatedBalance,
          payment_method: formData.payment_method,
          notes: formData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      onUpdate();
      onClose();
    } catch (err: any) {
      console.error('Error updating booking:', err);
      setError(err.message || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field: 'check_in' | 'check_out', value: string) => {
    const newData = { ...formData, [field]: value };

    // Recalculate nights
    if (newData.check_in && newData.check_out) {
      const checkIn = new Date(newData.check_in);
      const checkOut = new Date(newData.check_out);
      const nights = Math.max(0, differenceInDays(checkOut, checkIn));
      newData.nights = nights;

      // Recalculate total amount
      const subtotal = nights * newData.price_per_night;
      const total = subtotal - newData.discount + newData.extra_charges;
      newData.total_amount = total;

      // Recalculate balance
      const advance = newData.cash_amount + newData.online_amount;
      newData.balance = total - advance;
    }

    setFormData(newData);
  };

  const handlePaymentUpdate = (field: 'cash_amount' | 'online_amount', value: number) => {
    const newData = { ...formData };
    newData[field] = value;

    // Auto-calculate advance and balance
    const totalAdvance = newData.cash_amount + newData.online_amount;
    newData.advance_payment = totalAdvance;
    newData.balance = formData.total_amount - totalAdvance;

    setFormData(newData);
  };

  const downloadReceipt = async () => {
    const receiptElement = document.getElementById('receipt-preview');
    if (!receiptElement) return;

    try {
      // Wait for images to load
      const images = receiptElement.getElementsByTagName('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 200));

      // Capture the element as canvas with high quality
      const canvas = await html2canvas(receiptElement, {
        scale: 3,
        useCORS: false,
        allowTaint: true,
        logging: true,
        backgroundColor: '#ffffff',
        windowWidth: receiptElement.scrollWidth,
        windowHeight: receiptElement.scrollHeight,
        imageTimeout: 0,
      });

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10; // 10mm margins on all sides

      // Available space after margins
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);

      // Calculate image dimensions in mm (assuming 96 DPI)
      const imgWidthMM = (canvas.width / 96) * 25.4;
      const imgHeightMM = (canvas.height / 96) * 25.4;

      // Calculate scale to fit within available space while maintaining aspect ratio
      const scaleX = availableWidth / imgWidthMM;
      const scaleY = availableHeight / imgHeightMM;
      const scale = Math.min(scaleX, scaleY);

      // Final dimensions maintaining aspect ratio
      const finalWidth = imgWidthMM * scale;
      const finalHeight = imgHeightMM * scale;

      // Center the image on the page
      const xOffset = margin + (availableWidth - finalWidth) / 2;
      const yOffset = margin + (availableHeight - finalHeight) / 2;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Add image maintaining aspect ratio
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`Maison-Royale-Receipt-${booking.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl text-yellow-500 font-bold">Edit Booking</h2>
              <p className="text-neutral-400 text-sm mt-1">{booking.apartment_name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-400" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowReceipt(!showReceipt)}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg"
          >
            <Download className="w-5 h-5" />
            {showReceipt ? 'Hide Receipt Preview' : 'View & Download Receipt'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg text-amber-400 font-semibold">Client Information</h3>

            <div>
              <label className="block text-neutral-300 mb-2 text-sm">Client Name *</label>
              <input
                type="text"
                required
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 mb-2 text-sm">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-2 text-sm">CNIC</label>
                <input
                  type="text"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 mb-2 text-sm">Number of Guests</label>
              <input
                type="number"
                min="1"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Booking Dates */}
          <div className="space-y-4">
            <h3 className="text-lg text-amber-400 font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Booking Dates
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 mb-2 text-sm">Check-In Date *</label>
                <input
                  type="date"
                  required
                  value={formData.check_in}
                  onChange={(e) => handleDateChange('check_in', e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950/50 border-2 border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-2 text-sm">Check-Out Date *</label>
                <input
                  type="date"
                  required
                  value={formData.check_out}
                  onChange={(e) => handleDateChange('check_out', e.target.value)}
                  min={formData.check_in}
                  className="w-full px-4 py-3 bg-neutral-950/50 border-2 border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {formData.nights > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-emerald-400 text-sm flex items-center gap-2">
                  <span className="text-base">✓</span>
                  <span className="font-semibold">{formData.nights} night{formData.nights !== 1 ? 's' : ''}</span> selected
                  <span className="text-neutral-400">
                    ({format(new Date(formData.check_in), 'MMM dd')} - {format(new Date(formData.check_out), 'MMM dd')})
                  </span>
                </p>
              </div>
            )}

            <div className="bg-neutral-950/50 border border-neutral-700/50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Updated Total Amount:</span>
                <span className="text-2xl text-amber-400 font-bold">Rs {formData.total_amount.toLocaleString()}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                {formData.nights} nights × Rs {formData.price_per_night.toLocaleString()}
                {formData.discount > 0 && ` - Rs ${formData.discount.toLocaleString()} discount`}
                {formData.extra_charges > 0 && ` + Rs ${formData.extra_charges.toLocaleString()} extras`}
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg text-amber-400 font-semibold">Payment Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 mb-2 text-sm">💵 Cash Amount</label>
                <input
                  type="number"
                  min="0"
                  max={booking.total_amount}
                  value={formData.cash_amount}
                  onChange={(e) => handlePaymentUpdate('cash_amount', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-neutral-950/50 border-2 border-green-500/50 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                />
                <p className="text-green-500 text-sm mt-2">Cash: Rs {formData.cash_amount.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-neutral-300 mb-2 text-sm">💳 Online Amount</label>
                <input
                  type="number"
                  min="0"
                  max={booking.total_amount}
                  value={formData.online_amount}
                  onChange={(e) => handlePaymentUpdate('online_amount', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-neutral-950/50 border-2 border-blue-500/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-blue-500 text-sm mt-2">Online: Rs {formData.online_amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-neutral-800/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Advance Paid:</span>
                <span className="text-white font-bold">Rs {formData.advance_payment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Balance Remaining:</span>
                <span className="text-red-400 font-bold">Rs {formData.balance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-neutral-300 mb-2 text-sm">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
              placeholder="Add any notes or special requests..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:shadow-lg hover:shadow-yellow-500/30 text-neutral-900 rounded-xl transition-all disabled:opacity-50 font-bold"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Receipt Preview */}
        {showReceipt && (
          <div className="border-t-4 border-amber-500">
            <div className="p-6 bg-neutral-950">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl text-amber-400 font-bold">Receipt Preview</h3>
                <button
                  onClick={downloadReceipt}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>

              {/* Receipt Content */}
              <div id="receipt-preview" style={{ backgroundColor: '#ffffff', color: '#000000', maxWidth: '800px', margin: '0 auto' }}>
                <ReceiptContent
                  booking={{
                    ...booking,
                    ...formData,
                  }}
                  logoSrc={logoBase64}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditBookingModal;

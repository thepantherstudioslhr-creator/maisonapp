import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Booking, APARTMENTS } from '../types';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import logoImage from '../../imports/555031729_122102984955033682_4637142757421852213_n.jpg';

interface ReceiptGeneratorProps {
  bookingId: string;
  onClose: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ bookingId, onClose }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) throw error;

      const apartment = APARTMENTS.find((a) => a.id === data.apartment_id);
      setBooking({
        ...data,
        apartment_name: apartment?.name,
      });
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!booking) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(139, 0, 0);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 215, 0);
    doc.setFontSize(24);
    doc.text('MAISON ROYALE', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('RESIDENCY', pageWidth / 2, 30, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text('Booking Receipt', pageWidth / 2, 55, { align: 'center' });

    doc.setFontSize(10);
    let y = 75;

    doc.text(`Booking ID: ${booking.id.substring(0, 8).toUpperCase()}`, 20, y);
    y += 7;
    doc.text(`Date: ${format(new Date(booking.created_at), 'MMM dd, yyyy')}`, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.text('Client Details:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Name: ${booking.client_name}`, 25, y);
    y += 7;
    doc.text(`Phone: ${booking.phone}`, 25, y);
    y += 7;
    doc.text(`CNIC: ${booking.cnic}`, 25, y);
    y += 7;
    doc.text(`Guests: ${booking.guests}`, 25, y);
    y += 15;

    doc.setFontSize(12);
    doc.text('Booking Details:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Apartment: ${booking.apartment_name}`, 25, y);
    y += 7;
    doc.text(`Check-In: ${format(new Date(booking.check_in), 'MMM dd, yyyy')}`, 25, y);
    y += 7;
    doc.text(`Check-Out: ${format(new Date(booking.check_out), 'MMM dd, yyyy')}`, 25, y);
    y += 7;
    doc.text(`Total Nights: ${booking.nights}`, 25, y);
    y += 15;

    doc.setFontSize(12);
    doc.text('Payment Details:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Price per Night: Rs ${booking.price_per_night.toLocaleString()}`, 25, y);
    y += 7;
    doc.text(`Subtotal: Rs ${(booking.nights * booking.price_per_night).toLocaleString()}`, 25, y);
    y += 7;
    doc.text(`Discount: Rs ${booking.discount.toLocaleString()}`, 25, y);
    y += 7;
    doc.text(`Extra Charges: Rs ${booking.extra_charges.toLocaleString()}`, 25, y);
    y += 7;
    doc.setFontSize(12);
    doc.text(`Total Amount: Rs ${booking.total_amount.toLocaleString()}`, 25, y);
    y += 7;
    doc.text(`Paid: Rs ${booking.advance_payment.toLocaleString()}`, 25, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Payment Method: ${booking.payment_method === 'cash' ? 'Cash' : 'Online'}`, 25, y);
    y += 7;
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text(`Balance: Rs ${booking.balance.toLocaleString()}`, 25, y);

    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.text('Thank you for choosing Maison Royale Residency', pageWidth / 2, 280, {
      align: 'center',
    });

    doc.save(`Receipt-${booking.id.substring(0, 8)}.pdf`);
  };

  const shareWhatsApp = () => {
    if (!booking) return;

    const message = `*MAISON ROYALE RESIDENCY*
*Booking Confirmation*

Booking ID: ${booking.id.substring(0, 8).toUpperCase()}
Client: ${booking.client_name}
Apartment: ${booking.apartment_name}
Check-In: ${format(new Date(booking.check_in), 'MMM dd, yyyy')}
Check-Out: ${format(new Date(booking.check_out), 'MMM dd, yyyy')}
Nights: ${booking.nights}

Total Amount: Rs ${booking.total_amount.toLocaleString()}
Paid: Rs ${booking.advance_payment.toLocaleString()}
Payment Method: ${booking.payment_method === 'cash' ? '💵 Cash' : '💳 Online'}
Balance: Rs ${booking.balance.toLocaleString()}

Thank you for booking with us!`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-neutral-900 border border-yellow-600/30 rounded-lg p-8">
          <p className="text-white">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-neutral-900 border border-yellow-600/30 rounded-lg max-w-2xl w-full my-8">
        {/* Success Header */}
        <div className="bg-green-600 p-6 rounded-t-lg">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl text-white">Booking Confirmed!</h2>
              <p className="text-green-100">Receipt generated successfully</p>
            </div>
          </div>
        </div>

        {/* Receipt */}
        <div className="p-8 bg-white text-black">
          {/* Logo Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-yellow-600">
            <img
              src={logoImage}
              alt="Maison Royale"
              className="w-32 h-32 mx-auto mb-4"
            />
            <h1 className="text-3xl text-yellow-700 mb-1">MAISON ROYALE RESIDENCY</h1>
            <p className="text-neutral-600">Booking Receipt</p>
          </div>

          {/* Booking Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Booking ID</p>
              <p className="font-semibold">{booking.id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-600 mb-1">Date</p>
              <p className="font-semibold">{format(new Date(booking.created_at), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          {/* Client Details */}
          <div className="mb-8">
            <h3 className="text-yellow-700 mb-3">Client Details</h3>
            <div className="bg-neutral-50 p-4 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Name</p>
                  <p className="font-semibold">{booking.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Phone</p>
                  <p className="font-semibold">{booking.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">CNIC</p>
                  <p className="font-semibold">{booking.cnic}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Guests</p>
                  <p className="font-semibold">{booking.guests}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-8">
            <h3 className="text-yellow-700 mb-3">Booking Details</h3>
            <div className="bg-neutral-50 p-4 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Apartment</p>
                  <p className="font-semibold">{booking.apartment_name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Total Nights</p>
                  <p className="font-semibold">{booking.nights}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Check-In</p>
                  <p className="font-semibold">{format(new Date(booking.check_in), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Check-Out</p>
                  <p className="font-semibold">{format(new Date(booking.check_out), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-yellow-50 border-2 border-yellow-600 p-6 rounded">
            <h3 className="text-yellow-700 mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">
                  Price per Night × {booking.nights} nights
                </span>
                <span>Rs {(booking.nights * booking.price_per_night).toLocaleString()}</span>
              </div>
              {booking.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount</span>
                  <span>- Rs {booking.discount.toLocaleString()}</span>
                </div>
              )}
              {booking.extra_charges > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Extra Charges</span>
                  <span>+ Rs {booking.extra_charges.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t-2 border-yellow-600 pt-2 mt-2 flex justify-between text-lg">
                <span className="font-semibold">Total Amount</span>
                <span className="font-semibold">Rs {booking.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Paid</span>
                <span>Rs {booking.advance_payment.toLocaleString()}</span>
              </div>
              {booking.payment_method && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Payment Method</span>
                  <span className={booking.payment_method === 'cash' ? 'text-emerald-600 font-semibold' : 'text-blue-600 font-semibold'}>
                    {booking.payment_method === 'cash' ? '💵 Cash' : '💳 Online'}
                  </span>
                </div>
              )}
              <div className="border-t-2 border-yellow-600 pt-2 mt-2 flex justify-between text-xl">
                <span className="font-semibold text-red-600">Balance Due</span>
                <span className="font-semibold text-red-600">Rs {booking.balance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-neutral-500 text-sm mt-8">
            Thank you for choosing Maison Royale Residency
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 bg-neutral-900 border-t border-neutral-800 rounded-b-lg">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={downloadPDF}
              className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download PDF
            </button>
            <button
              onClick={shareWhatsApp}
              className="bg-green-600 hover:bg-green-500 text-white py-3 rounded transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Share WhatsApp
            </button>
            <button
              onClick={onClose}
              className="bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
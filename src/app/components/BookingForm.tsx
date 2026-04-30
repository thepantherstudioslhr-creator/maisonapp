import React, { useState } from 'react';
import { Apartment } from '../types';
import { supabase } from '../utils/supabase';
import { differenceInDays, format, addDays } from 'date-fns';
import ReceiptGenerator from './ReceiptGenerator';
import { isOnline, saveBookingOffline } from '../utils/offlineSync';
import { trackGuest, logAudit } from '../utils/guestTracking';
import { useAuth } from '../contexts/AuthContext';

interface BookingFormProps {
  apartment: Apartment;
  onClose: () => void;
  onComplete: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ apartment, onClose, onComplete }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    client_name: '',
    phone: '',
    cnic: '',
    guests: 1,
    check_in: '',
    check_out: '',
    price_per_night: apartment.price_per_night,
    discount: 0,
    extra_charges: 0,
    advance_payment: 0,
    payment_method: 'cash',
    notes: '',
    special_requests: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const calculateNights = () => {
    if (!formData.check_in || !formData.check_out) return 0;
    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    return Math.max(0, differenceInDays(checkOut, checkIn));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const subtotal = nights * formData.price_per_night;
    const total = subtotal - formData.discount + formData.extra_charges;
    return { nights, subtotal, total };
  };

  const { nights, subtotal, total } = calculateTotal();
  const balance = total - formData.advance_payment;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (nights === 0) {
        throw new Error('Check-out date must be after check-in date');
      }

      const checkInDate = new Date(formData.check_in);
      checkInDate.setHours(0, 0, 0, 0);
      const checkOutDate = new Date(formData.check_out);
      checkOutDate.setHours(0, 0, 0, 0);

      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('*')
        .eq('apartment_id', apartment.id)
        .in('status', ['active', 'upcoming']);

      if (checkError) throw checkError;

      const hasOverlap = existingBookings?.some((booking) => {
        const existingCheckIn = new Date(booking.check_in);
        existingCheckIn.setHours(0, 0, 0, 0);
        const existingCheckOut = new Date(booking.check_out);
        existingCheckOut.setHours(0, 0, 0, 0);

        return (
          (checkInDate.getTime() >= existingCheckIn.getTime() &&
           checkInDate.getTime() < existingCheckOut.getTime()) ||
          (checkOutDate.getTime() > existingCheckIn.getTime() &&
           checkOutDate.getTime() <= existingCheckOut.getTime()) ||
          (checkInDate.getTime() <= existingCheckIn.getTime() &&
           checkOutDate.getTime() >= existingCheckOut.getTime())
        );
      });

      if (hasOverlap) {
        throw new Error('Apartment already booked for selected dates. Please choose different dates.');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingStatus = checkInDate.getTime() <= today.getTime() ? 'active' : 'upcoming';

      const effectivePricePerNight = nights > 0
        ? Math.round((subtotal - formData.discount + formData.extra_charges) / nights)
        : formData.price_per_night;

      const bookingData = {
        apartment_id: apartment.id,
        client_name: formData.client_name,
        phone: formData.phone,
        cnic: formData.cnic,
        guests: formData.guests,
        check_in: formData.check_in,
        check_out: formData.check_out,
        nights,
        price_per_night: effectivePricePerNight,
        discount: formData.discount,
        extra_charges: formData.extra_charges,
        total_amount: total,
        advance_payment: formData.advance_payment,
        balance,
        payment_method: formData.payment_method,
        notes: formData.notes,
        special_requests: formData.special_requests,
        status: bookingStatus,
      };

      // Check if online
      if (!isOnline()) {
        // Save offline
        await saveBookingOffline(bookingData);
        alert('🔴 Offline Mode\n\nBooking saved locally!\nIt will automatically sync when internet is back online.');
        onComplete();
        return;
      }

      // Track guest first
      const guestId = await trackGuest({
        client_name: formData.client_name,
        phone: formData.phone,
        cnic: formData.cnic,
        total_amount: total,
        check_in: formData.check_in,
      });

      // Online - save to database
      const bookingDataWithGuest = {
        ...bookingData,
        guest_id: guestId,
        created_by: user?.id,
      };

      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert([bookingDataWithGuest])
        .select()
        .single();

      if (insertError) throw insertError;

      // Log audit
      await logAudit(
        'CREATE_BOOKING',
        'bookings',
        data.id,
        user?.id,
        user?.name,
        null,
        bookingDataWithGuest
      );

      setBookingId(data.id);
      setShowReceipt(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'price_per_night') {
      const newPrice = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        price_per_night: newPrice,
      }));
      return;
    }

    if (name === 'check_in' && value) {
      const checkInDate = new Date(value);
      const suggestedCheckOut = format(addDays(checkInDate, 1), 'yyyy-MM-dd');

      setFormData((prev) => ({
        ...prev,
        check_in: value,
        check_out: prev.check_out && new Date(prev.check_out) > checkInDate
          ? prev.check_out
          : suggestedCheckOut,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
      }));
    }
  };

  if (showReceipt && bookingId) {
    return (
      <ReceiptGenerator
        bookingId={bookingId}
        onClose={() => {
          setShowReceipt(false);
          onComplete();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
      <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-8 flex items-start sm:items-center justify-center">
        <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/30 rounded-2xl max-w-2xl w-full shadow-2xl">
          {/* Header */}
          <div className="border-b border-neutral-800 p-4 sm:p-6 sticky top-0 bg-neutral-900/95 backdrop-blur-sm rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent font-bold">New Booking</h2>
                <p className="text-neutral-400 mt-1 text-sm sm:text-base">{apartment.name}</p>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="text-neutral-400 hover:text-white text-3xl sm:text-4xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Client Details */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-amber-400 font-semibold text-base sm:text-lg">Client Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">Client Name *</label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base"
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base"
                  placeholder="03XX-XXXXXXX"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">CNIC *</label>
                <input
                  type="text"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base"
                  placeholder="12345-1234567-1"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">Number of Guests *</label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base"
                  required
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-amber-400 font-semibold text-base sm:text-lg">Booking Details</h3>
            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-3 sm:p-4 mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl">📅</span>
                </div>
                <div>
                  <p className="text-amber-400 text-xs sm:text-sm font-semibold">Calendar Picker Available</p>
                  <p className="text-neutral-400 text-xs">Click date fields below to select dates from calendar</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">
                  Check-In Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="check_in"
                    value={formData.check_in}
                    onChange={handleChange}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 bg-neutral-950/50 border-2 border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base cursor-pointer hover:border-amber-500/50"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📅</span>
                    </div>
                  </div>
                </div>
                <p className="text-neutral-500 text-xs mt-1.5">Earliest: {format(new Date(), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">
                  Check-Out Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="check_out"
                    value={formData.check_out}
                    onChange={handleChange}
                    min={formData.check_in || format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 bg-neutral-950/50 border-2 border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base cursor-pointer hover:border-amber-500/50"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📅</span>
                    </div>
                  </div>
                </div>
                {formData.check_in && (
                  <p className="text-neutral-500 text-xs mt-1.5">
                    Must be after {format(new Date(formData.check_in), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
            </div>
            {nights > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-emerald-400 text-sm flex items-center gap-2">
                  <span className="text-base">✓</span>
                  <span className="font-semibold">{nights} night{nights !== 1 ? 's' : ''}</span> selected
                  {formData.check_in && formData.check_out && (
                    <span className="text-neutral-400">
                      ({format(new Date(formData.check_in), 'MMM dd')} - {format(new Date(formData.check_out), 'MMM dd')})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-amber-400 font-semibold text-base sm:text-lg">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">Price per Night *</label>
                <input
                  type="number"
                  name="price_per_night"
                  value={formData.price_per_night}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-950/50 border-2 border-amber-500/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base font-bold"
                  required
                />
                <p className="text-amber-400 text-xs mt-1.5 font-semibold">
                  📝 Current: Rs {formData.price_per_night.toLocaleString()} (Default: Rs {apartment.price_per_night.toLocaleString()})
                </p>
              </div>
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">Total Nights</label>
                <input
                  type="number"
                  value={nights}
                  disabled
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800/50 border border-neutral-700/30 rounded-xl text-neutral-400 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">Discount (Rs)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">Extra Charges (Rs)</label>
                <input
                  type="number"
                  name="extra_charges"
                  value={formData.extra_charges}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">Advance Payment (Rs) *</label>
                <input
                  type="number"
                  name="advance_payment"
                  value={formData.advance_payment}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">Payment Method *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payment_method: 'cash' }))}
                    className={`px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                      formData.payment_method === 'cash'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payment_method: 'online' }))}
                    className={`px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                      formData.payment_method === 'online'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    💳 Online
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Special Requests */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-amber-400 font-semibold text-base sm:text-lg">Additional Information (Optional)</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">Internal Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base resize-none"
                  placeholder="e.g., VIP guest, early check-in requested, extra pillows"
                />
                <p className="text-neutral-500 text-xs mt-1">For staff use only - not visible to guests</p>
              </div>
              <div>
                <label className="block text-neutral-300 mb-2 text-sm sm:text-base font-medium">Guest Special Requests</label>
                <textarea
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base resize-none"
                  placeholder="e.g., Late checkout, birthday celebration, extra towels"
                />
                <p className="text-neutral-500 text-xs mt-1">Guest requirements and preferences</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-amber-500/30 rounded-2xl p-4 sm:p-5">
            <h3 className="text-amber-400 font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Booking Summary</h3>
            <div className="space-y-2 sm:space-y-2.5 text-sm sm:text-base">
              <div className="flex justify-between text-white">
                <span className="text-neutral-400">Subtotal ({nights} nights)</span>
                <span className="font-medium">Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Discount</span>
                <span className="text-red-400 font-medium">- Rs {formData.discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Extra Charges</span>
                <span className="text-green-400 font-medium">+ Rs {formData.extra_charges.toLocaleString()}</span>
              </div>
              <div className="border-t border-neutral-700/50 pt-2 sm:pt-3 flex justify-between text-base sm:text-lg">
                <span className="text-amber-400 font-semibold">Total Amount</span>
                <span className="text-amber-400 font-bold">Rs {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white">
                <span className="text-neutral-400">Advance Paid</span>
                <span className="font-medium">Rs {formData.advance_payment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white">
                <span className="text-neutral-400">Payment Method</span>
                <span className={`font-semibold ${formData.payment_method === 'cash' ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {formData.payment_method === 'cash' ? '💵 Cash' : '💳 Online'}
                </span>
              </div>
              <div className="border-t border-neutral-700/50 pt-2 sm:pt-3 flex justify-between text-base sm:text-lg">
                <span className="text-rose-400 font-semibold">Balance Remaining</span>
                <span className="text-rose-400 font-bold">Rs {balance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-3 sm:py-3.5 rounded-xl transition-all font-semibold text-sm sm:text-base active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black py-3 sm:py-3.5 rounded-xl transition-all font-bold text-sm sm:text-base shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default BookingForm;

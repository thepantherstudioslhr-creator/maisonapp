import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { Booking } from '../types';

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
    cash_amount: booking.cash_amount || 0,
    online_amount: booking.online_amount || 0,
    advance_payment: booking.advance_payment,
    balance: booking.balance,
    payment_method: booking.payment_method || 'cash',
    notes: booking.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calculate advance from cash + online
      const calculatedAdvance = formData.cash_amount + formData.online_amount;
      const calculatedBalance = booking.total_amount - calculatedAdvance;

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          client_name: formData.client_name,
          phone: formData.phone,
          cnic: formData.cnic,
          guests: formData.guests,
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

  const handlePaymentUpdate = (field: 'cash_amount' | 'online_amount', value: number) => {
    const newData = { ...formData };
    newData[field] = value;

    // Auto-calculate advance and balance
    const totalAdvance = newData.cash_amount + newData.online_amount;
    newData.advance_payment = totalAdvance;
    newData.balance = booking.total_amount - totalAdvance;

    setFormData(newData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-6 flex justify-between items-center">
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

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg text-amber-400 font-semibold">Payment Information</h3>

            <div className="bg-neutral-950/50 border border-neutral-700/50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-neutral-400">Total Amount:</span>
                <span className="text-2xl text-white font-bold">Rs {booking.total_amount.toLocaleString()}</span>
              </div>
            </div>

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
      </div>
    </div>
  );
};

export default EditBookingModal;

import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { Guest } from '../types';

interface EditGuestModalProps {
  guest: Guest;
  onClose: () => void;
  onUpdate: () => void;
}

const EditGuestModal: React.FC<EditGuestModalProps> = ({ guest, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: guest.name,
    phone: guest.phone,
    cnic: guest.cnic || '',
    email: guest.email || '',
    address: guest.address || '',
    notes: guest.notes || '',
    total_bookings: guest.total_bookings,
    total_spent: guest.total_spent,
    is_vip: guest.is_vip,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name || !formData.phone) {
        throw new Error('Name and Phone are required fields');
      }

      const { error: updateError } = await supabase
        .from('guests')
        .update({
          name: formData.name,
          phone: formData.phone,
          cnic: formData.cnic || null,
          email: formData.email || null,
          address: formData.address || null,
          notes: formData.notes || null,
          total_bookings: formData.total_bookings,
          total_spent: formData.total_spent,
          is_vip: formData.is_vip,
          updated_at: new Date().toISOString(),
        })
        .eq('id', guest.id);

      if (updateError) throw updateError;

      onUpdate();
      onClose();
    } catch (err: any) {
      console.error('Error updating guest:', err);
      setError(err.message || 'Failed to update guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl text-yellow-500 font-bold">Edit Guest</h2>
            <p className="text-neutral-400 text-sm mt-1">Update guest information and spending</p>
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

          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="text-lg text-amber-400 font-semibold">Guest Information</h3>

            <div>
              <label className="block text-neutral-300 mb-2 text-sm">Guest Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                placeholder="Guest name"
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
                  placeholder="03XX-XXXXXXX"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-2 text-sm">CNIC</label>
                <input
                  type="text"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="12345-1234567-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 mb-2 text-sm">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-neutral-300 mb-2 text-sm">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                placeholder="Guest address"
              />
            </div>
          </div>

          {/* Spending & Stats */}
          <div className="space-y-4">
            <h3 className="text-lg text-amber-400 font-semibold">Guest Statistics</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 mb-2 text-sm">Total Bookings</label>
                <input
                  type="number"
                  min="0"
                  value={formData.total_bookings}
                  onChange={(e) => setFormData({ ...formData, total_bookings: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                />
                <p className="text-amber-500 text-sm mt-2">Current: {formData.total_bookings} bookings</p>
              </div>

              <div>
                <label className="block text-neutral-300 mb-2 text-sm">Total Spent (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.total_spent}
                  onChange={(e) => setFormData({ ...formData, total_spent: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                />
                <p className="text-green-500 text-sm mt-2">PKR {formData.total_spent.toLocaleString()}</p>
              </div>
            </div>

            {/* VIP Status Toggle */}
            <div>
              <label className="block text-neutral-300 mb-2 text-sm">VIP Status</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_vip: !formData.is_vip })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  formData.is_vip
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-neutral-950/50 border-neutral-700/50 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                <Star className={`w-5 h-5 ${formData.is_vip ? 'fill-amber-400' : ''}`} />
                {formData.is_vip ? 'VIP Guest ⭐' : 'Regular Guest'}
              </button>
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
              placeholder="Add any notes about the guest..."
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

export default EditGuestModal;

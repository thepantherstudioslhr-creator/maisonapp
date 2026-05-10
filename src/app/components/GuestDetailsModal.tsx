import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Guest, Booking, APARTMENTS } from '../types';
import { format } from 'date-fns';
import { X, Calendar, DollarSign, MapPin, Clock } from 'lucide-react';

interface GuestDetailsModalProps {
  guest: Guest;
  onClose: () => void;
}

const GuestDetailsModal: React.FC<GuestDetailsModalProps> = ({ guest, onClose }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuestBookings();
  }, [guest.id]);

  const loadGuestBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('guest_id', guest.id)
        .order('check_in', { ascending: false });

      if (error) throw error;

      const bookingsWithApartments = (data || []).map((booking) => {
        const apartment = APARTMENTS.find((a) => a.id === booking.apartment_id);
        return {
          ...booking,
          apartment_name: apartment?.name,
        };
      });

      setBookings(bookingsWithApartments);
    } catch (error) {
      console.error('Error loading guest bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCashPaid = bookings.reduce((sum, b) => sum + (b.cash_amount || 0), 0);
  const totalOnlinePaid = bookings.reduce((sum, b) => sum + (b.online_amount || 0), 0);
  const totalNights = bookings.reduce((sum, b) => sum + b.nights, 0);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-start justify-center">
        <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/30 rounded-2xl max-w-4xl w-full shadow-2xl">
          {/* Header */}
          <div className="border-b border-neutral-800 p-6 sticky top-0 bg-neutral-900/95 backdrop-blur-sm rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent font-bold">
                  Guest Details
                </h2>
                <p className="text-neutral-400 mt-1">{guest.name}</p>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-white text-4xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Guest Info Summary */}
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-amber-400 font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <span className="text-neutral-400 w-20">Phone:</span>
                      <span className="font-medium">{guest.phone}</span>
                    </div>
                    {guest.cnic && (
                      <div className="flex items-center gap-2 text-neutral-300">
                        <span className="text-neutral-400 w-20">CNIC:</span>
                        <span className="font-medium">{guest.cnic}</span>
                      </div>
                    )}
                    {guest.email && (
                      <div className="flex items-center gap-2 text-neutral-300">
                        <span className="text-neutral-400 w-20">Email:</span>
                        <span className="font-medium">{guest.email}</span>
                      </div>
                    )}
                    {guest.address && (
                      <div className="flex items-start gap-2 text-neutral-300">
                        <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                        <span className="font-medium">{guest.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-amber-400 font-semibold mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <p className="text-neutral-400 text-xs mb-1">Total Visits</p>
                      <p className="text-amber-400 font-bold text-xl">{guest.total_bookings}</p>
                    </div>
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <p className="text-neutral-400 text-xs mb-1">Total Nights</p>
                      <p className="text-blue-400 font-bold text-xl">{totalNights}</p>
                    </div>
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <p className="text-neutral-400 text-xs mb-1">Total Spent</p>
                      <p className="text-green-400 font-bold text-lg">PKR {guest.total_spent.toLocaleString()}</p>
                    </div>
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <p className="text-neutral-400 text-xs mb-1">Last Visit</p>
                      <p className="text-purple-400 font-bold text-sm">
                        {guest.last_visit_date
                          ? format(new Date(guest.last_visit_date), 'MMM dd, yyyy')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="mt-6 pt-6 border-t border-amber-500/20">
                <h3 className="text-amber-400 font-semibold mb-3">Payment Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">💵</span>
                      <p className="text-sm text-neutral-400">Cash Payments</p>
                    </div>
                    <p className="text-2xl text-green-400 font-bold">PKR {totalCashPaid.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">💳</span>
                      <p className="text-sm text-neutral-400">Online Payments</p>
                    </div>
                    <p className="text-2xl text-blue-400 font-bold">PKR {totalOnlinePaid.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {guest.notes && (
                <div className="mt-4 p-3 bg-neutral-800/50 rounded-lg">
                  <p className="text-xs text-neutral-400 mb-1">Notes:</p>
                  <p className="text-sm text-neutral-300">{guest.notes}</p>
                </div>
              )}
            </div>

            {/* Visit History */}
            <div>
              <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Visit History ({bookings.length} visits)
              </h3>

              {loading ? (
                <div className="text-center text-neutral-400 py-8">Loading visit history...</div>
              ) : bookings.length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center">
                  <p className="text-neutral-400">No visit history found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {bookings.map((booking, index) => (
                    <div
                      key={booking.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-semibold">{booking.apartment_name}</h4>
                          <p className="text-neutral-400 text-sm">
                            Visit #{bookings.length - index}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : booking.status === 'completed'
                              ? 'bg-neutral-500/20 text-neutral-400'
                              : booking.status === 'upcoming'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-neutral-300">
                            <Calendar className="w-4 h-4 text-neutral-400" />
                            <span>
                              {format(new Date(booking.check_in), 'MMM dd, yyyy')} →{' '}
                              {format(new Date(booking.check_out), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-300">
                            <Clock className="w-4 h-4 text-neutral-400" />
                            <span>{booking.nights} night{booking.nights !== 1 ? 's' : ''}</span>
                          </div>
                          {booking.check_in_time && (
                            <div className="flex items-center gap-2 text-neutral-300">
                              <span className="text-neutral-400">Check-in:</span>
                              <span>{format(new Date(booking.check_in_time), 'MMM dd, hh:mm a')}</span>
                            </div>
                          )}
                          {booking.check_out_time && (
                            <div className="flex items-center gap-2 text-neutral-300">
                              <span className="text-neutral-400">Check-out:</span>
                              <span>{format(new Date(booking.check_out_time), 'MMM dd, hh:mm a')}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-neutral-400" />
                            <div className="flex-1">
                              <p className="text-neutral-400 text-xs">Total Amount</p>
                              <p className="text-yellow-400 font-bold">PKR {booking.total_amount.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="bg-neutral-800/50 rounded p-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-400">💵 Cash:</span>
                              <span className="text-green-400 font-semibold">PKR {(booking.cash_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-400">💳 Online:</span>
                              <span className="text-blue-400 font-semibold">PKR {(booking.online_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t border-neutral-700">
                              <span className="text-neutral-400">Balance:</span>
                              <span className={`font-semibold ${booking.balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                PKR {booking.balance.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {(booking.notes || booking.special_requests) && (
                        <div className="mt-3 pt-3 border-t border-neutral-800 space-y-1">
                          {booking.notes && (
                            <p className="text-xs text-neutral-400">
                              <span className="font-semibold">Notes:</span> {booking.notes}
                            </p>
                          )}
                          {booking.special_requests && (
                            <p className="text-xs text-neutral-400">
                              <span className="font-semibold">Special Requests:</span> {booking.special_requests}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-800 p-6">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black py-3 rounded-xl transition-all font-bold shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDetailsModal;

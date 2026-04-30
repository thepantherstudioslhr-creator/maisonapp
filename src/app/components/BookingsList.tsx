import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Booking, BookingStatus, APARTMENTS } from '../types';
import { format } from 'date-fns';

interface BookingsListProps {
  onBookingUpdated: () => void;
}

const BookingsList: React.FC<BookingsListProps> = ({ onBookingUpdated }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const bookingsWithApartments = data.map((booking) => {
        const apartment = APARTMENTS.find((a) => a.id === booking.apartment_id);
        return {
          ...booking,
          apartment_name: apartment?.name,
        };
      });

      setBookings(bookingsWithApartments);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      loadBookings();
      onBookingUpdated();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

      if (error) throw error;

      loadBookings();
      onBookingUpdated();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.apartment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm)
  );

  const getStatusBadge = (status: BookingStatus) => {
    const styles = {
      active: 'bg-green-500/20 text-green-500 border-green-500',
      upcoming: 'bg-blue-500/20 text-blue-500 border-blue-500',
      completed: 'bg-neutral-500/20 text-neutral-400 border-neutral-500',
      cancelled: 'bg-red-500/20 text-red-500 border-red-500',
    };

    return (
      <span className={`px-3 py-1 rounded-full border text-sm ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-yellow-500 mb-4">Bookings Management</h2>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex gap-2">
            {(['all', 'active', 'upcoming', 'completed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded transition-colors ${
                  filter === status
                    ? 'bg-yellow-600 text-black'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, or apartment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[300px] px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-yellow-500"
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center text-neutral-400 py-12">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <p className="text-neutral-400">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-yellow-600/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-yellow-500 text-lg">{booking.apartment_name}</h3>
                  <p className="text-neutral-400 text-sm">ID: {booking.id.substring(0, 8).toUpperCase()}</p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <h4 className="text-neutral-400 text-sm mb-2">Client</h4>
                  <p className="text-white">{booking.client_name}</p>
                  <p className="text-neutral-400 text-sm">{booking.phone}</p>
                  <p className="text-neutral-400 text-sm">{booking.guests} guests</p>
                </div>
                <div>
                  <h4 className="text-neutral-400 text-sm mb-2">Dates</h4>
                  <p className="text-white">
                    {format(new Date(booking.check_in), 'MMM dd, yyyy')} →{' '}
                    {format(new Date(booking.check_out), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-neutral-400 text-sm">{booking.nights} nights</p>
                </div>
                <div>
                  <h4 className="text-neutral-400 text-sm mb-2">Payment</h4>
                  <p className="text-yellow-500">Total: Rs {booking.total_amount.toLocaleString()}</p>
                  <p className="text-green-500 text-sm">Paid: Rs {booking.advance_payment.toLocaleString()}</p>
                  <p className="text-red-500 text-sm">Balance: Rs {booking.balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {booking.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'completed')}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(booking.id)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-red-400 px-4 py-2 rounded text-sm transition-colors ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsList;

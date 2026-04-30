import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Booking, APARTMENTS } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns';

const CalendarView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedApartment, setSelectedApartment] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .in('status', ['active', 'upcoming']);

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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBookingsForDay = (day: Date) => {
    return bookings.filter((booking) => {
      if (selectedApartment !== 'all' && booking.apartment_id !== selectedApartment) {
        return false;
      }

      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);

      return isWithinInterval(day, { start: checkIn, end: checkOut }) || isSameDay(day, checkIn);
    });
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  if (loading) {
    return <div className="text-center text-neutral-400 py-12">Loading calendar...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-yellow-500">Calendar View</h2>
        <select
          value={selectedApartment}
          onChange={(e) => setSelectedApartment(e.target.value)}
          className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-yellow-500"
        >
          <option value="all">All Apartments</option>
          {APARTMENTS.map((apt) => (
            <option key={apt.id} value={apt.id}>
              {apt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6 bg-neutral-900 border border-yellow-600/30 rounded-lg p-4">
        <button
          onClick={prevMonth}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded transition-colors"
        >
          ← Previous
        </button>
        <h3 className="text-xl text-yellow-500">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button
          onClick={nextMonth}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-neutral-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}

          {/* Days of the month */}
          {days.map((day) => {
            const dayBookings = getBookingsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square border rounded-lg p-2 ${
                  isToday
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-neutral-700 bg-neutral-800'
                } hover:border-yellow-600/50 transition-colors`}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-sm mb-1 ${isToday ? 'text-yellow-500' : 'text-white'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {dayBookings.map((booking) => {
                      const isCheckIn = isSameDay(day, new Date(booking.check_in));
                      const isCheckOut = isSameDay(day, new Date(booking.check_out));

                      return (
                        <div
                          key={booking.id}
                          className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded truncate"
                          title={`${booking.apartment_name} - ${booking.client_name}`}
                        >
                          {isCheckIn && '→ '}
                          {booking.client_name.split(' ')[0]}
                          {isCheckOut && ' ←'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-neutral-400 text-sm">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">→ Check-in</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">← Check-out</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

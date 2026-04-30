import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { Apartment, Booking, APARTMENTS } from '../types';
import { format } from 'date-fns';
import { LOGO_URL } from '../assets/logo';
import { Settings as SettingsIcon } from 'lucide-react';
import BookingForm from './BookingForm';
import BookingsList from './BookingsList';
import Reports from './Reports';
import CalendarView from './CalendarView';
import OfflineIndicator from './OfflineIndicator';
import { Settings } from './Settings';
import { SmartDashboard } from './SmartDashboard';
import { GuestDatabase } from './GuestDatabase';

type Tab = 'dashboard' | 'new-booking' | 'bookings' | 'reports' | 'calendar' | 'guests';

const Dashboard: React.FC = () => {
  const { user, logout, hasPermission, theme } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApartments();
  }, []);

  const loadApartments = async () => {
    try {
      setLoading(true);

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .in('status', ['active', 'upcoming']);

      const apartmentsWithStatus: Apartment[] = APARTMENTS.map((apt) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeBooking = bookingsData?.find((booking) => {
          const checkInDate = new Date(booking.check_in);
          checkInDate.setHours(0, 0, 0, 0);
          const checkOutDate = new Date(booking.check_out);
          checkOutDate.setHours(0, 0, 0, 0);

          return (
            booking.apartment_id === apt.id &&
            checkInDate.getTime() <= today.getTime() &&
            checkOutDate.getTime() >= today.getTime()
          );
        });

        let status: Apartment['status'] = 'available';
        if (activeBooking) {
          const checkoutDate = new Date(activeBooking.check_out);
          checkoutDate.setHours(0, 0, 0, 0);

          if (checkoutDate.getTime() === today.getTime()) {
            status = 'checkout_today';
          } else {
            status = 'booked';
          }
        }

        return {
          id: apt.id,
          name: apt.name,
          price_per_night: activeBooking ? activeBooking.price_per_night : apt.price,
          status,
          current_booking: activeBooking as Booking | undefined,
        };
      });

      setApartments(apartmentsWithStatus);
    } catch (error) {
      console.error('Error loading apartments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApartmentClick = (apartment: Apartment) => {
    if (apartment.status === 'available') {
      setSelectedApartment(apartment);
      setShowBookingForm(true);
    }
  };

  const handleBookingComplete = async () => {
    setShowBookingForm(false);
    setSelectedApartment(null);
    await loadApartments();
    const stats = await getTodayStats();
    setTodayStats(stats);
  };

  const handleCheckOut = async (bookingId: string) => {
    if (!confirm('Are you sure you want to check out this guest?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (error) throw error;

      await loadApartments();
      const stats = await getTodayStats();
      setTodayStats(stats);
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Failed to check out guest. Please try again.');
    }
  };

  const getOccupancyStats = () => {
    const booked = apartments.filter((a) => a.status === 'booked' || a.status === 'checkout_today').length;
    const available = apartments.filter((a) => a.status === 'available').length;
    const occupancyRate = apartments.length > 0 ? (booked / apartments.length) * 100 : 0;

    return { booked, available, occupancyRate };
  };

  const getTodayStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: allBookings } = await supabase
        .from('bookings')
        .select('*');

      const checkInsToday = allBookings?.filter((booking) => {
        const checkIn = new Date(booking.check_in);
        checkIn.setHours(0, 0, 0, 0);
        return checkIn.getTime() === today.getTime();
      }).length || 0;

      const checkOutsToday = allBookings?.filter((booking) => {
        const checkOut = new Date(booking.check_out);
        checkOut.setHours(0, 0, 0, 0);
        return checkOut.getTime() === today.getTime();
      }).length || 0;

      const todayActiveBookings = allBookings?.filter((booking) => {
        const checkIn = new Date(booking.check_in);
        checkIn.setHours(0, 0, 0, 0);
        const checkOut = new Date(booking.check_out);
        checkOut.setHours(0, 0, 0, 0);

        return (
          checkIn.getTime() <= today.getTime() &&
          checkOut.getTime() >= today.getTime()
        );
      }) || [];

      const todayRevenue = todayActiveBookings.reduce(
        (sum, booking) => sum + (booking.price_per_night || 0),
        0
      );

      return { checkInsToday, checkOutsToday, todayRevenue };
    } catch (error) {
      console.error('Error getting today stats:', error);
      return { checkInsToday: 0, checkOutsToday: 0, todayRevenue: 0 };
    }
  };

  const [todayStats, setTodayStats] = React.useState({ checkInsToday: 0, checkOutsToday: 0, todayRevenue: 0 });

  React.useEffect(() => {
    getTodayStats().then(setTodayStats);
  }, [apartments]);

  const getStatusColor = (status: Apartment['status']) => {
    switch (status) {
      case 'available': return 'from-emerald-500 to-green-600';
      case 'booked': return 'from-rose-500 to-red-600';
      case 'checkout_today': return 'from-amber-500 to-yellow-600';
      case 'maintenance': return 'from-neutral-500 to-gray-600';
    }
  };

  const getStatusBadge = (status: Apartment['status']) => {
    switch (status) {
      case 'available': return { text: 'Available', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'booked': return { text: 'Occupied', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
      case 'checkout_today': return { text: 'Check-out', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'maintenance': return { text: 'Maintenance', color: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30' };
    }
  };

  const stats = getOccupancyStats();

  return (
    <div className={`min-h-screen pb-20 relative ${
      theme === 'light'
        ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50'
        : 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950'
    }`}>
      {/* Background Image for Light Mode */}
      {theme === 'light' && (
        <div
          className="fixed inset-0 z-0 opacity-15"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1654448189789-b823e1794844?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Offline/Sync Indicator */}
        <OfflineIndicator />

      {/* Professional Header with Logo */}
      <header className={`border-b border-amber-500/20 shadow-2xl sticky top-0 z-40 backdrop-blur-md ${
        theme === 'light'
          ? 'bg-white/90'
          : 'bg-gradient-to-r from-neutral-900 to-neutral-950'
      }`}>
        <div className="px-3 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <img
                src={LOGO_URL}
                alt="Maison Royale"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shadow-lg shadow-amber-500/20 flex-shrink-0"
                onError={(e) => { console.error('Logo failed to load'); }}
              />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base md:text-lg bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent font-bold truncate">
                  Maison Royale Residency
                </h1>
                <p className={`text-xs hidden sm:block ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-500'}`}>
                  Management Portal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white p-2 rounded-xl text-xs sm:text-sm font-semibold active:scale-95 transition-all shadow-lg flex-shrink-0"
                title="Settings"
              >
                <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold active:scale-95 transition-all shadow-lg flex-shrink-0"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Navigation Tabs */}
        <div className={`px-2 sm:px-4 overflow-x-auto scrollbar-hide border-t ${
          theme === 'light' ? 'border-amber-200' : 'border-neutral-800/50'
        }`}>
          <div className="flex gap-1 min-w-max">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
              { id: 'new-booking', label: 'New Booking', icon: '➕' },
              { id: 'bookings', label: 'Bookings', icon: '📋' },
              { id: 'reports', label: 'Reports', icon: '📊' },
              { id: 'guests', label: 'Guests', icon: '👥' },
              { id: 'calendar', label: 'Calendar', icon: '📅' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-3 sm:px-5 py-2.5 sm:py-3 rounded-t-xl transition-all font-semibold text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-b from-amber-500 to-yellow-600 text-black shadow-lg'
                    : theme === 'light'
                    ? 'text-neutral-600 hover:text-amber-600 hover:bg-amber-50'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <span className="sm:hidden">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-3 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
        {activeTab === 'dashboard' && (
          <>
            {/* Smart Dashboard */}
            <SmartDashboard
              checkInsToday={todayStats.checkInsToday}
              checkOutsToday={todayStats.checkOutsToday}
              occupiedRooms={stats.booked}
              availableRooms={stats.available}
              totalRooms={apartments.length}
              todayRevenue={todayStats.todayRevenue}
              occupancyRate={stats.occupancyRate}
            />

            {/* Stats Cards - Mobile Optimized */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              {[
                { label: 'Total Units', value: apartments.length, gradient: 'from-blue-500 to-cyan-600', icon: '🏢' },
                { label: 'Available', value: stats.available, gradient: 'from-emerald-500 to-green-600', icon: '✓' },
                { label: 'Occupied', value: stats.booked, gradient: 'from-rose-500 to-red-600', icon: '🔒' },
                { label: 'Occupancy', value: `${stats.occupancyRate.toFixed(0)}%`, gradient: 'from-amber-500 to-yellow-600', icon: '📊' },
              ].map((stat, index) => (
                <div key={index} className={`group border rounded-2xl p-4 sm:p-6 hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:scale-105 ${
                  theme === 'light'
                    ? 'bg-white/80 backdrop-blur-sm border-amber-200'
                    : 'bg-gradient-to-br from-neutral-900 to-neutral-950 border-amber-500/10'
                }`}>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className={`text-xs sm:text-sm font-medium uppercase tracking-wide ${
                      theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'
                    }`}>{stat.label}</p>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-base sm:text-lg shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Apartments Section */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-full"></div>
                <h2 className="text-xl sm:text-2xl md:text-3xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent font-bold">
                  Apartments
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 sm:py-20">
                <div className="inline-block w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <p className={`text-sm sm:text-base ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'}`}>
                  Loading apartments...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {apartments.map((apt) => {
                  const statusBadge = getStatusBadge(apt.status);
                  return (
                    <div
                      key={apt.id}
                      onClick={() => apt.status === 'available' && handleApartmentClick(apt)}
                      className={`group relative border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                        theme === 'light'
                          ? 'bg-white/80 backdrop-blur-sm'
                          : 'bg-gradient-to-br from-neutral-900 to-neutral-950'
                      } ${
                        apt.status === 'available'
                          ? 'border-emerald-500/30 cursor-pointer hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-105 active:scale-100'
                          : theme === 'light'
                          ? 'border-amber-200'
                          : 'border-neutral-800/50'
                      }`}
                    >
                      {/* Gradient Overlay for Available */}
                      {apt.status === 'available' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      )}

                      <div className="relative p-5 sm:p-6">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${statusBadge.color} backdrop-blur-sm`}>
                            {statusBadge.text}
                          </div>
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${getStatusColor(apt.status)} shadow-lg animate-pulse`}></div>
                        </div>

                        {/* Apartment Name - NO PRICE */}
                        <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-4 leading-tight ${
                          theme === 'light' ? 'text-neutral-900' : 'text-white'
                        }`}>
                          {apt.name}
                        </h3>

                        {/* Booking Info or Ready Status */}
                        {apt.current_booking ? (
                          <div className="space-y-3 mb-4">
                            <div className="flex items-start gap-2">
                              <span className={`text-sm mt-0.5 ${theme === 'light' ? 'text-neutral-400' : 'text-neutral-500'}`}>👤</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs sm:text-sm mb-0.5 ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}`}>Guest</p>
                                <p className={`font-medium truncate text-sm sm:text-base ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>
                                  {apt.current_booking.client_name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className={`text-sm mt-0.5 ${theme === 'light' ? 'text-neutral-400' : 'text-neutral-500'}`}>📅</span>
                              <div className="flex-1">
                                <p className={`text-xs sm:text-sm mb-0.5 ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}`}>Stay Period</p>
                                <p className={`text-xs sm:text-sm ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-300'}`}>
                                  {format(new Date(apt.current_booking.check_in), 'MMM dd')} - {format(new Date(apt.current_booking.check_out), 'MMM dd')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className={`text-sm mt-0.5 ${theme === 'light' ? 'text-neutral-400' : 'text-neutral-500'}`}>💰</span>
                              <div className="flex-1">
                                <p className={`text-xs sm:text-sm mb-0.5 ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}`}>Price per Night</p>
                                <p className={`font-semibold text-sm sm:text-base ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                                  Rs {apt.current_booking.price_per_night.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 py-6 text-center">
                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-full flex items-center justify-center">
                              <span className="text-2xl">✨</span>
                            </div>
                            <p className={`text-xs sm:text-sm font-medium ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}`}>
                              Ready for Booking
                            </p>
                          </div>
                        )}

                        {/* Action Button */}
                        {apt.status === 'available' ? (
                          <button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-2.5 sm:py-3 rounded-xl transition-all font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 active:scale-95">
                            Book Now
                          </button>
                        ) : apt.current_booking ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckOut(apt.current_booking!.id);
                            }}
                            className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white py-2.5 sm:py-3 rounded-xl transition-all font-bold text-sm sm:text-base shadow-lg shadow-rose-500/20 active:scale-95"
                          >
                            {apt.status === 'checkout_today' ? 'Check Out Guest' : 'Mark as Checked Out'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'new-booking' && (
          <>
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-full"></div>
                <h2 className="text-xl sm:text-2xl md:text-3xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent font-bold">
                  New Booking
                </h2>
              </div>
              <p className={`text-sm sm:text-base ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'}`}>
                Select an apartment to create a new booking
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16 sm:py-20">
                <div className="inline-block w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <p className={`text-sm sm:text-base ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'}`}>
                  Loading apartments...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {apartments.map((apt) => {
                  const statusBadge = getStatusBadge(apt.status);
                  return (
                    <div
                      key={apt.id}
                      onClick={() => {
                        setSelectedApartment(apt);
                        setShowBookingForm(true);
                      }}
                      className={`group relative border-2 border-amber-500/30 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/20 hover:scale-105 active:scale-100 ${
                        theme === 'light'
                          ? 'bg-white/80 backdrop-blur-sm'
                          : 'bg-gradient-to-br from-neutral-900 to-neutral-950'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${statusBadge.color} backdrop-blur-sm`}>
                            {statusBadge.text}
                          </div>
                        </div>

                        <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-3 leading-tight ${
                          theme === 'light' ? 'text-neutral-900' : 'text-white'
                        }`}>
                          {apt.name}
                        </h3>

                        <div className="mb-4 py-4 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                          </div>
                          <p className={`font-semibold text-sm sm:text-base mb-1 ${
                            theme === 'light' ? 'text-amber-600' : 'text-amber-400'
                          }`}>
                            Rs {apt.price_per_night.toLocaleString()} / night
                          </p>
                          <p className={`text-xs sm:text-sm ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}`}>
                            Click to Book
                          </p>
                        </div>

                        <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black py-2.5 sm:py-3 rounded-xl transition-all font-bold text-sm sm:text-base shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 active:scale-95">
                          Create Booking
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'bookings' && <BookingsList onBookingUpdated={loadApartments} />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'guests' && <GuestDatabase />}
        {activeTab === 'calendar' && <CalendarView />}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedApartment && (
        <BookingForm
          apartment={selectedApartment}
          onClose={() => setShowBookingForm(false)}
          onComplete={handleBookingComplete}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
      </div>
    </div>
  );
};

export default Dashboard;

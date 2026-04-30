import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Booking, APARTMENTS } from '../types';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'apartment' | 'detailed'>('monthly');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [reportType, selectedDate]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('bookings').select('*');

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

  const getDailyStats = () => {
    const date = new Date(selectedDate);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dayBookings = bookings.filter((b) => {
      const createdAt = new Date(b.created_at);
      return createdAt >= dayStart && createdAt <= dayEnd;
    });

    const revenue = dayBookings.reduce((sum, b) => sum + b.total_amount, 0);
    const occupancy = dayBookings.filter((b) => b.status === 'active').length;

    return { revenue, bookings: dayBookings.length, occupancy };
  };

  const getMonthlyStats = () => {
    const date = new Date(selectedDate);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const monthBookings = bookings.filter((b) => {
      const createdAt = new Date(b.created_at);
      return createdAt >= monthStart && createdAt <= monthEnd;
    });

    const revenue = monthBookings.reduce((sum, b) => sum + b.total_amount, 0);
    const totalNights = monthBookings.reduce((sum, b) => sum + b.nights, 0);
    const occupancyRate =
      monthBookings.length > 0 ? (totalNights / (APARTMENTS.length * 30)) * 100 : 0;

    return { revenue, bookings: monthBookings.length, occupancyRate, totalNights };
  };

  const getWeeklyStats = () => {
    const date = new Date(selectedDate);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday

    const weekBookings = bookings.filter((b) => {
      const createdAt = new Date(b.created_at);
      return createdAt >= weekStart && createdAt <= weekEnd;
    });

    const revenue = weekBookings.reduce((sum, b) => sum + b.total_amount, 0);
    const totalNights = weekBookings.reduce((sum, b) => sum + b.nights, 0);
    const occupancyRate =
      weekBookings.length > 0 ? (totalNights / (APARTMENTS.length * 7)) * 100 : 0;

    return { revenue, bookings: weekBookings.length, occupancyRate, totalNights, weekStart, weekEnd };
  };

  const getApartmentStats = () => {
    return APARTMENTS.map((apartment) => {
      const apartmentBookings = bookings.filter((b) => b.apartment_id === apartment.id);
      const revenue = apartmentBookings.reduce((sum, b) => sum + b.total_amount, 0);
      const totalNights = apartmentBookings.reduce((sum, b) => sum + b.nights, 0);

      return {
        name: apartment.name,
        bookings: apartmentBookings.length,
        revenue,
        nights: totalNights,
      };
    });
  };

  const exportToCSV = () => {
    let csvContent = '';
    let data: any[] = [];

    if (reportType === 'detailed') {
      if (bookings.length === 0) {
        alert('⚠️ No bookings found to export!');
        return;
      }

      // Header row
      csvContent = 'Booking ID,Client Name,CNIC,Phone Number,Apartment,Check-In Date,Check-Out Date,Nights,Price per Night,Discount,Extra Charges,Total Amount,Advance Payment,Balance,Payment Method,Status,Booking Date\n';

      // Data rows
      bookings.forEach((booking) => {
        const checkInDate = format(new Date(booking.check_in), 'MMM dd yyyy');
        const checkOutDate = format(new Date(booking.check_out), 'MMM dd yyyy');
        const bookingDate = format(new Date(booking.created_at), 'MMM dd yyyy HH:mm');
        const paymentMethod = booking.payment_method ? (booking.payment_method === 'cash' ? 'Cash' : 'Online') : 'Cash';

        const row = [
          booking.id.substring(0, 8).toUpperCase(),
          `"${booking.client_name}"`,
          booking.cnic,
          booking.phone,
          `"${booking.apartment_name}"`,
          checkInDate,
          checkOutDate,
          booking.nights,
          booking.price_per_night,
          booking.discount,
          booking.extra_charges,
          booking.total_amount,
          booking.advance_payment,
          booking.balance,
          paymentMethod,
          booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
          bookingDate
        ];

        csvContent += row.join(',') + '\n';
      });

      console.log('CSV Generated - Total rows:', bookings.length + 1);
      console.log('First 200 chars:', csvContent.substring(0, 200));
    } else if (reportType === 'daily') {
      const stats = getDailyStats();
      csvContent = 'Date,Revenue,Bookings,Occupancy\n';
      csvContent += `${selectedDate},${stats.revenue},${stats.bookings},${stats.occupancy}\n`;
    } else if (reportType === 'monthly') {
      const stats = getMonthlyStats();
      csvContent = 'Month,Revenue,Bookings,Total Nights,Occupancy Rate\n';
      csvContent += `${format(new Date(selectedDate), 'MMMM yyyy')},${stats.revenue},${stats.bookings},${stats.totalNights},${stats.occupancyRate.toFixed(2)}%\n`;
    } else {
      csvContent = 'Apartment,Bookings,Revenue,Total Nights\n';
      data = getApartmentStats();
      data.forEach((apt) => {
        csvContent += `${apt.name},${apt.bookings},${apt.revenue},${apt.nights}\n`;
      });
    }

    // Add UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    a.download = `Maison-Royale-${reportType}-${timestamp}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    if (reportType === 'detailed') {
      alert(`✅ Exported ${bookings.length} bookings with complete details!\n\nFile: Maison-Royale-detailed-${timestamp}.csv`);
    }
  };

  const exportToExcel = () => {
    if (bookings.length === 0) {
      alert('⚠️ No bookings found to export!');
      return;
    }

    // Prepare data for Excel
    const excelData = bookings.map((booking) => ({
      'Booking ID': booking.id.substring(0, 8).toUpperCase(),
      'Client Name': booking.client_name,
      'CNIC': booking.cnic,
      'Phone': booking.phone,
      'Apartment': booking.apartment_name || 'N/A',
      'Check-In': format(new Date(booking.check_in), 'MMM dd yyyy'),
      'Check-Out': format(new Date(booking.check_out), 'MMM dd yyyy'),
      'Nights': booking.nights,
      'Price/Night': booking.price_per_night,
      'Discount': booking.discount,
      'Extra Charges': booking.extra_charges,
      'Total Amount': booking.total_amount,
      'Advance Payment': booking.advance_payment,
      'Balance': booking.balance,
      'Payment Method': booking.payment_method === 'cash' ? 'Cash' : 'Online',
      'Status': booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
      'Notes': booking.notes || '',
      'Special Requests': booking.special_requests || '',
      'Booking Date': format(new Date(booking.created_at), 'MMM dd yyyy HH:mm'),
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Booking ID
      { wch: 20 }, // Client Name
      { wch: 16 }, // CNIC
      { wch: 14 }, // Phone
      { wch: 20 }, // Apartment
      { wch: 12 }, // Check-In
      { wch: 12 }, // Check-Out
      { wch: 8 },  // Nights
      { wch: 12 }, // Price/Night
      { wch: 10 }, // Discount
      { wch: 14 }, // Extra Charges
      { wch: 14 }, // Total Amount
      { wch: 16 }, // Advance Payment
      { wch: 10 }, // Balance
      { wch: 14 }, // Payment Method
      { wch: 10 }, // Status
      { wch: 30 }, // Notes
      { wch: 30 }, // Special Requests
      { wch: 18 }, // Booking Date
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

    // Add summary sheet
    const summaryData = [
      { Metric: 'Total Bookings', Value: bookings.length },
      { Metric: 'Total Revenue', Value: bookings.reduce((sum, b) => sum + b.total_amount, 0) },
      { Metric: 'Total Nights', Value: bookings.reduce((sum, b) => sum + b.nights, 0) },
      { Metric: 'Average Booking Value', Value: Math.round(bookings.reduce((sum, b) => sum + b.total_amount, 0) / bookings.length) },
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Add apartment-wise sheet
    const apartmentStats = getApartmentStats();
    const apartmentWs = XLSX.utils.json_to_sheet(apartmentStats.map(apt => ({
      'Apartment': apt.name,
      'Bookings': apt.bookings,
      'Revenue': apt.revenue,
      'Total Nights': apt.nights,
    })));
    XLSX.utils.book_append_sheet(wb, apartmentWs, 'Room-Wise');

    // Generate file
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    XLSX.writeFile(wb, `Maison-Royale-Report-${timestamp}.xlsx`);

    alert(`✅ Excel report exported successfully!\n\n${bookings.length} bookings with 3 sheets:\n- Detailed Bookings\n- Summary\n- Room-Wise Revenue`);
  };

  if (loading) {
    return <div className="text-center text-neutral-400 py-12">Loading reports...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl text-yellow-500">Reports & Analytics</h2>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold shadow-lg text-sm"
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
            CSV
          </button>
          <button
            onClick={exportToExcel}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold shadow-lg text-sm"
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
              <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Excel
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {(['daily', 'weekly', 'monthly', 'apartment', 'detailed'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded transition-colors ${
                reportType === type
                  ? 'bg-yellow-600 text-black font-semibold'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        {reportType !== 'apartment' && reportType !== 'detailed' && (
          <input
            type={reportType === 'daily' || reportType === 'weekly' ? 'date' : 'month'}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-yellow-500"
          />
        )}
      </div>

      {/* Daily Report */}
      {reportType === 'daily' && (
        <div>
          <h3 className="text-xl text-yellow-500 mb-4">
            Daily Report - {format(new Date(selectedDate), 'MMMM dd, yyyy')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-900 border border-yellow-600/30 rounded-lg p-6">
              <p className="text-neutral-400 mb-2">Daily Revenue</p>
              <p className="text-4xl text-yellow-500">Rs {getDailyStats().revenue.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-900 border border-green-500/30 rounded-lg p-6">
              <p className="text-neutral-400 mb-2">Bookings Today</p>
              <p className="text-4xl text-green-500">{getDailyStats().bookings}</p>
            </div>
            <div className="bg-neutral-900 border border-blue-500/30 rounded-lg p-6">
              <p className="text-neutral-400 mb-2">Current Occupancy</p>
              <p className="text-4xl text-blue-500">{getDailyStats().occupancy}</p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Report */}
      {reportType === 'weekly' && (
        <div>
          <h3 className="text-xl text-yellow-500 mb-4">
            Weekly Report - {format(getWeeklyStats().weekStart, 'MMM dd')} to {format(getWeeklyStats().weekEnd, 'MMM dd, yyyy')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neutral-900 border border-yellow-600/30 rounded-lg p-6">
              <p className="text-neutral-400 mb-2">Weekly Revenue</p>
              <p className="text-4xl text-yellow-500">Rs {getWeeklyStats().revenue.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-900 border border-green-500/30 rounded-lg p-6">
              <p className="text-neutral-400 mb-2">Total Bookings</p>
              <p className="text-4xl text-green-500">{getWeeklyStats().bookings}</p>
            </div>
            <div className="bg-neutral-900 border border-purple-500/30 rounded-lg p-6">
              <p className="text-neutral-400 mb-2">Total Nights</p>
              <p className="text-4xl text-purple-500">{getWeeklyStats().totalNights}</p>
            </div>
            <div className="bg-neutral-900 border border-blue-500/30 rounded-lg p-6">
              <p className="text-neutral-400 mb-2">Occupancy Rate</p>
              <p className="text-4xl text-blue-500">{getWeeklyStats().occupancyRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Report */}
      {reportType === 'monthly' && (
        <div>
          <h3 className="text-xl text-yellow-500 mb-4">
            Monthly Report - {format(new Date(selectedDate), 'MMMM yyyy')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neutral-900 border border-yellow-600/30 rounded-lg p-6">
              <p className="text-neutral-400 mb-2">Monthly Revenue</p>
              <p className="text-4xl text-yellow-500">Rs {getMonthlyStats().revenue.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-900 border border-green-500/30 rounded-lg p-6">
              <p className="text-neutral-400 mb-2">Total Bookings</p>
              <p className="text-4xl text-green-500">{getMonthlyStats().bookings}</p>
            </div>
            <div className="bg-neutral-900 border border-blue-500/30 rounded-lg p-6">
              <p className="text-neutral-400 mb-2">Total Nights</p>
              <p className="text-4xl text-blue-500">{getMonthlyStats().totalNights}</p>
            </div>
            <div className="bg-neutral-900 border border-red-500/30 rounded-lg p-6">
              <p className="text-neutral-400 mb-2">Occupancy Rate</p>
              <p className="text-4xl text-red-500">{getMonthlyStats().occupancyRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Apartment Report */}
      {reportType === 'apartment' && (
        <div>
          <h3 className="text-xl text-yellow-500 mb-4">Apartment-wise Revenue</h3>
          <div className="space-y-4">
            {getApartmentStats().map((apt) => (
              <div
                key={apt.name}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-yellow-600/30 transition-colors"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-yellow-500 text-lg">{apt.name}</h4>
                  <span className="text-2xl text-white">Rs {apt.revenue.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-neutral-400 text-sm">Bookings</p>
                    <p className="text-white text-xl">{apt.bookings}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm">Total Nights</p>
                    <p className="text-white text-xl">{apt.nights}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm">Avg. per Booking</p>
                    <p className="text-white text-xl">
                      Rs {apt.bookings > 0 ? Math.round(apt.revenue / apt.bookings).toLocaleString() : 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Report */}
      {reportType === 'detailed' && (
        <div>
          <h3 className="text-xl text-yellow-500 mb-4">All Bookings - Detailed Report</h3>

          {/* Export Info */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-emerald-400 font-bold text-lg mb-2">📊 Complete Detailed Export</h4>
                <p className="text-white font-semibold mb-3">Total Bookings: {bookings.length}</p>
                <p className="text-neutral-300 text-sm mb-3">CSV will include 17 columns with complete booking details:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-neutral-400 mb-4">
                  <span>✓ Booking ID</span>
                  <span>✓ Client Name</span>
                  <span>✓ CNIC</span>
                  <span>✓ Phone Number</span>
                  <span>✓ Apartment</span>
                  <span>✓ Check-In Date</span>
                  <span>✓ Check-Out Date</span>
                  <span>✓ Nights</span>
                  <span>✓ Price per Night</span>
                  <span>✓ Discount</span>
                  <span>✓ Extra Charges</span>
                  <span>✓ Total Amount</span>
                  <span>✓ Advance Payment</span>
                  <span>✓ Balance</span>
                  <span>✓ Payment Method</span>
                  <span>✓ Status</span>
                  <span>✓ Booking Date</span>
                </div>
                <p className="text-emerald-400 text-sm font-semibold">👆 Click "Export Detailed CSV" button above to download Excel-ready file</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-800 text-yellow-500">
                <tr>
                  <th className="p-3 text-sm">Client Name</th>
                  <th className="p-3 text-sm">Phone</th>
                  <th className="p-3 text-sm">Apartment</th>
                  <th className="p-3 text-sm">Check-In</th>
                  <th className="p-3 text-sm">Check-Out</th>
                  <th className="p-3 text-sm">Price</th>
                  <th className="p-3 text-sm">Payment</th>
                  <th className="p-3 text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {bookings.slice(0, 20).map((booking) => (
                  <tr key={booking.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                    <td className="p-3 text-sm">{booking.client_name}</td>
                    <td className="p-3 text-sm">{booking.phone}</td>
                    <td className="p-3 text-sm">{booking.apartment_name}</td>
                    <td className="p-3 text-sm">{format(new Date(booking.check_in), 'MMM dd, yyyy')}</td>
                    <td className="p-3 text-sm">{format(new Date(booking.check_out), 'MMM dd, yyyy')}</td>
                    <td className="p-3 text-sm">Rs {booking.price_per_night.toLocaleString()}</td>
                    <td className="p-3 text-sm">
                      <span className={booking.payment_method === 'cash' ? 'text-emerald-400' : 'text-blue-400'}>
                        {booking.payment_method === 'cash' ? '💵 Cash' : '💳 Online'}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        booking.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        booking.status === 'completed' ? 'bg-neutral-500/20 text-neutral-400' :
                        booking.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length > 20 && (
              <p className="text-neutral-400 text-center mt-4 text-sm">
                Showing first 20 of {bookings.length} bookings. Export CSV for complete data.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

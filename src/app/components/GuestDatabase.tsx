import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Guest } from '../types';
import { format } from 'date-fns';
import { Users, Star, Calendar, DollarSign, Phone, Mail, MapPin, Plus, Trash2, X } from 'lucide-react';

export function GuestDatabase() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'bookings' | 'spent' | 'lastVisit'>('bookings');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cnic: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('total_bookings', { ascending: false });

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async () => {
    if (!formData.name || !formData.phone) {
      alert('Please fill in Name and Phone (required fields)');
      return;
    }

    try {
      const { error } = await supabase.from('guests').insert([
        {
          name: formData.name,
          phone: formData.phone,
          cnic: formData.cnic || null,
          email: formData.email || null,
          address: formData.address || null,
          notes: formData.notes || null,
          total_bookings: 0,
          total_spent: 0,
          is_vip: false,
        },
      ]);

      if (error) throw error;

      setFormData({ name: '', phone: '', cnic: '', email: '', address: '', notes: '' });
      setShowAddForm(false);
      await loadGuests();
      alert('Guest added successfully!');
    } catch (error: any) {
      console.error('Error adding guest:', error);
      alert(error.message || 'Failed to add guest');
    }
  };

  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    if (!confirm(`Are you sure you want to delete ${guestName}? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.from('guests').delete().eq('id', guestId);

      if (error) throw error;

      await loadGuests();
      alert('Guest deleted successfully!');
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Failed to delete guest');
    }
  };

  const filteredAndSortedGuests = guests
    .filter((guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.includes(searchTerm) ||
      (guest.cnic && guest.cnic.includes(searchTerm))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'bookings':
          return b.total_bookings - a.total_bookings;
        case 'spent':
          return b.total_spent - a.total_spent;
        case 'lastVisit':
          if (!a.last_visit_date) return 1;
          if (!b.last_visit_date) return -1;
          return new Date(b.last_visit_date).getTime() - new Date(a.last_visit_date).getTime();
        default:
          return 0;
      }
    });

  const totalGuests = guests.length;
  const vipGuests = guests.filter((g) => g.is_vip).length;
  const repeatCustomers = guests.filter((g) => g.total_bookings > 1).length;
  const totalRevenue = guests.reduce((sum, g) => sum + g.total_spent, 0);

  if (loading) {
    return (
      <div className="text-center text-neutral-400 py-12">
        Loading guest database...
      </div>
    );
  }

  return (
    <div>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-neutral-400 text-sm">Total Guests</span>
          </div>
          <p className="text-3xl font-bold text-purple-400">{totalGuests}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-400" />
            <span className="text-neutral-400 text-sm">VIP Guests</span>
          </div>
          <p className="text-3xl font-bold text-amber-400">{vipGuests}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <span className="text-neutral-400 text-sm">Repeat Customers</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{repeatCustomers}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-neutral-400 text-sm">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">PKR {totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Add Guest Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Guest
        </button>
      </div>

      {/* Add Guest Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-neutral-900 border border-amber-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-lg">Add New Guest</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                placeholder="Guest name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                placeholder="03XX-XXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                CNIC
              </label>
              <input
                type="text"
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                placeholder="12345-1234567-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                placeholder="email@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                placeholder="Address"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none"
                rows={2}
                placeholder="Optional notes about the guest"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddGuest}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Save Guest
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search and Sort Controls */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, phone, or CNIC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[250px] px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
        >
          <option value="bookings">Sort by: Most Bookings</option>
          <option value="spent">Sort by: Highest Spending</option>
          <option value="lastVisit">Sort by: Last Visit</option>
          <option value="name">Sort by: Name (A-Z)</option>
        </select>
      </div>

      {/* Guests List */}
      {filteredAndSortedGuests.length === 0 ? (
        <div className="text-center text-neutral-500 py-12">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No guests found</p>
          <p className="text-sm mt-2">Guest data will appear here after bookings are created</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAndSortedGuests.map((guest) => (
            <div
              key={guest.id}
              className={`bg-neutral-900 border rounded-xl p-5 hover:border-amber-500/50 transition-all ${
                guest.is_vip ? 'border-amber-500/30' : 'border-neutral-800'
              }`}
            >
              {/* Guest Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {guest.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      {guest.name}
                      {guest.is_vip && (
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          VIP
                        </span>
                      )}
                    </h3>
                    <p className="text-neutral-400 text-sm flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {guest.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteGuest(guest.id, guest.name)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                  title="Delete guest"
                >
                  <Trash2 className="w-5 h-5 text-neutral-400 group-hover:text-red-400" />
                </button>
              </div>

              {/* Guest Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-neutral-800/50 rounded-lg">
                  <p className="text-neutral-400 text-xs mb-1">Bookings</p>
                  <p className="text-amber-400 font-bold text-lg">{guest.total_bookings}</p>
                </div>
                <div className="text-center p-2 bg-neutral-800/50 rounded-lg">
                  <p className="text-neutral-400 text-xs mb-1">Total Spent</p>
                  <p className="text-green-400 font-bold text-lg">
                    {guest.total_spent.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-2 bg-neutral-800/50 rounded-lg">
                  <p className="text-neutral-400 text-xs mb-1">Last Visit</p>
                  <p className="text-blue-400 font-bold text-sm">
                    {guest.last_visit_date
                      ? format(new Date(guest.last_visit_date), 'MMM dd')
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Guest Details */}
              <div className="space-y-2 text-sm">
                {guest.cnic && (
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="font-medium">CNIC:</span>
                    <span>{guest.cnic}</span>
                  </div>
                )}
                {guest.email && (
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Mail className="w-3 h-3" />
                    <span>{guest.email}</span>
                  </div>
                )}
                {guest.address && (
                  <div className="flex items-center gap-2 text-neutral-400">
                    <MapPin className="w-3 h-3" />
                    <span>{guest.address}</span>
                  </div>
                )}
                {guest.notes && (
                  <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-neutral-300">
                    <p className="text-xs text-neutral-400 mb-1">Notes:</p>
                    <p className="text-sm">{guest.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

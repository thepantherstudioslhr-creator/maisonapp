import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Room } from '../types';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RoomManagementProps {
  onClose: () => void;
}

export function RoomManagement({ onClose }: RoomManagementProps) {
  const { user, hasPermission } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    room_name: '',
    room_number: '',
    price: '',
    description: '',
    max_occupancy: '2',
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_name');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async () => {
    if (!formData.room_name || !formData.price) {
      alert('Please fill in room name and price');
      return;
    }

    try {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .limit(1)
        .single();

      if (!properties) {
        alert('No property found. Please create a property first.');
        return;
      }

      const { error } = await supabase.from('rooms').insert([
        {
          property_id: properties.id,
          room_name: formData.room_name,
          room_number: formData.room_number,
          price: parseFloat(formData.price),
          description: formData.description,
          max_occupancy: parseInt(formData.max_occupancy),
          is_active: true,
          cleaning_status: 'clean',
        },
      ]);

      if (error) throw error;

      setFormData({
        room_name: '',
        room_number: '',
        price: '',
        description: '',
        max_occupancy: '2',
      });
      setShowAddForm(false);
      await loadRooms();
      alert('Room added successfully!');
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Failed to add room');
    }
  };

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    if (!confirm(`Are you sure you want to delete ${roomName}? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ is_active: false })
        .eq('id', roomId);

      if (error) throw error;
      await loadRooms();
      alert('Room deactivated successfully!');
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    }
  };

  const handleUpdateRoom = async (room: Room) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          price: room.price,
          description: room.description,
          max_occupancy: room.max_occupancy,
        })
        .eq('id', room.id);

      if (error) throw error;
      setEditingRoom(null);
      await loadRooms();
      alert('Room updated successfully!');
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Failed to update room');
    }
  };

  if (!hasPermission('add_room')) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have permission to manage rooms.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Room Management</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Add Room Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Room
            </button>
          </div>

          {/* Add Room Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add New Room</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    value={formData.room_name}
                    onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., Maison Pearl 406"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., 406"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price per Night *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., 15000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Occupancy
                  </label>
                  <input
                    type="number"
                    value={formData.max_occupancy}
                    onChange={(e) => setFormData({ ...formData, max_occupancy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddRoom}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save Room
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Rooms List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">All Rooms ({rooms.length})</h3>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : rooms.length === 0 ? (
              <p className="text-gray-500">No rooms found. Add your first room above!</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 border rounded-lg ${
                      room.is_active
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {room.room_name}
                          {room.room_number && (
                            <span className="ml-2 text-sm text-gray-500">#{room.room_number}</span>
                          )}
                        </h4>
                        {editingRoom === room.id ? (
                          <div className="mt-2 space-y-2">
                            <input
                              type="number"
                              value={room.price}
                              onChange={(e) => {
                                const updated = rooms.map((r) =>
                                  r.id === room.id ? { ...r, price: parseFloat(e.target.value) } : r
                                );
                                setRooms(updated);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <textarea
                              value={room.description || ''}
                              onChange={(e) => {
                                const updated = rooms.map((r) =>
                                  r.id === room.id ? { ...r, description: e.target.value } : r
                                );
                                setRooms(updated);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <>
                            <p className="text-lg font-semibold text-amber-500 mt-1">
                              PKR {room.price.toLocaleString()}/night
                            </p>
                            {room.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{room.description}</p>
                            )}
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              <span>Max: {room.max_occupancy || 2} guests</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                room.cleaning_status === 'clean' ? 'bg-green-100 text-green-800' :
                                room.cleaning_status === 'cleaning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {room.cleaning_status}
                              </span>
                              {!room.is_active && (
                                <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {editingRoom === room.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateRoom(room)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Save changes"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingRoom(null);
                                loadRooms();
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingRoom(room.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit room"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            {room.is_active && hasPermission('remove_room') && (
                              <button
                                onClick={() => handleDeleteRoom(room.id, room.room_name)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Deactivate room"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { Settings as SettingsIcon, Moon, Sun, User, Building2, Users, X, Home } from 'lucide-react';
import { RoomManagement } from './RoomManagement';
import { UserManagement } from './UserManagement';

interface SettingsProps {
  onClose: () => void;
  onOpenRoomManagement?: () => void;
  onOpenUserManagement?: () => void;
}

export function Settings({ onClose, onOpenRoomManagement, onOpenUserManagement }: SettingsProps) {
  const { user, isAdmin, refreshUser } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(user?.theme_preference || 'light');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('users')
        .update({ theme_preference: newTheme })
        .eq('id', user?.id);

      if (error) throw error;

      await refreshUser();
      setMessage('Theme updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating theme:', error);
      setMessage('Failed to update theme');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">User Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Hotel Manager' : 'Staff Member'}
                </span>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Moon className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Appearance</h3>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                disabled={saving}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  theme === 'light'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Sun className="w-6 h-6 text-amber-500" />
                  <span className="font-medium">Light Mode</span>
                  {theme === 'light' && (
                    <span className="text-xs text-amber-600">Active</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                disabled={saving}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-amber-500 bg-gray-900 text-white'
                    : 'border-gray-200 hover:border-gray-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Moon className="w-6 h-6 text-amber-500" />
                  <span className="font-medium">Dark Mode</span>
                  {theme === 'dark' && (
                    <span className="text-xs text-amber-400">Active</span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Admin Only Sections */}
          {isAdmin && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Room Management</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add, edit, or remove rooms and apartments
                </p>
                <button
                  onClick={() => setShowRoomManagement(true)}
                  className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Manage Rooms
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">User Management</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add managers, staff, and assign roles
                </p>
                <button
                  onClick={() => setShowUserManagement(true)}
                  className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Manage Users
                </button>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Room Management Modal */}
      {showRoomManagement && (
        <RoomManagement onClose={() => setShowRoomManagement(false)} />
      )}

      {/* User Management Modal */}
      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
    </div>
  );
}

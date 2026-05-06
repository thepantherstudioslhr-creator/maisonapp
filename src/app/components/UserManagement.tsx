import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { User } from '../types';
import { UserPlus, Shield, Edit, Trash2, Key, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: any;
}

interface UserManagementProps {
  onClose?: () => void;
}

export default function UserManagement({ onClose }: UserManagementProps = {}) {
  const { user: currentUser, theme } = useAuth();
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [tableUsers, setTableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'manager'>('manager');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Load users from users table
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      setTableUsers(usersData || []);

      // Try to load auth users (admin only can see this)
      // Note: This requires admin API access - may need backend function
      console.log('Loaded users from table:', usersData?.length);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncAuthUserToTable = async (authUserId: string, email: string, role: 'admin' | 'manager') => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUserId,
          email: email,
          name: email.split('@')[0],
          role: role,
          is_active: true,
          theme_preference: 'dark',
        })
        .select()
        .single();

      if (error) throw error;

      alert('✅ User synced successfully!');
      loadUsers();
    } catch (error: any) {
      console.error('Error syncing user:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'manager') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      alert('✅ Role updated successfully!');
      loadUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      alert(`✅ User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      loadUsers();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      alert('✅ User deleted successfully!');
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      alert('❌ Please enter email and password');
      return;
    }

    if (newUserPassword.length < 6) {
      alert('❌ Password must be at least 6 characters');
      return;
    }

    try {
      setCreating(true);

      // Check if user already exists in table
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', newUserEmail)
        .maybeSingle();

      if (existing) {
        alert('❌ A user with this email already exists.');
        return;
      }

      // Attempt to create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          emailRedirectTo: undefined,
          data: { name: newUserEmail.split('@')[0] }
        }
      });

      // Handle email rate limit — create table record anyway so admin can finish in Supabase dashboard
      if (authError) {
        const isRateLimit = authError.message?.toLowerCase().includes('rate limit') ||
          authError.message?.toLowerCase().includes('email rate');

        if (isRateLimit) {
          const { error: tableError } = await supabase
            .from('users')
            .insert({
              email: newUserEmail,
              name: newUserEmail.split('@')[0],
              role: newUserRole,
              is_active: false,
              theme_preference: 'dark',
            });

          if (tableError) throw tableError;

          alert(
            '⚠️ Email rate limit reached — Supabase is throttling sign-up emails.\n\n' +
            'The user record has been created in the database (inactive).\n\n' +
            'To finish setup:\n' +
            '1. Go to your Supabase dashboard → Authentication → Users\n' +
            '2. Click "Add user" → "Create new user"\n' +
            '3. Enter: ' + newUserEmail + ' / ' + newUserPassword + '\n' +
            '4. Then come back here and activate the user.'
          );

          setShowCreateModal(false);
          setNewUserEmail('');
          setNewUserPassword('');
          setNewUserRole('manager');
          loadUsers();
          return;
        }

        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create auth user');
      }

      // Create user in users table linked to auth account
      const { error: tableError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authData.user.id,
          email: newUserEmail,
          name: newUserEmail.split('@')[0],
          role: newUserRole,
          is_active: true,
          theme_preference: 'dark',
        });

      if (tableError) throw tableError;

      alert('✅ User created successfully!\n\n📧 Email: ' + newUserEmail + '\n🔑 Password: ' + newUserPassword);

      setShowCreateModal(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('manager');
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-4 text-center">
        <Shield className="w-12 h-12 mx-auto mb-2 text-red-500" />
        <p className="text-red-500">Admin access required</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50' 
        : 'bg-gradient-to-br from-black via-neutral-900 to-neutral-800'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${
          theme === 'light'
            ? 'bg-white/80 border-amber-200'
            : 'bg-neutral-900/80 border-neutral-700'
        } backdrop-blur-sm rounded-lg border p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-amber-800' : 'text-yellow-500'
              }`}>
                User Management
              </h1>
              <p className={theme === 'light' ? 'text-amber-600' : 'text-gray-400'}>
                Manage user accounts and permissions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:shadow-lg flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className={`${
          theme === 'light'
            ? 'bg-white/80 border-amber-200'
            : 'bg-neutral-900/80 border-neutral-700'
        } backdrop-blur-sm rounded-lg border overflow-hidden`}>
          {loading ? (
            <div className="p-8 text-center">
              <p className={theme === 'light' ? 'text-amber-600' : 'text-gray-400'}>
                Loading users...
              </p>
            </div>
          ) : tableUsers.length === 0 ? (
            <div className="p-8 text-center">
              <UserPlus className={`w-12 h-12 mx-auto mb-2 ${
                theme === 'light' ? 'text-amber-500' : 'text-gray-600'
              }`} />
              <p className={theme === 'light' ? 'text-amber-600' : 'text-gray-400'}>
                No users found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={
                  theme === 'light'
                    ? 'bg-amber-100 border-b border-amber-200'
                    : 'bg-neutral-800 border-b border-neutral-700'
                }>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${
                      theme === 'light' ? 'text-amber-800' : 'text-gray-300'
                    }`}>
                      Email
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${
                      theme === 'light' ? 'text-amber-800' : 'text-gray-300'
                    }`}>
                      Name
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${
                      theme === 'light' ? 'text-amber-800' : 'text-gray-300'
                    }`}>
                      Role
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${
                      theme === 'light' ? 'text-amber-800' : 'text-gray-300'
                    }`}>
                      Status
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${
                      theme === 'light' ? 'text-amber-800' : 'text-gray-300'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {tableUsers.map((user) => (
                    <tr key={user.id} className={
                      theme === 'light'
                        ? 'hover:bg-amber-50'
                        : 'hover:bg-neutral-800/50'
                    }>
                      <td className={`px-4 py-3 ${
                        theme === 'light' ? 'text-amber-900' : 'text-gray-300'
                      }`}>
                        {user.email}
                      </td>
                      <td className={`px-4 py-3 ${
                        theme === 'light' ? 'text-amber-800' : 'text-gray-400'
                      }`}>
                        {user.name}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                          className={`px-3 py-1 rounded ${
                            theme === 'light'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-neutral-700 text-yellow-500 border-neutral-600'
                          } border`}
                          disabled={user.id === currentUser.id}
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className="flex items-center gap-1"
                          disabled={user.id === currentUser.id}
                        >
                          {user.is_active ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 text-sm">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-red-500 text-sm">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={user.id === currentUser.id}
                          className={`p-1 rounded hover:bg-red-500/20 ${
                            user.id === currentUser.id
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Instructions Card */}
        <div className={`${
          theme === 'light'
            ? 'bg-amber-100/50 border-amber-300 text-amber-800'
            : 'bg-neutral-800/50 border-yellow-500/20 text-gray-300'
        } border rounded-lg p-4 mt-6`}>
          <h3 className={`font-semibold mb-2 ${
            theme === 'light' ? 'text-amber-900' : 'text-yellow-500'
          }`}>
            📝 How to Add New Users:
          </h3>
          <ol className="space-y-2 text-sm">
            <li>
              <strong>Step 1:</strong> Click "Add User" button above
            </li>
            <li>
              <strong>Step 2:</strong> Enter email, password, and select role
            </li>
            <li>
              <strong>Step 3:</strong> User can immediately login with those credentials!
            </li>
            <li className={theme === 'light' ? 'text-amber-700' : 'text-yellow-500'}>
              <strong>Note:</strong> No email confirmation required - user works immediately!
            </li>
          </ol>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${
            theme === 'light'
              ? 'bg-white border-amber-200'
              : 'bg-neutral-900 border-neutral-700'
          } rounded-lg border max-w-md w-full p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${
              theme === 'light' ? 'text-amber-800' : 'text-yellow-500'
            }`}>
              Create New User
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'light' ? 'text-amber-700' : 'text-gray-300'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    theme === 'light'
                      ? 'bg-white border-amber-300 text-amber-900'
                      : 'bg-neutral-800 border-neutral-600 text-white'
                  }`}
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'light' ? 'text-amber-700' : 'text-gray-300'
                }`}>
                  Password
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    theme === 'light'
                      ? 'bg-white border-amber-300 text-amber-900'
                      : 'bg-neutral-800 border-neutral-600 text-white'
                  }`}
                  placeholder="Min 6 characters"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'light' ? 'text-amber-700' : 'text-gray-300'
                }`}>
                  Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded border ${
                    theme === 'light'
                      ? 'bg-white border-amber-300 text-amber-900'
                      : 'bg-neutral-800 border-neutral-600 text-white'
                  }`}
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createUser}
                disabled={creating}
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create User'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewUserEmail('');
                  setNewUserPassword('');
                  setNewUserRole('manager');
                }}
                disabled={creating}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  theme === 'light'
                    ? 'border-amber-300 text-amber-800 hover:bg-amber-50'
                    : 'border-neutral-600 text-gray-300 hover:bg-neutral-800'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
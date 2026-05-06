import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { User } from '../types';
import { hasPermission, PermissionType } from '../utils/permissions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: PermissionType) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  refreshUser: () => Promise<void>;
  theme: 'light' | 'dark';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .single();

        if (userData) {
          setUser(userData as User);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 Attempting login for:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Login error:', error);

      // Detailed error messages
      if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
        throw new Error('Authentication service configuration error. Please contact administrator.');
      }

      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Make sure user exists in Supabase Auth.');
      }

      if (error.message.includes('Email not confirmed')) {
        throw new Error(
          'Email not confirmed. Fix this by running in Supabase SQL Editor:\n\n' +
          `UPDATE auth.users SET email_confirmed_at = now() WHERE email = '${email}';`
        );
      }

      throw error;
    }

    console.log('✅ Auth successful, user ID:', data.user?.id);

    if (data.user) {
      // First check if user exists in users table
      let { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();

      // If user doesn't exist in users table by auth_user_id, check by email (may exist from rate-limit fallback)
      if (!userData) {
        const { data: emailMatch } = await supabase
          .from('users')
          .select('*')
          .eq('email', data.user.email!)
          .maybeSingle();

        if (emailMatch) {
          // Link the auth account and activate the existing record
          const { data: updated, error: updateError } = await supabase
            .from('users')
            .update({ auth_user_id: data.user.id, is_active: true })
            .eq('email', data.user.email!)
            .select()
            .single();

          if (updateError) {
            console.error('Error linking user:', updateError);
            throw new Error('Failed to link user profile. Please contact admin.');
          }

          userData = updated;
          console.log('✅ Existing user linked to auth account:', userData);
        } else {
          // No record at all — create fresh
          const role = email.includes('admin') ? 'admin' : 'manager';

          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              auth_user_id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              role,
              is_active: true,
              theme_preference: 'dark',
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating user in users table:', createError);
            throw new Error('Failed to create user profile. Please contact admin.');
          }

          userData = newUser;
          console.log('✅ User created in users table:', userData);
        }
      }

      if (userData) {
        setUser(userData as User);
      }
    }
  };

  const refreshUser = async () => {
    await checkUser();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const checkPermission = (permission: PermissionType): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasPermission: checkPermission,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isStaff: user?.role === 'staff',
    refreshUser,
    theme: user?.theme_preference || 'dark',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
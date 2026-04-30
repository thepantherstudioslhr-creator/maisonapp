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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();

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

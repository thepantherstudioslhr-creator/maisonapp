import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OnlineStatus } from './components/OnlineStatus';
import { PWADebugInfo } from './components/PWADebugInfo';
import logoImage from '../imports/555031729_122102984955033682_4637142757421852213_n.jpg';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-neutral-800">
        <div className="text-center">
          <img
            src={logoImage}
            alt="Maison Royale"
            className="w-32 h-32 mx-auto mb-4 animate-pulse"
          />
          <p className="text-yellow-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? <Dashboard /> : <LoginScreen />}
      <OnlineStatus />
      <PWAInstallPrompt />
      <PWADebugInfo />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

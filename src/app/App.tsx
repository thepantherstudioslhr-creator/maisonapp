import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import logoImage from '../imports/555031729_122102984955033682_4637142757421852213_n.jpg';

function AppContent() {
  const { user, loading, theme } = useAuth();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'light'
          ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50'
          : 'bg-gradient-to-br from-black via-neutral-900 to-neutral-800'
      }`}>
        <div className="text-center">
          <img
            src={logoImage}
            alt="Maison Royale"
            className="w-32 h-32 mx-auto mb-4 animate-pulse"
          />
          <p className={theme === 'light' ? 'text-amber-600' : 'text-yellow-500'}>Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
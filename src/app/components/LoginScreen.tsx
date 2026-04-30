import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LOGO_URL } from '../assets/logo';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <img
            src={LOGO_URL}
            alt="Maison Royale Residency"
            className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 rounded-2xl shadow-2xl shadow-amber-500/20 object-cover"
          />
          <h1 className="text-3xl sm:text-4xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent mb-2 font-bold">
            MAISON ROYALE
          </h1>
          <p className="text-amber-600/80 text-sm tracking-widest">RESIDENCY</p>
        </div>

        {/* Login Form */}
        <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl sm:text-2xl text-amber-400 text-center mb-6 font-semibold">Admin Portal</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-neutral-300 mb-2 text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all text-base"
                placeholder="admin@maisonroyale.com"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-300 mb-2 text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all text-base"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-neutral-900 py-3.5 sm:py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 transition-all disabled:opacity-50 font-bold text-base sm:text-lg active:scale-98 mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-neutral-600 text-xs sm:text-sm mt-6">
          © 2026 Maison Royale Residency
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;

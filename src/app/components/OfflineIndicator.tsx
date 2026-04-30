import React, { useState, useEffect } from 'react';
import { isOnline, setupOfflineListener, syncPendingBookings, getPendingBookings } from '../utils/offlineSync';

const OfflineIndicator: React.FC = () => {
  const [online, setOnline] = useState(isOnline());
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const cleanup = setupOfflineListener(
      async () => {
        setOnline(true);
        // Auto-sync when coming back online
        await handleSync();
      },
      () => {
        setOnline(false);
      }
    );

    // Check pending bookings on mount
    checkPending();

    return cleanup;
  }, []);

  const checkPending = async () => {
    const pending = await getPendingBookings();
    setPendingCount(pending.length);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncPendingBookings();
      if (result.success > 0) {
        alert(`✅ Synced ${result.success} offline booking(s)!`);
      }
      await checkPending();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (online && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {!online && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-center text-sm font-semibold pointer-events-auto">
          <span className="inline-block mr-2">🔴</span>
          OFFLINE MODE - Bookings will sync when online
        </div>
      )}

      {online && pendingCount > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 text-center text-sm font-semibold pointer-events-auto">
          <span className="inline-block mr-2">⚠️</span>
          {pendingCount} booking(s) waiting to sync
          <button
            onClick={handleSync}
            disabled={syncing}
            className="ml-4 bg-white text-blue-600 px-4 py-1 rounded-full font-bold hover:bg-blue-50 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;

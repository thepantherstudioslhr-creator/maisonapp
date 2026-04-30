import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setIsSyncing(true);
      
      // Trigger sync
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SYNC_NOW' });
      }
      
      // Hide status after 5 seconds
      setTimeout(() => {
        setShowStatus(false);
        setIsSyncing(false);
      }, 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
      setIsSyncing(false);
    };

    // Listen for service worker sync complete
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        setIsSyncing(false);
        console.log('Sync completed:', event.data.count, 'items');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    // Show initial status if offline
    if (!navigator.onLine) {
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg transition-all ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      {isSyncing ? (
        <RefreshCw className="w-5 h-5 animate-spin" />
      ) : isOnline ? (
        <Wifi className="w-5 h-5" />
      ) : (
        <WifiOff className="w-5 h-5" />
      )}
      
      <span className="font-medium text-sm">
        {isSyncing ? 'Syncing data...' : isOnline ? 'Back online!' : 'Offline mode'}
      </span>
    </div>
  );
}

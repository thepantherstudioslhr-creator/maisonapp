import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export function PWADebugInfo() {
  const [isVisible, setIsVisible] = useState(false);
  const [pwaStatus, setPwaStatus] = useState({
    serviceWorker: false,
    manifest: false,
    https: false,
    standalone: false,
    installable: false,
  });

  useEffect(() => {
    // Check PWA criteria
    const checkPWAStatus = async () => {
      const status = {
        serviceWorker: 'serviceWorker' in navigator,
        manifest: document.querySelector('link[rel="manifest"]') !== null,
        https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
        standalone: window.matchMedia('(display-mode: standalone)').matches || 
                   (window.navigator as any).standalone === true,
        installable: false,
      };

      // Check if installable
      window.addEventListener('beforeinstallprompt', () => {
        status.installable = true;
        setPwaStatus({ ...status });
      });

      setPwaStatus(status);
    };

    checkPWAStatus();

    // Show debug on triple click bottom-left
    let clickCount = 0;
    const handleClick = (e: MouseEvent) => {
      if (e.clientY > window.innerHeight - 50 && e.clientX < 50) {
        clickCount++;
        if (clickCount === 3) {
          setIsVisible(!isVisible);
          clickCount = 0;
        }
        setTimeout(() => { clickCount = 0; }, 1000);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 bg-black/90 text-white p-4 rounded-lg shadow-2xl z-50 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">PWA Debug Info</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <StatusRow 
          label="Service Worker" 
          status={pwaStatus.serviceWorker} 
        />
        <StatusRow 
          label="Manifest" 
          status={pwaStatus.manifest} 
        />
        <StatusRow 
          label="HTTPS" 
          status={pwaStatus.https} 
        />
        <StatusRow 
          label="Installable" 
          status={pwaStatus.installable} 
          warning={!pwaStatus.installable}
        />
        <StatusRow 
          label="Already Installed" 
          status={pwaStatus.standalone} 
        />
      </div>

      <div className="mt-4 pt-3 border-t border-white/20 text-xs text-white/60">
        <p>Protocol: {window.location.protocol}</p>
        <p>Host: {window.location.hostname}</p>
        <p className="mt-2">
          {pwaStatus.installable 
            ? '✅ Ready to install!' 
            : '⚠️ Install prompt not available yet'}
        </p>
      </div>

      <button
        onClick={() => {
          console.log('=== PWA DEBUG INFO ===');
          console.log('Service Worker:', 'serviceWorker' in navigator);
          console.log('Manifest:', document.querySelector('link[rel="manifest"]'));
          console.log('HTTPS:', window.location.protocol);
          console.log('Standalone:', window.matchMedia('(display-mode: standalone)').matches);
          navigator.serviceWorker?.getRegistration().then(reg => {
            console.log('SW Registration:', reg);
          });
        }}
        className="mt-3 w-full bg-amber-500 text-white py-2 rounded text-sm font-medium hover:bg-amber-600"
      >
        Log to Console
      </button>
    </div>
  );
}

function StatusRow({ label, status, warning }: { label: string; status: boolean; warning?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/80">{label}:</span>
      <span className="flex items-center gap-1">
        {status ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-500">Yes</span>
          </>
        ) : warning ? (
          <>
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500">No</span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-500">No</span>
          </>
        )}
      </span>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = (window.navigator as any).standalone || isStandalone;

    if (isInstalled) {
      console.log('✅ App already installed');
      return; // Don't show prompt if already installed
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      console.log('⏸️ User previously dismissed install prompt');
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 Install prompt event received!');
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt immediately (no delay!)
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Debug: Check if event fires
    console.log('👂 Listening for beforeinstallprompt event...');

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.error('❌ No deferred prompt available');
      return;
    }

    console.log('📥 Showing install prompt...');
    
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`✅ User response to install prompt: ${outcome}`);
    
    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    console.log('⏸️ User dismissed install prompt');
    setShowPrompt(false);
    // Remember dismissal
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg shadow-2xl p-4 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-3 mb-3">
        <div className="bg-white/20 rounded-full p-2">
          <Download className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Install Maison Royale</h3>
          <p className="text-sm text-white/90">
            Install app on your device for quick access and offline use!
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-white text-amber-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-amber-50 transition-colors"
        >
          Install Now
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2.5 text-white/90 hover:text-white font-medium transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
}
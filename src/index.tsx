import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                if (confirm('New version available! Reload to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        console.log('✅ Offline data synced:', event.data.count, 'requests');
        // You can show a toast notification here
      }
    });
  });
}

// Handle online/offline events
window.addEventListener('online', () => {
  console.log('🌐 Back online! Syncing data...');
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SYNC_NOW' });
  }
  // Show online notification
  document.body.style.borderTop = '3px solid #10b981';
  setTimeout(() => {
    document.body.style.borderTop = '';
  }, 3000);
});

window.addEventListener('offline', () => {
  console.log('📡 Offline mode - Changes will sync when connection is restored');
  // Show offline notification
  document.body.style.borderTop = '3px solid #ef4444';
});

// PWA Install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('💡 PWA install prompt available');
  // You can show a custom install button here
});
import { supabase } from './supabase';

interface PendingBooking {
  id?: number;
  data: any;
  timestamp: number;
}

const DB_NAME = 'maison_royale_offline';
const STORE_NAME = 'pending_bookings';

// Open IndexedDB for offline storage
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Save booking offline
export async function saveBookingOffline(bookingData: any): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const pendingBooking: PendingBooking = {
    data: bookingData,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const request = store.add(pendingBooking);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get all pending offline bookings
export async function getPendingBookings(): Promise<PendingBooking[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Delete synced booking
export async function deleteBooking(id: number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Sync all pending bookings when online
export async function syncPendingBookings(): Promise<{ success: number; failed: number }> {
  const pending = await getPendingBookings();
  let success = 0;
  let failed = 0;

  for (const booking of pending) {
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([booking.data]);

      if (error) throw error;

      // Delete from offline storage after successful sync
      if (booking.id) {
        await deleteBooking(booking.id);
      }
      success++;
    } catch (error) {
      console.error('Failed to sync booking:', error);
      failed++;
    }
  }

  return { success, failed };
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Listen for online/offline events
export function setupOfflineListener(onOnline: () => void, onOffline: () => void): () => void {
  const handleOnline = () => {
    console.log('🟢 Back online - syncing...');
    onOnline();
  };

  const handleOffline = () => {
    console.log('🔴 Offline mode activated');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

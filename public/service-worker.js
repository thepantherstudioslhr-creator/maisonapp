// Maison Royale - Service Worker for PWA
// Version 1.0.0

const CACHE_NAME = 'maison-royale-v1';
const RUNTIME_CACHE = 'maison-royale-runtime-v1';
const OFFLINE_QUEUE = 'maison-royale-offline-queue';

// Files to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching offline page');
        return cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - Network first, cache fallback
  if (request.url.includes('/rest/v1/') || request.url.includes('supabase')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // For navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Static assets - Cache first, network fallback
  event.respondWith(cacheFirstStrategy(request));
});

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Fetch failed:', error);
    return new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network First Strategy (for API calls)
async function networkFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache');
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a GET request and we have no cache, queue it for later
    if (request.method === 'GET') {
      return new Response(JSON.stringify({ 
        error: 'Offline',
        message: 'You are offline. Data will sync when connection is restored.' 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For POST/PUT/DELETE requests, save to IndexedDB for sync later
    if (request.method !== 'GET') {
      await queueOfflineRequest(request);
      return new Response(JSON.stringify({ 
        success: true,
        offline: true,
        message: 'Request queued. Will sync when online.' 
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Queue offline requests for later sync
async function queueOfflineRequest(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: {},
    body: null,
    timestamp: Date.now()
  };

  // Copy headers
  for (let [key, value] of request.headers.entries()) {
    requestData.headers[key] = value;
  }

  // Clone body
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    requestData.body = await request.clone().text();
  }

  // Store in IndexedDB
  const db = await openQueueDB();
  const tx = db.transaction(OFFLINE_QUEUE, 'readwrite');
  const store = tx.objectStore(OFFLINE_QUEUE);
  await store.add(requestData);
  
  console.log('[Service Worker] Request queued for offline sync:', requestData);
}

// Open IndexedDB for offline queue
function openQueueDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MaisonRoyaleOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OFFLINE_QUEUE)) {
        db.createObjectStore(OFFLINE_QUEUE, { keyPath: 'timestamp' });
      }
    };
  });
}

// Background Sync - Process queued requests when back online
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered');
  
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncQueuedRequests());
  }
});

// Sync queued offline requests
async function syncQueuedRequests() {
  const db = await openQueueDB();
  const tx = db.transaction(OFFLINE_QUEUE, 'readonly');
  const store = tx.objectStore(OFFLINE_QUEUE);
  const requests = await store.getAll();
  
  console.log('[Service Worker] Syncing', requests.length, 'queued requests');
  
  for (const requestData of requests) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body
      });
      
      if (response.ok) {
        // Remove from queue after successful sync
        const deleteTx = db.transaction(OFFLINE_QUEUE, 'readwrite');
        const deleteStore = deleteTx.objectStore(OFFLINE_QUEUE);
        await deleteStore.delete(requestData.timestamp);
        console.log('[Service Worker] Synced request:', requestData.url);
      }
    } catch (error) {
      console.error('[Service Worker] Failed to sync request:', error);
    }
  }
  
  // Notify clients that sync is complete
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      count: requests.length
    });
  });
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SYNC_NOW') {
    syncQueuedRequests();
  }
});

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-bookings-periodic') {
    event.waitUntil(syncQueuedRequests());
  }
});

console.log('[Service Worker] Loaded successfully');

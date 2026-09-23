// Service Worker for Packet PWA
const CACHE_NAME = 'packet-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  // Add other assets as needed
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Install completed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Install failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Activation completed');
      return self.clients.claim();
    })
    .catch((error) => {
      console.error('Service Worker: Activation failed:', error);
    })
  );
});

// Fetch event - Cache-first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    // Network-first for API requests
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache error responses
          if (!response.ok) {
            return response;
          }
          
          // Clone the response to cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For app assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Update cache in background
          fetchAndCache(event.request);
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetchAndCache(event.request);
      })
      .catch(() => {
        // Both cache and network failed
        if (event.request.mode === 'navigate') {
          // For navigation requests, return offline page
          return caches.match('/index.html');
        }
        
        // For other requests, return empty response
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
  );
});

// Helper function to fetch and cache
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      // Check if we received a valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      
      // Clone the response to cache
      const responseToCache = response.clone();
      
      caches.open(CACHE_NAME)
        .then((cache) => {
          cache.put(request, responseToCache);
        });
      
      return response;
    });
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'sync-places') {
    event.waitUntil(syncOfflinePlaces());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  
  const options = {
    body: data.body || 'New update from Packet',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Packet', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    const url = event.notification.data.url || '/';
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Periodic sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'daily-sync') {
      console.log('Service Worker: Daily sync triggered');
      event.waitUntil(syncWithCloud());
    }
  });
}

// Sync offline places (mock implementation)
async function syncOfflinePlaces() {
  console.log('Syncing offline places...');
  
  // In a real app, this would sync with Supabase
  // For now, just log and clear offline flag
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      timestamp: new Date().toISOString()
    });
  });
  
  return Promise.resolve();
}

// Sync with cloud (mock implementation)
async function syncWithCloud() {
  console.log('Syncing with cloud...');
  
  // This would be your actual sync logic
  // For now, just return a resolved promise
  return Promise.resolve();
}

// Handle messages from the client
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_ASSETS') {
    const assets = event.data.assets || [];
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(assets))
    );
  }
});
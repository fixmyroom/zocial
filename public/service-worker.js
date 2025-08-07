const CACHE_NAME = 'fixmyroom-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/profile.html',
  '/role.html',
  '/customer.html',
  '/worker.html',
  '/store.html',
  '/admin.html',
  '/css/dashboard.css',
  '/js/firebase-config.js',
  '/js/auth.js',
  '/js/role-handler.js',
  '/js/map.js',
  '/js/customer-tools.js',
  '/js/requests.js',
  '/js/premium.js',
  '/js/store-tools.js',
  '/js/admin.js',
  '/js/utils.js',
  '/manifest.json',
  '/img/logo.png'
];

// Install event: cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('🛠️ Caching app shell...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🧹 Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event: serve cached assets first, then network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  // Only handle GET requests
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        // Return cached response if available
        return cachedResponse;
      }
      // Otherwise fetch from network and cache it
      return fetch(request)
        .then(networkResponse => {
          if (
            !networkResponse || 
            networkResponse.status !== 200 || 
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // Optional: fallback page or offline image if fetch fails
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

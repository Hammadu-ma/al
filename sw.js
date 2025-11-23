const CACHE_NAME = 'vercel-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/register.html',
  '/profile.html',
  '/dashboard.html',
  '/offline.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  console.log('🚀 Vercel SW: Installing on', self.origin);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Opened cache, adding files...');
        return cache.addAll(urlsToCache.map(url => new Request(url, {
          credentials: 'same-origin'
        })));
      })
      .then(() => {
        console.log('✅ All files cached successfully!');
        return self.skipWaiting();
      })
      .catch(error => {
        console.log('❌ Cache failed:', error);
        // Don't fail the installation if caching fails
        return self.skipWaiting();
      })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Only handle same-origin GET requests
  if (url.origin !== self.origin || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache successful responses
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(error => {
            // Show offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

self.addEventListener('activate', event => {
  console.log('🔥 Vercel SW: Activated!');
  event.waitUntil(self.clients.claim());
});
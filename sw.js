const CACHE_NAME = 'working-cache-v1';

// Only cache files we know exist
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/offline.html'
];

self.addEventListener('install', event => {
  console.log('🚀 SW INSTALL: Starting...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache opened, beginning file caching...');
        
        // Cache each file individually with error handling
        const cachePromises = urlsToCache.map(url => {
          return fetch(url, { cache: 'no-cache' })
            .then(response => {
              if (!response.ok) {
                throw new Error(`Bad status: ${response.status}`);
              }
              // Clone the response before using it
              const responseClone = response.clone();
              return cache.put(url, responseClone);
            })
            .then(() => {
              console.log(`✅ Cached: ${url}`);
              return true;
            })
            .catch(error => {
              console.log(`⚠️ Failed to cache ${url}:`, error.message);
              return false; // Don't stop other files from caching
            });
        });
        
        return Promise.all(cachePromises).then(results => {
          const successful = results.filter(Boolean).length;
          console.log(`🎉 Caching complete: ${successful}/${urlsToCache.length} files cached`);
        });
      })
      .then(() => {
        console.log('✨ Skip waiting called');
        return self.skipWaiting();
      })
      .catch(error => {
        console.log('💥 Installation failed:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Only handle same-origin navigation requests
  if (url.origin === location.origin && event.request.mode === 'navigate') {
    console.log('🔄 Handling navigation to:', url.pathname);
    
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Return cached version if available
          if (cachedResponse) {
            console.log('✅ Serving from cache:', url.pathname);
            return cachedResponse;
          }
          
          // Otherwise fetch from network
          console.log('🌐 Fetching from network:', url.pathname);
          return fetch(event.request)
            .then(networkResponse => {
              // Cache the successful response
              if (networkResponse.ok) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache));
              }
              return networkResponse;
            })
            .catch(error => {
              console.log('❌ Network failed, showing offline page');
              return caches.match('/offline.html');
            });
        })
    );
  }
});

self.addEventListener('activate', event => {
  console.log('🔥 SW ACTIVATE: Ready for action!');
  event.waitUntil(self.clients.claim());
});
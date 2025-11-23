const CACHE_NAME = 'debug-cache-v1';

// Start with ONLY 2 files to test
const urlsToCache = [
  '/',
  '/offline.html'
];

self.addEventListener('install', event => {
  console.log('🔧 DEBUG: Starting installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('🔧 DEBUG: Cache opened successfully');
        
        // Cache files one by one to see which fail
        const cachePromises = urlsToCache.map(url => {
          return fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP ${response.status} for ${url}`);
              }
              console.log(`✅ DEBUG: Successfully fetched ${url}`);
              return cache.put(url, response);
            })
            .catch(error => {
              console.log(`❌ DEBUG: Failed to cache ${url}:`, error.message);
              return Promise.resolve(); // Continue despite errors
            });
        });
        
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('🔧 DEBUG: Installation completed');
        return self.skipWaiting();
      })
      .catch(error => {
        console.log('🔧 DEBUG: Installation failed completely:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    console.log('🔧 DEBUG: Fetching page:', event.request.url);
    
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          if (cached) {
            console.log('✅ DEBUG: Serving from cache');
            return cached;
          }
          console.log('🌐 DEBUG: Fetching from network');
          return fetch(event.request);
        })
        .catch(() => {
          console.log('❌ DEBUG: Offline - no cache');
          return new Response('Offline - no cached version');
        })
    );
  }
});

self.addEventListener('activate', event => {
  console.log('🔧 DEBUG: Service Worker activated!');
  event.waitUntil(self.clients.claim());
});
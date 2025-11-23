const CACHE_NAME = 'medical-app-v4';
const urlsToCache = [
  // Root files
  '/',
  '/index.html',
  '/register.html',
  '/profile.html',
  '/dashboard.html',
  '/offline.html',
  '/manifest.json',
  '/notifications.html',
  
  // Year 1 main pages
  '/yr1/ps.html',
  '/yr1/pc.html',
  '/yr1/im.html',
  '/yr1/an.html',
  '/yr1/pcd.html',
  '/yr1/pr.html',
  '/yr1/pt.html',
  
  // pt subfolder
  '/yr1/pt/hem1.html',
  '/yr1/pt/logo.png',
  '/yr1/pt/pte2013.html',
  '/yr1/pt/pte2014.html',
  '/yr1/pt/pte2014e.html',
  '/yr1/pt/pte2017.html',
  '/yr1/pt/ptp-1.html',
  '/yr1/pt/ptp-2.html',
  '/yr1/pt/ptp-3.html',
  '/yr1/pt/ptp-4.html',
  '/yr1/pt/ptp-5.html',

  // pc
  '/yr1/pc/2014.13.png',
  '/yr1/pc/2014.14.png',
  '/yr1/pc/2015.8.png',
  '/yr1/pc/2015.9.png',
  '/yr1/pc/2015.54.png',
  '/yr1/pc/logo.png',
  '/yr1/pc/pce.2014.html',
  '/yr1/pc/pce.2014re.html',
  '/yr1/pc/pce.2015.html',
  '/yr1/pc/pce.2016.html',
  
  // pcd
  '/yr1/pcd/logo.png',
  '/yr1/pcd/pcd.2014.html',
  '/yr1/pcd/pcd.2016.html',
  '/yr1/pcd/pcd2016.html',
  
  // micro
  '/yr1/micro/logo.png',
  '/yr1/micro/mib.2013.html',
  '/yr1/micro/mib.2015.html',
  '/yr1/micro/mibpr1.html',
  '/yr1/micro/mibpr2.html',
  '/yr1/micro/micro2.html',
  '/yr1/micro/microp1.html',
  
  // im
  '/yr1/im/ime2013.html',
  '/yr1/im/ime2014,2015.html',
  '/yr1/im/impl.html',
  '/yr1/im/logo - Copy.png',
  '/yr1/im/logo.png',
  
  // pr
  '/yr1/pr/logo.png',
  '/yr1/pr/pre.2014.html',
  '/yr1/pr/pre.2015.html',
  '/yr1/pr/pre.2016.html',
  
  // bc
  '/yr1/bc/bce2014.html',
  '/yr1/bc/bio-chem.2013.html',
  '/yr1/bc/bio-chem.2015.html',
];

self.addEventListener('install', event => {
  console.log('🚀 Medical App SW: Installing and caching', urlsToCache.length, 'files...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache opened, beginning individual file caching...');
        
        // Cache files individually to prevent complete failure
        const cachePromises = urlsToCache.map(url => {
          return fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }
              return cache.put(url, response);
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
          const successful = results.filter(result => result).length;
          const failed = results.filter(result => !result).length;
          console.log(`🎉 Caching completed: ${successful} successful, ${failed} failed`);
        });
      })
      .then(() => {
        console.log('✨ Installation completed');
        return self.skipWaiting();
      })
      .catch(error => {
        console.log('💥 Installation failed completely:', error);
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
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache successful responses from our origin
            if (networkResponse.status === 200 && url.origin === self.origin) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('❌ Network failed for:', url.pathname);
            // Show offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            // For images, return nothing
            if (event.request.destination === 'image') {
              return new Response('', { status: 404 });
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

self.addEventListener('activate', event => {
  console.log('🔥 Medical App SW: Activated!');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
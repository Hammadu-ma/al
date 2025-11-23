const CACHE_NAME = 'your-app-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/register.html',
  '/profile.html',
  '/dashboard.html',
  
  // Year 1 main pages
  '/yr1/ps.html',
  '/yr1/pc.html',
  '/yr1/micro.html',
  
  // PS subfolder - ADD ALL YOUR ACTUAL FILES
  '/yr1/ps/pse2017.html',
  '/yr1/ps/pse2018.html',
  '/yr1/ps/pse2019.html',
  // Add all other PS files...
  
  // PC subfolder
  '/yr1/pc/pce2017.html',
  '/yr1/pc/pce2018.html', 
  '/yr1/pc/pce2019.html',
  // Add all other PC files...
  
  // Micro subfolder
  '/yr1/micro/microe2017.html',
  '/yr1/micro/microe2018.html',
  '/yr1/micro/microe2019.html',
  // Add all other Micro files...
  
  // CSS, JS, and other assets - UPDATE WITH YOUR ACTUAL PATHS
  '/styles/main.css',
  '/scripts/app.js', 
  '/images/logo.png',
  
  // Offline page
  '/offline.html'
];

// Install event - cache all resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version
        if (response) {
          return response;
        }

        // Fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If navigation request and offline, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            // For other requests (images, css, etc.), return nothing
            return new Response('Offline', { 
              status: 408, 
              statusText: 'Offline' 
            });
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
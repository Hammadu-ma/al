const CACHE_NAME = 'vercel-app-v1';
const urlsToCache = [
  // Root files
  '/',
  '/index.html',
  '/register.html',
  '/profile.html',
  '/dashboard.html',
  '/offline.html',
  '/manifest.json',
  '/sw.js',
  
  // Assets (add these if they exist)
  // '/css/styles.css',
  // '/js/app.js',
  // '/images/logo.png',
  
  // Year 1 main pages
  '/yr1/ps.html',
  '/yr1/pc.html',
  '/yr1/im.html',
  '/yr1/an.html',
  '/yr1/pcd.html',
  '/yr1/pr.html',
  '/yr1/pt.html',
  
 // pt subfolder - exam files
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
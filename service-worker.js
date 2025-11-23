const CACHE_NAME = "study-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/register.html",
  "/profile.html",
  "/dashboard.html",

  "/yr1/ps.html",
  "/yr1/pc.html",
  "/yr1/micro.html",

  // Subfolders
  "/yr1/ps/pse2017.html",
  "/yr1/pc/pce2017.html",
  "/yr1/micro/microe2017.html"
];

// Install & cache everything
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Serve cached files offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => 
      response || fetch(event.request)
    )
  );
});

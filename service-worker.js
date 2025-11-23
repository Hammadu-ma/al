const CACHE_NAME = "site-cache-v2";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "/dashboard.html",
        "/register.html",
        "/profile.html",
        "/index.html",

        "/yr1/ps.html",
        "/yr1/pc.html",
        "/yr1/micro.html",

        // Subpages
        "/yr1/ps/pse2016.html",
        "/yr1/pc/pce2017.html",
        "/yr1/micro/micro2014.html",

        // important!
        "/auth-check.js",
        "/icon.png",
      ]);
    })
  );
  self.skipWaiting();
});

// Offline-first strategy
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match("/dashboard.html")
        )
      );
    })
  );
});

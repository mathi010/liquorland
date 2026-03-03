const CACHE_NAME = "liquorland-v3"; // Cambiar número cada vez que actualices

const urlsToCache = [
  "/liquorland/",
  "/liquorland/index.html",
  "/liquorland/styles.css",
  "/liquorland/script.js",
  "/liquorland/manifest.json",
  "/liquorland/icons/icon-192.png",
  "/liquorland/icons/icon-512.png"
];

// INSTALAR
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ACTIVAR (borra versiones viejas)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH (estrategia Network First)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

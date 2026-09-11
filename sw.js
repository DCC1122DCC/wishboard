// Wishboard service worker
// Bump CACHE_VERSION whenever index.html or the icons change so clients
// pick up the new files instead of stale cached ones.
const CACHE_VERSION = "v1";
const APP_CACHE = `wishboard-app-${CACHE_VERSION}`;
const RUNTIME_CACHE = `wishboard-runtime-${CACHE_VERSION}`;

// Everything the app needs to at least launch offline.
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-48.png",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-192.png",
  "./icons/icon-256.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== APP_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // App-shell files: cache-first, so the app opens instantly and works offline.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(APP_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => {
            // Offline and not cached: fall back to the app shell for
            // navigations so the app still opens.
            if (request.mode === "navigate") {
              return caches.match("./index.html");
            }
          });
      })
    );
    return;
  }

  // Cross-origin (Google Fonts, React/Babel from cdnjs): stale-while-revalidate.
  // Serve the cached copy immediately if we have one, and refresh it in the
  // background so the next launch has the latest version.
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    )
  );
});

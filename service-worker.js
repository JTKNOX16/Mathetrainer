// service-worker.js
// Service Worker für Offline-Caching und PWA-Funktionalität

const SW_VERSION = "lom-v3.0.0";
const PRECACHE = `precache-${SW_VERSION}`;
const RUNTIME  = `runtime-${SW_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png"
];

// Install: Precache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Alte Caches aufräumen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== PRECACHE && k !== RUNTIME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Cache-Strategien
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Firebase & externe Requests → immer Netzwerk
  const isFirebase = /(?:googleapis\.com|firebaseio\.com|gstatic\.com)/.test(url.host);
  if (isFirebase) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // Gleich-Origin → stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Andere → Netzwerk mit Fallback
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === "basic") {
          const resClone = res.clone();
          caches.open(RUNTIME).then((cache) => cache.put(req, resClone));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || networkPromise || fetch(request).catch(() => cached);
}

// Message-Handler
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

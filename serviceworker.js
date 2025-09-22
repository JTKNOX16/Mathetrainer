// service-worker.js
const VERSION = 'v2.0';
const CACHE_NAME = `mathetrainer-${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
  // Falls du weitere Dateien separat anlegst (Bilder, Sounds), hier ergänzen.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)));
      await self.clients.claim();
    })()
  );
});

// Strategie:
// - HTML (Navigation) bevorzugt Netzwerk mit Cache-Fallback (immer die frische App bekommen)
// - Sonst: Cache-first (schnell/offline)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Nur GET cachen
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put('./', fresh.clone());
          return fresh;
        } catch (e) {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match('./')) || Response.error();
        }
      })()
    );
    return;
  }

  // Sonstige Assets: Cache-first
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        return cached || Response.error();
      }
    })()
  );
});

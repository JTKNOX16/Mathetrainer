// Simple offline cache for the Mathe-Trainer
const CACHE_NAME = 'mathetrainer-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest'
  // Falls du später eigene Dateien/Ordner hast: './css/styles.css', './js/app.js', etc.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Cache-first für Navigation & statische Assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Nur GET cachen
  if (req.method !== 'GET') return;

  // Für Navigationsanfragen (Seitenaufrufe) immer index.html aus dem Cache bevorzugen (SPA/Ein-Seiter)
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => cached || fetch('./index.html'))
    );
    return;
  }

  // Sonst: Cache first, dann Netzwerk
  event.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(resp => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, respClone));
        return resp;
      }).catch(() => cached) // Fallback: wenn offline und nicht im Cache → nichts
    )
  );
});

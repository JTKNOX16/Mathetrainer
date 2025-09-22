// service-worker.js
const CACHE_NAME = 'mathetrainer-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
];

// Install: Assets cachen
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(()=>{}))
  );
});

// Activate: alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())));
    await self.clients.claim();
  })());
});

// Fetch: Cache-First, danach Netzwerk (für gleiche Origin)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(()=>{});
          return resp;
        }).catch(()=> cached);
        return cached || fetchPromise;
      })
    );
  }
});


// service-worker.js
const CACHE_NAME = 'lom-v1';
const PRECACHE = [
  './',              // index.html via GitHub Pages
  './index.html',
  './manifest.json', // heißt bei dir manifest.json (nicht .webmanifest)
  // Falls vorhanden – sonst aus der Liste entfernen oder später ergänzen:
  './icons/icon-192.png',
  './icons/icon-512.png',
  // './icons/maskable-192.png',
  // './icons/maskable-512.png',
];

// Bei Install: best effort cachen (kein Abbruch bei 404)
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const url of PRECACHE) {
      try {
        const resp = await fetch(url, { cache: 'no-cache' });
        if (resp.ok) await cache.put(url, resp.clone());
      } catch (e) {
        // still continue
      }
    }
    self.skipWaiting();
  })());
});

// Aktivieren: alte Caches aufräumen
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names.map(n => (n === CACHE_NAME ? null : caches.delete(n)))
    );
    self.clients.claim();
  })());
});

// Fetch: Netz-vor-Cache, aber nur für GET; Firestore etc. umgehen
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Nur GET cachen
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Niemals API/Firestore/Analytics cachen
  if (
    url.origin.includes('firestore.googleapis.com') ||
    url.pathname.startsWith('/google.firestore.v1.Firestore') ||
    url.pathname.includes('/Write/') || url.pathname.includes('/Listen/')
  ) {
    return; // normaler Netzwerkfluss
  }

  event.respondWith((async () => {
    try {
      // Netzwerk zuerst (damit Updates schnell kommen)
      const netResp = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      // Nur erfolgreiche Antworten cachen
      if (netResp && netResp.ok && (url.protocol === 'http:' || url.protocol === 'https:')) {
        cache.put(request, netResp.clone());
      }
      return netResp;
    } catch (e) {
      // Offline: Fallback aus Cache
      const cacheMatch = await caches.match(request, { ignoreSearch: true });
      return cacheMatch || new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});

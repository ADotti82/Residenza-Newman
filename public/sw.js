const STATIC_CACHE = 'newman-static-v2';
const API_CACHE = 'newman-api-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/app.js',
  '/manifest.json',
  '/052a904e-e80d-4afb-82d5-ca5c18ebabda.webp',
  '/052a904e-e80d-4afb-82d5-ca5c18ebabda.jpg',
  '/icon-newman.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache static assets warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== API_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Network-first con fallback su cache per script.google.com
  if (url.hostname.includes('script.google.com')) {
    event.respondWith(
      fetch(req.clone())
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(API_CACHE).then((cache) => cache.put(req, clone)).catch(() => {});
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          return new Response(JSON.stringify({ success: false, error: 'Offline - cache non disponibile' }), {
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
          });
        })
    );
    return;
  }

  // Cache-first per asset statici (HTML, JS, immagini, manifest, stili)
  if (
    req.method === 'GET' &&
    (req.destination === 'image' ||
     req.destination === 'script' ||
     req.destination === 'style' ||
     req.destination === 'document' ||
     url.pathname === '/' ||
     url.pathname.endsWith('.html') ||
     url.pathname.endsWith('.js') ||
     url.pathname.endsWith('.webp') ||
     url.pathname.endsWith('.jpg') ||
     url.pathname.endsWith('.png') ||
     url.pathname.endsWith('.json'))
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          // In background aggiorna la cache (stale-while-revalidate per static assets)
          fetch(req).then((netRes) => {
            if (netRes && netRes.status === 200) {
              caches.open(STATIC_CACHE).then((cache) => cache.put(req, netRes));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, clone)).catch(() => {});
          }
          return networkRes;
        });
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Default network pass-through
  event.respondWith(fetch(req));
});

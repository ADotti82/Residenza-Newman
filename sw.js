const STATIC_CACHE = 'newman-static-v4';
const API_CACHE = 'newman-api-v4';

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
      // Cacha ogni asset singolarmente: se uno manca, gli altri vengono comunque cachati
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.log('Skip:', url))
        )
      );
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

// Gestione Notifiche Push nel Service Worker
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Residenza Newman', body: event.data.text() };
    }
  }
  const title = data.title || 'Residenza Newman';
  const options = {
    body: data.body || '',
    icon: '/icon-newman.png',
    badge: '/icon-newman.png',
    vibrate: [100, 50, 100],
    data: data.url || '/'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});


/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - SERVICE WORKER (sw.js)
 * ============================================================================
 * Strategia:
 * - Asset statici (immagini, manifest, icone) → Cache-First
 * - HTML e app.js → Network-First (prendono sempre la versione fresca se online)
 * - Chiamate a Google Apps Script → NON intercettate (passano dirette al server)
 * ============================================================================
 */

const STATIC_CACHE = 'newman-static-v7';
const API_CACHE = 'newman-api-v7';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icon-newman.png',
  '/apple-touch-icon.png',
  '/favicon.ico'
];

// ---------------------------------------------------------------------------
// INSTALL: pre-cacha gli asset statici singolarmente (uno alla volta)
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.log('Skip pre-cache:', url, err.message))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ---------------------------------------------------------------------------
// ACTIVATE: rimuove le cache vecchie
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// FETCH: gestione delle richieste
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ✅ CRITICO: NON intercettare MAI le chiamate a Google Apps Script.
  // Devono passare direttamente al server. Il SW non ha senso per POST e
  // qualsiasi tentativo di manipolarle introduce errori e timeout.
  if (url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')) {
    return;
  }

  // Solo GET sono gestiti dal SW (POST, PUT, DELETE passano diretti)
  if (req.method !== 'GET') {
    return;
  }

  // Asset critici (HTML, app.js) → NETWORK-FIRST con fallback su cache
  const isCritical = url.pathname === '/' ||
                     url.pathname.endsWith('.html') ||
                     url.pathname === '/app.js' ||
                     url.pathname.endsWith('/app.js');

  if (isCritical) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, clone)).catch(() => {});
          }
          return networkRes;
        })
        .catch(() => caches.match(req).then(c => c || caches.match('/index.html')))
    );
    return;
  }

  // Asset non critici (immagini, manifest, font, icone) → CACHE-FIRST + revalidate
  const isStaticAsset = req.destination === 'image' ||
                        req.destination === 'style' ||
                        req.destination === 'font' ||
                        url.pathname.endsWith('.webp') ||
                        url.pathname.endsWith('.jpg') ||
                        url.pathname.endsWith('.jpeg') ||
                        url.pathname.endsWith('.png') ||
                        url.pathname.endsWith('.svg') ||
                        url.pathname.endsWith('.ico') ||
                        url.pathname.endsWith('.json');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          // Aggiorna in background (stale-while-revalidate)
          fetch(req).then((netRes) => {
            if (netRes && netRes.status === 200) {
              caches.open(STATIC_CACHE).then((cache) => cache.put(req, netRes)).catch(() => {});
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
        }).catch(() => caches.match('/index.html'));
      })
    );
    return;
  }

  // Tutto il resto: passa direttamente alla rete
  return;
});

// ---------------------------------------------------------------------------
// NOTIFICHE PUSH
// ---------------------------------------------------------------------------
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
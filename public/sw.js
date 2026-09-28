/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - SERVICE WORKER
 * ============================================================================
 * Versione: v9-stable (Safe Network-First + No-Block + Push Support)
 *
 * REGOLE ARCHITETTURALI FONDAMENTALI:
 * 1. BACKEND GOOGLE APPS SCRIPT: MAI intercettato. Le chiamate a GAS
 *    (script.google.com e googleusercontent.com) passano al 100% dirette al server.
 * 2. ORIGINE ESTERNA: Qualsiasi richiesta cross-origin (API esterne, CDN) non
 *    viene alterata, per prevenire blocchi CORS o errori di redirect.
 * 3. NO-FALLBACK-HTML PER SCRIPT JS: I file .js NON ricevono MAI un fallback su
 *    index.html (causa principale dell'errore "Unexpected token '<'").
 * 4. CLEAN CACHE IMMEDIATA: Al rilascio di una nuova versione, tutte le cache
 *    precedenti vengono invalidate e il worker prende subito il controllo.
 * ============================================================================
 */

const CACHE_VERSION = 'newman-v9-stable';

// Asset minimi per la shell offline (pre-caching sicuro con allSettled)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/052a904e-e80d-4afb-82d5-ca5c18ebabda.webp'
];

// ---------------------------------------------------------------------------
// 1. INSTALLAZIONE: Pre-cache minimale e attivazione immediata (skipWaiting)
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  console.log('[SW v9] Installazione in corso...');
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[SW v9] Pre-cache opzionale non riuscita per:', url, err.message);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW v9] Installazione completata, skipWaiting attivo.');
        return self.skipWaiting();
      })
  );
});

// ---------------------------------------------------------------------------
// 2. ATTIVAZIONE: Pulizia immediata di TUTTE le cache precedenti
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  console.log('[SW v9] Attivazione in corso, pulizia cache obsolete...');
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_VERSION) {
              console.log('[SW v9] Rimozione vecchia cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW v9] Cache pulite, prendo controllo di tutte le schede (clients.claim).');
        return self.clients.claim();
      })
  );
});

// ---------------------------------------------------------------------------
// 3. FETCH: Gestione sicura del traffico di rete
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // REGOLA A: Solo le richieste GET vengono gestite dal Service Worker
  // (POST, PUT, DELETE, OPTIONS passano sempre direttamente alla rete)
  if (req.method !== 'GET') {
    return;
  }

  // REGOLA B: Bypassa tassativamente Google Apps Script e Google Services
  // Qualsiasi intercettazione di script.google.com rompe i redirect CORS (302)
  if (
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('googleusercontent.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google.com')
  ) {
    return;
  }

  // REGOLA C: Bypassa richieste cross-origin (API esterne, CDN)
  if (url.origin !== self.location.origin) {
    return;
  }

  // REGOLA D: Bypassa gli endpoint di sviluppo Vite / HMR / internal modules
  if (url.pathname.startsWith('/@') || url.pathname.includes('node_modules')) {
    return;
  }

  // STRATEGIA 1: Navigazione e pagine HTML (Network-First con fallback su cache)
  const isNavigation = req.mode === 'navigate' ||
                       url.pathname === '/' ||
                       url.pathname.endsWith('.html');

  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone)).catch(() => {});
          }
          return networkRes;
        })
        .catch(async () => {
          console.warn('[SW v9] Connessione assente, caricamento HTML dalla cache per:', url.pathname);
          const cached = await caches.match(req);
          if (cached) return cached;
          const indexCached = await caches.match('/index.html');
          if (indexCached) return indexCached;
          return caches.match('/');
        })
    );
    return;
  }

  // STRATEGIA 2: Script JavaScript (.js)
  // Network-First per avere sempre la versione fresca se online.
  // CRITICO: Non restituire MAI index.html in caso di errore su un file .js!
  const isJavaScript = url.pathname.endsWith('.js');
  if (isJavaScript) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone)).catch(() => {});
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          // Ritorna errore pulito invece di una pagina HTML che romperebbe il parser JS
          return new Response('/* Service Worker: Modulo JS offline non disponibile */', {
            status: 503,
            statusText: 'Service Unavailable (Offline)',
            headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
          });
        })
    );
    return;
  }

  // STRATEGIA 3: Asset statici puri (Immagini, Icone, Manifest, Font, Stili)
  // Stale-While-Revalidate: rispondi subito dalla cache se disponibile, aggiorna in background
  const isStaticAsset =
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    req.destination === 'image' ||
    req.destination === 'style' ||
    req.destination === 'font';

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              cache.put(req, networkRes.clone()).catch(() => {});
            }
            return networkRes;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Qualsiasi altra richiesta passa direttamente alla rete
  return;
});

// ---------------------------------------------------------------------------
// 4. MESSAGGI INTERNI (Skip waiting su richiesta, pulizia forzata)
// ---------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'PURGE_CACHE') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});

// ---------------------------------------------------------------------------
// 5. NOTIFICHE PUSH
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
    icon: '/052a904e-e80d-4afb-82d5-ca5c18ebabda.webp',
    badge: '/052a904e-e80d-4afb-82d5-ca5c18ebabda.webp',
    vibrate: [100, 50, 100],
    data: data.url || '/'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ---------------------------------------------------------------------------
// 6. CLICK NOTIFICA
// ---------------------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
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

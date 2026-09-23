const CACHE_NAME = 'newman-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through per le richieste: attualmente non facciamo caching aggressivo offline,
  // ma soddisfiamo il requisito del fetch handler per la PWA.
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('Connessione assente. Modalità offline non pienamente supportata.');
  }));
});
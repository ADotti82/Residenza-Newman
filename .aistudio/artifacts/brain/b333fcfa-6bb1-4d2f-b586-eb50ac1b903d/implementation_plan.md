# Piano di Implementazione: Ricaricamento Automatico e Aggiornamento Istantaneo dell'App [COMPLETATO]

## Diagnosi del Problema Risolto
Sugli smartphone (iOS Safari e Android Chrome, specialmente con PWA installata sulla Home):
1. **Cache aggressiva della Webview/Service Worker**: la vecchia versione veniva mantenuta in memoria locale.
2. **Standby mobile senza ricaricamento**: riaprendo l'app dopo altre app o dallo standby dello schermo, il browser manteneva la memoria congelata senza richiedere i file aggiornati.

---

## Modifiche Implementate

### 1. Sistema di Ricaricamento Automatico su Riapertura (`index.html` & `app.js`)
- **Ascolto degli eventi di resume del telefono**:
  - `document.addEventListener('visibilitychange')` quando l'utente sblocca lo schermo o torna sull'app.
  - `window.addEventListener('pageshow')` e `focus` per intercettare il risveglio della sessione.
  - Esecuzione immediata di `registration.update()` e refresh in tempo reale dei dati (`window.caricaDatiBackend()`).
- **Auto-Reload su `controllerchange`**:
  - Quando una nuova versione del Service Worker si attiva, la pagina si ricarica automaticamente applicando subito la nuova grafica e le funzioni appena rilasciate.

### 2. Service Worker v10-autoreload (`sw.js`)
- **Attivazione istantanea**: `self.skipWaiting()` e `clients.claim()` immediati in fase di installazione e attivazione.
- **Bypass no-cache su HTML e JS**:
  - Le richieste per `index.html` e script `.js` vengono inviate con `cache: 'no-cache'`, garantendo che il browser mobile non riutilizzi file obsoleti dalla cache disco.
- **Gestione messaggi `SKIP_WAITING` e `PURGE_CACHE`**:
  - Permette ai client di forzare la pulizia totale delle cache su richiesta.

### 3. Pulsanti di Garanzia e Emergenza (`index.html`)
- **Pulsante `🔄` nella barra superiore (Header)**:
  - Tasto dedicato posizionato accanto al calendario per ricaricare e aggiornare l'app con un solo tocco.
- **Sezione "Aggiornamento e Cache App" nelle Impostazioni**:
  - Box informativo con pulsante **"🔄 Ricarica & Svuota Cache Ora"** (`forzaAggiornamentoApp()`), che svuota `CacheStorage`, forza `registration.update()` e ricarica l'app con parametro anticache.

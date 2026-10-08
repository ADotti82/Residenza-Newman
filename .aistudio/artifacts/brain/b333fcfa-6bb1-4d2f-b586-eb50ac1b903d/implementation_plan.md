# Piano di Ripristino e Risoluzione: Sblocco Completo dei Clic e Interattività

## Diagnosi del Problema
L'utente segnala che *"L'app si vede ma cliccando non succede nulla"* in seguito a un ricaricamento con parametri di cache e alla comparsa di avvisi nella console del browser.

### Cause Tecniche Individuate:
1. **Mancata esecuzione di `DOMContentLoaded` su riavvii e script asincroni/modulari:**
   In `app.js`, l'inizializzazione dell'intera applicazione (`initStorage`, `setupEventListeners`, `checkAuthAndLoad`) era agganciata unicamente all'evento `document.addEventListener("DOMContentLoaded", ...)`. Quando la pagina viene ricaricata da PWA/Service Worker o quando lo script viene valutato a parsing già completato (`document.readyState === 'complete'` o `'interactive'`), l'evento `DOMContentLoaded` non si attiva più. Di conseguenza la pagina mostra la grafica ma tutti gli ascoltatori di eventi (`setupEventListeners`) non vengono agganciati.
2. **Navigazione inferiore (Bottom Bar) priva di fallback dichiarativo:**
   I tasti della barra di navigazione in basso (`bottom-nav-item`) usavano solo `data-tab` e dipendevano dall'evento JS di `setupEventListeners()`. Se l'evento non si agganciava, i tap non producevano alcuna reazione visibile.
3. **Avvisi di Console Esterni Innocui:**
   I messaggi di console riportati (`spoken-word.js`, `unload violation`, `beforeinstallpromptevent`) provengono da un'estensione browser (lettore vocale/accessibilità) e dalla normale gestione PWA, ma hanno comprensibilmente allarmato l'utente facendogli temere un blocco irreversibile.

---

## Piano di Intervento

### 1. Inizializzazione Universale e Immediata in `app.js`
- Sostituire l'aggancio rigido a `DOMContentLoaded` con un controllo di `document.readyState`:
  ```javascript
  function avviaApplicazioneNewman() {
    initStorage();
    initDateSelectorMensa();
    setupEventListeners();
    checkAuthAndLoad();
  }

  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", avviaApplicazioneNewman);
  } else {
    avviaApplicazioneNewman();
  }
  ```
- Includere un blocco `try...catch` per ogni fase in modo che un eventuale intoppo secondario non interrompa l'aggancio dei listener.

### 2. Aggiunta di Fallback Diretti `onclick` nella Bottom Navigation (`index.html`)
- Aggiungere `onclick="switchTab('info')"`, `onclick="switchTab('mensa')"`, `onclick="switchTab('accoglienza')"`, `onclick="switchTab('spazi')"`, `onclick="switchTab('manutenzione')"` direttamente sui tag `<button class="bottom-nav-item">`.
- In questo modo la barra risponde al tocco all'istante anche in condizioni estreme di caricamento ritardato del JS.

### 3. Rafforzamento del Tasto "🧳 Segnala Assenza"
- Verificare e garantire che `window.apriModalSegnalaAssenza()` sia accessibile all'istante da qualsiasi sezione (Bacheca, Mensa, Impostazioni utente).
- Se un utente è ospite/non autenticato, aprire comunque la modale con indicazione chiara o guidarlo all'accesso senza bloccare lo schermo.
- Assicurarsi che nessun overlay invisibile o modal rimanga in uno stato di intercettazione dei clic (`pointer-events`).

### 4. Pulizia e Sblocco Cache
- Aggiornare il numero di versione del bundle script a `v=20261008-3` in `index.html` e `sw.js` per forzare il refresh pulito senza loop.

---

## Piano di Verifica
- Verificare la corretta compilazione con `compile_applet`.
- Verificare che il cambio scheda (Bacheca, Mensa, Accoglienza, Spazi, Manutenzione) risponda immediatamente al tocco.
- Verificare l'apertura immediata della modale "🧳 Segnala Assenza" e la registrazione delle date.

# Piano di Risoluzione: Ripristino Cliccabilità e Rendering Istantaneo Modali

Piano di correzione immediata per ripristinare la piena operatività dei tocchi e garantire la visualizzazione a 0ms delle finestre modali su Google Chrome per Android.

---

### Diagnosi Tecnica e Causa del Blocco Recente

1. **Perché ora non si apriva neppure cliccando in alto?**
   - Nel precedente aggiornamento era stato aggiunto un listener `touchstart` che applicava a runtime la classe `.is-touched` con `transform: scale(0.96) !important;`.
   - In Google Chrome su Android, modificare la trasformazione geometrica (`scale`) di un elemento durante il `touchstart` ne riduce l'area di tocco sotto il polpastrello. Al momento del rilascio (`touchend`), l'algoritmo di hit-testing di Chrome determina che il tocco è "scivolato" o uscito dal bersaglio originale, **sopprimendo completamente l'evento nativo di `click`**. Di conseguenza, né i pulsanti normali né i badge dell'header ricevevano più l'evento `onclick`.

2. **Perché prima le modali non apparivano subito ma solo toccando l'header?**
   - I pulsanti di apertura si trovano dentro il contenitore con scroll `.main-content`.
   - Le modali si trovano fuori da `.app-frame`, come nodi figli statici di `body`.
   - In Chrome mobile, quando un'azione dentro un sotto-albero con scorrimento (`.main-content`) cambia lo stile di un nodo esterno, il motore Blink tende a differire il ridisegno del layer root finché non riceve un evento diretto sul root layer (come appunto l'header).

---

## 1. Modifiche Risolutive

### A. Rimozione Completa del Listener Bloccante su `touchstart`
- Rimuovere il listener `touchstart` / `touchend` che aggiungeva `.is-touched`.
- Sostituire la regola CSS `:active` con un effetto che **non altera le dimensioni o la posizione** dell'elemento:
  ```css
  .mode-tab-btn:active, .btn:active, button:active, .user-pill:active, .day-pill:active, .bottom-nav-item:active {
    opacity: 0.72 !important;
  }
  ```
  In questo modo il browser registra il 100% dei click senza alcuna soppressione o ritardo, garantendo al contempo il feedback visivo al tocco.

### B. Obbligo di Rendering Root Immediato con `document.body.appendChild(m)`
- In `window.mostraModaleIstantanea`, prima di impostare la visibilità, eseguire:
  ```javascript
  document.body.appendChild(m);
  ```
  Nel DOM HTML, invocare `appendChild` su un elemento già esistente sposta il nodo in fondo all'albero del `body`. Questa mutazione strutturale obbliga il motore di layout di Chromium ad invalidare e ridisegnare all'istante il layer visivo, portando la modale in primissimo piano senza dover attendere ulteriori tocchi sull'header.

### C. Ripristino dei Gestori di Chiusura e Pulizia Stili
- Garantire che la chiusura tramite `chiudiModale` rimuova la classe `.open`, reimposti `style.display = "none"` e ripulisca la classe `modal-is-open` dal body.

### D. Invalidazione Cache PWA e Query Param
- Incrementare `CACHE_VERSION` in `sw.js` a `newman-v21-touch-native-fix`.
- Aggiornare lo script frontend a `app.js?v=20261014-v7-touch-native-fix`.

---

## 2. Piano di Verifica

1. **Ripristino Cliccabilità Header**:
   - Tocco su "GAS Live" o sul nome utente in alto -> la finestra Impostazioni/Profilo deve aprirsi regolarmente.
2. **Apertura Istantanea Segnala Assenza & Menù**:
   - Tocco su "🧳 Segnala Assenza" -> la modale deve comparire all'istante al primo tocco, senza dover cliccare altrove.
   - Tocco su "📖 Menù" -> apertura istantanea.
3. **Verifica Compilazione**:
   - Esecuzione di `compile_applet` per confermare l'integrità del codice.

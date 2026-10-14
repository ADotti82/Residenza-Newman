# Risoluzione Ritardo Rendering Modali su Chrome Android (Segnala Assenza & Menù)

Piano di risoluzione mirato per eliminare il problema di rendering su smartphone Android (browser Chrome), in cui il tocco su "Segnala Assenza" o "Menù" non mostra subito la finestra finché l'utente non tocca la barra superiore dello schermo.

---

### Diagnosi Tecnica del Problema

> [!IMPORTANT]
> **Causa principale identificata**:
> - **Dispositivo & Browser**: Chrome su smartphone Android.
> - **Sintomo**: Al click su "Segnala Assenza" o "Menù 14 Giorni" la logica JavaScript viene eseguita (`display: flex`), ma a schermo non compare nulla finché non si tocca la barra in alto / testata dello schermo.
> - **Meccanismo di blocco (Bug noto Chromium Android)**:
>   1. La classe `.modal-overlay` combina `backdrop-filter: blur(4px)` e l'animazione CSS `animation: fadeIn 0.15s ease-out` con `transform: translateY(4px)` e `from { opacity: 0; }`.
>   2. Nel motore grafico di Chrome su Android (GPU Rasterizer), quando un elemento a tutto schermo `position: fixed` passa da `display: none` a `display: flex` con un filtro sfocatura hardware e una trasformazione iniziale a opacità 0, il thread del compositor **non invalida il layer** e resta congelato sul fotogramma iniziale (`opacity: 0`).
>   3. Toccando la testata superiore (barra dell'app o header del browser), Chrome riceve un evento di sistema che forza il ricalcolo dei layer grafici (compositor flush), facendo apparire la finestra di colpo.

---

## 1. Azioni Correttive Proposte

### A. Eliminazione Blocco Compositor CSS in `index.html`
1. **Rimozione `backdrop-filter` da `.modal-overlay`**:
   - Sostituzione con uno sfondo scuro semitrasparente ad alto contrasto immediato: `background-color: rgba(15, 23, 42, 0.75) !important`.
   - Nessun calcolo di sfocatura GPU: zero millisecondi di ritardo di rendering su qualsiasi GPU mobile Android/iOS.
2. **Rimozione `animation: fadeIn` con `transform` da `.modal-overlay`**:
   - L'overlay viene impostato subito a `opacity: 1 !important; transform: none !important;`.
   - Eliminata la partenza da `opacity: 0` e `translateY(4px)` che bloccava il primo frame.
3. **Reset Scroll & Overflow Singolo**:
   - Azzeramento forzato di `scrollTop = 0` sull'overlay e sulla card interna all'apertura.

### B. Helper Universale di Apertura Istantanea (`mostraModaleIstantanea`) in `app.js` & `index.html`
Centralizzazione dell'apertura di tutte le modali (`modal-segnala-assenza`, `modal-consulta-menu`, `modal-modifica-menu`, `modal-gestione-buste-master`, `modal-variazione-cuoca`, `modal-elenco-pasti-cucina`, `modal-dettaglio-giorno-assenze`):
- Impostazione simultanea di:
  ```javascript
  m.style.display = "flex";
  m.style.zIndex = "999999";
  m.style.visibility = "visible";
  m.style.opacity = "1";
  m.scrollTop = 0;
  void m.offsetHeight; // Forza il reflow sincrono immediato del motore grafico Blink
  ```
- Registrazione sicura del timestamp anti ghost-click (`window._modalOpenedTimestamp = Date.now()`).
- Esecuzione di `requestAnimationFrame` per garantire che il frame sia disegnato a schermo prima che il dito si sollevi.

### C. Aggiornamento PWA & Ricarica Automatica
- Incremento della versione di cache del Service Worker in `sw.js` a `newman-v18-instant-paint-fix`.
- Aggiornamento della stringa di query dello script in `index.html`.

---

## 2. Dettaglio dei File Interessati

1. **`index.html`**:
   - Regola CSS `.modal-overlay` e media query `@media (max-width: 600px)`: rimozione sfocatura GPU e animazioni con trasformazione; applicazione sfondo opaco reattivo.
   - Definizione della funzione `mostraModaleIstantanea(idModal)` nell'header/inline script per garantire disponibilità immediata a tutti i pulsanti.
2. **`app.js`**:
   - Aggiornamento di `apriModalSegnalaAssenza`, `apriModalConsultaMenu`, `apriModalModificaMenu`, `apriModalGestioneBusteMaster`, `apriModalVariazioneCuoca`, `apriModalElencoPastiCucina`, `apriDettaglioGiornoAssenze` con chiamata a `mostraModaleIstantanea` e flush sincrono.
3. **`sw.js`**:
   - Bump cache version (`newman-v18-instant-paint-fix`) per l'aggiornamento immediato su smartphone.

---

## 3. Piano di Collaudo e Verifica

1. **Test Apertura Immediata su Chrome Android**:
   - Click su "🧳 Segnala Assenza" -> la modale deve comparire all'istante al primo tocco, senza dover toccare in alto.
   - Click su "📖 Menù 14 Giorni" -> la modale deve comparire all'istante.
   - Click sui tasti della Cuoca ("Modifica Menù", "Gestione Buste", "Variazione") -> apertura immediata al primo tap.
2. **Test Chiusura e Riapertura**:
   - Chiusura con ✕ o "Annulla" e successiva riapertura immediata.
3. **Verifica Compilazione**:
   - Esecuzione di `compile_applet` per confermare l'assenza di errori di sintassi o build.

# Corretta Attribuzione Richiedente nelle Prenotazioni Ambienti (Chiesa e Sala TV)

Risoluzione del bug che sovrascriveva sempre l'utente Master come richiedente di ogni prenotazione, introducendo un selettore chiaro con preselezione dell'utente attivo, opzione per altri residenti o nominativo personalizzato, e visualizzazione conforme dei nominativi.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisioni confermate dall'utente nella fase di intervista**:
> 1. **Selezione del Richiedente**: Selettore residenti (elenco dei residenti registrati) con opzione integrata per inserire un nuovo nominativo personalizzato (Nome, Cognome, Email).
> 2. **Comportamento Predefinito**: La modale si precompila automaticamente con l'utente attualmente connesso (es. Don Andrea o altro utente), ma consente di cambiare liberamente il richiedente per cui si sta effettuando la prenotazione.
> 3. **Visibilità & Riservatezza sullo Slot**: Il nome e cognome del reale richiedente sono chiaramente visibili ai Master (e all'utente proprietario della richiesta), mentre per gli altri residenti lo slot continua a comparire come riservato (*"🔒 Occupato"* o *"⏳ In Valutazione"*).

---

### 1. Diagnosi del Problema Attuale

#### Causa Principale del Malfunzionamento
1. **Hardcoding su `appState.user`**:
   - Nella funzione `apriModalNuovaRichiestaSpazio`, se `appState.user` è presente (ad es. l'account Master `donandreadotti@gmail.com`), la modale visualizzava un blocco statico non modificabile che bloccava il richiedente su `appState.user`.
   - In `eseguiPrenotazioneSpazioConfermata`, il codice eseguiva:
     ```javascript
     if (appState.user) {
       emailPrenotante = appState.user.email;
       nomePrenotante = appState.user.nome;
     }
     ```
     ignorando qualsiasi volontà di registrare l'ambiente a nome di un altro sacerdote o studente.
2. **Mutazione Indesiderata della Sessione**:
   - Nei rari casi in cui `appState.user` era nullo e l'utente selezionava un profilo dal dropdown, il codice sovrascriveva `appState.user` e `localStorage.setItem(STORAGE_KEYS.USER, ...)`, cambiando l'identità dell'intera sessione invece di limitarsi alla sola prenotazione dello slot.
3. **Mancanza di Persistenza del Nome Esplicito**:
   - L'oggetto salvato in `prenotazioni_spazi` memorizzava solo `email`, lasciando la risoluzione del nome a stringhe troncate come `pren.email.split('@')[0]` (es. `donandreadotti`).

---

### 2. Flusso Utente & Modifiche alla User Experience

```text
┌────────────────────────────────────────────────────────┐
│             Modale Prenotazione Spazio / Ambiente      │
├────────────────────────────────────────────────────────┤
│ Ambiente: (o) Chiesa / Cappella   ( ) Sala TV          │
│ Data: [ 2026-10-16 ]   Slot: [ 08:00 - 08:30 ]         │
│ Note / Motivo: [ S. Messa devozione privata... ]       │
├────────────────────────────────────────────────────────┤
│ 👤 Richiedente della Prenotazione:                     │
│ [ ▼ Don Rocco (donrocco@newman.it)                   ] │
│   ├─ Don Andrea Dotti (donandreadotti@gmail.com)       │
│   ├─ Don Rocco (donrocco@newman.it)                    │
│   ├─ Don Sergio (donsergio@newman.it)                  │
│   ├─ Francesco Rossi (francesco.studente@newman.it)    │
│   └─ ✍️ Altro / Inserisci Nuovo Nominativo             │
│                                                        │
│ (Se selezionato "Altro / Nuovo Nominativo"):           │
│   [ Nome e Cognome Richiedente                       ] │
│   [ Email Richiedente                                ] │
├────────────────────────────────────────────────────────┤
│ [ Opzione Master: [x] Approva direttamente ]           │
│ [ ✕ Annulla ]         [ ✅ Invia Richiesta al Master ] │
└────────────────────────────────────────────────────────┘
```

1. **Preselezione Intelligente**:
   - All'apertura della modale, il menu a tendina seleziona automaticamente il profilo dell'utente loggato, ma lascia la piena facoltà di scegliere qualsiasi altro residente della comunità oppure di selezionare *"Altro / Nuovo Nominativo"*.
2. **Nessun Effetto Collaterale sulla Sessione**:
   - La scelta del richiedente per lo slot orario non altera la sessione corrente dell'utente connesso.
3. **Visualizzazione Consistente**:
   - Sia nella griglia slot, sia nel cruscotto Master (*"Richieste Spazi in Attesa"*), sia nei dettagli della prenotazione, comparirà sempre l'esatto nominativo indicato nel modulo (es. *"Don Rocco"* o *"Francesco Rossi"*).

---

### 3. Piano d'Azione Passo-Passo

#### Step 1: Aggiornamento della Modale Spazi in `index.html` e `src/modules/spazi/modal-spazio.js`
- Riorganizzare l'area richiedente (`modal-spazio-utente-blocco`) per contenere sempre:
  - Il selettore `<select id="spazio-richiedente-select">` popolato con tutti i residenti abilitati.
  - La visualizzazione del badge del profilo attivo con pulsante rapido per *"Cambia richiedente"*.
  - I campi di testo per nome ed email quando si sceglie un nominativo esterno/ospite.

#### Step 2: Aggiornamento della Logica di Inizializzazione e Salvataggio in `app.js` e `src/modules/spazi/spazi.service.js`
- In `apriModalNuovaRichiestaSpazio`:
  - Popolare il selettore con tutti i residenti e selezionare per default l'email dell'utente connesso.
  - Gestire l'evento `change` per mostrare/nascondere i campi personalizzati quando viene selezionato *"custom"*.
- In `eseguiPrenotazioneSpazioConfermata`:
  - Leggere i valori reali dal selettore o dai campi personalizzati (`emailPrenotante`, `nomePrenotante`).
  - Inviare sia `email` sia `nome` nella chiamata API `prenotaSpazio`.
  - Non mutare `appState.user` né sovrascrivere la sessione di login.
- Nella gestione locale `mockBackendExecution` per l'azione `prenotaSpazio`:
  - Salvare sia `email` sia `nome` nell'oggetto prenotazione.

#### Step 3: Aggiornamento del Rendering degli Slot e Liste Master
- In `renderSlotSpazi`:
  - Mostrare il nome completo dell'effettivo richiedente tramite `p.nome || trovaNomeUtente(p.email)` quando l'utente ha permessi Master o è il richiedente stesso.
  - Per gli altri residenti, mantenere il cartellino protetto (*"🔒 Occupato"* o *"⏳ In Valutazione"*).
- Nel cruscotto Master e nelle notifiche:
  - Visualizzare chiaramente: *"Richiedente: Don Rocco (richiesto da Don Andrea Dotti)"* qualora il Master abbia prenotato per conto terzi.

#### Step 4: Verifica & Compilazione
- Esecuzione `compile_applet` per verificare l'assenza di errori di sintassi o build.
- Collaudo del flusso sia con account Master sia con account residente.

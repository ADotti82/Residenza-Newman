# Integrazione Comunicazioni Ufficiali Master in Bacheca

Integrazione delle comunicazioni ufficiali della Direzione (Master/Supermaster) direttamente all'inizio della Bacheca come avviso istituzionale in evidenza fissato in cima, con supporto a titolo, testo, data di pubblicazione, data di scadenza e gestione reattiva dal Pannello Master.

## User Review & Critical Decisions

> [!IMPORTANT]
> Decisioni confermate tramite le risposte di chiarimento:
> - **Collocazione Primaria**: La comunicazione ufficiale della Direzione/Master compare direttamente in **Bacheca** come card prioritaria fissata in cima alla schermata principale, ben visibile a tutti i sacerdoti e residenti appena aprono l'app.
> - **Formato Strutturato**: La comunicazione include Titolo istituzionale, Testo del messaggio, Data di pubblicazione e Data di scadenza facoltativa (con scomparsa automatica o indicazione di validità).
> - **Accesso e Modifica**: I profili con privilegi Master possono creare, modificare o revocare la comunicazione sia direttamente dalla Bacheca (pulsante rapido "Modifica Comunicazione") sia dalla sezione dedicata del Pannello Master.

- **Conferma Scadenza**: Se impostata una data di scadenza passata, l'avviso non viene mostrato ai residenti; il Master può riattivarlo o aggiornarlo in qualsiasi momento.
- **Doppia Visibilità Consolidata**: Per coerenza storica, il messaggio rimane consultabile anche nella scheda Residenza/Info, ma il suo fulcro operativo quotidiano diventa la Bacheca comunitaria.

---

## 1. Overview & Core Concept

- **Che cosa fa**: Porta la voce della Direzione al centro dell'esperienza quotidiana della Residenza. Invece di richiedere agli utenti di cercare la comunicazione nella scheda secondaria "Residenza", il messaggio ufficiale viene presentato in cima alla Bacheca (la home page dell'applet), sopra il calendario romano e gli eventi del giorno.
- **Target & Contesto**: Sacerdoti e residenti della Residenza Newman che consultano l'app ogni mattina per orari, mensa e liturgia; Direzione/Master che deve comunicare tempestivamente avvisi urgenti o direttive comunitarie.
- **Valore Aggiunto**: Elimina ogni ambiguità sulla visibilità degli avvisi del Master, garantisce priorità alle comunicazioni della Direzione e offre un form completo di gestione con scadenza temporale.

---

## 2. User Experience & Visual Design

### Flusso Utente Principale

1. **Apertura Bacheca (Tutti i Residenti)**:
   - In cima alla Bacheca, subito sotto la testata della data liturgica romana (o come primo elemento in evidenza), compare la card istituzionale della Direzione:
     - Header con icona distintiva `👑 Comunicazione della Direzione`.
     - Badge di evidenza con data di pubblicazione formattata in italiano.
     - Titolo in grassetto chiaro e corpo del testo formattato (con supporto ad a capo e link).
     - Eventuale indicazione di scadenza ("Valido fino al: [Data]").
     - Per i Master: pulsante contestuale `✏️ Modifica` per aggiornamento istantaneo con un solo tap.
2. **Creazione & Modifica dal Master**:
   - Apertura di una modal dedicata o form nel Pannello Master con:
     - Titolo della comunicazione (es. "Aggiornamento orari estivi mensa" o "Accoglienza nuovi residenti").
     - Testo esteso del messaggio.
     - Data di pubblicazione (default: oggi).
     - Data di scadenza opzionale (con date picker).
     - Checkbox/opzione "Rimuovi / Disattiva comunicazione attiva".
3. **Persistenza & Reattività Immediata**:
   - Al salvataggio, l'avviso viene inviato a Google Apps Script (`aggiornaConfig`) e aggiornato nello stato locale `appState.cachedConfig`.
   - La vista della Bacheca e il Pannello Master si ri-renderizzano immediatamente senza dover ricaricare la pagina.

### Design Visivo & Ergonomia Mobile (Mobile-First)

- **Canvas & Spaziatura**: Progettato per schermi smartphone (360px–430px) senza overflow orizzontale.
- **Bordo & Superficie**: Bordo sinistro accentuato con tonalità ambra istituzionale (`border-left: 4px solid #f59e0b`), sfondo chiaro caldo con contrasto WCAG AA (`#fffbeb` in light mode, superficie scura compensata in dark mode).
- **Gerarchia Tipografica**:
  - Titolo sezione: 15px semi-bold con icona 👑.
  - Titolo avviso: 16px bold ad alta leggibilità.
  - Testo: 13.5px con interlinea 1.5, per una lettura fluida anche su telefoni piccoli.
  - Metadati (data pub/scadenza): 11.5px non incapsulati in pillole decorative, ma con testo nitido e separatori tipografici (`·`).

---

## 3. Decisioni di Prodotto & Trade-Offs

- **Decisione 1: Struttura dei Dati (Configurazione Globale vs Collezione Bacheca)**
  - *Scelta*: Estendere l'oggetto di configurazione globale (`Messaggio_Supermaster`, `Messaggio_Supermaster_Titolo`, `Messaggio_Supermaster_Data_Pubblicazione`, `Messaggio_Supermaster_Data_Scadenza`).
  - *Perché*: La Direzione emette un'unica comunicazione istituzionale in vigore alla volta (o stato vuoto). Questo evita conflitti con i singoli eventi giornalieri (compleanni, sante messe speciali) e permette al Master di modificare o cancellare l'avviso centrale in modo rapido e atomico, senza rischiare di cancellare per errore eventi del calendario.
- **Decisione 2: Filtro Data di Scadenza**
  - *Scelta*: Verifica automatica `dataScadenza < oggi`. Se la data è passata, la card non viene mostrata ai residenti comuni, ma nel pannello Master appare come "Comunicazione scaduta" con opzione di rinnovo o nuovo testo.
- **Decisione 3: Doppia presenza coerente**
  - *Scelta*: Il messaggio resta visibile sia in Bacheca (con la massima priorità) sia nella scheda "Residenza" sotto Dove Siamo, assicurando che chi naviga per consultare regolamento e contatti ritrovi lo stesso messaggio ufficiale.

---

## 4. Architettura Tecnica & Flusso Dati

```
┌────────────────────────────────────────────────────────┐
│                   PANNELLO MASTER                      │
│  - Form rapido o Modal "Comunicazione Direzione"       │
│  - Campi: Titolo, Testo, Data Pubblicazione, Scadenza │
└──────────────────────────┬─────────────────────────────┘
                           │ callApi("aggiornaConfig")
                           ▼
┌────────────────────────────────────────────────────────┐
│               BACKEND (Apps Script / Cache)            │
│  - Salva proprietà su Foglio/Configurazione           │
│  - Restituisce payload aggiornato                      │
└──────────────────────────┬─────────────────────────────┘
                           │ appState.cachedConfig
                           ▼
┌────────────────────────────────────────────────────────┐
│               RENDER BACHECA (renderBachecaView)       │
│  1. Verifica presenza e validità temporale del msg     │
│  2. Inserisce Card Ufficiale in cima alla Bacheca      │
│  3. Renderizza sotto il Calendario Romano & Avvisi     │
└────────────────────────────────────────────────────────┘
```

### Componenti e Funzioni Coinvolte

1. **`renderBachecaView()` (`app.js`)**:
   - Iniezione della card in evidenza prima della sezione degli eventi giornalieri se `Messaggio_Supermaster` è configurato e non scaduto.
   - Presenza pulsante rapido `✏️ Modifica` per utenti con ruolo Master/Supermaster/Admin.
2. **`apriModalMessaggioSupermaster()` & `salvaMessaggioSupermaster()` (`app.js`)**:
   - Aggiunta del campo `Titolo Comunicazione` (attualmente mancava o era solo testo).
   - Validazione delle date di pubblicazione e scadenza.
   - Chiamata a `aggiornaConfig` e re-render immediato di `renderBachecaView()` e `renderResidenzaView()`.
3. **Pannello Master (`renderMasterSection()` in `app.js`)**:
   - Aggiornamento della sottosezione "Messaggio della Direzione" per includere i campi Titolo e Scadenza e preview contestuale.

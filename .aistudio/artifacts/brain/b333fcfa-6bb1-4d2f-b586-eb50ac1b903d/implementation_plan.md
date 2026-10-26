# Piano di Implementazione: Nuove Funzionalità & Ottimizzazioni Residenza Newman

Piano operativo dettagliato in base alle risposte e alle preferenze confermate:
1. **Esportazione Residenti CSV** per Super Admin (compatibile Excel / Google Fogli).
2. **Scadenza e Archiviazione Automatica** della Comunicazione Ufficiale della Direzione.
3. **Mensa**: Vista Giornaliera come predefinita e pulsanti di navigazione settimana a fondo pagina.
4. **Calendario Liturgico Romano**: Correzione del computo della settimana liturgica ordinaria e festiva.
5. **Segnala Assenza**: Risoluzione definitiva dell'apertura su dispositivi touch/mobile.
6. **Gestione Orari Cappella / Chiesa nel Master**: Finestre orarie consentite (08:00–13:00, 16:30–19:30), Messa domenicale fissa (ore 11:00) e tempi comunitari.
7. **Spazio Indicazioni Ambienti**: Box pubblico sintetico su utilizzo Chiesa per gruppi esigui e ambienti.
8. **Snellimento Testi & Fluidità Visiva**: Rimozione di testi ridondanti e ottimizzazione tipografica rapida da consultare.

---

### User Review & Critical Decisions

> [!NOTE]
> Scelte confermate dall'utente:
> - **Formato Esportazione Residenti**: File CSV conforme RFC 4180 con BOM UTF-8 (compatibile con Microsoft Excel italiano e Google Fogli).
> - **Segnala Assenza**: Risoluzione dell'interazione al tocco (gestione eventi touch/pointer e prevenzione della chiusura precoce del backdrop).
> - **Gestione Orari Chiesa**: Nuova sezione dedicata collocata nella scheda **Master** (sottoscheda/blocco Chiesa & Tempi Comunitari).

---

### Proposta di Modifiche Dettagliate

#### 1. Esportazione Residenti in Formato CSV (Super Admin)
- Inserimento del pulsante **"📊 Esporta Residenti (CSV)"** nella scheda Master (sezione Residenti/Ruoli).
- Funzione `esportaResidentiCSV()`:
  - Estrazione dati da `appState.tuttiUtenti` (o mock iniziale se offline).
  - Generazione di stringa CSV con intestazioni: `Nome, Email, Stato, Utente Mensa, Master Mensa, Manutenzione, Spazi, Super Admin, Notif Guasti, Notif Spazi, Notif Push, Password`.
  - Inserimento del BOM UTF-8 (`\uFEFF`) e delimitatori con escape per garantire la corretta visualizzazione degli accenti in Microsoft Excel e Google Sheets.
  - Download immediato del file tramite Blob e link temporaneo: `residenti_newman_YYYY-MM-DD.csv`.

#### 2. Verifica e Scadenza Automatica Comunicazione Direzione
- **Causa identificata**: Attualmente la comunicazione verificava parzialmente la data di scadenza solo nella Bacheca, ma se la data di pubblicazione iniziale era futura veniva mostrata comunque, e nella scheda "La Residenza" non veniva filtrata la scadenza.
- **Risoluzione**:
  - `isAttiva`: il messaggio è attivo se `(!dataPub || dataPub <= adesso)` E `(!dataScad || adesso <= dataScad)`.
  - Se non è attivo (`adesso > dataScad`), il messaggio viene automaticamente nascosto a tutti i residenti ordinari sia in Bacheca che in "La Residenza".
  - Nella scheda Master compare come **"Archiviata per Scadenza"** con contatore visivo e pulsante per riattivare o archiviare/svuotare con un click.

#### 3. Mensa: Vista Giorno Predefinita & Navigazione Settimane a Fondo Pagina
- Modifica del default di visualizzazione in `appState.mensaViewMode`: impostazione predefinita su `'giorno'` invece di `'settimana'`. All'accesso alla scheda Mensa o al cambio giorno, l'utente visualizza immediatamente il pasto e i dettagli del giorno selezionato (con pillola data attiva).
- Aggiunta della barra di navigazione settimana (`◀ Settimana Precedente | Settimana Inizio - Fine | Settimana Successiva ▶`) anche a **fondo pagina** della vista settimanale scrollabile (`renderWeeklyScrollView`).

#### 4. Correzione Computo Settimana nel Calendario Liturgico Romano
- **Causa identificata**: In `calcolaCalendarioRomano()`, il Tempo Ordinario impostava in modo errato `settimanaNum = 1` nei primi mesi dell'anno, e dopo maggio utilizzava un calcolo rigido con offset fisso del 25 maggio che sfasava la settimana liturgica rispetto all'effettivo computo cattolico.
- **Risoluzione**:
  - Computo corretto del Battesimo del Signore (prima domenica dopo l'Epifania): la 1ª settimana del Tempo Ordinario inizia il lunedì successivo.
  - Computo corretto della ripresa del Tempo Ordinario dopo Pentecoste (Domenica di Pasqua + 50 giorni), sincronizzato a ritroso dalla 34ª settimana (Cristo Re, ultima domenica prima della 1ª di Avvento).
  - Assegnazione accurata della domenica e della feria liturgica corrente.

#### 5. Risoluzione Apertura Modale "Segnala Assenza" al Tocco
- **Causa identificata**: Sui dispositivi touch mobile, l'evento `click` sintetizzato dopo il tap cadeva spesso sullo sfondo della modale appena resa visibile, e la soglia di protezione temporale (150ms) era inferiore alla durata standard del tap (200-350ms), causando l'immediata auto-chiusura tramite `gestisciClickBackdrop`. Inoltre, alcuni pulsanti inline avevano stili o binding non coordinati con `pointer-events`.
- **Risoluzione**:
  - Incremento della protezione anti-tap-through a 450ms in `src/core/modal.js`.
  - Verifica coordinate e target esplicito nel click sul backdrop (`event.target === event.currentTarget`).
  - Prevenzione del bubbling con `event.stopPropagation()` e gestione sicura su pulsanti `apriModalSegnalaAssenza()`.
  - Sincronizzazione preventiva degli input data prima del reflow a schermo.

#### 6. Gestione Orari Chiesa & Tempi di Vita Comunitaria (Scheda Master)
- Nuova configurazione in `appState.cachedConfig` (salvata su Google Apps Script / LocalStorage):
  - `Chiesa_Fascia_Mattina_Inizio` (default: `"08:00"`)
  - `Chiesa_Fascia_Mattina_Fine` (default: `"13:00"`)
  - `Chiesa_Fascia_Pomeriggio_Inizio` (default: `"16:30"`)
  - `Chiesa_Fascia_Pomeriggio_Fine` (default: `"19:30"`)
  - `Chiesa_Messa_Domenica` (default: `"11:00"`, fissa ogni domenica)
  - `Chiesa_Descrizione_Comunitaria` (default testo modificabile dal Master per tempi di vita comunitaria e celebrazioni).
  - `Spazi_Indicazioni_Generali` (default testo sintetico per utilizzo ambienti).
- Sezione dedicata nella scheda Master per modificare e salvare questi parametri in tempo reale.
- In `src/modules/spazi/spazi.service.js`:
  - Per la risorsa **Chiesa**, gli slot prenotabili sono circoscritti alle fasce autorizzate (es. 08:00–13:00 e 16:30–19:30); gli slot fuori fascia sono indicati come non disponibili o riservati.
  - La domenica, lo slot delle 11:00 è automaticamente contrassegnato e bloccato come "⛪ Santa Messa Comunitaria".

#### 7. Spazio Indicazioni Pubbliche per Utilizzo Ambienti
- Inserimento nella scheda **Spazi / Prenotazioni** di una scheda informativa sintetica e pulita in testa alla pagina:
  - Specifica chiaramente che la Chiesa è a disposizione per **gruppi esigui** e momenti di preghiera comunitaria o individuale.
  - Riassume in forma visuale e sintetica le fasce orarie della celebrazione e la Messa comunitaria domenicale.

#### 8. Snellimento Testi & Fluidità UI
- Revisione dei testi verbosi e descrizioni ovvie ("In questa schermata puoi visualizzare...", spiegazioni prolisse rimosse).
- Uso di chip informativi essenziali, etichette chiare e icone leggibili.
- Layout leggero e arioso nel pieno rispetto del design constitution mobile-first.

---

### Piano di Verifica e Test

1. **Test Esportazione Residenti**:
   - Apertura Master con ruolo Super Admin ➜ Click su "Esporta Residenti (CSV)" ➜ Verifica del file scaricato, codifica caratteri e colonne.
2. **Test Scadenza Comunicazione**:
   - Impostazione di un messaggio con scadenza passata ➜ Verifica che per il residente scompaia dalla Bacheca e dalla Residenza, e compaia come archiviato per il Master.
3. **Test Mensa**:
   - Apertura scheda Mensa ➜ Verifica che si apra di default la Vista Giorno;
   - Passaggio a Vista Settimana ➜ Verifica presenza dei pulsanti di navigazione settimana a inizio e fondo pagina.
4. **Test Calendario Liturgico**:
   - Verifica della settimana del Tempo Ordinario odierna e delle domeniche calcolate rispetto al calendario cattolico.
5. **Test Tocco Segnala Assenza**:
   - Tap sui pulsanti "Segnala Assenza" (dalla Mensa, dal menu, dalla Bacheca) da touch emulation mobile ➜ Verifica apertura immediata e stabile della modale senza chiusura involontaria.
6. **Test Orari Chiesa**:
   - Modifica fasce in Master ➜ Verifica aggiornamento slot nella scheda Spazi per la Chiesa e blocco della Messa domenicale ore 11:00.
7. **Verifica Compilazione**:
   - Esecuzione `compile_applet` per confermare zero errori di sintassi o import.

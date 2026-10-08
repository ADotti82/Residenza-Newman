# Piano Operativo Pre-Lancio: Revisione Completa Meccanismi e Accessibilità

## Diagnosi ed Obiettivi del Piano

Il lancio ufficiale dell'applicazione per la Residenza è programmato per domani. L'utente ha segnalato alcuni blocchi specifici su funzionalità chiave che richiedono un consolidamento definitivo:
1. **Date di assenza ("non si apre")**: verifica dell'evento di apertura, del binding globale e della rimozione di ogni pre-condizione che blocchi la modale `modal-segnala-assenza`.
2. **Inserisci appuntamento**: verifica e sblocco di `apriModalMasterAppuntamento()` in tutte le sue viste (Home, Spazi, Master, Calendario) garantendo apertura e pre-compilazione corretta per Chiesa, Sala TV e Bacheca.
3. **Gestione buste**: revisione della finestra `modal-gestione-buste-master` e del selettore sacchetto pranzo per martedì/giovedì, assicurando che le azioni non si blocchino per verifiche di ruolo o selezioni data.
4. **Menu 14 giorni e modifica menu**: verifica della consultazione `modal-consulta-menu` e della modifica `modal-modifica-menu` con salvataggio sicuro su localStorage e fallback Google Apps Script.
5. **Sostituzione icona 👥 con "Ospiti"**: aggiornamento dell'etichetta nelle schede pasto della Mensa e nei riepiloghi.
6. **Leggibilità in Visione Notturna (Dark Mode)**: revisione globale dei contrasti CSS per tutte le card, testi, tabelle e finestre modali con token ad alto contrasto.

---

## 1. Architettura delle Modifiche e Flussi Utente

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INTERFACCIA RESIDENZA                           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
  [Segnala Assenza]       [Nuovo Appuntamento]       [Mensa & Menu 14gg]
  - Apertura garantita    - Ambienti: Chiesa, Sala   - Vista 14gg tabellare
  - Data inizio -> fine     TV, Bacheca              - Modifica piatti rapida
  - Sospensione pasti     - Orari 30m e fasce        - Gestione Buste M/G
  - Binding globale         predefinite              - Label "Ospiti" chiara
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
          ┌──────────────────────────────────────────────────┐
          │     DARK MODE ENGINE (Contrasto e Leggibilità)   │
          │  - Neutralizza hardcoded dark colors (#1e1b4b)   │
          │  - Testo chiaro (--text-main / #f8fafc)          │
          │  - Sfondi card scuri dedicati (--surface-alt)    │
          └──────────────────────────────────────────────────┘
```

---

## 2. Dettaglio degli Interventi Specifici

### A. Sblocco Finestra Date di Assenza
- **Problema**: L'utente clicca su "🧳 Segnala Assenza" ma la finestra non compare.
- **Risoluzione**:
  - Garantire che la funzione `window.apriModalSegnalaAssenza` e `apriModalSegnalaAssenza` sia invocabile da qualsiasi parte dell'app.
  - Assegnare esplicitamente `display: flex !important; z-index: 9999 !important;` sulla modale `#modal-segnala-assenza`.
  - Inserire l'apertura immediata PRIMA di qualsiasi lettura dei dati utente o calcolo di date, così che anche se un campo facoltativo non fosse ancora popolato, la modale sia visibile al 100%.
  - Consentire l'apertura anche all'utente non loggato, mostrando all'interno l'invito all'accesso o permettendo la pre-selezione.

### B. Inserisci Appuntamento (Master e Comunitario)
- **Problema**: I pulsanti "➕ Inserisci Appuntamento" in Home, Calendario Globale e Spazi non aprono regolarmente la modale `#modal-master-nuovo-appuntamento`.
- **Risoluzione**:
  - Verificare `window.apriModalMasterAppuntamento(risorsaDefault, dataDefault)`:
    - Impostare `display: flex !important; z-index: 9999 !important;`.
    - Popolare automaticamente l'ambiente (Chiesa se richiamato da Chiesa, Sala TV se da Sala TV, Bacheca per eventi generali).
    - Impostare l'orario e gli slot senza dipendere da funzioni non ancora sincronizzate.
  - Registrare l'evento `onsubmit` sul form per salvare su `appState.prenotazioniSpazi` e notificare con toast di successo.

### C. Gestione Buste (Pranzo al Sacco)
- **Problema**: La finestra di gestione buste (`modal-gestione-buste-master`) richiede permessi o non mostra chiaramente l'elenco dei residenti con sacchetto pranzo per martedì e giovedì.
- **Risoluzione**:
  - Consentire l'apertura della finestra per consultazione anche senza blocchi rigidi di permessi (con modalità sola lettura o sblocco per Master Mensa).
  - Assicurare che `renderContenutoGestioneBusteMaster()` mostri chiaramente i residenti che hanno spuntato "Busta" per la data selezionata.
  - Facilitare il cambio data veloce per il prossimo martedì o giovedì.

### D. Menu 14 Giorni e Modifica Menu
- **Problema**: Il menu ciclico a 14 giorni e la sua modifica non sono sempre accessibili o non riflettono immediatamente le modifiche.
- **Risoluzione**:
  - Verificare `apriModalConsultaMenu()` e `apriModalModificaMenu()`:
    - Garantire apertura immediata di `#modal-consulta-menu` e `#modal-modifica-menu`.
    - Visualizzare chiaramente Settimana 1 e Settimana 2 con alternanza pranzo/cena.
    - Sincronizzare il salvataggio in `localStorage.setItem('newman_menu_14_giorni', ...)` e forzare il re-rendering immediato della scheda menu del giorno in Mensa.

### E. Modifica Icona Ospiti: 👥 ➜ "Ospiti"
- **Problema**: La presenza dell'icona `👥` non è sempre intuitiva per gli utenti meno tecnologici.
- **Risoluzione**:
  - Nelle card pasto della Mensa (Pranzo e Cena), sostituire il badge o contatore con la dicitura chiara: **"Ospiti: [N] ➕"**.
  - Nei form e riepiloghi, sostituire i glifi `👥` con la dicitura formale **"Ospiti"**.

### F. Ottimizzazione Globale Contrasto in Visione Notturna (Dark Mode)
- **Problema**: Molti elementi HTML hanno stili in linea con colori scuri fissi (es. `#1e1b4b`, `#1e293b`, `#475569`, `#0f172a`), che su sfondo scuro risultano illeggibili o invisibili.
- **Risoluzione**:
  - Aggiungere in `index.html` una classe o selettore universale per `[data-theme="dark"]` che converta tutti i testi scuri in linea in tonalità chiare ad alto contrasto (`#f8fafc`, `#e2e8f0`, `#cbd5e1`).
  - Applicare sfondi scuri consistenti (`--surface` e `--surface-alt`) alle card, box informativi e modali.
  - Verificare i titoli delle modali, i label dei form e le tabelle delle assenze.

---

## 3. Piano di Verifica e Collaudo
1. **Test Apertura Modali**:
   - Clic su "🧳 Segnala Assenza" in Home e Mensa.
   - Clic su "👑 ➕ Inserisci Appuntamento" in Home, Calendario e Spazi.
   - Clic su "🥪 Gestione Buste" in Mensa e Master.
   - Clic su "📜 Consulta Menu 14 Giorni" e "✏️ Modifica Menu".
2. **Test Interazione Ospiti**:
   - Verifica comparsa della scritta "Ospiti" invece dell'icona `👥`.
3. **Test Visione Notturna**:
   - Attivazione del tema scuro (Dark Mode) dalle Impostazioni.
   - Ispezione visiva di contrasto su: card Home, card Mensa, modali di inserimento, tabelle e badge.
4. **Verifica Build**:
   - Esecuzione di `compile_applet` per assicurare zero regressioni di compilazione.

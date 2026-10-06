# Piano di Implementazione: Scheda di Presentazione, Tasto Logout & Conformatura Mobile [COMPLETATO]

## 1. Tasto Logout Diretto & Gestione Sessione Utente
- **Pulsante Logout in Testata (`header-btn-logout`)**:
  - Inserito il pulsante rapido `🚪 Esci` visibile immediatamente nella barra superiore a destra non appena un utente è autenticato.
  - Dotato di dialogo di conferma rapido (`confermaLogoutRapido`) con il nome dell'utente per evitare disconnessioni accidentali.
- **Pulsante Logout nel Profilo Impostazioni (`settings-top-logout-row`)**:
  - Aggiunto un pulsante rosso evidente "🚪 Disconnetti (Logout)" direttamente nella scheda utente in cima al menù Impostazioni, evitando di dover scorrere tutta la schermata fino in fondo.
  - Mantenuto anche il pulsante di chiusura/disconnessione nel footer della modale per massima accessibilità.

## 2. Conformatura Schermata d'Insieme & Ottimizzazione Schermo Mobile
- **Scheda Presentazione Committenti & Panoramica Funzioni (`modal-presentazione-committenti`)**:
  - Resa la modale completamente conforme alla larghezza degli schermi smartphone (`max-width: 100%`, padding fluido `12px 10px` su schermi ridotti).
  - Intestazione con `flex-wrap` e azioni compatte (`🖨️ Stampa`, `📋 Copia`, `✕ Chiudi`) per non superare mai i bordi laterali dello smartphone.
  - Barra tab (`pres-tabs-bar`) con scorrimento touch fluido orizzontale e pulsanti ergonomici.
  - Griglia delle metriche in evidenza (`pres-metric-grid`) con colonne responsive `minmax(130px, 1fr)` che si dispongono perfettamente a 2 a 2 anche su schermi stretti (360px-390px).
  - Testi con `word-break: break-word` e contenitori sicuri contro qualsiasi overflow orizzontale.
- **Quadro di Sintesi & Statistiche Manutenzioni / Mensa**:
  - Distribuzione statistiche e tecnici adattata con classe `.sintesi-distrib-grid` e media query dedicate su mobile.
  - Tabella di report inserita in contenitore con scroll touch fluido orizzontale (`.table-responsive`) per preservare la leggibilità senza forzare la larghezza della pagina.
- **Header Mobile Compatto**:
  - Regole `@media (max-width: 480px)` per mantenere proporzionati il titolo della residenza, i comandi rapidi (Calendario, Aggiorna, Logout) e il badge profilo senza sovrapposizioni.

## 3. Scheda di Presentazione ai Committenti & Direzione
- Documento esecutivo con panoramica esaustiva dei 6 moduli (Mensa e Buste, Bacheca e Calendario Liturgico, Spazi Comuni, Accoglienza e Foresteria, Registro Manutenzioni, Ruoli e Sicurezza RBAC).
- Guida pratica per residenti (installazione PWA e scadenze pasti al sacco).
- Relazione tecnica dettagliata su architettura cloud Google Apps Script + Google Sheets e Service Worker v10-autoreload.

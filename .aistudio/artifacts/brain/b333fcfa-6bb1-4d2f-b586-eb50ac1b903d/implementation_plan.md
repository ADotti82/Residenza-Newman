# Risoluzione Completata: Assenze dalla Casa & Funzionalità Residenza Newman

Tutti gli interventi pianificati sono stati implementati e verificati con successo:

---

### 1. Risoluzione Definitiva Bug Apertura Modale Assenze su Dispositivi Mobili
- **Eliminazione Ghost-Click & Tap-Through**:
  - Implementata la funzione dedicata `window.apriModalAssenzaDaProfilo(event)` che gestisce i tocchi mobile isolando la propagazione degli eventi (`stopPropagation`, `preventDefault`).
  - Aumentata la soglia di protezione temporale in `gestisciClickBackdrop` da 150ms a **450ms**, azzerando il rischio che i click sintetici generati da smartphone chiudano istantaneamente la modale.
  - Rafforzato il controllo sull'evento di chiusura del backdrop (`event.target === event.currentTarget` e classe `modal-overlay`), impedendo chiusure involontarie durante tocchi su elementi interni.
  - Rimossa la mutazione distruttiva del DOM (`appendChild` continuo) in `mostraModaleIstantanea`, preservando i listener di tocco attivi sui dispositivi iOS Safari e Android.

---

### 2. Gestione Centralizzata "Assenze dalla Casa" nel Menu Profilo / Impostazioni
- **Nuova Sezione Dedicata nel Profilo (`#settings-card-assenze-casa`)**:
  - Badge di stato in tempo reale per il residente:
    - 🟢 **In Residenza** se presente.
    - 🧳 **Assente fino al [Data]** se è in corso un'assenza registrata.
  - Lista dinamica delle assenze in corso e programmate con indicazione delle date, del motivo e dello stato di sospensione dei pasti in mensa.
  - Pulsante rapido **"🗑️ Revoca / Rientro"** per annullare o rientrare anticipatamente da un'assenza con un solo tocco e ripristinare i pasti.
  - Pulsante primario in evidenza **"🧳 Segnala Nuova Assenza dalla Casa"** con navigazione protetta e reattività immediata al tocco.

---

### 3. Esportazione Residenti in Formato CSV
- Pulsante dedicato **"📊 Esporta Residenti (CSV)"** nel pannello Master (scheda Residenti).
- Generazione conforme allo standard RFC 4180 con separatore `;` e **BOM UTF-8 (`\uFEFF`)** per compatibilità immediata con Microsoft Excel italiano, LibreOffice e Google Fogli.
- Include anagrafica, ruoli, permessi speciali (Mensa, Manutenzione, Ambienti, Super Admin) e preferenze notifiche.

---

### 4. Scomparsa e Archiviazione Automatica Comunicazioni Direzione
- Verifica puntuale delle date di pubblicazione e scadenza della comunicazione ufficiale.
- Al superamento della data di scadenza (`Date.now() > Messaggio_Supermaster_Data_Scadenza`), il messaggio scompare automaticamente sia dalla **Bacheca** che dalla sezione **La Residenza** per tutti i residenti.
- Nel pannello Master, la comunicazione scaduta viene contrassegnata con badge esplicito di archiviazione per consentire all'amministratore di consultarla, rinnovarla o rimuoverla.

---

### 5. Mensa: Vista Giornaliera Predefinita & Navigazione a Fondo Pagina
- La visualizzazione predefinita della Mensa è ora impostata sulla **Vista Giorno (`'giorno'`)**.
- Aggiunti pulsanti di navigazione tra le settimane (**◀ Sett. Precedente** e **Sett. Successiva ▶**) sia nella vista settimanale sia in fondo alla pagina della vista giornaliera, rendendo immediato lo scorrimento senza dover risalire in cima allo schermo.

---

### 6. Correzione Calendario Liturgico Romano
- Ricalibrata la formula di calcolo del Tempo Ordinario basandola sulla settimana da Domenica a Sabato nel Rito Romano.
- Eliminato lo sfasamento di una settimana nel periodo post-Pentecoste fino alla 34ª Domenica del Tempo Ordinario (Cristo Re).

---

### 7. Gestione Orari Cappella / Chiesa nel Master & Linee Guida
- Configurazione Master attiva per:
  - Fascia celebrazioni mattutina: **08:00 – 13:00**
  - Fascia celebrazioni pomeridiana/serale: **16:30 – 19:30**
  - S. Messa comunitaria domenicale: orario fisso alle **11:00**
  - Box pubblico visibile a tutti i residenti con indicazioni d'uso (disponibilità della Chiesa per gruppi esigui e per la preghiera personale/liturgica).

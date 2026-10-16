# Piano di Implementazione: Controllo Accessi Master, Iter Accoglienza e Gestione Ruoli Compatta

Riorganizzazione avanzata della sicurezza dell'interfaccia e dell'esperienza utente per la Residenza Cardinal Newman: occultamento automatico del pannello Master per gli utenti privi di ruoli speciali, tracciatore visivo dell'iter delle richieste di accoglienza per i residenti, e visualizzazione compatta a fisarmonica espandibile per la gestione ruoli.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisioni confermate dall'utente nella fase di intervista**:
> 1. **Visibilità Scheda Master**: Nascondere completamente il pulsante e l'accesso alla scheda Master per tutti gli utenti privi di ruoli amministrativi o notifiche attive (`perm_admin`, `perm_mensa`, `perm_manutenzione`, `notif_manutenzione`, `perm_spazi`, `notif_spazi`, `is_master_spazi`).
> 2. **Iter Richieste di Accoglienza**: Nella scheda "Accoglienza & Camere", inserire un tracciatore a fasi dell'iter (1/3 Richiesta inviata ➜ 2/3 1ª Autorizzazione e assegnazione camera ➜ 3/3 2ª Autorizzazione e conferma definitiva, o Rifiuto con motivazione) visibile al residente che ha inoltrato la richiesta.
> 3. **Gestione Ruoli Residenti**: Sostituire la griglia espansa con un elenco a fisarmonica (accordion) compatto: cliccando sul nome del residente si espandono le caselle di controllo (checkbox) per i ruoli, le notifiche e il salvataggio rapido.

---

### 1. Overview & Core Concept

- **Visibilità Selettiva Master**: La scheda Master non deve comparire nella barra di navigazione inferiore né tra i comandi di impostazione per i normali residenti, garantendo riservatezza ed evitando schermate inaccessibili.
- **Trasparenza dell'Iter Accoglienza**: I residenti che invitano ospiti (familiari, sacerdoti o colleghi universitari) possono seguire in tempo reale a che punto si trova la loro richiesta nella procedura a doppia autorizzazione, sapendo quale camera è stata proposta e se è intervenuta la conferma del Supermaster.
- **Cruscotto Ruoli a Fisarmonica**: Una schermata snella in cui ogni residente occupa una sola riga riassuntiva; con un semplice tocco o click sul nominativo si apre il cassetto dettagliato con le 8 caselle di controllo (`is_utente_mensa`, `perm_mensa`, `perm_manutenzione`, `perm_spazi`, `perm_admin`, `notif_manutenzione`, `notif_spazi`, `notif_push`) e i comandi per il salvataggio o il reset della password.

---

### 2. User Experience & Visual Design

#### A. Architettura Visiva e Flusso Utente

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        BARRA DI NAVIGAZIONE                            │
├────────────────────────────────────────────────────────────────────────┤
│ Utente Ordinario: [ 🏠 Home ]  [ 🍽️ Mensa ]  [ 🛏️ Accoglienza ]  [ ⛪ Spazi ]  [ 🛠️ Segnalazioni ] │
│ (Il pulsante [ 👑 Master ] è COMPLETAMENTE INVISIBILE)                 │
│                                                                        │
│ Utente con Ruoli Master:                                               │
│ [ 🏠 Home ] [ 🍽️ Mensa ] [ 🛏️ Accoglienza ] [ ⛪ Spazi ] [ 🛠️ Segn. ] [ 👑 Master ]     │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│               SCHEDA ACCOGLIENZA: LE MIE RICHIESTE (ITER)              │
├────────────────────────────────────────────────────────────────────────┤
│ 👤 Mario Rossi · Ospite per Studio/Ricerca                             │
│ 📅 20 Ott 2026 ➜ 23 Ott 2026 (3 notti) · 1 Persona                     │
│                                                                        │
│ ITER AUTORIZZATIVO:                                                    │
│ [ ✓ Inviata ] ────────── [ 🔑 1ª Auth ] ────────── [ ⏳ In Conferma ]  │
│ 16 Ott 09:30            Assegnata: Cam. Newman     Attesa 2° Master    │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│             GESTIONE RUOLI COMPATTA (ACCORDION PER RESIDENTE)          │
├────────────────────────────────────────────────────────────────────────┤
│ [▼] Don Andrea Dotti (donandreadotti@gmail.com)   [👑 Admin • 🍽️ Mensa]│
│     ┌────────────────────────────────────────────────────────────────┐ │
│     │ [x] Utente Mensa   [x] Master Mensa   [x] Manutenzione         │ │
│     │ [x] Ambienti       [x] Super Admin    [x] Notif. Guasti        │ │
│     │ [x] Notif. Spazi   [x] Push Notif                              │ │
│     │ Password: [ newman2026 ]              [ 💾 Salva Modifiche ]   │ │
│     └────────────────────────────────────────────────────────────────┘ │
│ [▶] Don Rocco (donrocco@newman.it)                [🍽️ Utente Mensa]    │
│ [▶] Don Sergio (donsergio@newman.it)              [🍽️ Utente Mensa]    │
│ [▶] Francesco Rossi (francesco.studente@newman.it)[🍽️ Utente Mensa]    │
└────────────────────────────────────────────────────────────────────────┘
```

#### B. Dettagli di Stile e Anti-Slop Discipline
- **Zero-Pill Metadata**: I ruoli correnti nell'intestazione della fisarmonica saranno mostrati come testo pulito o badge monocromatici sottili, senza agglomerati pesanti.
- **Rhythm & Accessibility**: Le righe della fisarmonica avranno un'altezza comoda al tocco ($\ge 44\text{px}$) con transizione fluida dello stato espanso/compresso e indicatore visivo chiaro (`▶` / `▼`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decisione 1: Criterio rigoroso per la visibilità del pannello Master**:
  - *Scelta*: Verificare con precisione i campi `perm_admin`, `perm_mensa`, `perm_manutenzione`, `notif_manutenzione`, `perm_spazi`, `notif_spazi`, `is_master_spazi`.
  - *Perché*: Evita che sacerdoti o studenti vedano una scheda con funzionalità bloccate o non pertinenti. L'allineamento dei dati predefiniti in `INITIAL_MOCK_DB` per Don Rocco, Don Sergio e Francesco Rossi assicurerà che solo i veri responsabili visualizzino il pulsante.
- **Decisione 2: Iter di accoglienza a 3 tappe progressive**:
  - *Scelta*: Mostrare i tre stati logici con connettori orizzontali e dettagli esplicativi (data richiesta, camera assegnata dal 1° Master, conferma finale).
  - *Perché*: Rende autonomi i residenti senza dover contattare continuamente la direzione per sapere se la stanza è pronta.
- **Decisione 3: Accordion nativo leggero con persistenza di apertura**:
  - *Scelta*: Implementare l'accordion direttamente nel rendering di `appState.tuttiUtenti` conservando gli ID degli utenti espansi in un `Set` (`appState.expandedResidentiSet`), in modo che un refresh o un salvataggio non richiuda inaspettatamente la scheda che il Supermaster sta modificando.
  - *Perché*: Massima fluidità, nessun ricaricamento di pagina, reattività immediata.

---

### 4. Technical Architecture & Data Strategy

```text
┌───────────────────────────────────────────────────────────────────────┐
│                           CENTRAL STATE                               │
│  - appState.user (permessi ricalcolati & puliti)                      │
│  - appState.accoglienzaList (filtrata per utente / iter visuale)      │
│  - appState.tuttiUtenti (renderizzata via template a fisarmonica)     │
│  - appState.expandedResidentiSet (traccia chi è aperto/chiuso)        │
└───────────────────┬───────────────────────────────┬───────────────────┘
                    │                               │
                    ▼                               ▼
       ┌────────────────────────┐      ┌────────────────────────┐
       │   ROUTER & NAV GATING  │      │    ACCOGLIENZA VIEW    │
       │ - nasconde nav-tab-    │      │ - timeline iter 3 fasi │
       │   master               │      │ - badge camera / auth  │
       │ - nasconde settings-   │      │ - note approvatori     │
       │   btn-master           │      └────────────────────────┘
       │ - protegge switchTab   │
       └────────────────────────┘
```

#### Fasi di Esecuzione:
1. **Aggiornamento Sicurezza e Accessi (`src/core/auth.js` e `app.js`)**:
   - Pulire `haPermessiMaster()` per verificare solo i ruoli effettivi e le notifiche di competenza.
   - Allineare `aggiornaUIUtente()` per nascondere sia `nav-tab-master` sia `settings-btn-master` per gli utenti senza privilegi.
   - Proteggere `switchTab('master')` con reindirizzamento automatico a `info` per utenti non autorizzati.
   - Rettificare in `INITIAL_MOCK_DB` i profili residenti ordinari (`perm_mensa: false`, mantenendo `is_utente_mensa: true`).
2. **Modulo Iter Accoglienza Residenti (`app.js`)**:
   - Arricchire `renderAccoglienzaView()` per la sezione "Le Mie Richieste":
     - Aggiungere il componente grafico dell'iter (1ª fase: Ricevuta; 2ª fase: 1ª Autorizzazione con camera assegnata; 3ª fase: 2ª Autorizzazione con conferma definitiva).
     - Evidenziare note di assegnazione, camera riservata e contatto del Master autorizzatore.
3. **Fisarmonica Compatta Gestione Ruoli Residenti (`app.js`)**:
   - Riscrivere `master-residenti-container` con struttura a fisarmonica espandibile:
     - Riga singola con nome, email, ruoli attivi e chevron.
     - Pannello espanso contenente le 8 caselle di controllo, il campo password e il pulsante salva.
     - Funzione toggle `toggleEspandiResidente(email)` e supporto "Espandi / Comprimi tutti".
4. **Collaudo & Build**:
   - Esecuzione `compile_applet` e test con utenti master e residenti standard.

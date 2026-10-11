# Piano di Intervento: Risoluzione Segnalazione Assenze e Blocco Istituzionale Lodi/Messa

## User Review & Critical Decisions

> [!IMPORTANT]
> Tutte le richieste sono state analizzate in dettaglio nel codice sorgente:
> 1. **Domenica cena vs Sabato cena**: Risolto il disallineamento nei bottoni e nei selettori per cui segnando l'assenza domenicale veniva coinvolto anche il sabato (e viceversa). La selezione del giorno e del pasto sarà strettamente atomica e indipendente.
> 2. **Mercoledì solo cena vs Pranzo**: Nel modale e nei bottoni rapidi, selezionare l'assenza a cena non toccherà né sospenderà il pranzo (disaccoppiamento completo dei pasti `pranzo` e `cena`).
> 3. **Blocco Istituzionale Chiesa per Lodi e Messa**:
>    - **Lodi mattutine**: 06:30 - 06:45 (lunedì - venerdì, eccetto giovedì).
>    - **Santa Messa comunitaria**: 06:45 - 07:15 (lunedì - venerdì, eccetto giovedì).
>    - I relativi slot orari nella Chiesa saranno bloccati e contrassegnati come celebrazioni comunitarie fisse, impedendo sovrapposizioni da parte dei singoli residenti.

---

### 1. Overview & Core Concept
- **Cosa fa**: 
  - Corregge la gestione e sincronizzazione delle assenze pasto garantendo granularità puntuale (singolo pasto per singolo giorno).
  - Introduce nel modulo Gestione Spazi (Chiesa / Cappella) gli slot orari dedicati alle Lodi (06:30 - 06:45) e alla Santa Messa Comunitaria (06:45 - 07:15) nei giorni feriali (Lunedì, Martedì, Mercoledì, Venerdì).
- **Target**: Residenti della Residenza Cardinal Newman e Direzione/Master.

---

### 2. User Experience & Visual Design
- **Interfaccia Segnala Assenza**:
  - Quando si apre il modale da un giorno specifico (es. Domenica o Mercoledì), data di inizio e data di fine corrispondono esattamente a quel giorno.
  - Le caselle per la scelta dei pasti (Pranzo / Cena) riflettono esattamente la volontà dell'utente: se si desidera solo la Cena, solo la Cena viene contrassegnata come assente, lasciando il Pranzo inalterato.
  - Nei bottoni rapidi di ogni singola card giornaliera della Mensa (`❌ Assente`), il clic su Cena segna assente solo ed esclusivamente la Cena di quel giorno specifico.
- **Griglia Spazi e Calendario per la Chiesa**:
  - Negli orari 06:30-06:45 e 06:45-07:15 (dal lunedì al venerdì escluso giovedì), la Chiesa mostra chiaramente i badge:
    - `06:30 - 06:45`: 📖 **Lodi Mattutine Comunitarie** (Riservato Comunità)
    - `06:45 - 07:15`: ⛪ **S. Messa Comunitaria** (Celebrazione Comunitaria)
  - Gli slot non saranno prenotabili dai singoli residenti ma saranno visibili anche in Bacheca e Calendario Globale.

---

### 3. Key Product Decisions & Trade-Offs
- **Decisione 1: Granularità slot mattutini (15 e 30 minuti)**
  - Gli slot generali restano su intervalli da 30 minuti, ma per la prima fascia mattutina della Chiesa (06:30 - 07:15) vengono supportati gli slot specifici `06:30 - 06:45` e `06:45 - 07:15`, integrati nel sistema di verifica collisioni.
- **Decisione 2: Isolamento atomico delle assenze**
  - I bottoni veloci `quickSegnaAssente(dStr, tipoPasto)` inviano e modificano unicamente il record del tipo pasto specificato (`pranzo` o `cena`), azzerando qualsiasi effetto collaterale sul pasto gemello dello stesso giorno o dei giorni adiacenti.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Mensa & Assenze                      │
│                                                        │
│  [quickSegnaAssente(dStr, 'cena')]                     │
│         │                                              │
│         ▼                                              │
│  Payload: { data: dStr, tipo_pasto: 'cena', ... }      │
│         │                                              │
│         ▼                                              │
│  db.mensa: Modifica SOLO { data: dStr, pasto: cena }   │
│  (Pranzo e giorni adiacenti rimangono INALTERATI)      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│               Chiesa / Cappella Spazi                  │
│                                                        │
│  Giorno Lun-Ven (tranne Gio):                          │
│  ├── 06:30 - 06:45 ➜ 📖 Lodi Comunitarie (Bloccato)    │
│  └── 06:45 - 07:15 ➜ ⛪ S. Messa (Bloccato)            │
│                                                        │
│  Eventi Istituzionali generati e sincronizzati in:    │
│  - Griglia Spazi Chiesa                                │
│  - Bacheca & Calendario Globale                        │
└────────────────────────────────────────────────────────┘
```

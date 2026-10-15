# Visualizzazione Ritardi e Ospiti nei "Prossimi Giorni" del Registro Cucina

Integrazione nella barra rapida "🛒 Prossimi Giorni" della vista Cucina dei conteggi per arrivi posticipati (ritardi) ed extra porzioni (ospiti), mostrati con indicatori iconici compatti solo quando presenti per pranzo e per cena.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Scelte confermate dall'utente nella fase di chiarimento**:
> 1. **Stile di Visualizzazione**: *Icone compatte senza etichetta di testo* (es. `⏰2`, `👥+1`), preservando l'ingombro ridotto delle schede dei giorni senza appesantire la griglia.
> 2. **Ripartizione dei Dati**: *Distinti separatamente tra pranzo e cena*, così che la cuoca e i master possano distinguere a colpo d'occhio se il ritardo o l'ospite è atteso a pranzo (☀️) o a cena (🌙).
> 3. **Regola di Visibilità Condizionale**: Gli indicatori compaiono **esclusivamente se maggiori di zero** (`> 0`). Se un giorno o pasto non ha ritardi o ospiti registrati, la scheda rimane pulita con i soli numeri base di presenze.

---

### 1. Overview & Core Concept

- **Cosa fa**: Arricchisce le schede dei 5 giorni futuri nel carosello `"🛒 Prossimi Giorni:"` del Registro Cucina. Oltre ai coperti ordinari di pranzo e cena (e alle buste nei giorni previsti), ogni scheda mostrerà l'icona dell'orologio `⏰` con il numero di ritardi e l'icona delle persone `👥` con il numero di ospiti, associati al rispettivo pasto.
- **Utenti target**: Personale di cucina (cuoca) e Master della residenza, che consultano la pianificazione settimanale per preparare porzioni aggiuntive e piatti da conservare al caldo.
- **Valore aggiunto**: Anticipare tempestivamente la preparazione dei pasti dei giorni a venire senza dover aprire il dettaglio di ogni singolo giorno.

---

### 2. User Experience & Visual Design

#### Struttura Visiva della Scheda Giorno
La scheda di ciascun giorno nella griglia `Prossimi Giorni` adotta un layout compatto e leggibile:

```text
┌─────────────────────────────────┐
│           VEN 16/10             │
│                                 │
│  ☀️ 3  ⏰1  👥+1    🌙 3       │
│               🥪 2              │
└─────────────────────────────────┘
```

- **Riga Intestazione**: Giorno della settimana e data (es. `VEN 16/10`).
- **Sezione Pranzo (☀️)**:
  - Conteggio presenze sala/totali in arancione scuro (`#ea580c`).
  - Se `ritardiPranzo > 0`: icona `⏰` con conteggio rosso scuro (`#dc2626`, `font-weight: 800`).
  - Se `ospitiPranzo > 0`: icona `👥` con `+N` in ambra scuro (`#d97706`, `font-weight: 800`).
- **Sezione Cena (🌙)**:
  - Conteggio presenze cena in blu (`#2563eb`).
  - Se `ritardiCena > 0`: icona `⏰` con conteggio in rosso (`#dc2626`).
  - Se `ospitiCena > 0`: icona `👥` con `+N` in blu cobalto (`#1d4ed8`).
- **Buste Asporto (🥪)**: Compare come badge separato solo nei giorni con buste attive (`> 0`).
- **Accessibilità & Tooltip**: Ciascun indicatore compatto include un attributo `title` descrittivo (es. `title="1 ritardo a pranzo"`, `title="2 ospiti a cena"`).

---

### 3. Key Product Decisions & Trade-Offs

- **Calcolo Dinamico dei Giorni Futuri**:
  - *Approccio Scelto*: Riutilizzare la funzione esistente `calcolaContatoreMensa(ymd, "pranzo")` e `calcolaContatoreMensa(ymd, "cena")` già ottimizzata per estrarre `totale`, `buste`, `ritardi` e `ospitiTotali`.
  - *Perché*: Garantisce coerenza al 100% tra quanto mostrato nelle mini-schede e quanto compare una volta selezionato il giorno nel dettaglio della schermata.
- **Ripartizione Grafica Compatta**:
  - *Approccio Scelto*: Raggruppare visivamente gli indicatori vicino al pasto di riferimento (☀️ per il pranzo, 🌙 per la cena) con spaziatura flessibile (`gap: 6px`) e wrapping naturale se lo schermo è molto stretto.

---

### 4. Technical Architecture & Data Strategy

#### Diagramma di Flusso Dati

```text
┌────────────────────────────────────────────────────────┐
│                   appState.mensaBookings               │
│       (Prenotazioni, assenze, ritardi, ospiti)         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│        Loop Prossimi Giorni (5 giorni futuri)          │
│   • calcolaContatoreMensa(ymd, "pranzo")               │
│     ➜ { totale, buste, ritardi, ospitiTotali }         │
│   • calcolaContatoreMensa(ymd, "cena")                 │
│     ➜ { totale, buste, ritardi, ospitiTotali }         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             Render Scheda "Prossimi Giorni"            │
│   ☀️ ${pg.pranzo} [⏰${pg.ritP}] [👥+${pg.ospP}]        │
│   🌙 ${pg.cena}   [⏰${pg.ritC}] [👥+${pg.ospC}]        │
│   [🥪 ${pg.buste}]                                     │
└────────────────────────────────────────────────────────┘
```

#### File Interessati:
1. `app.js`:
   - Nella funzione `renderCucinaView`:
     - Aggiornare il mapping di `prossimiGiorni` raccogliendo `ritardiPranzo`, `ospitiPranzo`, `ritardiCena`, `ospitiCena`, `bustePranzo`, `busteCena`.
     - Aggiornare il template HTML delle card in `prossimiGiorni.map(...)` per mostrare le icone compatte condizionalmente.
2. `sw.js` & `index.html`:
   - Aggiornamento della versione di cache del Service Worker per la propagazione immediata dell'aggiornamento.

---

### 5. Piano di Verifica

1. **Verifica Giorni Senza Ritardi/Ospiti**:
   - Accertarsi che per le date senza ritardi o ospiti non compaiano icone vuote o numeri zero (`⏰0` o `👥+0` non devono mai apparire).
2. **Verifica Presenza Ritardi**:
   - Impostare una presenza con arrivo ritardato su una data futura e verificare la comparsa immediata di `⏰N` associata al corretto pasto (☀️ pranzo o 🌙 cena).
3. **Verifica Presenza Ospiti**:
   - Aggiungere un ospite su una data futura e controllare la comparsa di `👥+N`.
4. **Test di Selezione & Cambio Data**:
   - Cliccando su ciascuna scheda giorno, il giorno attivo deve cambiare regolarmente aggiornando il dettaglio sottostante.
5. **Verifica Compilazione**:
   - Esecuzione di `compile_applet` per confermare l'integrità sintattica e di build.

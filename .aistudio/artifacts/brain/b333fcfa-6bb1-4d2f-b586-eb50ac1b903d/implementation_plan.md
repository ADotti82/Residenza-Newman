# Calendario Assenze Residenti & Sincronizzazione Mensa per Superadmin

Sistema completo per consentire a ogni residente di segnalare le proprie assenze (per uno o più giorni) e ai Superadmin / Master di monitorare le assenze su un vero calendario interattivo mensile, con disattivazione/sincronizzazione automatica dei pasti in mensa per gli utenti del servizio.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisioni confermate & flussi operativi integrati:**
> - **Segnalazione Assenza Utente**: Ogni utente può accedere sia dalla Home (widget dedicato / pulsante rapido) sia dalla sezione Mensa / Profilo per registrare un'assenza singola o un intervallo di date, specificando motivo opzionale e note.
> - **Sincronizzazione Mensa Automatica**: Se l'utente è un "utente mensa" (`is_utente_mensa: true`), la finestra permette di spuntare "Assente anche dai pasti in Mensa" (con scelta tra Pranzo, Cena o Entrambi). Al salvataggio, per tutti i giorni del periodo indicato, lo stato dei pasti viene automaticamente marcato come `assente` nel registro mensa comunitario.
> - **Calendario Superadmin / Master**: Una scheda dedicata nel pannello Master ("Calendario Assenze") strutturata come un calendario mensile reale con navigazione mesi, vista giorni Lun-Dom, badge dei nominativi assenti, chip pasto sospeso, filtri di ricerca e cassetto dettagli per ciascuna data.

---

## 1. Panoramica & Funzionalità Chiave

- **Per ogni Utente/Residente**:
  - Finestra modale intuitiva per registrare un'assenza (giorno singolo o intervallo date).
  - Opzione per contrassegnare l'assenza dai pasti con cancellazione/impostazione automatica su `assente` in mensa.
  - Sezione "Le Mie Assenze" con visualizzazione dei periodi salvati e possibilità di annullare o modificare.
- **Per i Superadmin & Master**:
  - Calendario mensile autentico (griglia Lun-Dom con evidenza del giorno corrente).
  - Visualizzazione immediata di chi è assente giorno per giorno con nomi leggibili e badge visuali.
  - Indicazione chiara se l'assenza comporta anche la sospensione della mensa (icona piatto/posate).
  - Statistiche rapide di testata: *Assenti oggi*, *Assenze nei prossimi 7 giorni*, *Pasti mensa sospesi*.
  - Filtri istantanei: ricerca per nome residente, filtro per sole assenze con mensa sospesa.
  - Clic su qualsiasi data del calendario per aprire il cassetto/popup di dettaglio con la lista completa dei residenti assenti in quel giorno, i contatti, il motivo e i pasti disattivati.

---

## 2. Esperienza Utente & Visual Design

```
┌────────────────────────────────────────────────────────────────────────┐
│ MASTER: CALENDARIO ASSENZE RESIDENTI                                  │
├────────────────────────────────────────────────────────────────────────┤
│ [ < Mese Prec ]        Ottobre 2026        [ Mese Succ > ]  [ Oggi ]   │
│                                                                        │
│ Filtra residente: [ Cerca nome... ]    [x] Solo con mensa sospesa      │
│                                                                        │
│ ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────┐ │
│ │ 3 Assenti    │  │ 7 Assenze    │  │ 12 Pasti Mensa                 │ │
│ │ Oggi         │  │ Prossimi 7gg │  │ Sospesi questo mese            │ │
│ └──────────────┘  └──────────────┘  └────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ LUN    MAR    MER    GIO    VEN    SAB    DOM                          │
│ ────────────────────────────────────────────────────────────────────── │
│ 28     29     30     1      2      3      4                            │
│                      [• Rossi (🍽️)]                                     │
│                                                                        │
│ 5      6      7      8      9      10     11                           │
│        [• Bianchi]   [• Rossi (🍽️)] [• Verdi]                            │
│                      [• Don Rocco]                                     │
│                                                                        │
│ 12     13     14     15     16     17     18                           │
└────────────────────────────────────────────────────────────────────────┘
```

- **Stile visivo**: Coerente con la palette Newman (Navy, Slate, Indigo, Amber), senza badge caramellosi o card annidate. Tipografia pulita con numeri tabulari.
- **Interazione al clic sul giorno**: Apre un pannello pulito con l'elenco degli assenti del giorno selezionato, le note di assenza e lo stato dei pasti.

---

## 3. Architettura Dati & Sincronizzazione

```
┌─────────────────────────┐
│     Modulo Assenza      │
│ (Data inizio - fine)    │
│ [x] Sospendi pasti      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐       Salvataggio
│   Array `db.assenze`    ├─────────────────────────────► localStorage /
│   - id, email, nome     │                               Apps Script API
│   - data_inizio, fine   │
│   - assente_mensa, pasti│
└───────────┬─────────────┘
            │ Se assente_mensa === true
            ▼
┌─────────────────────────┐
│ Ciclo date intervallo   │
│ Aggiorna `db.mensa`     │──► Segna stato_presenza = "assente"
│ per pranzo / cena       │    per ogni giorno compreso
└─────────────────────────┘
```

- **Entità `assenze`**:
  - `id`: identificativo univoco (es. `ASS_1728384910`)
  - `email`: email del residente
  - `nome`: nominativo del residente
  - `data_inizio`: `YYYY-MM-DD`
  - `data_fine`: `YYYY-MM-DD`
  - `motivo`: motivo selezionabile ("Studio", "Famiglia / Ritorno a casa", "Lavoro / Tirocinio", "Viaggio", "Altro")
  - `note`: note descrittive facoltative
  - `assente_mensa`: booleano (`true` / `false`)
  - `pasti_interessati`: array di pasti (`['pranzo']`, `['cena']`, o `['pranzo', 'cena']`)
  - `data_creazione`: timestamp ISO

- **Aggiornamento automatico della Mensa**:
  - Quando viene salvata un'assenza con `assente_mensa: true`, il sistema itera su tutte le date da `data_inizio` a `data_fine` (inclusive).
  - Per ciascun pasto selezionato (pranzo, cena o entrambi), crea o aggiorna la prenotazione in `db.mensa` impostando `stato_presenza: "assente"`, `busta: false`, `ritardo: false`, `note: "Assenza programmata: " + motivo`.
  - Se un'assenza viene cancellata dal residente prima della sua scadenza, viene data la possibilità di ripristinare o pulire i record mensa collegati.

---

## 4. Fasi di Implementazione

1. **Struttura Dati & Backend Mock**:
   - Inizializzazione della collezione `assenze` nel mock DB locale e gestione persistenza `localStorage`.
   - Implementazione delle azioni API: `registraAssenza`, `cancellaAssenza`, `getAssenze`.
   - Logica di sincronizzazione transazionale con `prenotaMensa` per impostare lo stato `assente`.

2. **UI Utente Residente**:
   - Modale "Segnala Assenza": scelta data singola o intervallo, motivo, note, toggle "Assente dai pasti della Mensa" con checkbox pranzo/cena.
   - Pulsante "Segnala Assenza" accessibile nella Home, nella vista Mensa e nel menu opzioni.
   - Scheda/elenco delle "Mie Assenze Programmate" per visualizzare e revocare le proprie assenze.

3. **Calendario Mensile Superadmin / Master**:
   - Aggiunta della tab "Calendario Assenze" nel pannello Master (visibile ai Superadmin/Master).
   - Generazione della griglia del calendario per il mese corrente con controlli Mese Prec / Mese Succ / Oggi.
   - Rendering dei residenti assenti su ogni casella giornaliera con badge nominativi ed icona pasto.
   - Statistiche in testata e filtri veloci (ricerca nominativo, toggle solo pasti mensa).
   - Drawer/modale di dettaglio del singolo giorno al clic sulla casella.

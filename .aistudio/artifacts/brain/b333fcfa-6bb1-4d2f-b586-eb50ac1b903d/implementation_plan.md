# Piano d'Azione: Visualizzazione Residenti con Busta Prenotata nella Finestra Modale

## Obiettivo
Garantire che, cliccando sul riepilogo delle buste nella vista cuoca ("🥪 X BUSTE", "vedi nomi ↗" o dal contatore porzioni), la finestra modale mostri **sempre con certezza assoluta l'elenco nominativo (Nome e Cognome essenziale)** di tutti i residenti che hanno prenotato la busta da asporto, per **qualsiasi data e pasto** (sia pranzi al sacco martedì/giovedì, sia qualsiasi altro giorno feriale o festivo).

---

## 1. Causa Radice Individuata
1. **Mancanza di `dettagliPresenti` nei pasti con busta (`calcolaContatoreMensa`)**:
   Quando la data selezionata corrisponde a un pasto con busta di default (come il pranzo di martedì e giovedì), `calcolaContatoreMensa` restituiva l'oggetto statistiche privo della proprietà `dettagliPresenti`. Di conseguenza, `apriModalElencoBuste` riceveva un array indefinito/vuoto (`[]`) e mostrava la schermata di "Nessuna busta prenotata".
2. **Filtraggio rigido e non normalizzato delle prenotazioni**:
   Nei giorni ordinari, il controllo `Boolean(p.busta)` falliva nel caso in cui il foglio Google Sheets o il backend restituissero valori testuali (`"TRUE"`, `"true"`, `"SI"`, `"1"` o `stato_presenza: "busta"`).
3. **Mancato recupero diretto da `appState.mensaBookings`**:
   La funzione della modale si affidava unicamente all'array sintetico calcolato anziché interrogare anche direttamente il registro prenotazioni salvato per quella data, rischiando di perdere record di residenti che avevano salvato la busta.

---

## 2. Modifiche Dettagliate Pianificate

### Modifica 1: Correzione di `calcolaContatoreMensa` per tutti i giorni
- **File**: `app.js`
- **Interventi**:
  1. Nel ramo `isBustaMeal` (martedì/giovedì e pasti con pranzo al sacco), costruire e restituire l'array completo `dettagliPresenti` mappando ciascun residente prenotato con `nome`, `email`, `busta: true`, `ospiti` e `note`.
  2. Utilizzare `isTruthyVal(m.busta)` e considerare anche `m.stato_presenza === "busta"` per riconoscere le prenotazioni busta provenienti da Google Sheets in qualsiasi formato.

### Modifica 2: Riorganizzazione e Blindatura di `apriModalElencoBuste`
- **File**: `app.js`
- **Interventi**:
  1. Eseguire una doppia estrazione convergente:
     - Dalle presenze calcolate del pasto (`statsPasto.dettagliPresenti`).
     - Direttamente dall'archivio `appState.mensaBookings` filtrando per data, pasto e flag busta (`isTruthyVal(busta) || stato_presenza === "busta"`).
  2. Deduplicare per email e risolvere sempre il **Nome e Cognome anagrafico** tramite `trovaNomeUtente()` e la lista `utentiMensa`/`tuttiUtenti`.
  3. Ordinare alfabeticamente per nome.
  4. Mantenere l'interfaccia pulita ed essenziale: solo nome e cognome, con checkbox di spunta per la preparazione della cuoca e copia veloce negli appunti.

### Modifica 3: Verifica e Compilazione
- Eseguire `compile_applet` e `lint_applet` per confermare l'assenza di errori sintattici o di build.
- Verificare la corretta apertura della modale al click su tutti i punti di ingresso del riepilogo cuoca.

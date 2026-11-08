# Visualizzazione Nominativa Buste da Asporto su Click nel Riepilogo Vista Cuoca

Predisposizione nella Vista Cuoca (Registro Cucina) della visualizzazione rapida dei residenti che hanno prenotato la busta da asporto, accessibile cliccando direttamente sui contatori di riepilogo (badge segnalazioni in testata e riassunto porzioni del pasto), mostrando unicamente il nome e cognome essenziale di ciascun richiedente in qualsiasi data dell'anno.

---

### Decisioni Confermate dall'Utente

> [!IMPORTANT]
> - **Punto di Attivazione**: L'elenco si apre **cliccando sul riepilogo** dalla Vista Cuoca (dal badge in testata e dalla voce delle porzioni buste nella scheda del pasto).
> - **Dettagli Visualizzati**: **Solo nome e cognome essenziale** (es. *Mario Rossi*), senza sovraccarico di email, orari tecnici o dati superflui.
> - **Tempistica di Comparsa**: **Sempre**, in qualsiasi data in cui siano state prenotate una o più buste (non limitato al solo martedì/giovedì).

---

## 1. Panoramica & Concetto Chiave

Il personale di cucina, durante la preparazione dei pasti, necessita di una consultazione immediata per confezionare le buste da asporto ed etichettarle nominalmente:
1. **Accesso con Singolo Click**: Cliccando sul contatore `🥪 X Buste` presente sia nel riepilogo delle segnalazioni in alto sia nel sommario delle porzioni di pasto, si apre istantaneamente il pannello dedicato.
2. **Semplicità Estrema**: La lista riporta chiaramente la numerazione progressiva, la casella di spunta di avvenuto confezionamento e il **solo nome e cognome** del residente, con caratteri grandi e leggibili anche a distanza o su tablet da banco cucina.
3. **Copertura Completa**: La funzionalità si attiva dinamicamente per qualsiasi giorno (giorni ordinari di lezioni fuori sede martedì/giovedì, ma anche eventuali richieste straordinarie autorizzate negli altri giorni).

---

## 2. Esperienza Utente & Design Visivo

### Flusso Cuoca (Schermata Registro Cucina)
1. **Segnalazioni in Alto (Banner Alert)**:
   - Se `countBustePranzo > 0`: oltre a eventuali ritardi e ospiti, compare il badge arancione interattivo:
     `[ 🥪 ${countBustePranzo} BUSTE DA PREPARARE 🔍 ]`
   - Il cursore a puntatore e l'evidenziazione visiva invitano al tocco.
2. **Scheda Dettaglio Pranzo / Cena**:
   - Nella riga di conteggio porzioni:
     `🍲 Totale porzioni (${inSala} sala, 🥪 ${buste} buste)`: la dicitura `${buste} buste` è resa cliccabile con feedback visivo.
3. **Pannello Modale Dedicato Buste (`modal-buste-prenotate`)**:
   - **Intestazione**: Titolo con icona `🥪 Buste da Asporto Prenotate` e data italiana chiara (`📅 Martedì 10 Novembre 2026`).
   - **Elenco Essenziale**: Elenco pulito e ordinato:
     `1. ☑ Mario Rossi`
     `2. ☐ Luigi Bianchi`
   - **Interazione al Banco**: Possibilità di spuntare la casella man mano che la busta viene impacchettata o consegnata (con persistenza nello stato locale).
   - **Chiusura Rapida**: Tasto `✕` in alto a destra e pulsante `Chiudi` in calce.

---

## 3. Decisioni di Prodotto & Architettura Tecnica

- **Modalità Dedicata e Diretta**:
  - Creazione di `window.apriModalElencoBuste(dataYMD, tipoPasto)` che prepara ed espone solo i residenti con `p.busta === true`, formattando il nominativo nella forma canonica `Nome Cognome`.
- **Integrazione con Filtri Esistenti**:
  - Il pulsante filtro `🥪 Buste (X)` già presente nella scheda continua a funzionare per filtrare la tabella principale della cuoca.
- **Formattazione Pulita dei Nomi**:
  - Estrazione prioritaria dal campo anagrafico residente (`p.nome`), con fallback pulito da email (es. `mario.rossi@...` -> `Mario Rossi`) con rimozione di punti e corretta capitalizzazione.

---

## 4. Architettura dei Componenti & Flusso Dati

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Vista Cuoca (renderCucinaView)                       │
│  - Banner Segnalazioni Oggi: [ 🥪 3 BUSTE (clicca per elenco) ]       │
│  - Scheda Pranzo: Totale 25 (22 sala, [ 3 buste 🥪 ] )                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Click su riepilogo buste
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             apriModalElencoBuste(dataYMD, tipoPasto)                   │
├────────────────────────────────────────────────────────────────────────┤
│  Filtra lista: residenti con pasto.busta === true                      │
│  Estrae: solo Nome e Cognome formattati                                │
│  Stato spunta: salvato in newman_cucina_spuntati_${dataYMD}            │
├────────────────────────────────────────────────────────────────────────┤
│  Visualizza: Modale ad alto contrasto con lista numerata e spunte      │
└────────────────────────────────────────────────────────────────────────┘
```

### Modifiche Previste ai File

1. **`app.js`**:
   - Aggiunta della funzione `window.apriModalElencoBuste(dataYMD, tipoPasto)` e della chiusura associata.
   - Aggiornamento del banner *Segnalazioni Cucina di Oggi* in `renderCucinaView`: inclusione del badge cliccabile delle buste quando `countBustePranzo > 0` o `countBusteCena > 0`.
   - Rendere cliccabile il conteggio delle buste nel riepilogo porzioni della Scheda Pranzo e Scheda Cena.
   - Creazione o aggancio dinamico del markup modale `modal-buste-prenotate`.

2. **`index.html`**:
   - Predisposizione della struttura DOM per `#modal-buste-prenotate` con backdrop sfumato, card centrata e area scrollabile, garantendo accessibilità e fruibilità mobile/desktop.

---

## 5. Piano di Verifica

1. **Test Click da Banner Segnalazioni**:
   - Selezionare una data con buste (es. martedì o data con buste simulate) e cliccare sul badge delle buste in cima alla Vista Cuoca.
   - Verificare che il modale si apra istantaneamente mostrando solo la lista di nomi e cognomi essenziali.
2. **Test Click da Riepilogo Porzioni Pranzo**:
   - Cliccare sulla scritta `X buste` nella scheda Pranzo e verificare l'apertura del modale.
3. **Test Spunta Confezionamento**:
   - Selezionare la checkbox accanto a un nominativo e verificare che rimanga spuntata.
4. **Test Date Senza Buste vs Con Buste**:
   - Verificare che in una data con 0 buste il badge non appaia e il conteggio mostri 0 senza errori.
5. **Compilazione**:
   - Eseguire `compile_applet` per confermare l'integrità del codice.

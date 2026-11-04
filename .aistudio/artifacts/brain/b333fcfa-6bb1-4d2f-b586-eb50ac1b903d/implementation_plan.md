# Revisione Guida App & Orari Rinnovati: Pranzo Weekend alle 13:00 e Limite Cena alle 14:30

Piano di aggiornamento completo dell'applicazione e della **Guida dell'App**, del **Regolamento Mensa** e delle schermate operative (Mensa, Registro Cuoca e Cruscotto Master) per riflettere fedelmente le nuove disposizioni orarie della Residenza Universitaria Card. Newman.

---

### Quadro Orari Ufficiale e Regole di Prenotazione

> [!IMPORTANT]
> - **Pranzo Feriale (Lunedì – Venerdì)**: Servizio in sala alle ore **14:30**. Termine ultimo prenotazione / disdetta: entro le ore **09:00**.
> - **Pranzo Weekend (Sabato e Domenica)**: Servizio in sala anticipato alle ore **13:00**. Termine ultimo prenotazione / disdetta: entro le ore **09:00**.
> - **Cena (Tutti i giorni, Lunedì – Domenica)**: Servizio in sala alle ore **19:30**. Termine ultimo prenotazione / disdetta: entro le ore **14:30** *(sostituisce qualsiasi riferimento obsoleto a ore 18:30 o 17:00)*.
> - **Pranzo al Sacco (Buste Martedì e Giovedì)**:
>   - Busta del Martedì: prenotazione entro Domenica alle ore 18:00.
>   - Busta del Giovedì: prenotazione entro Martedì alle ore 18:00.
> - **Ambito Operativo**: Aggiornamento integrale della guida integrata (`modal-guida-app`), del regolamento e contatti, del testo rapido condivisibile, della scheda Mensa residenti, della Vista Cucina (Cuoca) e del cruscotto Master.

---

## 1. Panoramica delle Modifiche alla Guida e all'Interfaccia

La discrepanza tra gli orari effettivi di cucina e i testi informativi storici dell'app viene risolta con una riscrittura chiara e coerente di tutte le sezioni di orientamento per i residenti:

1. **Guida Completa dell'App (`#modal-guida-app`)**:
   - Ristrutturazione della sezione `🍽️ Gestione Mensa & Pasti` con tabella/elenco chiaro di orari di servizio ed esatti orari limite di prenotazione/disdetta.
   - Esplicitazione della nuova regola per la cena: **prenotazione entro le 14:30** per permettere al personale di cucina di fare gli acquisti e le preparazioni del pomeriggio.
   - Chiarimento della differenziazione del pranzo: **ore 14:30 Lun–Ven** e **ore 13:00 Sab–Dom**, entrambi con termine di modifica entro le **09:00** del giorno stesso.
   - Conferma delle regole per pasti al sacco, pasti ospiti e piatti tenuti da parte.

2. **Scheda Mensa Residente (`renderMensaView`)**:
   - Titolo dinamico del pranzo a seconda del giorno selezionato: `☀️ Pranzo (14:30)` per Lun–Ven e `☀️ Pranzo (13:00)` per Sab–Dom.
   - Barra riepilogativa dei limiti visibile in testa al calendario:
     *«Limiti prenotazione: Pranzo entro le 09:00 (servizio 14:30 Lun-Ven, 13:00 Sab-Dom) • Cena entro le 14:30 (servizio 19:30)»*.
   - Logica di blocco interattivo aggiornata: `isPranzoBloccato` (blocco alle 09:00) e `isCenaBloccata` (blocco alle 14:30).

3. **Guida Utente Rapida Condivisibile (`GUIDA UTENTE RAPIDA` in `app.js`)**:
   - Aggiornamento del testo preformattato che i residenti possono copiare e incollare nei gruppi chat della residenza, con tutti gli orari rinnovati.

4. **Vista Cuoca & Personale Cucina (`renderCucinaView`)**:
   - Intestazioni del servizio pranzo con orario corretto (13:00 per Sabato e Domenica, 14:30 per Lunedì–Venerdì).
   - Selettori dei pasti e variazioni orari con le opzioni coerenti.

---

## 2. Esperienza Utente & Design Visivo

### Nuova Sezione Guida Mensa (`index.html`)
La guida interna al modale presenterà una scheda leggibile e ordinata:
- **Orari di Servizio in Sala**:
  - Pranzo Lun–Ven: **14:30**
  - Pranzo Sab–Dom: **13:00**
  - Cena tutti i giorni: **19:30**
- **Termini Ultimi di Prenotazione / Modifica**:
  - Pranzo: entro le **09:00** della mattina stessa.
  - Cena: entro le **14:30** del pomeriggio stesso.
  - Busta al sacco Martedì: entro **Domenica ore 18:00**.
  - Busta al sacco Giovedì: entro **Martedì ore 18:00**.
- **Piatti da parte & Ritardi**: Segnalazione per chi arriva dopo l'orario di inizio servizio con specifica dell'orario presunto.

### Stile Visivo e Coerenza
- Aderenza rigorosa alla palette bordeaux/navy della Residenza Newman.
- Nessun badge statico informe o pillola superflua (zero-pill discipline da linee guida di design frontend).
- Tabelle informative e blocchi con bordi puliti, spaziatura confortevole e tipografia ad alto contrasto.

---

## 3. Architettura Tecnica & File Interessati

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Data Selezionata                                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
            [Lunedì – Venerdì]              [Sabato – Domenica]
            Servizio: 14:30                 Servizio: 13:00
            Limite: 09:00                   Limite: 09:00
                     │                             │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     [Tutti i Giorni (Lun – Dom)]
                     Cena Servizio: 19:30
                     Cena Limite: 14:30
                                    │
                                    ▼
┌───────────────────────────────────┴────────────────────────────────────┐
│                    Funzioni Helper Centralizzate                        │
│ - getOrarioServizioPranzo(dataTarget) -> "13:00" | "14:30"             │
│ - getOrariLimitePasti(dataTarget) -> { limitePranzo: "09:00", ... }    │
│ - isPranzoBloccato(dataSelezionata)                                    │
│ - isCenaBloccata(dataSelezionata)                                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ Scheda Mensa  │           │ Vista Cuoca   │           │ Guida App &   │
│ & Limiti Live │           │ & Variazioni  │           │ Regolamento   │
└───────────────┘           └───────────────┘           └───────────────┘
```

### 1. `index.html`
- **`#modal-guida-app`** (sezione `#guida-sec-mensa`): riscrittura completa dei testi con le tabelle di orari rinnovati (servizio feriale 14:30, weekend 13:00, cena 19:30, limiti pranzo 09:00 e cena 14:30).
- **Sezione Residenza / Regolamento / Contatti**: allineamento di qualsiasi menzione oraria pregressa.
- **Select orario pasti modal cuoca (`#cuoca-modal-pasto`)**: verifica opzioni per riflettere 14:30 e 13:00.

### 2. `app.js`
- **`getOrariLimitePasti(dataTarget)`**:
  - Restituisce `orarioServizioPranzo: (isWeekend ? "13:00" : "14:30")`.
  - Imposta formalmente `limitePranzo: cfg.Orario_Limite_Pranzo || "09:00"` sia per feriali che per weekend.
  - Imposta formalmente `limiteCena: cfg.Orario_Limite_Cena || "14:30"` (scadenza inderogabile ore 14:30).
- **`isPranzoBloccato(dataSelezionata)` & `isCenaBloccata(dataSelezionata)`**:
  - Valutazione dell'orario limite (09:00 per pranzo, 14:30 per cena) sul giorno selezionato se coincide con la giornata odierna.
- **`renderMensaView()`**:
  - Titolo dinamico `☀️ Pranzo (${orarioPranzo})`.
  - Aggiornamento della barra riassuntiva "Limiti" con le indicazioni aggiornate.
- **`renderCucinaView()`**:
  - Intestazione del pranzo differenziata: `☀️ Pranzo (13:00)` per sabato e domenica, `☀️ Pranzo (14:30)` dal lunedì al venerdì.
- **`testoGuidaRapida` / `GUIDA UTENTE RAPIDA`**:
  - Aggiornamento del testo copiabile negli appunti con le nuove regole: cena entro le 14:30, pranzo entro le 09:00 (14:30 feriali, 13:00 weekend).

---

## 4. Piano di Verifica

1. **Verifica Guida dell'App**:
   - Aprire il modale della guida ("Guida Completa") dall'icona del punto interrogativo e navigare sulla scheda "Mensa".
   - Verificare che il testo indichi esplicitamente:
     - Pranzo Lun–Ven alle 14:30 (limite ore 09:00).
     - Pranzo Sab–Dom alle 13:00 (limite ore 09:00).
     - Cena tutti i giorni alle 19:30 con **prenotazione entro le 14:30**.
2. **Verifica Scheda Mensa Residente**:
   - Selezionare un giorno feriale (es. Lunedì o Giovedì): visualizzare `☀️ Pranzo (14:30)`.
   - Selezionare Sabato o Domenica: visualizzare `☀️ Pranzo (13:00)`.
   - Verificare il testo della barra limiti in alto.
3. **Verifica Blocco Modifiche**:
   - Verificare che per la cena odierna il blocco intervenga alle ore 14:30 e per il pranzo alle ore 09:00.
4. **Verifica Vista Cuoca**:
   - Navigare nel registro cuoca per una data di sabato o domenica e verificare l'indicazione `☀️ Pranzo (13:00)`.
5. **Verifica Compilazione**:
   - Eseguire `compile_applet` per accertare l'assenza di anomalie di build o sintassi.

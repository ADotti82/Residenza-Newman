# Piano d'Azione: Risoluzione Disinstallazione PWA e Ripristino Permanente della Stellina Amministratore

## Obiettivo
1. **Garantire la presenza continua e non volatile della stellina dell'amministrazione** (`nav-tab-master`) per Don Andrea Dotti e per **qualsiasi utente avente ruolo "Master", "Admin" o deleghe nel foglio presenze**, eliminando i blocchi di codice che ne azzeravano i permessi in locale.
2. **Risolvere la sparizione e disinstallazione automatica dell'app sui dispositivi Android con Google Chrome**, correggendo le anomalie di conformità WebAPK (mancanza di `id`, assenza delle icone obbligatorie 192x192 e 512x512, disallineamento Service Worker e gestione link canonico).

---

## 1. Analisi delle Cause Accertate

### A. Sparizione della Stellina Amministrazione
- **Cancellazione permessi a runtime (`app.js` e `src/core/auth.js`)**: All'avvio dell'app (`checkAuthAndLoad`) e a ogni sync con il backend (`caricaDatiBackend`), il codice verificava se l'utente era presente nell'array locale. Se non trovato e se l'email non conteneva "dotti", il codice eseguiva:
  `appState.user.perm_admin = false; appState.user.perm_mensa = false; appState.user.notif_manutenzione = false; appState.user.notif_spazi = false;`
  sovrascrivendo e azzerando istantaneamente il profilo salvato in `localStorage`.
- **Riconoscimento restrittivo in `haPermessiMaster()`**: La funzione controllava solo 4 booleani specifici (`perm_admin`, `perm_mensa`, `notif_manutenzione`, `notif_spazi`), ignorando `ruolo === "Master"`, `ruolo === "Admin"`, `is_master_spazi` e i valori testuali restituiti dai fogli Google (`"TRUE"`, `"SI"`, `"1"`).

### B. Disinstallazione e Sparizione dell'icona su Android (Chrome WebAPK)
- **Manifest WebAPK non conforme**:
  - Mancanza dell'attributo fondamentale `"id": "/"`: per Chrome su Android, la mancanza dell'id fa sì che ogni variazione di sessione o cache generi un'istanza diversa, provocando la revoca del pacchetto WebAPK sintetico installato.
  - **Mancanza delle icone obbligatorie `192x192` e `512x512`**: Il server WebAPK di Google scarta e rifiuta la generazione dell'APK nativo su Android se mancano i formati 192px e 512px (erano presenti solo 256x256 e 180x180, oltre a una richiesta 404 su favicon.png). Durante i cicli periodici di pulizia di Android, l'icona non convalidata viene rimossa dal launcher.
  - Mancanza di `"scope": "/"` e gestione di `purpose: "any maskable"`.
- **Disallineamento Service Worker**:
  - `public/sw.js` e `sw.js` avevano versioni di cache differenti (`v16` vs `v24`), generando conflitti di refresh e rimozioni forzate della cache su mobile.

---

## 2. Modifiche Dettagliate Pianificate

### Modifica 1: Rimozione azzeramento permessi e blindatura `haPermessiMaster`
- **File**: `app.js` e `src/core/auth.js`
- **Interventi**:
  1. Rimuovere definitivamente il ramo distruttivo `else if (!uEmail.includes("dotti") && !appState.user.perm_admin)`: i permessi assegnati a un utente non devono **mai** essere revocati a cascata da una sincronizzazione parziale.
  2. Aggiornare `haPermessiMaster(u)` e la logica di sessione per riconoscere:
     - `String(u.ruolo || "").toLowerCase().trim() === "master"`
     - `String(u.ruolo || "").toLowerCase().trim() === "admin"`
     - `u.perm_admin` (con supporto a booleani, `"TRUE"`, `"true"`, `"SI"`, `"1"`)
     - `u.perm_mensa`
     - `u.perm_manutenzione` o `u.notif_manutenzione`
     - `u.perm_spazi`, `u.notif_spazi`, o `u.is_master_spazi`
     - Email di Don Andrea Dotti (`donandreadotti@gmail.com`).
  3. Mantenimento e persistenza permanente in `localStorage` dello stato Master/Admin una volta convalidato.

### Modifica 2: Adeguamento Manifest PWA per WebAPK Android
- **File**: `manifest.json`, `public/manifest.json`, `index.html`
- **Interventi**:
  1. Inserire `"id": "/"` e `"scope": "/"`.
  2. Aggiungere le icone standard WebAPK:
     - `icon-192.png` (192x192, `any` e `maskable`)
     - `icon-512.png` (512x512, `any` e `maskable`)
     - Salvataggio delle risorse grafiche in `public/` e root.
  3. Risolvere il collegamento a `favicon.png` o `favicon.ico` eliminando errori 404 nella console.
  4. Impostare `prefer_related_applications: false` e `start_url: "/?source=pwa"`.

### Modifica 3: Allineamento e Stabilità del Service Worker
- **File**: `public/sw.js`, `sw.js`
- **Interventi**:
  1. Unificare `CACHE_VERSION` in un'unica release stabile (es. `newman-v25-stable`).
  2. Configurare `self.skipWaiting()` e `clients.claim()` in modo che gli aggiornamenti avvengano in background senza invalidare il token o la registrazione PWA del sistema Android.

### Modifica 4: Verifica e Compilazione
- Eseguire `compile_applet` e `lint_applet` per accertare che non vi siano regressioni o errori di sintassi.
- Verificare la corretta build di produzione (`npm run build`).

---

## 3. Risultato Atteso
- Qualsiasi utente che possieda il ruolo Master/Admin nel foglio o i permessi speciali vedrà **sempre** comparire la stellina nella barra di navigazione, anche dopo riavvii del telefono, chiusure dell'app o momenti di scarsa connettività.
- L'app su smartphone Android (Chrome) risulterà pienamente conforme agli standard Google WebAPK: l'icona rimarrà saldamente installata nel cassetto delle app e nella Home screen senza disinstallarsi o sparire.

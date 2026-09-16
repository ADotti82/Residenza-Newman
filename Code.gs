/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - BACKEND GOOGLE APPS SCRIPT (Code.gs)
 * ============================================================================
 * Architettura Database su Fogli Google con 5 fogli:
 * 1. "Utenti"              : [Email, Nome, Stato, Perm_Mensa, Perm_Manutenzione, Perm_Spazi, Perm_Admin]
 * 2. "Mensa"               : [ID, Data, Email, Tipo_Pasto, Busta, Ritardo, Note, Timestamp]
 * 3. "Prenotazioni_Spazi"  : [ID, Risorsa, Data, Slot_Orario, Email, Timestamp]
 * 4. "Manutenzione"        : [ID, Timestamp, Email, Descrizione, Link_Foto, Stato]
 * 5. "Configurazione"      : [Chiave, Valore]
 * ============================================================================
 */

// Nomi dei Fogli
const SHEET_UTENTI = "Utenti";
const SHEET_MENSA = "Mensa";
const SHEET_SPAZI = "Prenotazioni_Spazi";
const SHEET_MANUTENZIONE = "Manutenzione";
const SHEET_CONFIG = "Configurazione";
const SHEET_BACHECA = "Bacheca";

/**
 * Funzione di inizializzazione automatica del database.
 * Esegui questa funzione una sola volta dall'editor di Apps Script per creare
 * tutti i fogli, le intestazioni e una configurazione predefinita.
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Foglio Utenti
  let sUtenti = ss.getSheetByName(SHEET_UTENTI);
  if (!sUtenti) {
    sUtenti = ss.insertSheet(SHEET_UTENTI);
    sUtenti.appendRow([
      "Email",
      "Nome",
      "Stato",
      "Perm_Mensa",
      "Perm_Manutenzione",
      "Perm_Spazi",
      "Perm_Admin"
    ]);
    // Aggiungi utente di default con pieni permessi
    sUtenti.appendRow([
      Session.getActiveUser().getEmail() || "admin@newman.it",
      "Direzione Residenza",
      "Approvato",
      true,
      true,
      true,
      true
    ]);
  }

  // 2. Foglio Mensa
  let sMensa = ss.getSheetByName(SHEET_MENSA);
  if (!sMensa) {
    sMensa = ss.insertSheet(SHEET_MENSA);
    sMensa.appendRow([
      "ID",
      "Data",
      "Email",
      "Tipo_Pasto",
      "Busta",
      "Ritardo",
      "Note",
      "Timestamp"
    ]);
  }

  // 3. Foglio Prenotazioni_Spazi (Chiesa e Sala TV a slot di 30 min)
  let sSpazi = ss.getSheetByName(SHEET_SPAZI);
  if (!sSpazi) {
    sSpazi = ss.insertSheet(SHEET_SPAZI);
    sSpazi.appendRow([
      "ID",
      "Risorsa",
      "Data",
      "Slot_Orario",
      "Email",
      "Timestamp"
    ]);
  }

  // 4. Foglio Manutenzione
  let sManutenzione = ss.getSheetByName(SHEET_MANUTENZIONE);
  if (!sManutenzione) {
    sManutenzione = ss.insertSheet(SHEET_MANUTENZIONE);
    sManutenzione.appendRow([
      "ID",
      "Timestamp",
      "Email",
      "Descrizione",
      "Link_Foto",
      "Stato"
    ]);
  }

  // 5. Foglio Configurazione
  let sConfig = ss.getSheetByName(SHEET_CONFIG);
  if (!sConfig) {
    sConfig = ss.insertSheet(SHEET_CONFIG);
    sConfig.appendRow(["Chiave", "Valore"]);
    sConfig.appendRow(["Data_Variazione_Menu", ""]);
    sConfig.appendRow(["Testo_Variazione", ""]);
    sConfig.appendRow(["Pasto_Variazione", "entrambi"]);
    sConfig.appendRow([
      "Info_Regolamento",
      "Benvenuti alla Residenza Card. Newman.\n• Rispetto degli orari di silenzio dalle 23:00 alle 07:30 del mattino in tutti i corridoi e le aree comuni.\n• Orari comunitari: S. Messa ore 07:00, Pranzo ore 14:30, Cena ore 19:30.\n• Prenotazione pasti: Pranzo entro le 13:30, Cena entro le 18:30.\n• Spazi Comuni: La Chiesa e la Sala TV sono riservabili in autonomia a slot di 30 minuti. Si raccomanda di lasciare gli ambienti in perfetto ordine dopo l'uso."
    ]);
    sConfig.appendRow([
      "Info_Contatti",
      "Portineria e Accoglienza: Int. 101 (Tel: +39 06 12345678)\nDirezione: int. 102 - direzione@residenzanewman.org\nEmergenze Notturne: +39 333 9876543\nResponsabile Mensa: mensa@residenzanewman.org\nAssistenza Tecnica: manutenzione@residenzanewman.org"
    ]);
  }

  // 6. Foglio Bacheca (Compleanni, Anniversari, Eventi, Avvisi)
  let sBacheca = ss.getSheetByName(SHEET_BACHECA);
  if (!sBacheca) {
    sBacheca = ss.insertSheet(SHEET_BACHECA);
    sBacheca.appendRow([
      "ID",
      "Data",
      "Tipo",
      "Titolo",
      "Descrizione",
      "Autore",
      "Priorita",
      "Timestamp"
    ]);
    sBacheca.appendRow([
      "B_001",
      "2026-09-16",
      "compleanno",
      "Compleanno Don Andrea Dotti",
      "Tanti auguri a Don Andrea per il suo compleanno! Ci uniamo nella preghiera e festeggeremo insieme a cena.",
      "Direzione",
      "alta",
      new Date().toISOString()
    ]);
    sBacheca.appendRow([
      "B_002",
      "2026-09-16",
      "avviso",
      "Memoria Santi Cornelio e Cipriano",
      "Oggi memoria liturgica dei Santi Cornelio, papa, e Cipriano, vescovo, martiri. S. Messa in cappella ore 07:00.",
      "Liturgia",
      "normale",
      new Date().toISOString()
    ]);
    sBacheca.appendRow([
      "B_003",
      "2026-09-18",
      "evento",
      "Incontro Comunitario di Inizio Anno",
      "Venerdì sera dopo cena ritrovo in Sala TV per l'incontro fraterno e la presentazione delle attività della Residenza.",
      "Direzione",
      "alta",
      new Date().toISOString()
    ]);
  }

  return "Setup completato con successo!";
}

/**
 * Helper per generare ID univoci
 */
function generaId(prefisso) {
  return (prefisso || "ID") + "_" + Utilities.formatDate(new Date(), "GMT+1", "yyyyMMdd_HHmmss") + "_" + Math.floor(Math.random() * 1000);
}

/**
 * Helper per formattare la risposta JSON e risolvere il CORS
 */
function rispostaJSON(dati) {
  return ContentService.createTextOutput(JSON.stringify(dati))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handler GET: utile per verificare lo stato dell'API o recuperare info pubbliche
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
    if (action === "ping") {
      return rispostaJSON({ status: "ok", timestamp: new Date().toISOString(), app: "Residenza Card. Newman API" });
    }
    if (action === "getInfoData") {
      return getInfoData();
    }
    return rispostaJSON({ status: "online", message: "API attiva. Utilizza richieste POST per le operazioni." });
  } catch (err) {
    return rispostaJSON({ error: err.toString() });
  }
}

/**
 * Handler POST principale: elabora tutte le azioni dell'applicazione
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (errJson) {
        // Fallback se inviato con form-urlencoded o query param
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;

    switch (action) {
      case "login":
        return gestisciLogin(payload.email);

      case "registraUtente":
        return gestisciRegistrazione(payload.email, payload.nome);

      case "approvaUtente":
        return gestisciApprovazione(payload);

      case "prenotaMensa":
        return gestisciPrenotazioneMensa(payload);

      case "cancellaPrenotazioneMensa":
        return gestisciCancellaPrenotazioneMensa(payload);

      case "prenotaSpazio":
        return gestisciPrenotazioneSpazio(payload);

      case "cancellaPrenotazioneSpazio":
        return gestisciCancellaPrenotazioneSpazio(payload);

      case "getBacheca":
        return gestisciGetBacheca();

      case "salvaAvvisoBacheca":
        return gestisciSalvaAvvisoBacheca(payload);

      case "eliminaAvvisoBacheca":
        return gestisciEliminaAvvisoBacheca(payload);

      case "caricaGuasto":
        return gestisciCaricaGuasto(payload);

      case "risolviGuasto":
        return gestisciRisolviGuasto(payload.id);

      case "getMasterData":
        return getMasterData(payload.email);

      case "getInfoData":
        return getInfoData();

      case "aggiornaConfig":
        return gestisciAggiornaConfig(payload);

      default:
        return rispostaJSON({ success: false, error: "Azione non riconosciuta: " + action });
    }
  } catch (error) {
    return rispostaJSON({ success: false, error: error.toString() });
  }
}

// ----------------------------------------------------------------------------
// GESTIONE UTENTI
// ----------------------------------------------------------------------------

function gestisciLogin(email) {
  if (!email) return rispostaJSON({ success: false, error: "Email obbligatoria" });
  email = email.trim().toLowerCase();

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
  const data = sheet.getDataRange().getValues();

  // data[0] sono le intestazioni
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[0]).trim().toLowerCase() === email) {
      return rispostaJSON({
        success: true,
        utente: {
          email: row[0],
          nome: row[1],
          stato: row[2], // "In Attesa" | "Approvato"
          perm_mensa: Boolean(row[3]),
          perm_manutenzione: Boolean(row[4]),
          perm_spazi: Boolean(row[5]),
          perm_admin: Boolean(row[6])
        }
      });
    }
  }

  // Utente non trovato nel foglio
  return rispostaJSON({
    success: false,
    notFound: true,
    message: "Utente non presente. Richiesta registrazione."
  });
}

function gestisciRegistrazione(email, nome) {
  if (!email || !nome) {
    return rispostaJSON({ success: false, error: "Email e Nome obbligatori" });
  }
  email = email.trim().toLowerCase();
  nome = nome.trim();

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
  const data = sheet.getDataRange().getValues();

  // Verifica se esiste già
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === email) {
      return rispostaJSON({
        success: false,
        error: "Questa email è già registrata con stato: " + data[i][2]
      });
    }
  }

  // Inserimento nuovo utente con stato "In Attesa"
  sheet.appendRow([
    email,
    nome,
    "In Attesa",
    false, // Perm_Mensa
    false, // Perm_Manutenzione
    false, // Perm_Spazi
    false  // Perm_Admin
  ]);

  return rispostaJSON({
    success: true,
    status: "In Attesa",
    message: "Registrazione inviata con successo. Attendi l'approvazione del Direttore."
  });
}

function gestisciApprovazione(payload) {
  const emailTarget = String(payload.emailTarget || "").trim().toLowerCase();
  if (!emailTarget) return rispostaJSON({ success: false, error: "Email target mancante" });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === emailTarget) {
      // Imposta Stato "Approvato"
      sheet.getRange(i + 1, 3).setValue("Approvato");

      // Aggiorna permessi se forniti
      if (payload.perm_mensa !== undefined) sheet.getRange(i + 1, 4).setValue(Boolean(payload.perm_mensa));
      if (payload.perm_manutenzione !== undefined) sheet.getRange(i + 1, 5).setValue(Boolean(payload.perm_manutenzione));
      if (payload.perm_spazi !== undefined) sheet.getRange(i + 1, 6).setValue(Boolean(payload.perm_spazi));
      if (payload.perm_admin !== undefined) sheet.getRange(i + 1, 7).setValue(Boolean(payload.perm_admin));

      return rispostaJSON({ success: true, message: "Utente approvato con successo" });
    }
  }

  return rispostaJSON({ success: false, error: "Utente non trovato" });
}

// ----------------------------------------------------------------------------
// GESTIONE MENSA
// ----------------------------------------------------------------------------

function gestisciPrenotazioneMensa(payload) {
  const { data, email, tipo_pasto, busta, ritardo, note, bypassTimeLock } = payload;
  if (!data || !email || !tipo_pasto) {
    return rispostaJSON({ success: false, error: "Campi obbligatori mancanti (data, email, tipo_pasto)" });
  }

  // Verifica orario limite (1 ora prima del pasto: pranzo 14:30 blocco 13:30, cena 19:30 blocco 18:30)
  if (!bypassTimeLock) {
    const adesso = new Date();
    const targetDate = new Date(String(data).split("T")[0] + "T00:00:00");
    const oggiDate = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate());

    if (targetDate < oggiDate) {
      return rispostaJSON({ success: false, error: "Non è possibile modificare presenze per date passate." });
    }

    if (targetDate.getTime() === oggiDate.getTime()) {
      const ore = adesso.getHours();
      const minuti = adesso.getMinutes();
      const pastoNorm = String(tipo_pasto).trim().toLowerCase();

      if (pastoNorm === "pranzo" && ((ore > 13) || (ore === 13 && minuti >= 30))) {
        return rispostaJSON({ success: false, error: "Prenotazioni per il pranzo chiuse (limite ore 13:30, 1h prima del pranzo)." });
      }
      if (pastoNorm === "cena" && ((ore > 18) || (ore === 18 && minuti >= 30))) {
        return rispostaJSON({ success: false, error: "Prenotazioni per la cena chiuse (limite ore 18:30, 1h prima della cena)." });
      }
    }
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MENSA);
  const rows = sheet.getDataRange().getValues();

  // Verifica se esiste già una prenotazione per questo utente, data e tipo_pasto
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowData = String(row[1]).split("T")[0];
    const targetData = String(data).split("T")[0];

    if (rowData === targetData &&
        String(row[2]).trim().toLowerCase() === String(email).trim().toLowerCase() &&
        String(row[3]).trim().toLowerCase() === String(tipo_pasto).trim().toLowerCase()) {
      
      // Aggiorna prenotazione esistente
      sheet.getRange(i + 1, 5).setValue(Boolean(busta));
      sheet.getRange(i + 1, 6).setValue(Boolean(ritardo));
      sheet.getRange(i + 1, 7).setValue(note || "");
      sheet.getRange(i + 1, 8).setValue(new Date().toISOString());

      return rispostaJSON({ success: true, id: row[0], aggiornato: true });
    }
  }

  // Nuova prenotazione
  const id = generaId("MENSA");
  sheet.appendRow([
    id,
    data,
    email.trim().toLowerCase(),
    tipo_pasto,
    Boolean(busta),
    Boolean(ritardo),
    note || "",
    new Date().toISOString()
  ]);

  return rispostaJSON({ success: true, id: id });
}

function gestisciCancellaPrenotazioneMensa(payload) {
  const { data, email, tipo_pasto, bypassTimeLock } = payload;
  if (!data || !email || !tipo_pasto) {
    return rispostaJSON({ success: false, error: "Parametri mancanti per cancellazione presenza" });
  }

  // Verifica orario limite di cancellazione (1 ora prima: pranzo 14:30 blocco 13:30, cena 19:30 blocco 18:30)
  if (!bypassTimeLock) {
    const adesso = new Date();
    const targetDate = new Date(String(data).split("T")[0] + "T00:00:00");
    const oggiDate = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate());

    if (targetDate < oggiDate) {
      return rispostaJSON({ success: false, error: "Non è possibile cancellare presenze per date passate." });
    }

    if (targetDate.getTime() === oggiDate.getTime()) {
      const ore = adesso.getHours();
      const minuti = adesso.getMinutes();
      const pastoNorm = String(tipo_pasto).trim().toLowerCase();

      if (pastoNorm === "pranzo" && ((ore > 13) || (ore === 13 && minuti >= 30))) {
        return rispostaJSON({ success: false, error: "Modifiche per il pranzo chiuse (limite ore 13:30, 1h prima del pasto)." });
      }
      if (pastoNorm === "cena" && ((ore > 18) || (ore === 18 && minuti >= 30))) {
        return rispostaJSON({ success: false, error: "Modifiche per la cena chiuse (limite ore 18:30, 1h prima del pasto)." });
      }
    }
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MENSA);
  if (!sheet) return rispostaJSON({ success: true });

  const rows = sheet.getDataRange().getValues();
  const targetData = String(data).split("T")[0];
  const targetEmail = String(email).trim().toLowerCase();
  const targetTipo = String(tipo_pasto).trim().toLowerCase();

  for (let i = rows.length - 1; i >= 1; i--) {
    const row = rows[i];
    const rowData = String(row[1]).split("T")[0];
    const rowEmail = String(row[2]).trim().toLowerCase();
    const rowTipo = String(row[3]).trim().toLowerCase();

    if (rowData === targetData && rowEmail === targetEmail && rowTipo === targetTipo) {
      sheet.deleteRow(i + 1);
      return rispostaJSON({ success: true, message: "Presenza rimossa con successo" });
    }
  }

  return rispostaJSON({ success: true, message: "Nessuna presenza da cancellare trovata" });
}

// ----------------------------------------------------------------------------
// GESTIONE SPAZI
// ----------------------------------------------------------------------------

function gestisciPrenotazioneSpazio(payload) {
  const { risorsa, data, slot_orario, email } = payload;
  if (!risorsa || !data || !slot_orario || !email) {
    return rispostaJSON({ success: false, error: "Parametri mancanti per prenotazione spazio" });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SPAZI);
  const rows = sheet.getDataRange().getValues();

  const targetDataStr = String(data).split("T")[0];

  // Controllo sovrapposizione slot
  for (let i = 1; i < rows.length; i++) {
    const rRisorsa = String(rows[i][1]);
    const rDataStr = String(rows[i][2]).split("T")[0];
    const rSlot = String(rows[i][3]);

    if (rRisorsa === risorsa && rDataStr === targetDataStr && rSlot === slot_orario) {
      return rispostaJSON({
        success: false,
        error: "Questo slot orario è già stato prenotato da un altro residente."
      });
    }
  }

  const id = generaId("SPAZIO");
  sheet.appendRow([
    id,
    risorsa,
    targetDataStr,
    slot_orario,
    email.trim().toLowerCase(),
    new Date().toISOString()
  ]);

  return rispostaJSON({ success: true, id: id });
}

function gestisciCancellaPrenotazioneSpazio(payload) {
  const { id, risorsa, data, slot_orario, email } = payload;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SPAZI);
  if (!sheet) return rispostaJSON({ success: true });

  const rows = sheet.getDataRange().getValues();
  const targetEmail = String(email || "").trim().toLowerCase();
  const targetData = String(data || "").split("T")[0];

  for (let i = rows.length - 1; i >= 1; i--) {
    const row = rows[i];
    const rowId = String(row[0]);
    const rowRisorsa = String(row[1]);
    const rowData = String(row[2]).split("T")[0];
    const rowSlot = String(row[3]);
    const rowEmail = String(row[4]).trim().toLowerCase();

    const matchId = id && (rowId === String(id));
    const matchDetails = (!id) && (rowRisorsa === risorsa && rowData === targetData && rowSlot === slot_orario);

    if (matchId || matchDetails) {
      sheet.deleteRow(i + 1);
      return rispostaJSON({ success: true, message: "Prenotazione spazio cancellata" });
    }
  }

  return rispostaJSON({ success: true, message: "Nessuna prenotazione trovata" });
}

// ----------------------------------------------------------------------------
// GESTIONE MANUTENZIONE & UPLOAD SU GOOGLE DRIVE
// ----------------------------------------------------------------------------

function gestisciCaricaGuasto(payload) {
  const { email, descrizione, fotoBase64, mimeType } = payload;
  if (!email || !descrizione) {
    return rispostaJSON({ success: false, error: "Email e descrizione obbligatorie" });
  }

  let linkFoto = "";

  // Se c'è un'immagine Base64 (compressa dal canvas del frontend)
  if (fotoBase64 && fotoBase64.length > 50) {
    try {
      // Rimuovi eventuale intestazione data:image/jpeg;base64,
      let cleanedBase64 = fotoBase64;
      if (cleanedBase64.indexOf("base64,") !== -1) {
        cleanedBase64 = cleanedBase64.split("base64,")[1];
      }

      const decodedBytes = Utilities.base64Decode(cleanedBase64);
      const mType = mimeType || "image/jpeg";
      const fileName = "Guasto_" + Utilities.formatDate(new Date(), "GMT+1", "yyyyMMdd_HHmmss") + ".jpg";
      const blob = Utilities.newBlob(decodedBytes, mType, fileName);

      // Cerca o crea la cartella su Google Drive
      let folder;
      const folderName = "Newman_Manutenzione_Foto";
      const folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }

      const file = folder.createFile(blob);
      // Rendi accessibile a chiunque abbia il link
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      linkFoto = file.getUrl();
    } catch (errUpload) {
      linkFoto = "Errore upload Drive: " + errUpload.toString();
    }
  }

  const id = generaId("GUASTO");
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MANUTENZIONE);
  sheet.appendRow([
    id,
    new Date().toISOString(),
    email.trim().toLowerCase(),
    descrizione,
    linkFoto,
    "Da fare"
  ]);

  return rispostaJSON({
    success: true,
    id: id,
    linkFoto: linkFoto,
    message: "Guasto segnalato con successo"
  });
}

function gestisciRisolviGuasto(id) {
  if (!id) return rispostaJSON({ success: false, error: "ID guasto mancante" });
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MANUTENZIONE);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 6).setValue("Risolto");
      return rispostaJSON({ success: true, message: "Guasto contrassegnato come risolto" });
    }
  }

  return rispostaJSON({ success: false, error: "Guasto non trovato" });
}

// ----------------------------------------------------------------------------
// GET CONFIGURAZIONE & BACHECA
// ----------------------------------------------------------------------------

function getInfoData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sConfig = ss.getSheetByName(SHEET_CONFIG);
  const config = {};

  if (sConfig) {
    const rows = sConfig.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      config[rows[i][0]] = rows[i][1];
    }
  }

  // Recupera anche le prenotazioni spazi per mostrare gli slot occupati
  const sSpazi = ss.getSheetByName(SHEET_SPAZI);
  const prenotazioniSpazi = [];
  if (sSpazi) {
    const rows = sSpazi.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      prenotazioniSpazi.push({
        id: rows[i][0],
        risorsa: rows[i][1],
        data: rows[i][2],
        slot_orario: rows[i][3],
        email: rows[i][4]
      });
    }
  }

  // Recupera prenotazioni mensa per visualizzare la propria presenza
  const sMensa = ss.getSheetByName(SHEET_MENSA);
  const prenotazioniMensa = [];
  if (sMensa) {
    const rowsM = sMensa.getDataRange().getValues();
    for (let i = 1; i < rowsM.length; i++) {
      prenotazioniMensa.push({
        id: rowsM[i][0],
        data: rowsM[i][1],
        email: rowsM[i][2],
        tipo_pasto: rowsM[i][3],
        busta: Boolean(rowsM[i][4]),
        ritardo: Boolean(rowsM[i][5]),
        note: rowsM[i][6] || ""
      });
    }
  }

  // 4. Recupera avvisi Bacheca
  const sBacheca = ss.getSheetByName(SHEET_BACHECA);
  const bacheca = [];
  if (sBacheca) {
    const rowsB = sBacheca.getDataRange().getValues();
    for (let i = 1; i < rowsB.length; i++) {
      if (rowsB[i][0] || rowsB[i][3]) {
        bacheca.push({
          id: String(rowsB[i][0] || ""),
          data: rowsB[i][1] ? String(rowsB[i][1]).split("T")[0] : "",
          tipo: String(rowsB[i][2] || "avviso"),
          titolo: String(rowsB[i][3] || ""),
          descrizione: String(rowsB[i][4] || ""),
          autore: String(rowsB[i][5] || "Direzione"),
          priorita: String(rowsB[i][6] || "normale"),
          timestamp: String(rowsB[i][7] || "")
        });
      }
    }
  }

  return rispostaJSON({
    success: true,
    config: {
      Data_Variazione_Menu: config["Data_Variazione_Menu"] || "",
      Testo_Variazione: config["Testo_Variazione"] || "",
      Pasto_Variazione: config["Pasto_Variazione"] || "entrambi",
      Variazioni_Per_Data: config["Variazioni_Per_Data"] || "",
      Info_Regolamento: config["Info_Regolamento"] || "Regolamento in fase di aggiornamento.",
      Info_Contatti: config["Info_Contatti"] || "Contatti non specificati."
    },
    prenotazioniSpazi: prenotazioniSpazi,
    prenotazioniMensa: prenotazioniMensa,
    bacheca: bacheca
  });
}

// ----------------------------------------------------------------------------
// PANNELLO MASTER
// ----------------------------------------------------------------------------

function getMasterData(emailRichiedente) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Utenti
  const sUtenti = ss.getSheetByName(SHEET_UTENTI);
  const utenti = [];
  const utentiInAttesa = [];
  if (sUtenti) {
    const rows = sUtenti.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const u = {
        email: rows[i][0],
        nome: rows[i][1],
        stato: rows[i][2],
        perm_mensa: Boolean(rows[i][3]),
        perm_manutenzione: Boolean(rows[i][4]),
        perm_spazi: Boolean(rows[i][5]),
        perm_admin: Boolean(rows[i][6])
      };
      utenti.push(u);
      if (u.stato === "In Attesa") utentiInAttesa.push(u);
    }
  }

  // 2. Prenotazioni Mensa
  const sMensa = ss.getSheetByName(SHEET_MENSA);
  const mensa = [];
  if (sMensa) {
    const rows = sMensa.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      mensa.push({
        id: rows[i][0],
        data: rows[i][1],
        email: rows[i][2],
        tipo_pasto: rows[i][3],
        busta: Boolean(rows[i][4]),
        ritardo: Boolean(rows[i][5]),
        note: rows[i][6],
        timestamp: rows[i][7]
      });
    }
  }

  // 3. Guasti Manutenzione
  const sManutenzione = ss.getSheetByName(SHEET_MANUTENZIONE);
  const guasti = [];
  if (sManutenzione) {
    const rows = sManutenzione.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      guasti.push({
        id: rows[i][0],
        timestamp: rows[i][1],
        email: rows[i][2],
        descrizione: rows[i][3],
        link_foto: rows[i][4],
        stato: rows[i][5]
      });
    }
  }

  // 4. Configurazione
  const sConfig = ss.getSheetByName(SHEET_CONFIG);
  const config = {};
  if (sConfig) {
    const rows = sConfig.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      config[rows[i][0]] = rows[i][1];
    }
  }

  return rispostaJSON({
    success: true,
    utentiInAttesa: utentiInAttesa,
    tuttiUtenti: utenti,
    mensa: mensa,
    guasti: guasti,
    config: config
  });
}

function gestisciAggiornaConfig(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_CONFIG);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Configurazione non trovato" });

  const rows = sheet.getDataRange().getValues();

  function aggiornaOInserisci(chiave, valore) {
    if (valore === undefined) return;
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === chiave) {
        sheet.getRange(i + 1, 2).setValue(valore);
        return;
      }
    }
    sheet.appendRow([chiave, valore]);
  }

  if (payload.Info_Regolamento !== undefined) aggiornaOInserisci("Info_Regolamento", payload.Info_Regolamento);
  if (payload.Info_Contatti !== undefined) aggiornaOInserisci("Info_Contatti", payload.Info_Contatti);
  if (payload.Data_Variazione_Menu !== undefined) aggiornaOInserisci("Data_Variazione_Menu", payload.Data_Variazione_Menu);
  if (payload.Testo_Variazione !== undefined) aggiornaOInserisci("Testo_Variazione", payload.Testo_Variazione);
  if (payload.Pasto_Variazione !== undefined) aggiornaOInserisci("Pasto_Variazione", payload.Pasto_Variazione);
  if (payload.Variazioni_Per_Data !== undefined) aggiornaOInserisci("Variazioni_Per_Data", payload.Variazioni_Per_Data);

  return rispostaJSON({ success: true, message: "Configurazione aggiornata con successo" });
}

// ----------------------------------------------------------------------------
// GESTIONE BACHECA (Compleanni, Anniversari, Eventi, Avvisi)
// ----------------------------------------------------------------------------

function gestisciGetBacheca() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_BACHECA);
  const items = [];
  if (sheet) {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] || rows[i][3]) {
        items.push({
          id: String(rows[i][0] || ""),
          data: rows[i][1] ? String(rows[i][1]).split("T")[0] : "",
          tipo: String(rows[i][2] || "avviso"),
          titolo: String(rows[i][3] || ""),
          descrizione: String(rows[i][4] || ""),
          autore: String(rows[i][5] || "Direzione"),
          priorita: String(rows[i][6] || "normale"),
          timestamp: String(rows[i][7] || "")
        });
      }
    }
  }
  return rispostaJSON({ success: true, bacheca: items });
}

function gestisciSalvaAvvisoBacheca(payload) {
  const { id, data, tipo, titolo, descrizione, autore, priorita } = payload;
  if (!titolo) {
    return rispostaJSON({ success: false, error: "Il titolo dell'avviso è obbligatorio" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_BACHECA);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_BACHECA);
    sheet.appendRow(["ID", "Data", "Tipo", "Titolo", "Descrizione", "Autore", "Priorita", "Timestamp"]);
  }

  const rows = sheet.getDataRange().getValues();
  const idTarget = id || generaId("BACH");
  const dataVal = data ? String(data).split("T")[0] : Utilities.formatDate(new Date(), "GMT+1", "yyyy-MM-dd");
  const tipoVal = tipo || "avviso";
  const autoreVal = autore || "Direzione";
  const prioritaVal = priorita || "normale";
  const descVal = descrizione || "";

  // Se id esiste, aggiorna riga
  if (id) {
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(id)) {
        sheet.getRange(i + 1, 2, 1, 6).setValues([[
          dataVal,
          tipoVal,
          titolo,
          descVal,
          autoreVal,
          prioritaVal
        ]]);
        return rispostaJSON({ success: true, id: idTarget, message: "Avviso aggiornato" });
      }
    }
  }

  // Altrimenti inserisci nuova riga
  sheet.appendRow([
    idTarget,
    dataVal,
    tipoVal,
    titolo,
    descVal,
    autoreVal,
    prioritaVal,
    new Date().toISOString()
  ]);

  return rispostaJSON({ success: true, id: idTarget, message: "Avviso inserito in bacheca" });
}

function gestisciEliminaAvvisoBacheca(payload) {
  const { id } = payload;
  if (!id) return rispostaJSON({ success: false, error: "ID avviso obbligatorio" });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_BACHECA);
  if (!sheet) return rispostaJSON({ success: true });

  const rows = sheet.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return rispostaJSON({ success: true, message: "Avviso rimosso con successo" });
    }
  }

  return rispostaJSON({ success: false, error: "Avviso non trovato" });
}

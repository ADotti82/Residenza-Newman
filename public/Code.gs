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
const SHEET_MENU = "Menu_Base";
const SHEET_ACCOGLIENZA = "Accoglienza";

/**
 * Funzione di inizializzazione automatica del database.
 * Esegui questa funzione una sola volta dall'editor di Apps Script per creare
 * tutti i fogli, le intestazioni e una configurazione predefinita.
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Foglio Utenti (con colonna Is_Utente_Mensa distinta da Perm_Mensa)
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
      "Perm_Admin",
      "Password",
      "Notif_Manutenzione",
      "Notif_Spazi",
      "Is_Utente_Mensa"
    ]);
    // Aggiungi utente di default con pieni permessi
    sUtenti.appendRow([
      Session.getActiveUser().getEmail() || "admin@newman.it",
      "Direzione Residenza",
      "Approvato",
      true,
      true,
      true,
      true,
      "newman2026",
      true,
      true,
      true
    ]);
  } else {
    // Se le colonne non sono ancora presenti, aggiungile all'intestazione
    const lastCol = sUtenti.getLastColumn();
    if (lastCol < 8) {
      sUtenti.getRange(1, 8).setValue("Password");
    }
    if (lastCol < 9) {
      sUtenti.getRange(1, 9).setValue("Notif_Manutenzione");
    }
    if (lastCol < 10) {
      sUtenti.getRange(1, 10).setValue("Notif_Spazi");
    }
    if (lastCol < 11) {
      sUtenti.getRange(1, 11).setValue("Is_Utente_Mensa");
    }
  }

  // 2. Foglio Mensa (con colonne Ospiti e Stato_Presenza)
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
      "Timestamp",
      "Ospiti",
      "Stato_Presenza"
    ]);
  } else {
    const lastColM = sMensa.getLastColumn();
    if (lastColM < 9) {
      sMensa.getRange(1, 9).setValue("Ospiti");
    }
    if (lastColM < 10) {
      sMensa.getRange(1, 10).setValue("Stato_Presenza");
    }
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
      "Timestamp",
      "Stato",
      "Approvato_Da"
    ]);
  }

  // 4. Foglio Manutenzione & Servizi Residenza
  let sManutenzione = ss.getSheetByName(SHEET_MANUTENZIONE);
  if (!sManutenzione) {
    sManutenzione = ss.insertSheet(SHEET_MANUTENZIONE);
    sManutenzione.appendRow([
      "ID",
      "Timestamp",
      "Email",
      "Descrizione",
      "Link_Foto",
      "Stato",
      "Categoria",
      "Luogo",
      "Priorita",
      "Note_Intervento",
      "Tecnico",
      "Data_Chiusura"
    ]);
  }

  // 5. Foglio Configurazione
  let sConfig = ss.getSheetByName(SHEET_CONFIG);
  if (!sConfig) {
    sConfig = ss.insertSheet(SHEET_CONFIG);
    sConfig.appendRow(["Chiave", "Valore"]);
    sConfig.appendRow(["Orario_Limite_Pranzo", "09:00"]);
    sConfig.appendRow(["Orario_Limite_Cena", "14:30"]);
    sConfig.appendRow(["Orario_Limite_Busta", "14:00"]);
    sConfig.appendRow(["Email_Notifiche_Master", "donandreadotti@gmail.com"]);
    sConfig.appendRow(["Data_Variazione_Menu", ""]);
    sConfig.appendRow(["Testo_Variazione", ""]);
    sConfig.appendRow(["Pasto_Variazione", "entrambi"]);
    sConfig.appendRow(["Nome_Camera_1", "Camera 1 - Newman"]);
    sConfig.appendRow(["Nome_Camera_2", "Camera 2 - San Filippo Neri"]);
    sConfig.appendRow(["Nome_Camera_3", "Camera 3 - San Tommaso d'Aquino"]);
    sConfig.appendRow(["Max_Ospiti_Mensa", "5"]);
    sConfig.appendRow([
      "Info_Regolamento",
      "Benvenuti alla Residenza Card. Newman.\n• Rispetto degli orari di silenzio dalle 23:00 alle 07:30 del mattino in tutti i corridoi e le aree comuni.\n• Orari comunitari: S. Messa ore 07:00, Pranzo ore 14:30, Cena ore 19:30.\n• Prenotazione pasti: Pranzo entro le 09:00 del mattino, Cena entro le 14:30. Per martedì e giovedì la busta va prenotata entro le 14:00 del giorno prima.\n• Spazi Comuni: Le richieste per Chiesa e Sala TV a slot di 30 minuti sono soggette ad approvazione del Master. Si raccomanda di lasciare gli ambienti in perfetto ordine dopo l'uso."
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

  // 7. Foglio Menu_Base (Menu ciclico 14 giorni modificabile nel Google Foglio)
  let sMenu = ss.getSheetByName(SHEET_MENU);
  if (!sMenu) {
    sMenu = ss.insertSheet(SHEET_MENU);
    sMenu.appendRow([
      "Settimana", "Giorno", "Pasto", "Primo", "Secondo", "Contorno1", "Contorno2", "Dessert", "OpzioneBusta"
    ]);
    const righeMenuDefault = [
      // Settimana 1
      ["settimana1", "lunedi", "pranzo", "Paella di carne alla Valenciana", "Saltimbocca alla Romana", "Insalata di cetrioli, pomodori e cipolla", "Spinaci", "Frutta fresca", false],
      ["settimana1", "lunedi", "cena", "Spaghetti alle vongole", "Scaloppine di Tacchino", "Fagioli", "Insalata mista", "Frutta fresca", false],
      ["settimana1", "martedi", "pranzo", "Classici di busta", "Classici di busta", "Classici di busta", "Classici di busta", "Frutta / Snack", true],
      ["settimana1", "martedi", "cena", "Riso basmati con pollo al curry", "Pollo al curry e verdure", "Zucchine trifolate", "Carote julienne", "Dessert dello chef", false],
      ["settimana1", "mercoledi", "pranzo", "Gnocchi alla Sorrentina", "Cotoletta di Maiale alla milanese", "Patate al forno dorate", "Piselli", "Frutta fresca", false],
      ["settimana1", "mercoledi", "cena", "Vellutata di zucca con crostini", "Frittata campagnola con formaggio", "Broccoli al vapore", "Insalata verde", "Yogurt", false],
      ["settimana1", "giovedi", "pranzo", "Classici di busta", "Classici di busta", "Classici di busta", "Classici di busta", "Frutta / Snack", true],
      ["settimana1", "giovedi", "cena", "Lasagna alla Bolognese tradizionale", "Arista di maiale al latte", "Purè di patate", "Spinaci al burro", "Frutta fresca", false],
      ["settimana1", "venerdi", "pranzo", "Pasta e lenticchie", "Filetto di Merluzzo in crosta di patate", "Verdure grigliate miste", "Finocchi all'insalata", "Frutta di stagione", false],
      ["settimana1", "venerdi", "cena", "Minestrone di verdure di stagione", "Platessa dorata al limone", "Insalata russa casereccia", "Pomodori", "Sorbetto al limone", false],
      ["settimana1", "sabato", "pranzo", "Fusilli al pesto genovese", "Arrosto di vitello al forno", "Patate novelle al rosmarino", "Carote", "Frutta fresca", false],
      ["settimana1", "sabato", "cena", "Pizza Margherita casalinga", "Supplì e arancini artigianali", "Insalata capricciosa", "Verdure crude", "Dolce della casa", false],
      ["settimana1", "domenica", "pranzo", "Tagliatelle al ragù festivo", "Cosciotto di agnello o arrosto", "Patate al forno e carciofi", "Insalata ricca", "Torta festiva della domenica", false],
      ["settimana1", "domenica", "cena", "Passato di verdure con riso", "Tagliere di formaggi e salumi locali", "Insalata mista", "Olive", "Frutta fresca", false],

      // Settimana 2
      ["settimana2", "lunedi", "pranzo", "Ravioli Burro e Salvia", "Polpette di Carne fatte in casa", "Fagiolini", "Carote novelle", "Frutta fresca", false],
      ["settimana2", "lunedi", "cena", "Risotto ai funghi porcini", "Petto di pollo alla griglia", "Melanzane a funghetto", "Insalata mista", "Frutta fresca", false],
      ["settimana2", "martedi", "pranzo", "Classici di busta", "Classici di busta", "Classici di busta", "Classici di busta", "Frutta / Snack", true],
      ["settimana2", "martedi", "cena", "Pasta all'Amatriciana con guanciale", "Involtini di vitello con prosciutto", "Zucchine grigliate", "Insalata verde", "Frutta fresca", false],
      ["settimana2", "mercoledi", "pranzo", "Cannelloni ricotta e spinaci", "Bistecca di manzo ai ferri", "Insalata mista", "Patate lesse", "Macedonia di frutta fresca", false],
      ["settimana2", "mercoledi", "cena", "Crema di piselli e menta", "Tortino di patate e provola", "Peperonata dolce", "Insalata di pomodori", "Budino al cioccolato", false],
      ["settimana2", "giovedi", "pranzo", "Classici di busta", "Classici di busta", "Classici di busta", "Classici di busta", "Frutta / Snack", true],
      ["settimana2", "giovedi", "cena", "Pasta e fagioli borlotti alla veneta", "Salsiccia e scamorza al forno", "Friarelli saltati", "Patate al vapore", "Frutta fresca", false],
      ["settimana2", "venerdi", "pranzo", "Spaghetti al tonno, capperi e olive", "Salmone al forno con erbe", "Insalata verde e pomodorini", "Zucchine", "Frutta fresca", false],
      ["settimana2", "venerdi", "cena", "Zuppa d'orzo e legumi", "Calamari dorati o seppie in umido", "Caponata di verdure", "Insalata mista", "Gelato o dessert", false],
      ["settimana2", "sabato", "pranzo", "Penne all'Arrabbiata", "Cosce di pollo al forno con aromi", "Patatine fritte", "Insalata mista", "Frutta fresca", false],
      ["settimana2", "sabato", "cena", "Focaccia ligure e piadine", "Tagliere di affettati e mozzarella", "Insalata mista", "Sottoli", "Croccante o dolce", false],
      ["settimana2", "domenica", "pranzo", "Risotto alla Milanese con zafferano", "Filetto di maiale glassato al miele", "Patate al forno e asparagi", "Insalata mista", "Tiramisù della casa", false],
      ["settimana2", "domenica", "cena", "Brodo di carne con tortellini", "Carpaccio di bresaola, rucola e grana", "Insalata mista", "Finocchi", "Frutta fresca", false]
    ];
    for (let r = 0; r < righeMenuDefault.length; r++) {
      sMenu.appendRow(righeMenuDefault[r]);
    }
  }

  // 8. Foglio Accoglienza (Richieste Ospitalità in Camera con Doppia Autorizzazione)
  let sAccoglienza = ss.getSheetByName(SHEET_ACCOGLIENZA);
  if (!sAccoglienza) {
    sAccoglienza = ss.insertSheet(SHEET_ACCOGLIENZA);
    sAccoglienza.appendRow([
      "ID",
      "Data_Richiesta",
      "Richiedente_Email",
      "Richiedente_Nome",
      "Nome_Ospite",
      "Numero_Ospiti",
      "Data_Checkin",
      "Data_Checkout",
      "Camera_Assegnata",
      "Motivo",
      "Note",
      "Stato",
      "Auth1_Email",
      "Auth1_Data",
      "Auth1_Note",
      "Auth2_Email",
      "Auth2_Data",
      "Auth2_Note"
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
 * Helper per formattare la data in stringa 'yyyy-MM-dd' sia per oggetti Date che stringhe
 */
function formattaDataGAS(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || "GMT+1", "yyyy-MM-dd");
  }
  const s = String(val).trim();
  if (s.includes("T")) return s.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return Utilities.formatDate(d, Session.getScriptTimeZone() || "GMT+1", "yyyy-MM-dd");
  }
  return s;
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
      return gestisciPing();
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
      case "ping":
        return gestisciPing();

      case "inizializzaDati":
        return gestisciInizializzaDati(payload);

      case "login":
        return gestisciLogin(payload);

      case "registraUtente":
        return gestisciRegistrazione(payload.email, payload.nome, payload.password);

      case "cambiaPassword":
        return gestisciCambiaPassword(payload);

      case "resetPasswordUtente":
        return gestisciResetPasswordUtente(payload);

      case "approvaUtente":
        return gestisciApprovazione(payload);

      case "aggiornaRuoliUtente":
        return gestisciAggiornaRuoliUtente(payload);

      case "importaElencoUtenti":
        return gestisciImportaElencoUtenti(payload);

      case "eliminaUtente":
        return gestisciEliminaUtente(payload);

      case "prenotaMensa":
        return gestisciPrenotazioneMensa(payload);

      case "cancellaPrenotazioneMensa":
        return gestisciCancellaPrenotazioneMensa(payload);

      case "prenotaSpazio":
        return gestisciPrenotazioneSpazio(payload);

      case "approvaPrenotazioneSpazio":
        return gestisciApprovaPrenotazioneSpazio(payload);

      case "rifiutaPrenotazioneSpazio":
        return gestisciRifiutaPrenotazioneSpazio(payload);

      case "cancellaPrenotazioneSpazio":
        return gestisciCancellaPrenotazioneSpazio(payload);

      case "getBacheca":
        return gestisciGetBacheca();

      case "salvaAvvisoBacheca":
        return gestisciSalvaAvvisoBacheca(payload);

      case "importaEventiCalendario":
        return gestisciImportaEventiCalendario(payload);

      case "eliminaAvvisoBacheca":
        return gestisciEliminaAvvisoBacheca(payload);

      case "caricaGuasto":
        return gestisciCaricaGuasto(payload);

      case "risolviGuasto":
        return gestisciRisolviGuasto(payload.id);

      case "aggiornaSegnalazione":
        return gestisciAggiornaSegnalazione(payload);

      case "getBootstrap":
        return gestisciGetBootstrap(payload);

      case "getMasterData":
        return getMasterData(payload.email);

      case "getInfoData":
        return getInfoData();

      case "aggiornaConfig":
        return gestisciAggiornaConfig(payload);

      case "salvaMenuBase":
        return gestisciSalvaMenuBase(payload);

      case "inizializzaMenuBase":
        return gestisciInizializzaMenuBase();

      case "richiediAccoglienza":
        return gestisciRichiestaAccoglienza(payload);

      case "autorizza1Accoglienza":
        return gestisciAutorizza1Accoglienza(payload);

      case "autorizza2Accoglienza":
        return gestisciAutorizza2Accoglienza(payload);

      case "rifiutaAccoglienza":
        return gestisciRifiutaAccoglienza(payload);

      case "cancellaAccoglienza":
        return gestisciCancellaAccoglienza(payload);

      case "getAccoglienzaData":
        return gestisciGetAccoglienzaData();

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

function gestisciLogin(payload) {
  const email = (typeof payload === "string" ? payload : (payload && payload.email ? payload.email : "")).trim().toLowerCase();
  const password = payload && payload.password ? String(payload.password).trim() : "";
  if (!email) return rispostaJSON({ success: false, error: "Email obbligatoria" });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Utenti non trovato" });
  const data = sheet.getDataRange().getValues();

  // data[0] sono le intestazioni
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[0]).trim().toLowerCase() === email) {
      const storedPass = String(row[7] || "").trim();

      // Se l'utente ha una password impostata, verificala
      if (storedPass) {
        if (!password) {
          return rispostaJSON({
            success: false,
            requirePassword: true,
            error: "Inserisci la tua password per accedere"
          });
        }
        if (password !== storedPass) {
          return rispostaJSON({
            success: false,
            requirePassword: true,
            error: "Password errata. Riprova o chiedi il reset alla Direzione."
          });
        }
      } else {
        // Se non ha ancora una password nel foglio e l'ha fornita al login, salvala come password iniziale
        if (password) {
          sheet.getRange(i + 1, 8).setValue(password);
        }
      }

      return rispostaJSON({
        success: true,
        utente: {
          email: row[0],
          nome: row[1],
          stato: row[2], // "In Attesa" | "Approvato"
          perm_mensa: Boolean(row[3]),
          perm_manutenzione: Boolean(row[4]),
          perm_spazi: Boolean(row[5]),
          perm_admin: Boolean(row[6]),
          hasPassword: Boolean(storedPass || password),
          is_utente_mensa: (row[10] !== undefined && row[10] !== "") ? Boolean(row[10]) : Boolean(row[3])
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

function gestisciRegistrazione(email, nome, password) {
  if (!email || !nome) {
    return rispostaJSON({ success: false, error: "Email e Nome obbligatori" });
  }
  email = email.trim().toLowerCase();
  nome = nome.trim();
  password = String(password || "newman2026").trim();

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Utenti non trovato" });
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

  // Inserimento nuovo utente: all'iscrizione di base è Utente Base abilitato
  sheet.appendRow([
    email,
    nome || email.split("@")[0],
    "Approvato", // Stato Approvato come Utente Base
    false, // Perm_Mensa (non master mensa)
    false, // Perm_Manutenzione (non master manutenzione)
    true,  // Perm_Spazi (abilitato a prenotare Chiesa e Sala TV)
    false, // Perm_Admin (non supermaster)
    password, // Password utente
    false, // Notif_Manutenzione
    false, // Notif_Spazi
    true   // Is_Utente_Mensa (di default abilitato alla mensa)
  ]);

  return rispostaJSON({
    success: true,
    status: "Approvato",
    utente: {
      email: email,
      nome: nome || email.split("@")[0],
      stato: "Approvato",
      perm_mensa: false,
      perm_manutenzione: false,
      perm_spazi: true,
      perm_admin: false,
      hasPassword: true,
      is_utente_mensa: true
    },
    message: "Registrazione completata con successo come Utente Base!"
  });
}

function gestisciCambiaPassword(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const passwordAttuale = String(payload.passwordAttuale || "").trim();
  const nuovaPassword = String(payload.nuovaPassword || "").trim();

  if (!email) return rispostaJSON({ success: false, error: "Email utente mancante" });
  if (!nuovaPassword || nuovaPassword.length < 4) {
    return rispostaJSON({ success: false, error: "La nuova password deve contenere almeno 4 caratteri" });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Utenti non trovato" });
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === email) {
      const passNelFoglio = String(data[i][7] || "").trim();
      // Se c'è già una password nel foglio, verifica che quella attuale corrisponda
      if (passNelFoglio && passNelFoglio !== passwordAttuale) {
        return rispostaJSON({ success: false, error: "La password attuale inserita non è corretta." });
      }

      sheet.getRange(i + 1, 8).setValue(nuovaPassword);
      return rispostaJSON({ success: true, message: "Password aggiornata con successo nel database!" });
    }
  }

  return rispostaJSON({ success: false, error: "Utente non trovato nel sistema" });
}

function gestisciResetPasswordUtente(payload) {
  const emailTarget = String(payload.emailTarget || "").trim().toLowerCase();
  const nuovaPassword = String(payload.nuovaPassword || "newman2026").trim();

  if (!emailTarget) return rispostaJSON({ success: false, error: "Email residente mancante" });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Utenti non trovato" });
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === emailTarget) {
      sheet.getRange(i + 1, 8).setValue(nuovaPassword);
      return rispostaJSON({
        success: true,
        message: "Password per " + emailTarget + " reimpostata con successo a: " + nuovaPassword
      });
    }
  }

  return rispostaJSON({ success: false, error: "Utente non trovato" });
}

function gestisciApprovazione(payload) {
  const emailTarget = String(payload.emailTarget || "").trim().toLowerCase();
  if (!emailTarget) return rispostaJSON({ success: false, error: "Email target mancante" });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Utenti non trovato" });
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
      if (payload.notif_manutenzione !== undefined) sheet.getRange(i + 1, 9).setValue(Boolean(payload.notif_manutenzione));
      if (payload.notif_spazi !== undefined) sheet.getRange(i + 1, 10).setValue(Boolean(payload.notif_spazi));
      if (payload.is_utente_mensa !== undefined) sheet.getRange(i + 1, 11).setValue(Boolean(payload.is_utente_mensa));

      return rispostaJSON({ success: true, message: "Utente approvato con successo" });
    }
  }

  return rispostaJSON({ success: false, error: "Utente non trovato" });
}

function gestisciAggiornaRuoliUtente(payload) {
  const emailTarget = String(payload.emailTarget || "").trim().toLowerCase();
  if (!emailTarget) return rispostaJSON({ success: false, error: "Email target mancante" });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Utenti non trovato" });
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === emailTarget) {
      if (payload.stato !== undefined) sheet.getRange(i + 1, 3).setValue(payload.stato);
      if (payload.perm_mensa !== undefined) sheet.getRange(i + 1, 4).setValue(Boolean(payload.perm_mensa));
      if (payload.perm_manutenzione !== undefined) sheet.getRange(i + 1, 5).setValue(Boolean(payload.perm_manutenzione));
      if (payload.perm_spazi !== undefined) sheet.getRange(i + 1, 6).setValue(Boolean(payload.perm_spazi));
      if (payload.perm_admin !== undefined) sheet.getRange(i + 1, 7).setValue(Boolean(payload.perm_admin));
      if (payload.notif_manutenzione !== undefined) sheet.getRange(i + 1, 9).setValue(Boolean(payload.notif_manutenzione));
      if (payload.notif_spazi !== undefined) sheet.getRange(i + 1, 10).setValue(Boolean(payload.notif_spazi));
      if (payload.is_utente_mensa !== undefined) sheet.getRange(i + 1, 11).setValue(Boolean(payload.is_utente_mensa));

      return rispostaJSON({ success: true, message: "Ruoli e autorizzazioni aggiornati per " + emailTarget });
    }
  }

  return rispostaJSON({ success: false, error: "Utente non trovato" });
}

function gestisciImportaElencoUtenti(payload) {
  const lista = payload.utenti || [];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Utenti non trovato" });

  const data = sheet.getDataRange().getValues();
  const existingEmails = new Set();
  for (let i = 1; i < data.length; i++) {
    existingEmails.add(String(data[i][0]).trim().toLowerCase());
  }

  let aggiunti = 0;
  lista.forEach(item => {
    const email = String(item.email || "").trim().toLowerCase();
    const nome = String(item.nome || "").trim();
    if (email && !existingEmails.has(email)) {
      sheet.appendRow([
        email,
        nome || email.split("@")[0],
        "Approvato",
        item.perm_mensa !== undefined ? Boolean(item.perm_mensa) : false,
        item.perm_manutenzione !== undefined ? Boolean(item.perm_manutenzione) : false,
        item.perm_spazi !== undefined ? Boolean(item.perm_spazi) : true,
        item.perm_admin !== undefined ? Boolean(item.perm_admin) : false,
        String(item.password || "newman2026").trim(),
        item.notif_manutenzione !== undefined ? Boolean(item.notif_manutenzione) : Boolean(item.perm_manutenzione),
        item.notif_spazi !== undefined ? Boolean(item.notif_spazi) : Boolean(item.perm_spazi)
      ]);
      existingEmails.add(email);
      aggiunti++;
    }
  });

  return rispostaJSON({ success: true, aggiunti: aggiunti, message: aggiunti + " residenti importati con successo" });
}

function gestisciEliminaUtente(payload) {
  const emailTarget = String(payload.emailTarget || "").trim().toLowerCase();
  if (!emailTarget) return rispostaJSON({ success: false, error: "Email target mancante" });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Utenti non trovato" });
  const data = sheet.getDataRange().getValues();

  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]).trim().toLowerCase() === emailTarget) {
      sheet.deleteRow(i + 1);
      return rispostaJSON({ success: true, message: "Residente rimosso con successo" });
    }
  }

  return rispostaJSON({ success: false, error: "Utente non trovato" });
}

// ----------------------------------------------------------------------------
// GESTIONE MENSA
// ----------------------------------------------------------------------------

function gestisciPrenotazioneMensa(payload) {
  const { data, email, tipo_pasto, busta, ritardo, note, bypassTimeLock, ospiti, stato_presenza } = payload;
  const numOspiti = Math.max(0, parseInt(ospiti || 0, 10));
  const statoPresenza = stato_presenza || (payload.assente ? "Assente" : "Presente");
  if (!data || !email || !tipo_pasto) {
    return rispostaJSON({ success: false, error: "Campi obbligatori mancanti (data, email, tipo_pasto)" });
  }

  // Verifica orario limite (configurabile da foglio Configurazione)
  if (!bypassTimeLock) {
    const adesso = new Date();
    const targetDate = new Date(String(data).split("T")[0] + "T00:00:00");
    const oggiDate = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate());

    if (targetDate < oggiDate) {
      return rispostaJSON({ success: false, error: "Non è possibile modificare presenze per date passate." });
    }

    // Lettura orari limite da foglio Configurazione (con default)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sConfig = ss.getSheetByName(SHEET_CONFIG);
    let limitePranzo = "09:00";
    let limiteCena = "14:30";
    let limiteBusta = "14:00";
    if (sConfig) {
      const cRows = sConfig.getDataRange().getValues();
      for (let c = 1; c < cRows.length; c++) {
        if (String(cRows[c][0]) === "Orario_Limite_Pranzo" && cRows[c][1]) limitePranzo = String(cRows[c][1]).trim();
        if (String(cRows[c][0]) === "Orario_Limite_Cena" && cRows[c][1]) limiteCena = String(cRows[c][1]).trim();
        if (String(cRows[c][0]) === "Orario_Limite_Busta" && cRows[c][1]) limiteBusta = String(cRows[c][1]).trim();
      }
    }

    const pastoNorm = String(tipo_pasto).trim().toLowerCase();

    // Controllo Busta (prenotabile entro le 14:00 del giorno prima)
    if (busta) {
      const bParts = limiteBusta.split(":").map(Number);
      const bOre = isNaN(bParts[0]) ? 14 : bParts[0];
      const bMin = isNaN(bParts[1]) ? 0 : bParts[1];
      const deadlineBusta = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() - 1, bOre, bMin, 0);
      if (adesso > deadlineBusta) {
        return rispostaJSON({ success: false, error: "La busta (pranzo al sacco) può essere prenotata solo entro le " + limiteBusta + " del giorno prima." });
      }
    }

    if (targetDate.getTime() === oggiDate.getTime()) {
      const ore = adesso.getHours();
      const minuti = adesso.getMinutes();

      if (pastoNorm === "pranzo") {
        const pParts = limitePranzo.split(":").map(Number);
        const pOre = isNaN(pParts[0]) ? 9 : pParts[0];
        const pMin = isNaN(pParts[1]) ? 0 : pParts[1];
        if (ore > pOre || (ore === pOre && minuti >= pMin)) {
          return rispostaJSON({ success: false, error: "Prenotazioni per il pranzo chiuse (limite ore " + limitePranzo + " del mattino)." });
        }
      }
      if (pastoNorm === "cena") {
        const cParts = limiteCena.split(":").map(Number);
        const cOre = isNaN(cParts[0]) ? 14 : cParts[0];
        const cMin = isNaN(cParts[1]) ? 30 : cParts[1];
        if (ore > cOre || (ore === cOre && minuti >= cMin)) {
          return rispostaJSON({ success: false, error: "Prenotazioni per la cena chiuse (limite ore " + limiteCena + ")." });
        }
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
      sheet.getRange(i + 1, 9).setValue(numOspiti);
      sheet.getRange(i + 1, 10).setValue(statoPresenza);

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
    new Date().toISOString(),
    numOspiti,
    statoPresenza
  ]);

  return rispostaJSON({ success: true, id: id });
}

function gestisciCancellaPrenotazioneMensa(payload) {
  const { data, email, tipo_pasto, bypassTimeLock } = payload;
  if (!data || !email || !tipo_pasto) {
    return rispostaJSON({ success: false, error: "Parametri mancanti per cancellazione presenza" });
  }

  // Verifica orario limite di cancellazione (da foglio Configurazione)
  if (!bypassTimeLock) {
    const adesso = new Date();
    const targetDate = new Date(String(data).split("T")[0] + "T00:00:00");
    const oggiDate = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate());

    if (targetDate < oggiDate) {
      return rispostaJSON({ success: false, error: "Non è possibile cancellare presenze per date passate." });
    }

    // Lettura orari limite da foglio Configurazione (con default)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sConfig = ss.getSheetByName(SHEET_CONFIG);
    let limitePranzo = "09:00";
    let limiteCena = "14:30";
    if (sConfig) {
      const cRows = sConfig.getDataRange().getValues();
      for (let c = 1; c < cRows.length; c++) {
        if (String(cRows[c][0]) === "Orario_Limite_Pranzo" && cRows[c][1]) limitePranzo = String(cRows[c][1]).trim();
        if (String(cRows[c][0]) === "Orario_Limite_Cena" && cRows[c][1]) limiteCena = String(cRows[c][1]).trim();
      }
    }

    if (targetDate.getTime() === oggiDate.getTime()) {
      const ore = adesso.getHours();
      const minuti = adesso.getMinutes();
      const pastoNorm = String(tipo_pasto).trim().toLowerCase();

      if (pastoNorm === "pranzo") {
        const pParts = limitePranzo.split(":").map(Number);
        const pOre = isNaN(pParts[0]) ? 9 : pParts[0];
        const pMin = isNaN(pParts[1]) ? 0 : pParts[1];
        if (ore > pOre || (ore === pOre && minuti >= pMin)) {
          return rispostaJSON({ success: false, error: "Modifiche per il pranzo chiuse (limite ore " + limitePranzo + ")." });
        }
      }
      if (pastoNorm === "cena") {
        const cParts = limiteCena.split(":").map(Number);
        const cOre = isNaN(cParts[0]) ? 14 : cParts[0];
        const cMin = isNaN(cParts[1]) ? 30 : cParts[1];
        if (ore > cOre || (ore === cOre && minuti >= cMin)) {
          return rispostaJSON({ success: false, error: "Modifiche per la cena chiuse (limite ore " + limiteCena + ")." });
        }
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
  const { risorsa, data, slot_orario, email, isMaster } = payload;
  if (!risorsa || !data || !slot_orario || !email) {
    return rispostaJSON({ success: false, error: "Parametri mancanti per prenotazione spazio" });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SPAZI);
  if (!sheet) {
    return rispostaJSON({ success: false, error: "Foglio " + SHEET_SPAZI + " non trovato. Esegui setupDatabase()." });
  }
  const rows = sheet.getDataRange().getValues();

  const targetDataStr = formattaDataGAS(data);

  // Controllo sovrapposizione slot
  for (let i = 1; i < rows.length; i++) {
    const rRisorsa = String(rows[i][1]);
    const rDataStr = formattaDataGAS(rows[i][2]);
    const rSlot = String(rows[i][3]);
    const rStato = String(rows[i][6] || "Approvata");

    if (rRisorsa === risorsa && rDataStr === targetDataStr && rSlot === slot_orario && rStato !== "Rifiutata") {
      return rispostaJSON({
        success: false,
        error: "Questo slot orario è già occupato o ha una richiesta in attesa."
      });
    }
  }

  // Verifica se l'utente è master dai permessi nel foglio Utenti
  let requesterIsMaster = Boolean(isMaster);
  if (!requesterIsMaster) {
    const sUtenti = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_UTENTI);
    if (sUtenti) {
      const uRows = sUtenti.getDataRange().getValues();
      for (let u = 1; u < uRows.length; u++) {
        if (String(uRows[u][0]).trim().toLowerCase() === email.trim().toLowerCase()) {
          if (uRows[u][6]) requesterIsMaster = true; // perm_admin
          break;
        }
      }
    }
  }

  const stato = requesterIsMaster ? "Approvata" : "In Attesa";
  const approvatoDa = requesterIsMaster ? email : "";
  const id = generaId("SPAZIO");

  sheet.appendRow([
    id,
    risorsa,
    targetDataStr,
    slot_orario,
    email.trim().toLowerCase(),
    new Date().toISOString(),
    stato,
    approvatoDa
  ]);

  // Se la richiesta è di un residente ed è in attesa, manda notifica email ai Master
  if (stato === "In Attesa") {
    inviaNotificaEmailMaster(
      "spazi",
      "[Residenza Newman] Richiesta Spazio da Approvare: " + risorsa + " (" + targetDataStr + " - " + slot_orario + ")",
      "Un residente ha richiesto la prenotazione di un ambiente comune:\n\n" +
      "• Ambiente: " + risorsa + "\n" +
      "• Data: " + targetDataStr + "\n" +
      "• Slot Orario: " + slot_orario + "\n" +
      "• Richiedente: " + email + "\n" +
      "• Stato: In Attesa di Approvazione da un Referente/Master\n\n" +
      "Puoi approvare o rifiutare la richiesta direttamente dalla sezione Spazi del Pannello Master nell'applicazione."
    );
  }

  return rispostaJSON({
    success: true,
    id: id,
    stato: stato,
    message: stato === "Approvata" ? "Prenotazione confermata" : "Richiesta inviata. In attesa di approvazione da un Master."
  });
}

function gestisciApprovaPrenotazioneSpazio(payload) {
  const { id, approvatoreEmail } = payload;
  if (!id) return rispostaJSON({ success: false, error: "ID prenotazione mancante" });
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SPAZI);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Spazi non trovato" });

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 7).setValue("Approvata");
      sheet.getRange(i + 1, 8).setValue(approvatoreEmail || "Master");
      return rispostaJSON({ success: true, message: "Richiesta spazio approvata con successo" });
    }
  }
  return rispostaJSON({ success: false, error: "Prenotazione spazio non trovata" });
}

function gestisciRifiutaPrenotazioneSpazio(payload) {
  const { id } = payload;
  if (!id) return rispostaJSON({ success: false, error: "ID prenotazione mancante" });
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SPAZI);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Spazi non trovato" });

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return rispostaJSON({ success: true, message: "Richiesta spazio rifiutata e slot liberato" });
    }
  }
  return rispostaJSON({ success: false, error: "Prenotazione spazio non trovata" });
}

function gestisciCancellaPrenotazioneSpazio(payload) {
  const { id, risorsa, data, slot_orario, email } = payload;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SPAZI);
  if (!sheet) return rispostaJSON({ success: true });

  const rows = sheet.getDataRange().getValues();
  const targetEmail = String(email || "").trim().toLowerCase();
  const targetData = formattaDataGAS(data);

  for (let i = rows.length - 1; i >= 1; i--) {
    const row = rows[i];
    const rowId = String(row[0]);
    const rowRisorsa = String(row[1]);
    const rowData = formattaDataGAS(row[2]);
    const rowSlot = String(row[3]);
    const rowEmail = String(row[4]).trim().toLowerCase();

    const matchId = id && (rowId === String(id));
    const matchDetails = (!id) && (rowRisorsa === risorsa && rowData === targetData && rowSlot === slot_orario);

    if (matchId || matchDetails) {
      // Se richiesta non-admin con email, verifica appartenenza
      if (targetEmail && rowEmail && rowEmail !== targetEmail) {
        continue;
      }
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

  const id = payload.id || generaId("GUASTO");
  const categoria = payload.categoria || "manutenzione";
  const luogo = payload.luogo || "";
  const priorita = payload.priorita || "Media";
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MANUTENZIONE);
  sheet.appendRow([
    id,
    new Date().toISOString(),
    email.trim().toLowerCase(),
    descrizione,
    linkFoto,
    "Da fare",
    categoria,
    luogo,
    priorita,
    "", // note_intervento
    "", // tecnico
    ""  // data_chiusura
  ]);

  // Invia notifica email al Master / Referente Manutenzione
  inviaNotificaEmailMaster(
    "manutenzione",
    "[Residenza Newman] Nuova Segnalazione: " + (luogo ? luogo + " - " : "") + priorita,
    "È stata registrata una nuova segnalazione di manutenzione/servizi:\n\n" +
    "• ID Segnalazione: " + id + "\n" +
    "• Data: " + Utilities.formatDate(new Date(), "GMT+1", "dd/MM/yyyy HH:mm") + "\n" +
    "• Inviata da: " + email + "\n" +
    "• Categoria: " + (categoria === "servizi" ? "Servizi Residenza" : "Manutenzione & Guasti") + "\n" +
    "• Luogo/Ambiente: " + (luogo || "Non specificato") + "\n" +
    "• Priorità: " + priorita + "\n" +
    "• Descrizione: " + descrizione + "\n" +
    (linkFoto ? "• Foto allegata: " + linkFoto + "\n\n" : "\n") +
    "L'intervento può essere seguito e aggiornato nell'app (Pannello Master) o direttamente nel foglio Google 'Manutenzione' per l'amministrazione."
  );

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
      sheet.getRange(i + 1, 12).setValue(new Date().toISOString());
      return rispostaJSON({ success: true, message: "Guasto contrassegnato come risolto" });
    }
  }

  return rispostaJSON({ success: false, error: "Guasto non trovato" });
}

function gestisciAggiornaSegnalazione(payload) {
  const { id, stato, priorita, note_intervento, tecnico, categoria, luogo } = payload;
  if (!id) return rispostaJSON({ success: false, error: "ID segnalazione mancante" });
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MANUTENZIONE);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Manutenzione non trovato" });
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      if (stato !== undefined) sheet.getRange(i + 1, 6).setValue(stato);
      if (categoria !== undefined) sheet.getRange(i + 1, 7).setValue(categoria);
      if (luogo !== undefined) sheet.getRange(i + 1, 8).setValue(luogo);
      if (priorita !== undefined) sheet.getRange(i + 1, 9).setValue(priorita);
      if (note_intervento !== undefined) sheet.getRange(i + 1, 10).setValue(note_intervento);
      if (tecnico !== undefined) sheet.getRange(i + 1, 11).setValue(tecnico);
      if (stato === "Risolto") {
        sheet.getRange(i + 1, 12).setValue(new Date().toISOString());
      } else if (stato !== undefined && stato !== "Risolto") {
        sheet.getRange(i + 1, 12).setValue("");
      }
      return rispostaJSON({ success: true, message: "Segnalazione aggiornata con successo" });
    }
  }

  return rispostaJSON({ success: false, error: "Segnalazione non trovata" });
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
      if (rows[i][0] || rows[i][3]) {
        prenotazioniSpazi.push({
          id: String(rows[i][0] || ""),
          risorsa: String(rows[i][1] || ""),
          data: formattaDataGAS(rows[i][2]),
          slot_orario: String(rows[i][3] || ""),
          email: String(rows[i][4] || "").toLowerCase(),
          stato: String(rows[i][6] || "Approvata"),
          approvato_da: String(rows[i][7] || "")
        });
      }
    }
  }

  // Recupera prenotazioni mensa per visualizzare la propria presenza
  const sMensa = ss.getSheetByName(SHEET_MENSA);
  const prenotazioniMensa = [];
  if (sMensa) {
    const rowsM = sMensa.getDataRange().getValues();
    for (let i = 1; i < rowsM.length; i++) {
      if (rowsM[i][0] || rowsM[i][1]) {
        prenotazioniMensa.push({
          id: String(rowsM[i][0] || ""),
          data: formattaDataGAS(rowsM[i][1]),
          email: String(rowsM[i][2] || "").toLowerCase(),
          tipo_pasto: String(rowsM[i][3] || ""),
          busta: Boolean(rowsM[i][4]),
          ritardo: Boolean(rowsM[i][5]),
          note: String(rowsM[i][6] || ""),
          ospiti: parseInt(rowsM[i][8] || 0, 10),
          stato_presenza: String(rowsM[i][9] || "Presente")
        });
      }
    }
  }

  // Recupera richieste di Accoglienza
  const sAccoglienza = ss.getSheetByName(SHEET_ACCOGLIENZA);
  const accoglienza = [];
  if (sAccoglienza) {
    const rowsA = sAccoglienza.getDataRange().getValues();
    for (let i = 1; i < rowsA.length; i++) {
      if (rowsA[i][0]) {
        accoglienza.push({
          id: String(rowsA[i][0]),
          data_richiesta: rowsA[i][1] ? String(rowsA[i][1]) : "",
          richiedente_email: String(rowsA[i][2] || "").toLowerCase(),
          richiedente_nome: String(rowsA[i][3] || ""),
          nome_ospite: String(rowsA[i][4] || ""),
          numero_ospiti: parseInt(rowsA[i][5] || 1, 10),
          data_checkin: formattaDataGAS(rowsA[i][6]),
          data_checkout: formattaDataGAS(rowsA[i][7]),
          camera_assegnata: String(rowsA[i][8] || ""),
          motivo: String(rowsA[i][9] || ""),
          note: String(rowsA[i][10] || ""),
          stato: String(rowsA[i][11] || "In Attesa 1a Autorizzazione"),
          auth1_email: String(rowsA[i][12] || ""),
          auth1_data: rowsA[i][13] ? String(rowsA[i][13]) : "",
          auth1_note: String(rowsA[i][14] || ""),
          auth2_email: String(rowsA[i][15] || ""),
          auth2_data: rowsA[i][16] ? String(rowsA[i][16]) : "",
          auth2_note: String(rowsA[i][17] || "")
        });
      }
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
          data: formattaDataGAS(rowsB[i][1]),
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

  // 5. Recupera Menu Base dal foglio Menu_Base (se presente)
  let menuBase = null;
  const sMenu = ss.getSheetByName(SHEET_MENU);
  if (sMenu) {
    const rowsM = sMenu.getDataRange().getValues();
    if (rowsM.length > 1) {
      menuBase = { settimana1: {}, settimana2: {} };
      for (let i = 1; i < rowsM.length; i++) {
        const row = rowsM[i];
        const rawSett = String(row[0] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const settKey = (rawSett.includes("1") || rawSett === "settimana1") ? "settimana1" : (rawSett.includes("2") || rawSett === "settimana2") ? "settimana2" : "";
        const rawGiorno = String(row[1] || "").toLowerCase().trim();
        let giornoKey = "";
        if (rawGiorno.startsWith("lun")) giornoKey = "lunedi";
        else if (rawGiorno.startsWith("mar")) giornoKey = "martedi";
        else if (rawGiorno.startsWith("mer")) giornoKey = "mercoledi";
        else if (rawGiorno.startsWith("gio")) giornoKey = "giovedi";
        else if (rawGiorno.startsWith("ven")) giornoKey = "venerdi";
        else if (rawGiorno.startsWith("sab")) giornoKey = "sabato";
        else if (rawGiorno.startsWith("dom")) giornoKey = "domenica";

        const pastoKey = String(row[2] || "").toLowerCase().includes("cena") ? "cena" : "pranzo";

        if (settKey && giornoKey) {
          if (!menuBase[settKey][giornoKey]) menuBase[settKey][giornoKey] = {};
          menuBase[settKey][giornoKey][pastoKey] = {
            primo: String(row[3] || "").trim(),
            secondo: String(row[4] || "").trim(),
            contorno: String(row[5] || "").trim(),
            contorno2: String(row[6] || "").trim(),
            dessert: String(row[7] || "").trim(),
            busta: Boolean(row[8] === true || String(row[8]).toLowerCase() === "true")
          };
        }
      }
    }
  }

  return rispostaJSON({
    success: true,
    menuBase: menuBase,
    config: {
      Data_Variazione_Menu: config["Data_Variazione_Menu"] || "",
      Testo_Variazione: config["Testo_Variazione"] || "",
      Pasto_Variazione: config["Pasto_Variazione"] || "entrambi",
      Variazioni_Per_Data: config["Variazioni_Per_Data"] || "",
      Messaggio_Supermaster: config["Messaggio_Supermaster"] || "Cari residenti, benvenuti nel portale digitale della Residenza Newman. Per qualsiasi necessità o urgenza la Direzione è a vostra disposizione.",
      Info_Regolamento: config["Info_Regolamento"] || "REGOLAMENTO INTERNO DELLA RESIDENZA CARDINAL NEWMAN\n1. VITA COMUNITARIA: Il clima di studio, preghiera e fraternità è alla base della convivenza.\n2. ORARI DI SILENZIO: Dalle ore 23:00 alle ore 07:30 del mattino è richiesto il silenzio assoluto nei corridoi e nelle aree comuni.\n3. MENSA COMUNITARIA:\n   • Pranzo alle 14:30 (prenotazioni aperte fino alle 13:30, 1h prima).\n   • Cena alle 19:30 (prenotazioni aperte fino alle 18:30, 1h prima).\n   • Martedì e Giovedì a pranzo: sono previsti i classici di busta (pranzo al sacco da asporto).\n4. PRENOTAZIONE SPAZI:\n   • Gli unici spazi soggetti a prenotazione sono la Chiesa / Cappella e la Sala TV.\n   • Gli slot sono di 30 minuti. Non serve conferma preventiva.\n5. MANUTENZIONE: Segnalare tempestivamente qualsiasi anomalia nell'apposita sezione Guasti.",
      Info_Contatti: config["Info_Contatti"] || "CONTATTI E RECAPITI DELLA RESIDENZA:\n• Portineria / Accoglienza: Tel. +39 06 87654321 (Int. 101) - Attiva 07:00 - 22:30\n• Direzione Generale: direzione@residenzanewman.org (Int. 102)\n• Emergenze Notturne Custode: +39 333 1122334\n• Economato & Servizio Mensa: mensa@residenzanewman.org\n• Assistenza Tecnica Manutenzione: manutenzione@residenzanewman.org",
      Nome_Camera_1: config["Nome_Camera_1"] || "Camera 1 - Newman",
      Nome_Camera_2: config["Nome_Camera_2"] || "Camera 2 - San Filippo Neri",
      Nome_Camera_3: config["Nome_Camera_3"] || "Camera 3 - San Tommaso d'Aquino",
      Max_Ospiti_Mensa: config["Max_Ospiti_Mensa"] || "5"
    },
    prenotazioniSpazi: prenotazioniSpazi,
    prenotazioniMensa: prenotazioniMensa,
    bacheca: bacheca,
    accoglienza: accoglienza
  });
}

/**
 * Endpoint unificato ad alte prestazioni: restituisce tutti i dati pubblici e,
 * se l'utente possiede permessi master, include anche utentiInAttesa, tuttiUtenti e guasti.
 */
function gestisciGetBootstrap(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const emailRichiedente = String((payload && payload.email) || "").trim().toLowerCase();

  // 1. Configurazione
  const sConfig = ss.getSheetByName(SHEET_CONFIG);
  const config = {};
  if (sConfig) {
    const rows = sConfig.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) config[rows[i][0]] = rows[i][1];
    }
  }

  // 2. Prenotazioni Spazi
  const sSpazi = ss.getSheetByName(SHEET_SPAZI);
  const prenotazioniSpazi = [];
  if (sSpazi) {
    const rows = sSpazi.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] || rows[i][3]) {
        prenotazioniSpazi.push({
          id: String(rows[i][0] || ""),
          risorsa: String(rows[i][1] || ""),
          data: formattaDataGAS(rows[i][2]),
          slot_orario: String(rows[i][3] || ""),
          email: String(rows[i][4] || "").toLowerCase(),
          stato: String(rows[i][6] || "Approvata"),
          approvato_da: String(rows[i][7] || "")
        });
      }
    }
  }

  // 3. Prenotazioni Mensa
  const sMensa = ss.getSheetByName(SHEET_MENSA);
  const prenotazioniMensa = [];
  if (sMensa) {
    const rows = sMensa.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] || rows[i][1]) {
        prenotazioniMensa.push({
          id: String(rows[i][0] || ""),
          data: formattaDataGAS(rows[i][1]),
          email: String(rows[i][2] || "").toLowerCase(),
          tipo_pasto: String(rows[i][3] || ""),
          busta: Boolean(rows[i][4]),
          ritardo: Boolean(rows[i][5]),
          note: String(rows[i][6] || ""),
          ospiti: parseInt(rows[i][8] || 0, 10),
          stato_presenza: String(rows[i][9] || "Presente")
        });
      }
    }
  }

  // 4. Bacheca
  const sBacheca = ss.getSheetByName(SHEET_BACHECA);
  const bacheca = [];
  if (sBacheca) {
    const rows = sBacheca.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] || rows[i][3]) {
        bacheca.push({
          id: String(rows[i][0] || ""),
          data: formattaDataGAS(rows[i][1]),
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

  // 5. Accoglienza
  const sAccoglienza = ss.getSheetByName(SHEET_ACCOGLIENZA);
  const accoglienza = [];
  if (sAccoglienza) {
    const rows = sAccoglienza.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        accoglienza.push({
          id: String(rows[i][0]),
          data_richiesta: rows[i][1] ? String(rows[i][1]) : "",
          richiedente_email: String(rows[i][2] || "").toLowerCase(),
          richiedente_nome: String(rows[i][3] || ""),
          nome_ospite: String(rows[i][4] || ""),
          numero_ospiti: parseInt(rows[i][5] || 1, 10),
          data_checkin: formattaDataGAS(rows[i][6]),
          data_checkout: formattaDataGAS(rows[i][7]),
          camera_assegnata: String(rows[i][8] || ""),
          motivo: String(rows[i][9] || ""),
          note: String(rows[i][10] || ""),
          stato: String(rows[i][11] || "In Attesa 1a Autorizzazione"),
          auth1_email: String(rows[i][12] || ""),
          auth1_data: rows[i][13] ? String(rows[i][13]) : "",
          auth1_note: String(rows[i][14] || ""),
          auth2_email: String(rows[i][15] || ""),
          auth2_data: rows[i][16] ? String(rows[i][16]) : "",
          auth2_note: String(rows[i][17] || "")
        });
      }
    }
  }

  // 6. Menu Base
  let menuBase = null;
  const sMenu = ss.getSheetByName(SHEET_MENU);
  if (sMenu) {
    const rowsM = sMenu.getDataRange().getValues();
    if (rowsM.length > 1) {
      menuBase = { settimana1: {}, settimana2: {} };
      for (let i = 1; i < rowsM.length; i++) {
        const row = rowsM[i];
        const rawSett = String(row[0] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const settKey = (rawSett.includes("1") || rawSett === "settimana1") ? "settimana1" : (rawSett.includes("2") || rawSett === "settimana2") ? "settimana2" : "";
        const rawGiorno = String(row[1] || "").toLowerCase().trim();
        let giornoKey = "";
        if (rawGiorno.startsWith("lun")) giornoKey = "lunedi";
        else if (rawGiorno.startsWith("mar")) giornoKey = "martedi";
        else if (rawGiorno.startsWith("mer")) giornoKey = "mercoledi";
        else if (rawGiorno.startsWith("gio")) giornoKey = "giovedi";
        else if (rawGiorno.startsWith("ven")) giornoKey = "venerdi";
        else if (rawGiorno.startsWith("sab")) giornoKey = "sabato";
        else if (rawGiorno.startsWith("dom")) giornoKey = "domenica";

        const pastoKey = String(row[2] || "").toLowerCase().includes("cena") ? "cena" : "pranzo";
        if (settKey && giornoKey) {
          if (!menuBase[settKey][giornoKey]) menuBase[settKey][giornoKey] = {};
          menuBase[settKey][giornoKey][pastoKey] = {
            primo: String(row[3] || "").trim(),
            secondo: String(row[4] || "").trim(),
            contorno: String(row[5] || "").trim(),
            contorno2: String(row[6] || "").trim(),
            dessert: String(row[7] || "").trim(),
            busta: Boolean(row[8] === true || String(row[8]).toLowerCase() === "true")
          };
        }
      }
    }
  }

  // 7. Dati Master condizionali
  const sUtenti = ss.getSheetByName(SHEET_UTENTI);
  const tuttiUtenti = [];
  const utentiInAttesa = [];
  let isMaster = false;

  if (sUtenti) {
    const rowsU = sUtenti.getDataRange().getValues();
    for (let i = 1; i < rowsU.length; i++) {
      const uEmail = String(rowsU[i][0] || "").trim().toLowerCase();
      const u = {
        email: rowsU[i][0],
        nome: rowsU[i][1],
        stato: rowsU[i][2],
        perm_mensa: Boolean(rowsU[i][3]),
        perm_manutenzione: Boolean(rowsU[i][4]),
        perm_spazi: Boolean(rowsU[i][5]),
        perm_admin: Boolean(rowsU[i][6]),
        password: rowsU[i][7] ? String(rowsU[i][7]) : "",
        notif_manutenzione: Boolean(rowsU[i][8]),
        notif_spazi: Boolean(rowsU[i][9]),
        is_utente_mensa: (rowsU[i][10] !== undefined && rowsU[i][10] !== "") ? Boolean(rowsU[i][10]) : Boolean(rowsU[i][3])
      };
      tuttiUtenti.push(u);
      if (u.stato === "In Attesa") utentiInAttesa.push(u);
      if (emailRichiedente && uEmail === emailRichiedente) {
        if (u.perm_admin || u.perm_mensa || u.perm_manutenzione || u.perm_spazi) {
          isMaster = true;
        }
      }
    }
  }

  const guasti = [];
  const sManutenzione = ss.getSheetByName(SHEET_MANUTENZIONE);
  if (sManutenzione) {
    const rowsG = sManutenzione.getDataRange().getValues();
    for (let i = 1; i < rowsG.length; i++) {
      const gEmail = String(rowsG[i][2] || "").trim().toLowerCase();
      if (isMaster || (emailRichiedente && gEmail === emailRichiedente)) {
        guasti.push({
          id: String(rowsG[i][0] || ""),
          timestamp: rowsG[i][1] ? String(rowsG[i][1]) : "",
          email: rowsG[i][2] ? String(rowsG[i][2]) : "",
          descrizione: rowsG[i][3] ? String(rowsG[i][3]) : "",
          link_foto: rowsG[i][4] ? String(rowsG[i][4]) : "",
          stato: rowsG[i][5] || "Da fare",
          categoria: rowsG[i][6] || "manutenzione",
          luogo: rowsG[i][7] || "",
          priorita: rowsG[i][8] || "Media",
          note_intervento: rowsG[i][9] || "",
          tecnico: rowsG[i][10] || "",
          data_chiusura: rowsG[i][11] ? String(rowsG[i][11]) : ""
        });
      }
    }
  }

  const result = {
    success: true,
    config: config,
    prenotazioniSpazi: prenotazioniSpazi,
    prenotazioniMensa: prenotazioniMensa,
    bacheca: bacheca,
    accoglienza: accoglienza,
    menuBase: menuBase,
    isMaster: isMaster
  };

  if (isMaster) {
    result.utentiInAttesa = utentiInAttesa;
    result.tuttiUtenti = tuttiUtenti;
    result.guasti = guasti;
  }

  return rispostaJSON(result);
}

/**
 * Salva o aggiorna una riga specifica del foglio Menu_Base
 */
function gestisciSalvaMenuBase(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sMenu = ss.getSheetByName(SHEET_MENU);
  if (!sMenu) {
    gestisciInizializzaMenuBase();
    sMenu = ss.getSheetByName(SHEET_MENU);
  }

  const { settimana, giorno, pasto, primo, secondo, contorno, contorno2, dessert, busta } = payload;
  const rows = sMenu.getDataRange().getValues();
  let rigaTrovata = -1;
  const targetSett = String(settimana || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const targetGiorno = String(giorno || "").toLowerCase().trim();
  const targetPasto = String(pasto || "").toLowerCase().trim();

  for (let i = 1; i < rows.length; i++) {
    const s = String(rows[i][0] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const g = String(rows[i][1] || "").toLowerCase().trim();
    const p = String(rows[i][2] || "").toLowerCase().trim();
    if (s === targetSett && g.startsWith(targetGiorno.substring(0, 3)) && p === targetPasto) {
      rigaTrovata = i + 1;
      break;
    }
  }

  if (rigaTrovata > 0) {
    sMenu.getRange(rigaTrovata, 4, 1, 6).setValues([[
      primo || "",
      secondo || "",
      contorno || "",
      contorno2 || "",
      dessert || "",
      Boolean(busta)
    ]]);
  } else {
    sMenu.appendRow([
      settimana, giorno, pasto, primo || "", secondo || "", contorno || "", contorno2 || "", dessert || "", Boolean(busta)
    ]);
  }

  return rispostaJSON({ success: true, message: "Menu base aggiornato nel foglio Menu_Base" });
}

/**
 * Inizializza o crea il foglio Menu_Base con i 14 giorni di menu standard
 */
function gestisciInizializzaMenuBase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sMenu = ss.getSheetByName(SHEET_MENU);
  if (!sMenu) {
    setupDatabase();
  }
  return rispostaJSON({ success: true, message: "Foglio Menu_Base pronto e verificato!" });
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
        perm_admin: Boolean(rows[i][6]),
        password: rows[i][7] ? String(rows[i][7]) : "",
        notif_manutenzione: Boolean(rows[i][8]),
        notif_spazi: Boolean(rows[i][9]),
        is_utente_mensa: (rows[i][10] !== undefined && rows[i][10] !== "") ? Boolean(rows[i][10]) : Boolean(rows[i][3])
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
        timestamp: rows[i][7],
        ospiti: parseInt(rows[i][8] || 0, 10),
        stato_presenza: String(rows[i][9] || "Presente")
      });
    }
  }

  // 3. Guasti Manutenzione & Servizi Residenza
  const sManutenzione = ss.getSheetByName(SHEET_MANUTENZIONE);
  const guasti = [];
  const emailNorm = String(emailRichiedente || "").trim().toLowerCase();
  
  // Determina se il richiedente è Master o Supermaster
  const utenteRichiedente = utenti.find(u => String(u.email || "").trim().toLowerCase() === emailNorm);
  const isMaster = utenteRichiedente ? (utenteRichiedente.perm_admin || utenteRichiedente.perm_manutenzione || utenteRichiedente.perm_mensa) : false;

  if (sManutenzione) {
    const rows = sManutenzione.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const gEmail = String(rows[i][2] || "").trim().toLowerCase();
      // Regola di riservatezza: solo i master vedono tutte le segnalazioni, l'utente base vede solo le sue
      if (isMaster || (emailNorm && gEmail === emailNorm)) {
        guasti.push({
          id: String(rows[i][0] || ""),
          timestamp: rows[i][1] ? String(rows[i][1]) : "",
          email: rows[i][2] ? String(rows[i][2]) : "",
          descrizione: rows[i][3] ? String(rows[i][3]) : "",
          link_foto: rows[i][4] ? String(rows[i][4]) : "",
          stato: rows[i][5] || "Da fare",
          categoria: rows[i][6] || "manutenzione",
          luogo: rows[i][7] || "",
          priorita: rows[i][8] || "Media",
          note_intervento: rows[i][9] || "",
          tecnico: rows[i][10] || "",
          data_chiusura: rows[i][11] ? String(rows[i][11]) : ""
        });
      }
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

  // 5. Prenotazioni Spazi
  const sSpazi = ss.getSheetByName(SHEET_SPAZI);
  const prenotazioniSpazi = [];
  if (sSpazi) {
    const rowsS = sSpazi.getDataRange().getValues();
    for (let i = 1; i < rowsS.length; i++) {
      if (rowsS[i][0] || rowsS[i][3]) {
        prenotazioniSpazi.push({
          id: String(rowsS[i][0] || ""),
          risorsa: String(rowsS[i][1] || ""),
          data: formattaDataGAS(rowsS[i][2]),
          slot_orario: String(rowsS[i][3] || ""),
          email: String(rowsS[i][4] || "").toLowerCase(),
          stato: String(rowsS[i][6] || "Approvata"),
          approvato_da: String(rowsS[i][7] || "")
        });
      }
    }
  }

  // 6. Accoglienza
  const sAccoglienza = ss.getSheetByName(SHEET_ACCOGLIENZA);
  const accoglienza = [];
  if (sAccoglienza) {
    const rowsA = sAccoglienza.getDataRange().getValues();
    for (let i = 1; i < rowsA.length; i++) {
      if (rowsA[i][0]) {
        accoglienza.push({
          id: String(rowsA[i][0]),
          data_richiesta: rowsA[i][1] ? String(rowsA[i][1]) : "",
          richiedente_email: String(rowsA[i][2] || "").toLowerCase(),
          richiedente_nome: String(rowsA[i][3] || ""),
          nome_ospite: String(rowsA[i][4] || ""),
          numero_ospiti: parseInt(rowsA[i][5] || 1, 10),
          data_checkin: formattaDataGAS(rowsA[i][6]),
          data_checkout: formattaDataGAS(rowsA[i][7]),
          camera_assegnata: String(rowsA[i][8] || ""),
          motivo: String(rowsA[i][9] || ""),
          note: String(rowsA[i][10] || ""),
          stato: String(rowsA[i][11] || "In Attesa 1a Autorizzazione"),
          auth1_email: String(rowsA[i][12] || ""),
          auth1_data: rowsA[i][13] ? String(rowsA[i][13]) : "",
          auth1_note: String(rowsA[i][14] || ""),
          auth2_email: String(rowsA[i][15] || ""),
          auth2_data: rowsA[i][16] ? String(rowsA[i][16]) : "",
          auth2_note: String(rowsA[i][17] || "")
        });
      }
    }
  }

  return rispostaJSON({
    success: true,
    isMaster: isMaster,
    utentiInAttesa: utentiInAttesa,
    tuttiUtenti: utenti,
    mensa: mensa,
    guasti: guasti,
    prenotazioniSpazi: prenotazioniSpazi,
    accoglienza: accoglienza,
    config: config
  });
}

function gestisciAggiornaConfig(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_CONFIG);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_CONFIG);
    sheet.appendRow(["Chiave", "Valore"]);
  }

  const rows = sheet.getDataRange().getValues();

  function aggiornaOInserisci(chiave, valore) {
    if (valore === undefined || valore === null) return;
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === chiave) {
        sheet.getRange(i + 1, 2).setValue(String(valore));
        return;
      }
    }
    sheet.appendRow([chiave, String(valore)]);
  }

  // Aggiorna tutti i campi forniti nel payload
  for (const k in payload) {
    if (k !== "action" && payload[k] !== undefined) {
      aggiornaOInserisci(k, payload[k]);
    }
  }

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

function gestisciImportaEventiCalendario(payload) {
  const eventi = payload.eventi;
  if (!Array.isArray(eventi) || eventi.length === 0) {
    return rispostaJSON({ success: false, error: "Nessun evento fornito per l'importazione" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_BACHECA);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_BACHECA);
    sheet.appendRow(["ID", "Data", "Tipo", "Titolo", "Descrizione", "Autore", "Priorita", "Timestamp"]);
  }

  let importati = 0;
  const nowIso = new Date().toISOString();
  const rowsToAdd = [];

  for (let i = 0; i < eventi.length; i++) {
    const ev = eventi[i];
    if (!ev || !ev.titolo) continue;

    const idVal = ev.id || generaId("BACH");
    const dataVal = ev.data ? String(ev.data).split("T")[0] : Utilities.formatDate(new Date(), "GMT+1", "yyyy-MM-dd");
    const tipoVal = ev.tipo || "evento";
    const titoloVal = String(ev.titolo).trim();
    const descVal = ev.descrizione ? String(ev.descrizione).trim() : "";
    const autoreVal = ev.autore ? String(ev.autore).trim() : "Direzione";
    const prioritaVal = ev.priorita || "normale";

    rowsToAdd.push([
      idVal,
      dataVal,
      tipoVal,
      titoloVal,
      descVal,
      autoreVal,
      prioritaVal,
      nowIso
    ]);
    importati++;
  }

  if (rowsToAdd.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rowsToAdd.length, 8).setValues(rowsToAdd);
  }

  return rispostaJSON({
    success: true,
    count: importati,
    message: importati + " eventi importati con successo nel foglio Bacheca!"
  });
}

// ----------------------------------------------------------------------------
// UTILITY PING & INIZIALIZZAZIONE DATI DA APP A GOOGLE FOGLI
// ----------------------------------------------------------------------------

function gestisciPing() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const fogliNomi = [SHEET_UTENTI, SHEET_MENSA, SHEET_SPAZI, SHEET_MANUTENZIONE, SHEET_CONFIG, SHEET_BACHECA];
  const fogliAttivi = fogliNomi.filter(n => Boolean(ss.getSheetByName(n)));
  
  let totalUtenti = 0;
  const sUtenti = ss.getSheetByName(SHEET_UTENTI);
  if (sUtenti && sUtenti.getLastRow() > 1) {
    totalUtenti = sUtenti.getLastRow() - 1;
  }

  let totalSpazi = 0;
  const sSpazi = ss.getSheetByName(SHEET_SPAZI);
  if (sSpazi && sSpazi.getLastRow() > 1) {
    totalSpazi = sSpazi.getLastRow() - 1;
  }

  let totalBacheca = 0;
  const sBacheca = ss.getSheetByName(SHEET_BACHECA);
  if (sBacheca && sBacheca.getLastRow() > 1) {
    totalBacheca = sBacheca.getLastRow() - 1;
  }

  return rispostaJSON({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    nomeSpreadsheet: ss.getName(),
    fogliAttivi: fogliAttivi,
    conteggi: {
      utenti: totalUtenti,
      spazi: totalSpazi,
      bacheca: totalBacheca
    },
    app: "Residenza Card. Newman API"
  });
}

/**
 * Popola il Google Foglio con utenti iniziali, avvisi e configurazioni se vuoto
 */
function gestisciInizializzaDati(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Assicurati che i fogli esistano
  setupDatabase();

  const { utenti, bacheca, configurazione } = payload;
  let aggiuntiUtenti = 0;
  let aggiuntiBacheca = 0;

  // Popola Utenti
  if (Array.isArray(utenti) && utenti.length > 0) {
    const sUtenti = ss.getSheetByName(SHEET_UTENTI);
    if (sUtenti) {
      const rows = sUtenti.getDataRange().getValues();
      const existingEmails = new Set();
      for (let i = 1; i < rows.length; i++) {
        existingEmails.add(String(rows[i][0]).toLowerCase().trim());
      }

      utenti.forEach(u => {
        const mail = String(u.email || "").toLowerCase().trim();
        if (mail && !existingEmails.has(mail)) {
          sUtenti.appendRow([
            mail,
            u.nome || "Residente",
            u.stato || "Approvato",
            u.perm_mensa !== false,
            u.perm_manutenzione !== false,
            u.perm_spazi !== false,
            Boolean(u.perm_admin)
          ]);
          existingEmails.add(mail);
          aggiuntiUtenti++;
        }
      });
    }
  }

  // Popola Bacheca
  if (Array.isArray(bacheca) && bacheca.length > 0) {
    const sBacheca = ss.getSheetByName(SHEET_BACHECA);
    if (sBacheca) {
      const rowsB = sBacheca.getDataRange().getValues();
      const existingIds = new Set();
      for (let i = 1; i < rowsB.length; i++) {
        existingIds.add(String(rowsB[i][0]));
      }

      bacheca.forEach(b => {
        const id = b.id || generaId("BACH");
        if (!existingIds.has(id)) {
          sBacheca.appendRow([
            id,
            b.data || formattaDataGAS(new Date()),
            b.tipo || "avviso",
            b.titolo || "Avviso",
            b.descrizione || "",
            b.autore || "Direzione",
            b.priorita || "normale",
            new Date().toISOString()
          ]);
          existingIds.add(id);
          aggiuntiBacheca++;
        }
      });
    }
  }

  return rispostaJSON({
    success: true,
    message: `Database sincronizzato con successo! Utenti aggiunti: ${aggiuntiUtenti}, Bacheca: ${aggiuntiBacheca}`,
    aggiuntiUtenti: aggiuntiUtenti,
    aggiuntiBacheca: aggiuntiBacheca
  });
}

/**
 * Invia una notifica email ai destinatari autorizzati (selezionati per ricevere la notifica)
 * Supporta i canali: 'manutenzione', 'spazi' o generico
 */
function inviaNotificaEmailMaster(tipo, oggetto, corpoTesto) {
  try {
    // Retrocompatibilità se chiamata con due argomenti: inviaNotificaEmailMaster(oggetto, corpo)
    if (!corpoTesto) {
      corpoTesto = oggetto;
      oggetto = tipo;
      tipo = "generale";
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let destinatari = [];

    // 1. Cerca nel foglio Utenti chi ha il permesso autorizzato E la spunta esplicita per la notifica
    const sUtenti = ss.getSheetByName(SHEET_UTENTI);
    if (sUtenti) {
      const uRows = sUtenti.getDataRange().getValues();
      for (let u = 1; u < uRows.length; u++) {
        const emailU = String(uRows[u][0]).trim().toLowerCase();
        const pManut = Boolean(uRows[u][4]);
        const pSpazi = Boolean(uRows[u][5]);
        const pAdmin = Boolean(uRows[u][6]);
        const nManut = Boolean(uRows[u][8]);
        const nSpazi = Boolean(uRows[u][9]);

        if (tipo === "manutenzione") {
          // Utente autorizzato alla manutenzione (o admin) con notifica manutenzione attiva
          if ((pManut || pAdmin) && nManut) {
            if (emailU.includes("@") && !destinatari.includes(emailU)) destinatari.push(emailU);
          }
        } else if (tipo === "spazi") {
          // Utente autorizzato agli spazi (o admin) con notifica spazi attiva
          if ((pSpazi || pAdmin) && nSpazi) {
            if (emailU.includes("@") && !destinatari.includes(emailU)) destinatari.push(emailU);
          }
        } else {
          // Generico: chiunque abbia una notifica attiva o admin
          if (pAdmin || nManut || nSpazi) {
            if (emailU.includes("@") && !destinatari.includes(emailU)) destinatari.push(emailU);
          }
        }
      }
    }

    // 2. Se nessun utente è selezionato per la notifica specifica, usa la configurazione generale
    if (destinatari.length === 0) {
      const sConfig = ss.getSheetByName(SHEET_CONFIG);
      if (sConfig) {
        const cRows = sConfig.getDataRange().getValues();
        for (let c = 1; c < cRows.length; c++) {
          if (String(cRows[c][0]) === "Email_Notifiche_Master" && cRows[c][1]) {
            const raw = String(cRows[c][1]).split(",");
            raw.forEach(e => {
              const em = e.trim().toLowerCase();
              if (em.includes("@") && !destinatari.includes(em)) {
                destinatari.push(em);
              }
            });
          }
        }
      }
    }

    // 3. Fallback di sicurezza: Superamministratore
    if (destinatari.length === 0) {
      if (sUtenti) {
        const uRows = sUtenti.getDataRange().getValues();
        for (let u = 1; u < uRows.length; u++) {
          const emailU = String(uRows[u][0]).trim().toLowerCase();
          const pAdmin = Boolean(uRows[u][6]);
          if (pAdmin && emailU.includes("@") && !destinatari.includes(emailU)) {
            destinatari.push(emailU);
          }
        }
      }
    }

    // 4. Fallback estremo per don Andrea Dotti
    if (destinatari.length === 0) {
      destinatari.push("donandreadotti@gmail.com");
    }

    // Invia email a ciascun destinatario selezionato
    for (let i = 0; i < destinatari.length; i++) {
      MailApp.sendEmail({
        to: destinatari[i],
        subject: oggetto,
        body: corpoTesto
      });
    }
  } catch (errEmail) {
    Logger.log("Errore durante l'invio della notifica email Master: " + errEmail.toString());
  }
}

// ----------------------------------------------------------------------------
// GESTIONE ACCOGLIENZA (OSPITALITÀ IN CAMERA CON RIGOROSA DOPPIA AUTORIZZAZIONE)
// ----------------------------------------------------------------------------

function gestisciRichiestaAccoglienza(payload) {
  const email = (payload.email || "").trim().toLowerCase();
  const nome = payload.nome || "";
  const nome_ospite = (payload.nome_ospite || "").trim();
  const numero_ospiti = Math.max(1, parseInt(payload.numero_ospiti || 1, 10));
  const data_checkin = payload.data_checkin;
  const data_checkout = payload.data_checkout;
  const motivo = payload.motivo || "";
  const note = payload.note || "";
  const camera_preferita = payload.camera_preferita || "";

  if (!email || !nome_ospite || !data_checkin || !data_checkout) {
    return rispostaJSON({ success: false, error: "Campi obbligatori mancanti per la richiesta di ospitalità" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_ACCOGLIENZA);
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName(SHEET_ACCOGLIENZA);
  }

  const id = generaId("ACC");
  const dataRichiesta = new Date().toISOString();
  const stato = "In Attesa 1a Autorizzazione";

  sheet.appendRow([
    id,
    dataRichiesta,
    email,
    nome,
    nome_ospite,
    numero_ospiti,
    formattaDataGAS(data_checkin),
    formattaDataGAS(data_checkout),
    camera_preferita,
    motivo,
    note,
    stato,
    "", // Auth1_Email
    "", // Auth1_Data
    "", // Auth1_Note
    "", // Auth2_Email
    "", // Auth2_Data
    ""  // Auth2_Note
  ]);

  inviaNotificaEmailMaster(
    "generale",
    "[Residenza Newman] Nuova Richiesta Ospitalità Camere da Autorizzare",
    "Il residente " + (nome || email) + " ha inviato una richiesta di ospitalità per l'ospite " + nome_ospite + " (" + formattaDataGAS(data_checkin) + " - " + formattaDataGAS(data_checkout) + ").\nStato: In Attesa 1a Autorizzazione."
  );

  return rispostaJSON({ success: true, id: id, message: "Richiesta di ospitalità inviata. In attesa della 1a autorizzazione con assegnazione camera." });
}

function gestisciAutorizza1Accoglienza(payload) {
  const { id, approvatoreEmail, camera_assegnata, note } = payload;
  if (!id || !camera_assegnata) {
    return rispostaJSON({ success: false, error: "ID richiesta e Camera assegnata obbligatori" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ACCOGLIENZA);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Accoglienza non trovato" });

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      const checkin = String(rows[i][6]);
      const checkout = String(rows[i][7]);

      // Verifica che la camera non sia già occupata da una prenotazione confermata o autorizzata
      for (let j = 1; j < rows.length; j++) {
        if (j !== i && String(rows[j][8]) === String(camera_assegnata) && String(rows[j][11]) !== "Rifiutata") {
          const cIn = String(rows[j][6]);
          const cOut = String(rows[j][7]);
          if (checkin < cOut && cIn < checkout) {
            return rispostaJSON({
              success: false,
              error: "La camera " + camera_assegnata + " è già occupata nelle date richieste (" + formattaDataGAS(cIn) + " - " + formattaDataGAS(cOut) + ")."
            });
          }
        }
      }

      sheet.getRange(i + 1, 9).setValue(String(camera_assegnata));
      sheet.getRange(i + 1, 12).setValue("1a Autorizzazione Concessa");
      sheet.getRange(i + 1, 13).setValue(String(approvatoreEmail || "").toLowerCase());
      sheet.getRange(i + 1, 14).setValue(new Date().toISOString());
      sheet.getRange(i + 1, 15).setValue(note || "");

      inviaNotificaEmailMaster(
        "generale",
        "[Residenza Newman] Accoglienza: 1a Autorizzazione Concessa",
        "La richiesta per l'ospite " + rows[i][4] + " è stata autorizzata con assegnazione della " + camera_assegnata + " da " + approvatoreEmail + ".\nÈ necessaria la 2a autorizzazione per confermare definitivamente il soggiorno."
      );

      return rispostaJSON({ success: true, message: "1a autorizzazione registrata. Camera assegnata: " + camera_assegnata });
    }
  }

  return rispostaJSON({ success: false, error: "Richiesta non trovata" });
}

function gestisciAutorizza2Accoglienza(payload) {
  const { id, approvatoreEmail, note } = payload;
  if (!id) return rispostaJSON({ success: false, error: "ID richiesta obbligatorio" });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ACCOGLIENZA);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Accoglienza non trovato" });

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      const statoAttuale = String(rows[i][11]);
      if (statoAttuale !== "1a Autorizzazione Concessa") {
        return rispostaJSON({ success: false, error: "La richiesta non ha ancora ricevuto la 1a autorizzazione con assegnazione camera." });
      }

      sheet.getRange(i + 1, 12).setValue("Confermata");
      sheet.getRange(i + 1, 16).setValue(String(approvatoreEmail || "").toLowerCase());
      sheet.getRange(i + 1, 17).setValue(new Date().toISOString());
      sheet.getRange(i + 1, 18).setValue(note || "");

      return rispostaJSON({ success: true, message: "2a autorizzazione completata con successo! Prenotazione camera confermata." });
    }
  }

  return rispostaJSON({ success: false, error: "Richiesta non trovata" });
}

function gestisciRifiutaAccoglienza(payload) {
  const { id, approvatoreEmail, note } = payload;
  if (!id) return rispostaJSON({ success: false, error: "ID richiesta mancante" });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ACCOGLIENZA);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Accoglienza non trovato" });

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 12).setValue("Rifiutata");
      sheet.getRange(i + 1, 15).setValue("Rifiutata da " + approvatoreEmail + (note ? ": " + note : ""));
      return rispostaJSON({ success: true, message: "Richiesta di ospitalità contrassegnata come Rifiutata" });
    }
  }

  return rispostaJSON({ success: false, error: "Richiesta non trovata" });
}

function gestisciCancellaAccoglienza(payload) {
  const { id } = payload;
  if (!id) return rispostaJSON({ success: false, error: "ID richiesta mancante" });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ACCOGLIENZA);
  if (!sheet) return rispostaJSON({ success: false, error: "Foglio Accoglienza non trovato" });

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return rispostaJSON({ success: true, message: "Richiesta cancellata con successo" });
    }
  }

  return rispostaJSON({ success: false, error: "Richiesta non trovata" });
}

function gestisciGetAccoglienzaData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ACCOGLIENZA);
  const lista = [];
  if (sheet) {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        lista.push({
          id: String(rows[i][0]),
          data_richiesta: rows[i][1] ? String(rows[i][1]) : "",
          richiedente_email: String(rows[i][2] || "").toLowerCase(),
          richiedente_nome: String(rows[i][3] || ""),
          nome_ospite: String(rows[i][4] || ""),
          numero_ospiti: parseInt(rows[i][5] || 1, 10),
          data_checkin: formattaDataGAS(rows[i][6]),
          data_checkout: formattaDataGAS(rows[i][7]),
          camera_assegnata: String(rows[i][8] || ""),
          motivo: String(rows[i][9] || ""),
          note: String(rows[i][10] || ""),
          stato: String(rows[i][11] || "In Attesa 1a Autorizzazione"),
          auth1_email: String(rows[i][12] || ""),
          auth1_data: rows[i][13] ? String(rows[i][13]) : "",
          auth1_note: String(rows[i][14] || ""),
          auth2_email: String(rows[i][15] || ""),
          auth2_data: rows[i][16] ? String(rows[i][16]) : "",
          auth2_note: String(rows[i][17] || "")
        });
      }
    }
  }
  return rispostaJSON({ success: true, accoglienza: lista });
}

/**
 * ============================================================================
 * MODULO AGGIUNTIVO: LOGICA CONTATORE MENSA CON DEFAULT & PRESENZE RESIDENTI
 * ============================================================================
 * Funzioni aggiuntive per il calcolo automatico dei pasti:
 * - Parte di default con tutti i residenti abilitati presenti
 * - Sottrae chi ha esplicitamente contrassegnato l'assenza
 * - Esclude dalla regola automatica i pasti contrassegnati dalla busta
 *   (la busta va prenotata/esplicitata e non è assegnata di default)
 * ============================================================================
 */

/**
 * Verifica se un dato pasto è contrassegnato come "Busta" (pranzo al sacco).
 * Di default il martedì e giovedì a pranzo, o in base alla colonna OpzioneBusta del menu.
 */
function isPastoBustaGiornoGAS(dataVal, tipoPasto) {
  if (String(tipoPasto || "").trim().toLowerCase() !== "pranzo") return false;
  let d;
  if (dataVal instanceof Date) d = dataVal;
  else {
    const s = String(dataVal).split("T")[0];
    d = new Date(s + "T12:00:00");
  }
  const dayOfWeek = d.getDay(); // 2 = martedì, 4 = giovedì
  if (dayOfWeek === 2 || dayOfWeek === 4) return true;

  // Controllo su foglio Menu_Base se presente
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sMenu = ss.getSheetByName(SHEET_MENU);
    if (sMenu) {
      const rows = sMenu.getDataRange().getValues();
      const giorni = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];
      const nomeGiorno = giorni[dayOfWeek];
      for (let i = 1; i < rows.length; i++) {
        const g = String(rows[i][1] || "").toLowerCase().trim();
        const p = String(rows[i][2] || "").toLowerCase().trim();
        const busta = Boolean(rows[i][8] === true || String(rows[i][8]).toLowerCase() === "true");
        if (g === nomeGiorno && p === "pranzo" && busta) {
          return true;
        }
      }
    }
  } catch (err) {}
  return false;
}

/**
 * Calcola il conteggio dettagliato dei pasti per una data e un tipo di pasto:
 * 1. Residenti abilitati alla mensa (Utenti con Stato = "Approvato" e Is_Utente_Mensa != false).
 * 2. Se il pasto è contrassegnato dalla busta, la regola automatica è esclusa:
 *    si contano solo le buste esplicitamente prenotate (+ ospiti).
 * 3. Se il pasto è normale in sala:
 *    tutti i residenti partono come presenti di default, sottraendo chi ha segnato "Assente"
 *    e chi ha richiesto la busta da asporto, sommando gli ospiti registrati.
 */
function calcolaContatoreMensaDefaultGAS(dataTarget, tipoPasto) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const targetDataStr = formattaDataGAS(dataTarget);
  const targetPastoNorm = String(tipoPasto || "pranzo").trim().toLowerCase();
  const isBustaMeal = isPastoBustaGiornoGAS(dataTarget, targetPastoNorm);

  // 1. Recupera tutti i residenti mensa abilitati
  const residentiMensa = [];
  const sUtenti = ss.getSheetByName(SHEET_UTENTI);
  if (sUtenti) {
    const rowsU = sUtenti.getDataRange().getValues();
    for (let i = 1; i < rowsU.length; i++) {
      const email = String(rowsU[i][0] || "").trim().toLowerCase();
      const nome = String(rowsU[i][1] || "");
      const stato = String(rowsU[i][2] || "");
      const isMensa = (rowsU[i][10] !== undefined && rowsU[i][10] !== "") ? Boolean(rowsU[i][10]) : Boolean(rowsU[i][3]);
      if (email && stato === "Approvato" && isMensa) {
        residentiMensa.push({ email: email, nome: nome });
      }
    }
  }

  // 2. Recupera le registrazioni effettive da Mensa
  const sMensa = ss.getSheetByName(SHEET_MENSA);
  const prenotazioniMap = {};
  if (sMensa) {
    const rowsM = sMensa.getDataRange().getValues();
    for (let i = 1; i < rowsM.length; i++) {
      const rowData = formattaDataGAS(rowsM[i][1]);
      const rowEmail = String(rowsM[i][2] || "").trim().toLowerCase();
      const rowPasto = String(rowsM[i][3] || "").trim().toLowerCase();
      if (rowData === targetDataStr && rowPasto === targetPastoNorm) {
        prenotazioniMap[rowEmail] = {
          id: String(rowsM[i][0]),
          busta: Boolean(rowsM[i][4]),
          ritardo: Boolean(rowsM[i][5]),
          note: String(rowsM[i][6] || ""),
          ospiti: Math.max(0, parseInt(rowsM[i][8] || 0, 10)),
          stato_presenza: String(rowsM[i][9] || "Presente")
        };
      }
    }
  }

  // Se pasto contrassegnato dalla busta (es. pranzo martedì/giovedì)
  if (isBustaMeal) {
    let totBuste = 0;
    let totOspiti = 0;
    let totRitardi = 0;
    let totAssenti = 0;
    const listaBuste = [];

    Object.keys(prenotazioniMap).forEach(function(email) {
      const p = prenotazioniMap[email];
      const isAss = (p.stato_presenza === "assente" || p.stato_presenza === "Assente");
      if (isAss) {
        totAssenti++;
      } else if (p.busta) {
        totBuste += (1 + p.ospiti);
        totOspiti += p.ospiti;
        if (p.ritardo) totRitardi++;
        listaBuste.push({ email: email, ospiti: p.ospiti, ritardo: p.ritardo, note: p.note });
      }
    });

    return {
      success: true,
      data: targetDataStr,
      tipo_pasto: targetPastoNorm,
      isBustaGiorno: true,
      totalePasti: totBuste,
      inSala: 0,
      buste: totBuste,
      assenti: totAssenti,
      ritardi: totRitardi,
      ospitiTotali: totOspiti,
      dettaglioBuste: listaBuste
    };
  }

  // Pasto normale in sala (pranzi regolari e cene)
  let countAssenti = 0;
  let countBuste = 0;
  let countRitardi = 0;
  let ospitiTotali = 0;
  const elencoPresenti = [];

  residentiMensa.forEach(function(u) {
    const p = prenotazioniMap[u.email];
    const isAss = p && (p.stato_presenza === "assente" || p.stato_presenza === "Assente");
    const haBusta = p && Boolean(p.busta);
    const inRit = p && Boolean(p.ritardo);
    const numOsp = p ? p.ospiti : 0;

    if (isAss) {
      countAssenti++;
    } else if (haBusta) {
      countBuste += (1 + numOsp);
      ospitiTotali += numOsp;
      elencoPresenti.push({ email: u.email, nome: u.nome, busta: true, ritardo: inRit, ospiti: numOsp, default: false });
    } else {
      if (inRit) countRitardi++;
      ospitiTotali += numOsp;
      elencoPresenti.push({ email: u.email, nome: u.nome, busta: false, ritardo: inRit, ospiti: numOsp, default: !p });
    }
  });

  const baseResidenti = residentiMensa.length;
  const inSala = Math.max(0, baseResidenti - countAssenti - countBuste) + (ospitiTotali);
  const totalePasti = inSala + countBuste;

  return {
    success: true,
    data: targetDataStr,
    tipo_pasto: targetPastoNorm,
    isBustaGiorno: false,
    baseResidentiDefault: baseResidenti,
    totalePasti: totalePasti,
    inSala: inSala,
    buste: countBuste,
    assenti: countAssenti,
    ritardi: countRitardi,
    ospitiTotali: ospitiTotali,
    elencoPresenti: elencoPresenti
  };
}

/**
 * Handler POST aggiuntivo per ottenere il conteggio pasti con logica di default
 */
function gestisciGetConteggioMensaDefault(payload) {
  const data = payload && payload.data ? payload.data : Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+1", "yyyy-MM-dd");
  const tipoPasto = payload && payload.tipo_pasto ? payload.tipo_pasto : "pranzo";
  const ris = calcolaContatoreMensaDefaultGAS(data, tipoPasto);
  return rispostaJSON(ris);
}

/**
 * Handler POST aggiuntivo per segnare rapidamente l'assenza dal frontend
 */
function gestisciSegnaAssenzaRapida(payload) {
  payload.stato_presenza = "Assente";
  payload.busta = false;
  payload.ritardo = false;
  payload.ospiti = 0;
  return gestisciPrenotazioneMensa(payload);
}

/**
 * Handler POST aggiuntivo per aggiornare rapidamente il numero di ospiti
 */
function gestisciAggiornaOspitiRapido(payload) {
  payload.stato_presenza = payload.stato_presenza || "Presente";
  return gestisciPrenotazioneMensa(payload);
}



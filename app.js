/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - FRONTEND LOGIC (app.js)
 * ============================================================================
 * Single Page Application Mobile-First
 * Vanilla JavaScript ES6+ - Zero dipendenze esterne
 * ============================================================================
 */

// Costanti di Configurazione e Chiavi Storage
const STORAGE_KEYS = {
  USER: "newman_user_data",
  BACKEND_URL: "newman_gas_backend_url",
  LOCAL_DB: "newman_local_mock_db",
  BYPASS_TIME_LOCK: "newman_bypass_time_lock"
};

// Data di ancoraggio per la Settimana 1 del Menu: 20 Luglio 2026
const MENU_ANCHOR_DATE = new Date("2026-07-20T00:00:00");

// Componenti standard della Busta (Pranzo al Sacco - Martedì e Giovedì)
const CLASSICI_BUSTA = [
  { icon: "🥖", nome: "Panino o Focaccia imbottita", desc: "Farcito con salumi o formaggi" },
  { icon: "🍎", nome: "Frutta fresca di stagione", desc: "Mela, banana o frutto del giorno (o succo)" },
  { icon: "🍪", nome: "Snack / Dolce", desc: "Biscotti o merendina confezionata" },
  { icon: "💧", nome: "Acqua minerale", desc: "Bottiglietta da 50 cl" }
];

// Menu ciclico di 14 giorni (Settimana 1 e Settimana 2)
// NOTA: Il martedì e il giovedì a pranzo non c'è un menù cotto, sono previsti i classici di busta (salvo variazione della cuoca).
const MENU_14_GIORNI = {
  settimana1: {
    lunedi: {
      pranzo: { primo: "Pasta al pomodoro e basilico fresco", secondo: "Arista di maiale al forno con patate", contorno: "Insalata mista di stagione", dessert: "Frutta fresca" },
      cena: { primo: "Minestrone di verdure con crostoni", secondo: "Frittata campagnola con zucchine", contorno: "Carote novelle al vapore", dessert: "Yogurt artigianale" }
    },
    martedi: {
      pranzo: { isBustaClassica: true, bustaOnly: true, note: "Martedì: Classici di busta (salvo variazione cuoca)" },
      cena: { primo: "Risotto allo zafferano e parmigiano", secondo: "Petto di pollo alla piastra con limone", contorno: "Spinaci saltati con pinoli", dessert: "Frutta fresca" }
    },
    mercoledi: {
      pranzo: { primo: "Fusilli al pesto genovese", secondo: "Merluzzo al pomodoro e olive taggiasche", contorno: "Fagiolini all'agro", dessert: "Budino alla vaniglia" },
      cena: { primo: "Passato di zucca e carote", secondo: "Caciotta fresca con pomodori", contorno: "Verdure grigliate", dessert: "Frutta fresca" }
    },
    giovedi: {
      pranzo: { isBustaClassica: true, bustaOnly: true, note: "Giovedì: Classici di busta (salvo variazione cuoca)" },
      cena: { primo: "Gnocchi alla sorrentina con mozzarella", secondo: "Scaloppine ai funghi trifolati", contorno: "Insalata mista", dessert: "Gelato fior di latte" }
    },
    venerdi: {
      pranzo: { primo: "Penne all'arrabbiata", secondo: "Orata al cartoccio con erbe aromatiche", contorno: "Patate lesse prezzemolate", dessert: "Macedonia di stagione" },
      cena: { primo: "Zuppa di lenticchie e farro", secondo: "Tortino di uova e bietole", contorno: "Finocchi in insalata con arance", dessert: "Frutta fresca" }
    },
    sabato: {
      pranzo: { primo: "Pasta al forno gratinata", secondo: "Bocconcini di vitello con piselli", contorno: "Insalata capricciosa", dessert: "Frutta fresca" },
      cena: { primo: "Crema di patate e porri", secondo: "Mozzarella di bufala e prosciutto crudo", contorno: "Pomodori ramati all'origano", dessert: "Dolce della casa" }
    },
    domenica: {
      pranzo: { primo: "Lasagne alla bolognese della tradizione", secondo: "Arrosto di vitello con salsa delicata", contorno: "Patate rustiche al rosmarino", dessert: "Tiramisù classico" },
      cena: { primo: "Brodo caldo con tortellini", secondo: "Formaggi tipici e miele", contorno: "Insalata mista", dessert: "Frutta fresca" }
    }
  },
  settimana2: {
    lunedi: {
      pranzo: { primo: "Spaghetti alla carbonara delicata", secondo: "Polpette della nonna al sugo", contorno: "Piselli stufati con cipolla", dessert: "Frutta fresca" },
      cena: { primo: "Vellutata di piselli e menta", secondo: "Ricotta fresca con olio e pepe", contorno: "Zucchine trifolate", dessert: "Mela cotta alla cannella" }
    },
    martedi: {
      pranzo: { isBustaClassica: true, bustaOnly: true, note: "Martedì: Classici di busta (salvo variazione cuoca)" },
      cena: { primo: "Pasta e ceci alla romana", secondo: "Fesa di tacchino arrosto con erbe", contorno: "Purè di patate soffice", dessert: "Frutta fresca" }
    },
    mercoledi: {
      pranzo: { primo: "Rigatoni all'amatriciana", secondo: "Filetto di platessa dorato", contorno: "Insalata mista con mais", dessert: "Panna cotta ai frutti di bosco" },
      cena: { primo: "Minestra di riso e verdure", secondo: "Stracchino e affettato magro", contorno: "Carciofi alla romana", dessert: "Frutta fresca" }
    },
    giovedi: {
      pranzo: { isBustaClassica: true, bustaOnly: true, note: "Giovedì: Classici di busta (salvo variazione cuoca)" },
      cena: { primo: "Risotto con radicchio e provola", secondo: "Cosce di pollo al forno con timo", contorno: "Broccoli ripassati", dessert: "Frutta fresca" }
    },
    venerdi: {
      pranzo: { primo: "Tagliatelle al salmone affumicato (o sugo vegetale)", secondo: "Calamari in umido con piselli", contorno: "Insalata mista", dessert: "Sorbetto al limone" },
      cena: { primo: "Zuppa toscana di fagioli cannellini", secondo: "Uova in camicia su crostone integrale", contorno: "Bietole all'agro", dessert: "Frutta fresca" }
    },
    sabato: {
      pranzo: { primo: "Pasta con crema di zucchine e speck", secondo: "Lonza di maiale all'arancia", contorno: "Patate sabbiate al forno", dessert: "Frutta fresca" },
      cena: { primo: "Passato di verdure miste", secondo: "Piatto freddo di bresaola, rucola e grana", contorno: "Verdure al vapore", dessert: "Torta di mele" }
    },
    domenica: {
      pranzo: { primo: "Cannelloni ricotta e spinaci", secondo: "Spezzatino di manzo con funghi", contorno: "Patate novelle al forno", dessert: "Profiteroles al cioccolato" },
      cena: { primo: "Vellutata di funghi champignon con crostini", secondo: "Selezione formaggi con mostarda", contorno: "Insalata valeriana e noci", dessert: "Frutta fresca" }
    }
  }
};

// Database Mock Locale iniziale (attivo quando non è configurato un backend GAS)
const INITIAL_MOCK_DB = {
  utenti: [
    { email: "donandreadotti@gmail.com", nome: "Don Andrea Dotti", stato: "Approvato", perm_mensa: true, perm_manutenzione: true, perm_spazi: true, perm_admin: true },
    { email: "donrocco@newman.it", nome: "Don Rocco", stato: "Approvato", perm_mensa: false, perm_manutenzione: false, perm_spazi: true, perm_admin: false },
    { email: "donsergio@newman.it", nome: "Don Sergio", stato: "Approvato", perm_mensa: true, perm_manutenzione: false, perm_spazi: true, perm_admin: false },
    { email: "francesco.studente@newman.it", nome: "Francesco Rossi", stato: "In Attesa", perm_mensa: false, perm_manutenzione: false, perm_spazi: false, perm_admin: false }
  ],
  mensa: [
    { id: "M_001", data: "2026-09-16", email: "donrocco@newman.it", tipo_pasto: "pranzo", busta: false, ritardo: false, note: "Piatto standard", timestamp: "2026-09-16T09:00:00Z" },
    { id: "M_002", data: "2026-09-16", email: "donandreadotti@gmail.com", tipo_pasto: "pranzo", busta: false, ritardo: true, note: "Arrivo alle 13:45 causa lezioni", timestamp: "2026-09-16T09:30:00Z" }
  ],
  prenotazioni_spazi: [
    { id: "S_001", risorsa: "Chiesa", data: "2026-09-16", slot_orario: "07:00 - 07:30", email: "donrocco@newman.it", timestamp: "2026-09-15T20:00:00Z" },
    { id: "S_002", risorsa: "Sala TV", data: "2026-09-16", slot_orario: "20:30 - 21:00", email: "donsergio@newman.it", timestamp: "2026-09-15T21:00:00Z" },
    { id: "S_003", risorsa: "Chiesa", data: "2026-09-16", slot_orario: "18:00 - 18:30", email: "donandreadotti@gmail.com", timestamp: "2026-09-16T08:00:00Z" }
  ],
  bacheca: [
    {
      id: "B_001",
      tipo: "compleanno",
      data: "2026-09-16",
      titolo: "Buon Compleanno Don Andrea Dotti!",
      descrizione: "La comunità della Residenza si unisce in preghiera e festa per il compleanno del nostro Padre Direttore!",
      autore: "Direzione",
      priorita: "alta",
      timestamp: "2026-09-16T06:00:00Z"
    },
    {
      id: "B_002",
      tipo: "anniversario",
      data: "2026-09-16",
      titolo: "Anniversario di Ordinazione Presbiterale",
      descrizione: "15° anniversario sacerdotale di Don Rocco. Ricordiamolo con gratitudine nella S. Messa comunitaria.",
      autore: "Comunità",
      priorita: "normale",
      timestamp: "2026-09-16T06:30:00Z"
    },
    {
      id: "B_003",
      tipo: "evento",
      data: "2026-09-16",
      titolo: "Proiezione Partita & Serata Fraterna in Sala TV",
      descrizione: "Stasera dalle ore 20:45 visione comunitaria in Sala TV con tisane e biscotti per tutti i residenti.",
      autore: "Comitato Residenti",
      priorita: "normale",
      timestamp: "2026-09-16T08:00:00Z"
    },
    {
      id: "B_004",
      tipo: "avviso",
      data: "2026-09-17",
      titolo: "Ritiro Spirituale di Inizio Anno Accademico",
      descrizione: "Sabato mattina momento di meditazione e adorazione in Cappella guidato dal Padre Spirituale, seguito da pranzo insieme.",
      autore: "Direzione",
      priorita: "alta",
      timestamp: "2026-09-15T10:00:00Z"
    }
  ],
  manutenzione: [
    { id: "G_001", timestamp: "2026-09-14T11:20:00Z", email: "donrocco@newman.it", descrizione: "Perdita d'acqua dal rubinetto del lavabo al piano 2", link_foto: "", stato: "Da fare" },
    { id: "G_002", timestamp: "2026-09-12T16:00:00Z", email: "donandreadotti@gmail.com", descrizione: "Sostituita lampadina nel corridoio est", link_foto: "", stato: "Risolto" }
  ],
  configurazione: {
    Data_Variazione_Menu: "2026-09-16",
    Testo_Variazione: "Oggi a pranzo dessert sostituito con Gelato artigianale offerto dalla Direzione per la festa della Residenza!",
    Pasto_Variazione: "pranzo",
    Info_Regolamento: `REGOLAMENTO INTERNO DELLA RESIDENZA CARDINAL NEWMAN
1. VITA COMUNITARIA: Il clima di studio, preghiera e fraternità sacerdotale e accademica è alla base della nostra convivenza.
2. ORARI DI SILENZIO: Dalle ore 23:00 alle ore 07:30 del mattino è richiesto il silenzio nei corridoi e negli spazi comuni per favorire il riposo e la preghiera.
3. MENSA COMUNITARIA:
   • Pranzo alle 14:30 (prenotazioni e disdette aperte fino alle 13:30, 1h prima).
   • Cena alle 19:30 (prenotazioni e disdette aperte fino alle 18:30, 1h prima).
   • Martedì e Giovedì a pranzo: sono previsti i classici di busta (pranzo al sacco da asporto), sempre con possibilità di variazione straordinaria da parte della cuoca.
4. PRENOTAZIONE DEGLI SPAZI COMUNI:
   • Gli unici spazi soggetti a prenotazione sono la Chiesa / Cappella e la Sala TV.
   • Le prenotazioni avvengono a slot di 30 minuti ciascuno. Non è richiesta conferma previa: la prenotazione è immediatamente attiva.
   • Riservatezza: l'utente visualizza le proprie prenotazioni; il Master visualizza l'occupante; tutti gli altri residenti vedono lo slot come 'Occupato'.
5. MANUTENZIONE E CURA DEI LOCALI:
   • Qualsiasi guasto o anomalia in camera o nelle aree comuni va tempestivamente registrato nell'apposita sezione Guasti.`,
    Info_Contatti: `CONTATTI E RECAPITI DELLA RESIDENZA:
• Portineria / Accoglienza: Tel. +39 06 87654321 (Int. 101) - Attiva 07:00 - 22:30
• Direzione Generale: direzione@residenzanewman.org (Int. 102)
• Emergenze Notturne Custode: +39 333 1122334
• Economato & Servizio Mensa: mensa@residenzanewman.org
• Assistenza Tecnica Manutenzione: manutenzione@residenzanewman.org`
  }
};

/**
 * Stato Globale dell'Applicazione nel Frontend
 */
const appState = {
  user: null,                  // Oggetto utente correntemente loggato
  backendUrl: "",              // URL Google Apps Script Web App
  currentTab: "info",          // Tab corrente: info | mensa | spazi | residenza | manutenzione | master
  mensaViewMode: "settimana",  // "settimana" (default panoramica scorrevole) oppure "giorno"
  selectedDateMensa: null,     // Data selezionata per la mensa (oggetto Date)
  cachedConfig: {},            // Configurazione scaricata dal backend
  prenotazioniSpazi: [],       // Prenotazioni spazi scaricate
  bacheca: [],                 // Elementi bacheca (compleanni, anniversari, eventi, avvisi)
  selectedBachecaDate: null,   // Data selezionata per la visualizzazione bacheca (oggetto Date)
  selectedSpazioRisorsa: "Chiesa", // Risorsa attiva: "Chiesa" oppure "Sala TV"
  selectedSpazioData: "",      // Data selezionata per prenotazione spazi (YYYY-MM-DD)
  selectedSpazioFascia: "tutti", // Filtro fascia: tutti | mattina | pomeriggio | sera
  mensaBookings: [],           // Prenotazioni mensa
  guasti: [],                  // Lista guasti
  utentiInAttesa: [],          // Lista utenti in attesa (per Admin)
  compressedImageBase64: null, // Stringa JPEG compressa dal canvas
  isOfflineMode: false,
  bypassTimeLock: false
};

// ----------------------------------------------------------------------------
// INIZIALIZZAZIONE DELL'APP
// ----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  initDateSelectorMensa();
  setupEventListeners();
  checkAuthAndLoad();
});

/**
 * Inizializza impostazioni dal localStorage
 */
function initStorage() {
  appState.backendUrl = localStorage.getItem(STORAGE_KEYS.BACKEND_URL) || "";
  appState.bypassTimeLock = localStorage.getItem(STORAGE_KEYS.BYPASS_TIME_LOCK) === "true";
  appState.selectedBachecaDate = new Date();
  appState.selectedSpazioData = formatYMD(new Date());

  // Se non c'è il DB mock in localStorage o se manca la bacheca, aggiornalo con dati iniziali
  const savedDbStr = localStorage.getItem(STORAGE_KEYS.LOCAL_DB);
  if (!savedDbStr) {
    localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(INITIAL_MOCK_DB));
  } else {
    try {
      const parsed = JSON.parse(savedDbStr);
      let needsSave = false;
      if (!parsed.bacheca || parsed.bacheca.length === 0) {
        parsed.bacheca = INITIAL_MOCK_DB.bacheca;
        needsSave = true;
      }
      // Pulisci vecchi spazi diversi da Chiesa e Sala TV se presenti
      if (parsed.prenotazioni_spazi) {
        const valid = parsed.prenotazioni_spazi.filter(p => p.risorsa === "Chiesa" || p.risorsa === "Sala TV");
        if (valid.length !== parsed.prenotazioni_spazi.length) {
          parsed.prenotazioni_spazi = valid;
          needsSave = true;
        }
      }
      if (needsSave) {
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(parsed));
      }
    } catch (e) {
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(INITIAL_MOCK_DB));
    }
  }

  // Se non c'è URL GAS, l'app usa il Mock locale
  appState.isOfflineMode = !appState.backendUrl;
  aggiornaIndicatoreConnessione();
}

/**
 * Verifica se l'utente è già loggato
 */
function checkAuthAndLoad() {
  const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
  if (savedUser) {
    try {
      appState.user = JSON.parse(savedUser);
      aggiornaUIUtente();
      caricaDatiBackend();
      return;
    } catch (e) {
      console.error("Errore parse utente:", e);
    }
  }
  // Mostra modal di login se non loggato
  mostraModalAuth(true);
}

// ----------------------------------------------------------------------------
// LAYER DI RETE E API (GOOGLE APPS SCRIPT / LOCAL MOCK)
// ----------------------------------------------------------------------------

/**
 * Esegue una chiamata all'API GAS con fallback automatico al database locale
 */
async function callApi(action, params = {}) {
  const payload = { action, ...params };

  // Se è configurato un backend Google Apps Script valido
  if (appState.backendUrl && !appState.isOfflineMode) {
    try {
      const response = await fetch(appState.backendUrl, {
        method: "POST",
        // Inviando text/plain si evitano complesse pre-flight CORS con GAS
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn("Chiamata a Google Apps Script fallita. Uso fallback locale temporaneo.", err);
      mostraToast("Server GAS non raggiungibile. Operazione in modalità locale.", "warning");
      return mockBackendExecution(action, params);
    }
  } else {
    // Modalità Demo Locale pura
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockBackendExecution(action, params));
      }, 250);
    });
  }
}

/**
 * Simulatore Backend per funzionamento standalone immediato
 */
function mockBackendExecution(action, params) {
  const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_DB) || JSON.stringify(INITIAL_MOCK_DB));

  switch (action) {
    case "login": {
      const email = String(params.email || "").trim().toLowerCase();
      const utente = db.utenti.find(u => u.email.toLowerCase() === email);
      if (utente) {
        return { success: true, utente };
      }
      return { success: false, notFound: true, message: "Utente non presente" };
    }

    case "registraUtente": {
      const email = String(params.email || "").trim().toLowerCase();
      const nome = String(params.nome || "").trim();
      const exists = db.utenti.some(u => u.email.toLowerCase() === email);
      if (exists) return { success: false, error: "Email già registrata" };

      const nuovo = { email, nome, stato: "In Attesa", perm_mensa: false, perm_manutenzione: false, perm_spazi: false, perm_admin: false };
      db.utenti.push(nuovo);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, status: "In Attesa", message: "Registrazione inviata con successo!" };
    }

    case "approvaUtente": {
      const emailTarget = String(params.emailTarget || "").trim().toLowerCase();
      const idx = db.utenti.findIndex(u => u.email.toLowerCase() === emailTarget);
      if (idx !== -1) {
        db.utenti[idx].stato = "Approvato";
        if (params.perm_mensa !== undefined) db.utenti[idx].perm_mensa = Boolean(params.perm_mensa);
        if (params.perm_manutenzione !== undefined) db.utenti[idx].perm_manutenzione = Boolean(params.perm_manutenzione);
        if (params.perm_spazi !== undefined) db.utenti[idx].perm_spazi = Boolean(params.perm_spazi);
        if (params.perm_admin !== undefined) db.utenti[idx].perm_admin = Boolean(params.perm_admin);
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, message: "Utente approvato!" };
      }
      return { success: false, error: "Utente non trovato" };
    }

    case "prenotaMensa": {
      const { data, email, tipo_pasto, busta, ritardo, note } = params;
      const existIdx = db.mensa.findIndex(m => m.data === data && m.email.toLowerCase() === email.toLowerCase() && m.tipo_pasto === tipo_pasto);
      const entry = {
        id: "M_" + Date.now(),
        data,
        email,
        tipo_pasto,
        busta: Boolean(busta),
        ritardo: Boolean(ritardo),
        note: note || "",
        timestamp: new Date().toISOString()
      };
      if (existIdx !== -1) {
        db.mensa[existIdx] = entry;
      } else {
        db.mensa.push(entry);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, id: entry.id };
    }

    case "cancellaPrenotazioneMensa": {
      const { data, email, tipo_pasto } = params;
      db.mensa = db.mensa.filter(m => !(m.data === data && m.email.toLowerCase() === email.toLowerCase() && m.tipo_pasto === tipo_pasto));
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true };
    }

    case "prenotaSpazio": {
      const { risorsa, data, slot_orario, email } = params;
      const occupied = db.prenotazioni_spazi.some(p => p.risorsa === risorsa && p.data === data && p.slot_orario === slot_orario);
      if (occupied) return { success: false, error: "Slot già occupato da un altro residente" };

      const prenotazione = {
        id: "S_" + Date.now(),
        risorsa,
        data,
        slot_orario,
        email,
        timestamp: new Date().toISOString()
      };
      db.prenotazioni_spazi.push(prenotazione);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, id: prenotazione.id };
    }

    case "caricaGuasto": {
      const { email, descrizione, fotoBase64 } = params;
      const guasto = {
        id: "G_" + Date.now(),
        timestamp: new Date().toISOString(),
        email,
        descrizione,
        link_foto: fotoBase64 ? fotoBase64 : "",
        stato: "Da fare"
      };
      db.manutenzione.unshift(guasto);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, id: guasto.id, linkFoto: guasto.link_foto, message: "Guasto salvato" };
    }

    case "risolviGuasto": {
      const g = db.manutenzione.find(item => String(item.id) === String(params.id));
      if (g) {
        g.stato = "Risolto";
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true };
      }
      return { success: false, error: "Guasto non trovato" };
    }

    case "cancellaPrenotazioneSpazio": {
      const { id, risorsa, data, slot_orario, email } = params;
      const initialLen = db.prenotazioni_spazi.length;
      db.prenotazioni_spazi = db.prenotazioni_spazi.filter(p => {
        if (id && String(p.id) === String(id)) return false;
        if (risorsa && data && slot_orario) {
          const pData = String(p.data).split("T")[0];
          if (p.risorsa === risorsa && pData === data && p.slot_orario === slot_orario) {
            // Se non specificata email o utente admin o match email, cancella
            if (!email || !p.email || p.email.toLowerCase() === email.toLowerCase()) return false;
          }
        }
        return true;
      });
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      const deleted = db.prenotazioni_spazi.length < initialLen;
      return { success: deleted, message: deleted ? "Prenotazione spazio cancellata" : "Nessuna prenotazione corrispondente trovata" };
    }

    case "getBacheca": {
      return {
        success: true,
        bacheca: db.bacheca || []
      };
    }

    case "salvaAvvisoBacheca": {
      if (!db.bacheca) db.bacheca = [];
      const item = {
        id: params.id || ("B_" + Date.now()),
        tipo: params.tipo || "avviso",
        data: params.data || formatYMD(new Date()),
        titolo: params.titolo || "",
        descrizione: params.descrizione || "",
        autore: params.autore || "Direzione",
        priorita: params.priorita || "normale",
        timestamp: new Date().toISOString()
      };
      const existIdx = db.bacheca.findIndex(b => String(b.id) === String(item.id));
      if (existIdx !== -1) {
        db.bacheca[existIdx] = item;
      } else {
        db.bacheca.unshift(item);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, id: item.id, item };
    }

    case "eliminaAvvisoBacheca": {
      if (!db.bacheca) db.bacheca = [];
      const initLen = db.bacheca.length;
      db.bacheca = db.bacheca.filter(b => String(b.id) !== String(params.id));
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: db.bacheca.length < initLen, message: "Avviso bacheca rimosso" };
    }

    case "getInfoData": {
      return {
        success: true,
        config: db.configurazione,
        prenotazioniSpazi: db.prenotazioni_spazi,
        prenotazioniMensa: db.mensa,
        bacheca: db.bacheca || []
      };
    }

    case "getMasterData": {
      return {
        success: true,
        utentiInAttesa: db.utenti.filter(u => u.stato === "In Attesa"),
        tuttiUtenti: db.utenti,
        mensa: db.mensa,
        guasti: db.manutenzione,
        config: db.configurazione
      };
    }

    case "aggiornaConfig": {
      if (params.Info_Regolamento !== undefined) db.configurazione.Info_Regolamento = params.Info_Regolamento;
      if (params.Info_Contatti !== undefined) db.configurazione.Info_Contatti = params.Info_Contatti;
      if (params.Data_Variazione_Menu !== undefined) db.configurazione.Data_Variazione_Menu = params.Data_Variazione_Menu;
      if (params.Testo_Variazione !== undefined) db.configurazione.Testo_Variazione = params.Testo_Variazione;
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, message: "Configurazione salvata!" };
    }

    default:
      return { success: false, error: "Azione non riconosciuta" };
  }
}

// ----------------------------------------------------------------------------
// CARICAMENTO E AGGIORNAMENTO DATI
// ----------------------------------------------------------------------------

async function caricaDatiBackend() {
  renderBachecaView();
  renderResidenzaView();
  renderMensaView();
  renderSpaziView();

  try {
    const data = await callApi("getInfoData");
    if (data && data.success) {
      appState.cachedConfig = data.config || {};
      appState.prenotazioniSpazi = data.prenotazioniSpazi || [];
      if (data.bacheca) {
        appState.bacheca = data.bacheca;
      }
      if (data.prenotazioniMensa) {
        appState.mensaBookings = data.prenotazioniMensa;
      }

      // Aggiorna viste
      renderBachecaView();
      renderResidenzaView();
      verificaAlertVariazione();
      renderSlotSpazi();
      renderMensaView();
    }

    // Se l'utente ha permessi Master, carica anche i dati del Master
    if (haPermessiMaster()) {
      caricaDatiMaster();
    }
  } catch (err) {
    console.error("Errore caricamento dati:", err);
  }
}

// ----------------------------------------------------------------------------
// LOGICA CALENDARIO ROMANO CLASSICO & LITURGICO
// ----------------------------------------------------------------------------

function toRomanNumerals(num) {
  if (num <= 0) return "N";
  const romanMap = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let res = "";
  let n = num;
  for (const [val, roman] of romanMap) {
    while (n >= val) {
      res += roman;
      n -= val;
    }
  }
  return res || "I";
}

// ----------------------------------------------------------------------------
// CALENDARIO ROMANO GENERALE (general-it) & FASTI LITURGICI
// ----------------------------------------------------------------------------

// Database feste e memorie del Calendario Romano Generale per l'Italia (general-it)
const CALENDARIO_ROMANO_IT = {
  "01-01": { titolo: "Maria Santissima Madre di Dio", grado: "Solennità", colore: "Bianco / Oro", hex: "#d97706" },
  "01-02": { titolo: "Santi Basilio Magno e Gregorio Nazianzeno, vescovi e dottori", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "01-03": { titolo: "Santissimo Nome di Gesù", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "01-06": { titolo: "Epifania del Signore", grado: "Solennità", colore: "Bianco / Oro", hex: "#d97706" },
  "01-17": { titolo: "Sant'Antonio, abate", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "01-20": { titolo: "San Fabiano, papa e martire; San Sebastiano, martire", grado: "Memoria facoltativa", colore: "Rosso", hex: "#dc2626" },
  "01-21": { titolo: "Sant'Agnese, vergine e martire", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "01-22": { titolo: "San Vincenzo, diacono e martire", grado: "Memoria facoltativa", colore: "Rosso", hex: "#dc2626" },
  "01-24": { titolo: "San Francesco di Sales, vescovo e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "01-25": { titolo: "Conversione di San Paolo, apostolo", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "01-26": { titolo: "Santi Timoteo e Tito, vescovi", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "01-28": { titolo: "San Tommaso d'Aquino, presbitero e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "01-31": { titolo: "San Giovanni Bosco, presbitero", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "02-02": { titolo: "Presentazione del Signore al Tempio", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "02-03": { titolo: "San Biagio, vescovo e martire", grado: "Memoria facoltativa", colore: "Rosso", hex: "#dc2626" },
  "02-05": { titolo: "Sant'Agata, vergine e martire", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "02-06": { titolo: "Santi Paolo Miki e compagni, martiri", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "02-10": { titolo: "Santa Scolastica, vergine", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "02-11": { titolo: "Beata Vergine Maria di Lourdes", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "02-14": { titolo: "Santi Cirillo, monaco, e Metodio, vescovo, compatroni d'Europa", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "02-21": { titolo: "San Pier Damiani, vescovo e dottore", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "02-22": { titolo: "Cattedra di San Pietro, apostolo", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "02-23": { titolo: "San Policarpo, vescovo e martire", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "03-07": { titolo: "Sante Perpetua e Felicita, martiri", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "03-08": { titolo: "San Giovanni di Dio, religioso", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "03-09": { titolo: "Santa Francesca Romana, religiosa", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "03-17": { titolo: "San Patrizio, vescovo", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "03-19": { titolo: "San Giuseppe, sposo della Beata Vergine Maria", grado: "Solennità", colore: "Bianco / Oro", hex: "#d97706" },
  "03-25": { titolo: "Annunciazione del Signore", grado: "Solennità", colore: "Bianco / Oro", hex: "#d97706" },
  "04-07": { titolo: "San Giovanni Battista de La Salle, presbitero", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "04-21": { titolo: "Sant'Anselmo, vescovo e dottore", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "04-23": { titolo: "San Giorgio, martire", grado: "Memoria facoltativa", colore: "Rosso", hex: "#dc2626" },
  "04-25": { titolo: "San Marco, evangelista", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "04-29": { titolo: "Santa Caterina da Siena, vergine e dottore, patrona d'Italia e d'Europa", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "05-01": { titolo: "San Giuseppe Lavoratore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "05-02": { titolo: "Sant'Atanasio, vescovo e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "05-03": { titolo: "Santi Filippo e Giacomo, apostoli", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "05-13": { titolo: "Beata Vergine Maria di Fatima", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "05-14": { titolo: "San Mattia, apostolo", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "05-24": { titolo: "Beata Vergine Maria Aiuto dei Cristiani", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "05-26": { titolo: "San Filippo Neri, presbitero", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "05-31": { titolo: "Visitazione della Beata Vergine Maria", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "06-01": { titolo: "San Giustino, martire", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "06-02": { titolo: "Santi Marcellino e Pietro, martiri", grado: "Memoria facoltativa", colore: "Rosso", hex: "#dc2626" },
  "06-03": { titolo: "Santi Carlo Lwanga e compagni, martiri", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "06-05": { titolo: "San Bonifacio, vescovo e martire", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "06-11": { titolo: "San Barnaba, apostolo", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "06-13": { titolo: "Sant'Antonio di Padova, presbitero e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "06-21": { titolo: "San Luigi Gonzaga, religioso", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "06-24": { titolo: "Natività di San Giovanni Battista", grado: "Solennità", colore: "Bianco / Oro", hex: "#d97706" },
  "06-28": { titolo: "Sant'Ireneo, vescovo e martire", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "06-29": { titolo: "Santi Pietro e Paolo, apostoli", grado: "Solennità", colore: "Rosso", hex: "#dc2626" },
  "06-30": { titolo: "Primi Santi Martiri della Chiesa Romana", grado: "Memoria facoltativa", colore: "Rosso", hex: "#dc2626" },
  "07-03": { titolo: "San Tommaso, apostolo", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "07-11": { titolo: "San Benedetto, abate, patrono d'Europa", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "07-15": { titolo: "San Bonaventura, vescovo e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "07-22": { titolo: "Santa Maria Maddalena", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "07-23": { titolo: "Santa Brigida, religiosa, compatrona d'Europa", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "07-25": { titolo: "San Giacomo, apostolo", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "07-26": { titolo: "Santi Gioacchino e Anna, genitori della Beata Vergine Maria", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "07-29": { titolo: "Santi Marta, Maria e Lazzaro", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "07-31": { titolo: "Sant'Ignazio di Loyola, presbitero", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "08-01": { titolo: "Sant'Alfonso Maria de' Liguori, vescovo e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "08-04": { titolo: "San Giovanni Maria Vianney, presbitero (Curato d'Ars)", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "08-06": { titolo: "Trasfigurazione del Signore", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "08-08": { titolo: "San Domenico, presbitero", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "08-09": { titolo: "Santa Teresa Benedetta della Croce (Edith Stein), vergine e martire, compatrona d'Europa", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "08-10": { titolo: "San Lorenzo, diacono e martire", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "08-11": { titolo: "Santa Chiara, vergine", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "08-14": { titolo: "San Massimiliano Maria Kolbe, presbitero e martire", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "08-15": { titolo: "Assunzione della Beata Vergine Maria", grado: "Solennità", colore: "Bianco / Oro", hex: "#d97706" },
  "08-20": { titolo: "San Bernardo, abate e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "08-21": { titolo: "San Pio X, papa", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "08-22": { titolo: "Beata Vergine Maria Regina", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "08-24": { titolo: "San Bartolomeo, apostolo", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "08-27": { titolo: "Santa Monica", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "08-28": { titolo: "Sant'Agostino, vescovo e dottore della Chiesa", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "08-29": { titolo: "Martirio di San Giovanni Battista", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "09-03": { titolo: "San Gregorio Magno, papa e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "09-08": { titolo: "Natività della Beata Vergine Maria", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "09-12": { titolo: "Santissimo Nome di Maria", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "09-13": { titolo: "San Giovanni Crisostomo, vescovo e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "09-14": { titolo: "Esaltazione della Santa Croce", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "09-15": { titolo: "Beata Vergine Maria Addolorata", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "09-16": { titolo: "Santi Cornelio papa e Cipriano vescovo, martiri", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "09-17": { titolo: "San Roberto Bellarmino, vescovo e dottore della Chiesa", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "09-19": { titolo: "San Gennaro, vescovo e martire", grado: "Memoria facoltativa", colore: "Rosso", hex: "#dc2626" },
  "09-20": { titolo: "Santi Andrea Kim Taegon, presbitero, e Paolo Chong Hasang e compagni, martiri", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "09-21": { titolo: "San Matteo, apostolo ed evangelista", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "09-23": { titolo: "San Pio da Pietrelcina, presbitero", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "09-26": { titolo: "Santi Cosma e Damiano, martiri", grado: "Memoria facoltativa", colore: "Rosso", hex: "#dc2626" },
  "09-27": { titolo: "San Vincenzo de' Paoli, presbitero", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "09-28": { titolo: "San Venceslao, martire", grado: "Memoria facoltativa", colore: "Rosso", hex: "#dc2626" },
  "09-29": { titolo: "Santi Michele, Gabriele e Raffaele, arcangeli", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "09-30": { titolo: "San Girolamo, presbitero e dottore della Chiesa", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "10-01": { titolo: "Santa Teresa di Gesù Bambino, vergine e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "10-02": { titolo: "Santi Angeli Custodi", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "10-04": { titolo: "San Francesco d'Assisi, patrono d'Italia", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "10-07": { titolo: "Beata Vergine Maria del Rosario", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "10-09": { titolo: "San John Henry Newman, presbitero e cardinale, titolare della Residenza", grado: "Solennità", colore: "Bianco / Oro", hex: "#d97706" },
  "10-15": { titolo: "Santa Teresa di Gesù (d'Avila), vergine e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "10-17": { titolo: "Sant'Ignazio d'Antiochia, vescovo e martire", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "10-18": { titolo: "San Luca, evangelista", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "10-19": { titolo: "Santi Giovanni de Brébeuf e Isacco Jogues, presbiteri, e compagni, martiri", grado: "Memoria facoltativa", colore: "Rosso", hex: "#dc2626" },
  "10-22": { titolo: "San Giovanni Paolo II, papa", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "10-28": { titolo: "Santi Simone e Giuda, apostoli", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "11-01": { titolo: "Tutti i Santi", grado: "Solennità", colore: "Bianco / Oro", hex: "#d97706" },
  "11-02": { titolo: "Commemorazione di tutti i fedeli defunti", grado: "Celebrazione", colore: "Viola", hex: "#7c3aed" },
  "11-04": { titolo: "San Carlo Borromeo, vescovo", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "11-09": { titolo: "Dedicazione della Basilica Lateranense", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "11-10": { titolo: "San Leone Magno, papa e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "11-11": { titolo: "San Martino di Tours, vescovo", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "11-12": { titolo: "San Giosafat, vescovo e martire", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "11-17": { titolo: "Sant'Elisabetta d'Ungheria, religiosa", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "11-21": { titolo: "Presentazione della Beata Vergine Maria", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "11-22": { titolo: "Santa Cecilia, vergine e martire", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "11-24": { titolo: "Santi Andrea Dung-Lac, presbitero, e compagni, martiri", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "11-30": { titolo: "Sant'Andrea, apostolo", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "12-03": { titolo: "San Francesco Saverio, presbitero", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "12-06": { titolo: "San Nicola, vescovo", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "12-07": { titolo: "Sant'Ambrogio, vescovo e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "12-08": { titolo: "Immacolata Concezione della Beata Vergine Maria", grado: "Solennità", colore: "Bianco / Oro", hex: "#d97706" },
  "12-12": { titolo: "Beata Vergine Maria di Guadalupe", grado: "Memoria facoltativa", colore: "Bianco", hex: "#d97706" },
  "12-13": { titolo: "Santa Lucia, vergine e martire", grado: "Memoria", colore: "Rosso", hex: "#dc2626" },
  "12-14": { titolo: "San Giovanni della Croce, presbitero e dottore", grado: "Memoria", colore: "Bianco", hex: "#d97706" },
  "12-25": { titolo: "Natale del Signore", grado: "Solennità", colore: "Bianco / Oro", hex: "#d97706" },
  "12-26": { titolo: "Santo Stefano, primo martire", grado: "Festa", colore: "Rosso", hex: "#dc2626" },
  "12-27": { titolo: "San Giovanni, apostolo ed evangelista", grado: "Festa", colore: "Bianco", hex: "#d97706" },
  "12-28": { titolo: "Santi Innocenti, martiri", grado: "Festa", colore: "Rosso", hex: "#dc2626" }
};

// Algoritmo Computus per la data di Pasqua
function calcolaDomenicaPasqua(anno) {
  const a = anno % 19;
  const b = Math.floor(anno / 100);
  const c = anno % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anno, month - 1, day);
}

function calcolaCalendarioRomano(date) {
  const giorniSettimanaLatino = [
    "Dies Solis", "Dies Lunae", "Dies Martis", "Dies Mercurii", 
    "Dies Iovis", "Dies Veneris", "Dies Saturni"
  ];
  const giorniSettimanaIt = [
    "Domenica", "Lunedì", "Martedì", "Mercoledì", 
    "Giovedì", "Venerdì", "Sabato"
  ];
  const mesiIt = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const y = date.getFullYear();
  const m = date.getMonth(); // 0-11
  const d = date.getDate();  // 1-31
  const dayOfWeek = date.getDay(); // 0-6

  const annoRomano = `ANNO DOMINI ${toRomanNumerals(y)}`;
  const dataItaliana = `${giorniSettimanaIt[dayOfWeek]} ${d} ${mesiIt[m]} ${y}`;
  const giornoRomano = giorniSettimanaLatino[dayOfWeek];

  const keyMeseGiorno = `${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  // Determinazione del Tempo Liturgico
  const pasqua = calcolaDomenicaPasqua(y);
  const pasquaMs = pasqua.getTime();
  const currMs = new Date(y, m, d).getTime();
  const diffGiorniPasqua = Math.round((currMs - pasquaMs) / 86400000);

  // Prima domenica d'Avvento (4 domeniche prima di Natale)
  const natale = new Date(y, 11, 25);
  const giornoNatale = natale.getDay();
  const offsetAvvento = (giornoNatale === 0 ? 7 : giornoNatale) + 21;
  const primaDomenicaAvvento = new Date(y, 11, 25 - offsetAvvento);

  let tempoLiturgico = "Tempo Ordinario";
  let coloreTempo = "Verde";
  let hexTempo = "#16a34a";
  let settimanaNum = 1;

  if (currMs >= primaDomenicaAvvento.getTime() && (m === 11 && d <= 24)) {
    tempoLiturgico = "Tempo di Avvento";
    coloreTempo = "Viola";
    hexTempo = "#7c3aed";
  } else if ((m === 11 && d >= 25) || (m === 0 && d <= 12)) {
    tempoLiturgico = "Tempo di Natale";
    coloreTempo = "Bianco";
    hexTempo = "#d97706";
  } else if (diffGiorniPasqua >= -46 && diffGiorniPasqua < 0) {
    tempoLiturgico = "Tempo di Quaresima";
    coloreTempo = "Viola";
    hexTempo = "#7c3aed";
  } else if (diffGiorniPasqua >= 0 && diffGiorniPasqua <= 49) {
    tempoLiturgico = "Tempo Pasquale";
    coloreTempo = "Bianco";
    hexTempo = "#d97706";
  } else {
    tempoLiturgico = "Tempo Ordinario";
    coloreTempo = "Verde";
    hexTempo = "#16a34a";
    // Stima della settimana del Tempo Ordinario
    // A metà settembre (settimana del 16) corrisponde tipicamente alla 24ª settimana
    if (m >= 5) {
      settimanaNum = Math.min(34, Math.max(8, Math.floor((currMs - new Date(y, 4, 25).getTime()) / (7 * 86400000)) + 9));
    }
  }

  // Celebrazione del giorno da general-it
  const eventoFisso = CALENDARIO_ROMANO_IT[keyMeseGiorno];
  let santo = "";
  let coloreLiturgico = coloreTempo;
  let coloreHex = hexTempo;

  if (eventoFisso) {
    santo = `${eventoFisso.titolo} (${eventoFisso.grado})`;
    coloreLiturgico = eventoFisso.colore;
    coloreHex = eventoFisso.hex;
  } else {
    // Feria ordinaria o della stagione
    if (dayOfWeek === 0) {
      santo = `${toRomanNumerals(settimanaNum)}ª Domenica del ${tempoLiturgico}`;
    } else {
      santo = `Feria della ${toRomanNumerals(settimanaNum)}ª settimana del ${tempoLiturgico}`;
    }
  }

  // Regola di salvaguardia per santi martiri: sempre Rosso
  const santoLower = santo.toLowerCase();
  if (santoLower.includes("martir") || santoLower.includes("apostol") || santoLower.includes("croce")) {
    if (!santoLower.includes("giovanni, apostolo")) {
      coloreLiturgico = "Rosso";
      coloreHex = "#dc2626";
    }
  }

  return {
    annoRomano,
    dataItaliana,
    giornoRomano,
    santo,
    coloreLiturgico,
    coloreHex,
    tempoLiturgico
  };
}

// ----------------------------------------------------------------------------
// LOGICA SEZIONE 1: BACHECA & CALENDARIO ROMANO (PAGINA INIZIALE)
// ----------------------------------------------------------------------------

function renderBachecaView() {
  const container = document.getElementById("bacheca-container");
  if (!container) return;

  if (!appState.selectedBachecaDate) {
    appState.selectedBachecaDate = new Date();
  }

  const currentDate = appState.selectedBachecaDate;
  const cal = calcolaCalendarioRomano(currentDate);
  const dataYMD = formatYMD(currentDate);
  const oggiYMD = formatYMD(new Date());
  const isOggi = (dataYMD === oggiYMD);

  // Filtra elementi per il giorno selezionato
  const itemsGiorno = (appState.bacheca || []).filter(item => {
    const itemData = String(item.data).split("T")[0];
    return itemData === dataYMD;
  });

  // Filtra elementi futuri (prossimi 14 giorni) per la vista panoramica
  const oraInMs = new Date(oggiYMD).getTime();
  const quattordiciGiorniMs = oraInMs + (14 * 86400000);
  const itemsProssimi = (appState.bacheca || []).filter(item => {
    const itemData = String(item.data).split("T")[0];
    const itemMs = new Date(itemData).getTime();
    return itemMs >= oraInMs && itemMs <= quattordiciGiorniMs && itemData !== dataYMD;
  }).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const isMasterOrAdmin = haPermessiMaster();

  let html = `
    <!-- CARD CALENDARIO ROMANO ISTITUZIONALE -->
    <div class="card roman-calendar-card">
      <div class="roman-header-clean">
        <div class="roman-latin-date-highlight">${escapeHtml(cal.annoRomano)} • ${escapeHtml(cal.giornoRomano)}</div>
        <div class="roman-italian-date-large">${escapeHtml(cal.dataItaliana)}</div>
      </div>

      <div class="roman-liturgy-badge" style="border-left: 4px solid ${cal.coloreHex};">
        <div class="liturgy-row">
          <span class="liturgy-dot" style="background-color: ${cal.coloreHex};"></span>
          <strong>${escapeHtml(cal.tempoLiturgico)}</strong>
          <span style="font-weight: 700; color: #f8fafc; font-size: 13px;">(${escapeHtml(cal.coloreLiturgico)})</span>
        </div>
        <div class="liturgy-saint">
          ⛪ ${escapeHtml(cal.santo)}
        </div>
      </div>

      <!-- NAVIGAZIONE RAPIDA GIORNI -->
      <div class="roman-nav-bar">
        <button type="button" class="btn btn-secondary btn-sm" onclick="cambiaGiornoBacheca(-1)">
          ◀ Ieri
        </button>
        <button type="button" class="btn ${isOggi ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="vaiAOggiBacheca()">
          📅 ${isOggi ? 'Oggi' : 'Torna a Oggi'}
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="cambiaGiornoBacheca(1)">
          Domani ▶
        </button>
        <input type="date" class="input-date-small" value="${dataYMD}" onchange="selezionaDataBacheca(this.value)" title="Scegli data">
      </div>
    </div>

    <!-- SEZIONE BACHECA DEL GIORNO -->
    <div class="card">
      <div class="flex-between" style="margin-bottom: 12px;">
        <div>
          <h3 class="card-title" style="margin: 0;">Bacheca della Residenza</h3>
          <span class="text-xs text-muted">
            Avvisi, compleanni ed eventi per ${isOggi ? 'oggi' : cal.dataItaliana}
          </span>
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="apriModalBacheca('${dataYMD}')">
          + Aggiungi
        </button>
      </div>

      <div class="bacheca-list">
  `;

  if (itemsGiorno.length === 0) {
    html += `
      <div class="empty-bacheca-card">
        <div style="font-size: 32px; margin-bottom: 6px;">🕊️</div>
        <div style="font-weight: 600; font-size: 14px; color: var(--text);">Nessun avviso o ricorrenza per questo giorno</div>
        <div class="text-xs text-muted" style="margin-top: 2px;">
          Puoi inserire un compleanno, un anniversario o un avviso comunitario tramite il pulsante in alto.
        </div>
      </div>
    `;
  } else {
    itemsGiorno.forEach(item => {
      const tipo = item.tipo || "avviso";
      let tipoIcon = "📢";
      let tipoLabel = "Avviso";
      let badgeClass = "badge-avviso";

      if (tipo === "compleanno") {
        tipoIcon = "🎂";
        tipoLabel = "Compleanno";
        badgeClass = "badge-compleanno";
      } else if (tipo === "anniversario") {
        tipoIcon = "🔔";
        tipoLabel = "Anniversario";
        badgeClass = "badge-anniversario";
      } else if (tipo === "evento") {
        tipoIcon = "📆";
        tipoLabel = "Evento";
        badgeClass = "badge-evento";
      }

      const isEvidenza = item.priorita === "alta";

      html += `
        <div class="bacheca-card type-${tipo} ${isEvidenza ? 'priority-high' : ''}">
          <div class="bacheca-card-header">
            <div class="flex-align" style="gap: 6px;">
              <span class="bacheca-badge ${badgeClass}">${tipoIcon} ${tipoLabel}</span>
              ${isEvidenza ? '<span class="badge badge-accent">⭐ In Evidenza</span>' : ''}
            </div>
            ${isMasterOrAdmin ? `
              <button type="button" class="btn-delete-bacheca" onclick="eliminaAvvisoBacheca('${item.id}')" title="Elimina dalla bacheca">
                ✕
              </button>
            ` : ''}
          </div>

          <h4 class="bacheca-card-title">${escapeHtml(item.titolo)}</h4>

          ${item.descrizione ? `
            <p class="bacheca-card-desc">${escapeHtml(item.descrizione)}</p>
          ` : ''}

          <div class="bacheca-card-footer">
            <span class="text-xs text-muted">✍️ ${escapeHtml(item.autore || 'Direzione')}</span>
            <span class="text-xs text-muted">📅 ${item.data}</span>
          </div>
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>
  `;

  // Sezione prossimi eventi (se ce ne sono)
  if (itemsProssimi.length > 0) {
    html += `
      <div class="card" style="margin-top: 14px;">
        <h3 class="card-title-sm" style="margin-bottom: 8px;">Prossime Ricorrenze & Avvisi (14 giorni)</h3>
        <div class="mini-list">
    `;

    itemsProssimi.forEach(item => {
      let icon = "📢";
      if (item.tipo === "compleanno") icon = "🎂";
      if (item.tipo === "anniversario") icon = "🔔";
      if (item.tipo === "evento") icon = "📆";

      html += `
        <div class="mini-item flex-between" style="cursor: pointer;" onclick="selezionaDataBacheca('${item.data}')">
          <div class="flex-align" style="gap: 8px;">
            <span style="font-size: 18px;">${icon}</span>
            <div>
              <strong style="font-size: 13px;">${escapeHtml(item.titolo)}</strong>
              <div class="text-xs text-muted">${item.data} • ${escapeHtml(item.autore || 'Direzione')}</div>
            </div>
          </div>
          <span class="badge" style="background:#f1f5f9; font-size: 10.5px;">Vedi</span>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

window.cambiaGiornoBacheca = function(offset) {
  if (!appState.selectedBachecaDate) appState.selectedBachecaDate = new Date();
  const d = new Date(appState.selectedBachecaDate);
  d.setDate(d.getDate() + offset);
  appState.selectedBachecaDate = d;
  renderBachecaView();
};

window.vaiAOggiBacheca = function() {
  appState.selectedBachecaDate = new Date();
  renderBachecaView();
};

window.selezionaDataBacheca = function(dateStr) {
  if (!dateStr) return;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    appState.selectedBachecaDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    renderBachecaView();
  }
};

// ----------------------------------------------------------------------------
// LOGICA SEZIONE: LA RESIDENZA (REGOLAMENTO, ORARI E CONTATTI)
// ----------------------------------------------------------------------------

function renderResidenzaView() {
  const container = document.getElementById("residenza-container");
  if (!container) return;

  const regText = appState.cachedConfig.Info_Regolamento || `REGOLAMENTO INTERNO DELLA RESIDENZA CARDINAL NEWMAN
1. VITA COMUNITARIA: Il clima di studio, preghiera e fraternità è alla base della convivenza.
2. ORARI DI SILENZIO: Dalle ore 23:00 alle ore 07:30 del mattino è richiesto il silenzio assoluto nei corridoi e nelle aree comuni.
3. MENSA COMUNITARIA:
   • Pranzo alle 14:30 (prenotazioni aperte fino alle 13:30, 1h prima).
   • Cena alle 19:30 (prenotazioni aperte fino alle 18:30, 1h prima).
   • Martedì e Giovedì a pranzo: sono previsti i classici di busta (pranzo al sacco da asporto).
4. PRENOTAZIONE SPAZI:
   • Gli unici spazi soggetti a prenotazione sono la Chiesa / Cappella e la Sala TV.
   • Gli slot sono di 30 minuti. Non serve conferma preventiva.
   • Privacy garantita: l'utente e il master visualizzano l'occupante; gli altri residenti vedono lo slot come 'Occupato'.
5. MANUTENZIONE: Segnalare tempestivamente qualsiasi anomalia nell'apposita sezione Guasti.`;

  const contText = appState.cachedConfig.Info_Contatti || `CONTATTI E RECAPITI DELLA RESIDENZA:
• Portineria / Accoglienza: Tel. +39 06 87654321 (Int. 101) - Attiva 07:00 - 22:30
• Direzione Generale: direzione@residenzanewman.org (Int. 102)
• Emergenze Notturne Custode: +39 333 1122334
• Economato & Servizio Mensa: mensa@residenzanewman.org
• Assistenza Tecnica Manutenzione: manutenzione@residenzanewman.org`;

  container.innerHTML = `
    <!-- CARD ORARI COMUNITARI GIORNALIERI -->
    <div class="card">
      <div class="flex-align" style="margin-bottom: 8px;">
        <span style="font-size: 22px; margin-right: 8px;">⏰</span>
        <h2 class="card-title" style="margin: 0;">Orari Comunitari Giornalieri</h2>
      </div>
      <p class="card-desc">I momenti che scandiscono la giornata e la vita comune della Residenza.</p>

      <div class="card-inner">
        <div class="mini-list">
          <div class="flex-between text-sm" style="padding: 6px 0;">
            <div class="flex-align" style="gap: 8px;">
              <span>🔔</span>
              <span><strong>Sveglia & S. Messa in Cappella</strong></span>
            </div>
            <span class="badge" style="background: #f1f5f9; font-weight: 700;">07:00</span>
          </div>

          <div class="flex-between text-sm" style="padding: 6px 0;">
            <div class="flex-align" style="gap: 8px;">
              <span>🍽️</span>
              <div>
                <strong>Pranzo Comunitario</strong>
                <div class="text-xs text-muted">Prenotazioni & disdette entro le 13:30</div>
              </div>
            </div>
            <span class="badge" style="background: #fef3c7; color: #92400e; font-weight: 700;">14:30</span>
          </div>

          <div class="flex-between text-sm" style="padding: 6px 0;">
            <div class="flex-align" style="gap: 8px;">
              <span>🌙</span>
              <div>
                <strong>Cena Comunitaria</strong>
                <div class="text-xs text-muted">Prenotazioni & disdette entro le 18:30</div>
              </div>
            </div>
            <span class="badge" style="background: #e0e7ff; color: #3730a3; font-weight: 700;">19:30</span>
          </div>

          <div class="flex-between text-sm" style="padding: 6px 0;">
            <div class="flex-align" style="gap: 8px;">
              <span>🥪</span>
              <div>
                <strong>Martedì & Giovedì a Pranzo</strong>
                <div class="text-xs text-muted">Classici di busta da asporto (o variazione cuoca)</div>
              </div>
            </div>
            <span class="badge" style="background: #f3f4f6; font-weight: 700;">Busta</span>
          </div>

          <div class="flex-between text-sm" style="padding: 6px 0;">
            <div class="flex-align" style="gap: 8px;">
              <span>🤫</span>
              <span><strong>Inizio Silenzio Notturno</strong></span>
            </div>
            <span class="badge" style="background: #fee2e2; color: #991b1b; font-weight: 700;">23:00</span>
          </div>
        </div>
      </div>
    </div>

    <!-- CARD REGOLAMENTO INTERNO -->
    <div class="card">
      <div class="flex-between" style="margin-bottom: 8px;">
        <div class="flex-align">
          <span style="font-size: 22px; margin-right: 8px;">📜</span>
          <h2 class="card-title" style="margin: 0;">Regolamento Interno</h2>
        </div>
        ${haPermessiMaster() ? `
          <button type="button" class="btn btn-secondary btn-sm" onclick="switchTab('master')">
            Modifica da Master
          </button>
        ` : ''}
      </div>
      <div class="residenza-text-box">
        ${escapeHtml(regText)}
      </div>
    </div>

    <!-- CARD CONTATTI E RECAPITI -->
    <div class="card">
      <div class="flex-align" style="margin-bottom: 8px;">
        <span style="font-size: 22px; margin-right: 8px;">📞</span>
        <h2 class="card-title" style="margin: 0;">Contatti & Numeri Utili</h2>
      </div>
      <div class="residenza-text-box">
        ${escapeHtml(contText)}
      </div>

      <div class="quick-call-actions" style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
        <a href="tel:+390687654321" class="btn btn-outline btn-sm" style="flex: 1; text-align: center; text-decoration: none;">
          📞 Chiama Portineria
        </a>
        <a href="mailto:direzione@residenzanewman.org" class="btn btn-outline btn-sm" style="flex: 1; text-align: center; text-decoration: none;">
          ✉️ Scrivi a Direzione
        </a>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// MODAL GESTIONE BACHECA (NUOVO AVVISO / COMPLEANNO)
// ----------------------------------------------------------------------------

window.apriModalBacheca = function(prefillData) {
  const modal = document.getElementById("modal-bacheca");
  if (!modal) return;

  const dataInput = document.getElementById("bacheca-modal-data");
  if (dataInput) {
    dataInput.value = prefillData || formatYMD(appState.selectedBachecaDate || new Date());
  }

  const autoreInput = document.getElementById("bacheca-modal-autore");
  if (autoreInput && appState.user) {
    autoreInput.value = appState.user.nome || "Direzione";
  }

  modal.style.display = "flex";
};

window.chiudiModalBacheca = function() {
  const modal = document.getElementById("modal-bacheca");
  if (modal) modal.style.display = "none";
};

window.handleSalvaAvvisoBacheca = async function(e) {
  e.preventDefault();

  const tipo = document.getElementById("bacheca-modal-tipo")?.value || "avviso";
  const data = document.getElementById("bacheca-modal-data")?.value || formatYMD(new Date());
  const titolo = document.getElementById("bacheca-modal-titolo")?.value.trim();
  const descrizione = document.getElementById("bacheca-modal-desc")?.value.trim();
  const autore = document.getElementById("bacheca-modal-autore")?.value.trim() || (appState.user ? appState.user.nome : "Direzione");
  const priorita = document.getElementById("bacheca-modal-priorita")?.value || "normale";

  if (!titolo) {
    mostraToast("Inserisci un titolo", "warning");
    return;
  }

  const btn = document.getElementById("btn-submit-bacheca");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Pubblicazione in corso...";
  }

  try {
    const payload = {
      tipo,
      data,
      titolo,
      descrizione,
      autore,
      priorita
    };

    const res = await callApi("salvaAvvisoBacheca", payload);
    if (res.success) {
      mostraToast("Pubblicato in bacheca con successo!", "success");
      // Aggiorna cache locale
      if (!appState.bacheca) appState.bacheca = [];
      const item = {
        id: res.id || ("B_" + Date.now()),
        ...payload,
        timestamp: new Date().toISOString()
      };
      appState.bacheca.unshift(item);

      chiudiModalBacheca();
      renderBachecaView();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile salvare"), "error");
    }
  } catch (err) {
    mostraToast("Errore di connessione", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Pubblica in Bacheca";
    }
  }
};

window.eliminaAvvisoBacheca = async function(id) {
  if (!confirm("Sei sicuro di voler rimuovere questo elemento dalla bacheca?")) return;

  try {
    const res = await callApi("eliminaAvvisoBacheca", { id });
    if (res.success) {
      mostraToast("Elemento rimosso dalla bacheca", "info");
      appState.bacheca = (appState.bacheca || []).filter(b => String(b.id) !== String(id));
      renderBachecaView();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile eliminare"), "error");
    }
  } catch (err) {
    mostraToast("Errore di connessione", "error");
  }
};

function verificaAlertVariazione() {
  const alertContainer = document.getElementById("menu-variation-alert");
  if (!alertContainer) return;

  const dataVariazione = appState.cachedConfig.Data_Variazione_Menu;
  const testoVariazione = appState.cachedConfig.Testo_Variazione;
  const pastoVariazione = (appState.cachedConfig.Pasto_Variazione || "entrambi").toLowerCase();

  const oggiStr = formatYMD(new Date());

  if (dataVariazione && dataVariazione === oggiStr && testoVariazione && testoVariazione.trim() !== "") {
    let pastoBadge = '<span class="badge" style="background:#fef3c7; color:#92400e; font-size:11px; margin-left:6px;">🍽️ Pranzo & Cena</span>';
    if (pastoVariazione === "pranzo") {
      pastoBadge = '<span class="badge" style="background:#ffedd5; color:#9a3412; font-size:11px; margin-left:6px;">☀️ Solo Pranzo (14:30)</span>';
    } else if (pastoVariazione === "cena") {
      pastoBadge = '<span class="badge" style="background:#e0e7ff; color:#3730a3; font-size:11px; margin-left:6px;">🌙 Solo Cena (19:30)</span>';
    }

    alertContainer.innerHTML = `
      <div class="alert-box alert-warning animate-fade">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="flex-align" style="gap: 4px; flex-wrap: wrap;">
            <strong>Variazione Straordinaria Menu di Oggi:</strong>
            ${pastoBadge}
          </div>
          <p style="margin-top: 4px;">${escapeHtml(testoVariazione)}</p>
        </div>
      </div>
    `;
    alertContainer.style.display = "block";
  } else {
    alertContainer.style.display = "none";
    alertContainer.innerHTML = "";
  }
}

// ----------------------------------------------------------------------------
// LOGICA SEZIONE 2: MENSA
// ----------------------------------------------------------------------------

/**
 * Calcola se una certa data cade nella Settimana 1 o Settimana 2
 * basandosi sull'ancoraggio del 20 Luglio 2026 (Lunedì Settimana 1)
 */
function getSettimanaMenu(dataTarget) {
  const dTarget = new Date(dataTarget.getFullYear(), dataTarget.getMonth(), dataTarget.getDate());
  const dAnchor = new Date(MENU_ANCHOR_DATE.getFullYear(), MENU_ANCHOR_DATE.getMonth(), MENU_ANCHOR_DATE.getDate());

  const diffMs = dTarget.getTime() - dAnchor.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

  // modulo ciclico a 2 settimane (gestendo anche date antecedenti l'ancora)
  const isSettimana1 = Math.abs(diffWeeks) % 2 === 0;
  return isSettimana1 ? "settimana1" : "settimana2";
}

/**
 * Riconosce il giorno della settimana in italiano
 */
function getNomeGiorno(data) {
  const giorni = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];
  return giorni[data.getDay()];
}

function initDateSelectorMensa() {
  appState.selectedDateMensa = new Date();
}

/**
 * Verifica blocchi temporali:
 * - Pranzo alle 14:30, blocco prenotazioni 1 ora prima (dopo le 13:30)
 * - Cena alle 19:30, blocco prenotazioni 1 ora prima (dopo le 18:30)
 */
function isPranzoBloccato(dataSelezionata) {
  if (appState.bypassTimeLock) return false;
  const adesso = new Date();
  const dataScelta = new Date(dataSelezionata.getFullYear(), dataSelezionata.getMonth(), dataSelezionata.getDate());
  const dataOggi = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate());

  // Se la data selezionata è nel passato, è bloccata
  if (dataScelta < dataOggi) return true;
  // Se la data è nel futuro, è aperta
  if (dataScelta > dataOggi) return false;

  // Se è oggi, controlla orario (limite 13:30, 1h prima del pranzo delle 14:30)
  const ore = adesso.getHours();
  const minuti = adesso.getMinutes();
  return (ore > 13) || (ore === 13 && minuti >= 30);
}

function isCenaBloccata(dataSelezionata) {
  if (appState.bypassTimeLock) return false;
  const adesso = new Date();
  const dataScelta = new Date(dataSelezionata.getFullYear(), dataSelezionata.getMonth(), dataSelezionata.getDate());
  const dataOggi = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate());

  if (dataScelta < dataOggi) return true;
  if (dataScelta > dataOggi) return false;

  // Se è oggi, controlla orario (limite 18:30, 1h prima della cena delle 19:30)
  const ore = adesso.getHours();
  const minuti = adesso.getMinutes();
  return (ore > 18) || (ore === 18 && minuti >= 30);
}

function getLunediDellaSettimana(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const lunedi = new Date(date.setDate(diff));
  lunedi.setHours(0, 0, 0, 0);
  return lunedi;
}

/**
 * Restituisce l'eventuale variazione del menù inserita dalla cuoca o dal master per una data specifica.
 * @param {string} dStr - Data in formato YYYY-MM-DD
 * @param {string} [tipoPasto] - 'pranzo', 'cena' o undefined
 */
function getVariazioneCuocaPerData(dStr, tipoPasto) {
  if (!dStr) return null;

  // 1. Controllo dizionario strutturato se presente in Variazioni_Per_Data
  if (appState.cachedConfig.Variazioni_Per_Data) {
    try {
      const map = typeof appState.cachedConfig.Variazioni_Per_Data === "string"
        ? JSON.parse(appState.cachedConfig.Variazioni_Per_Data)
        : appState.cachedConfig.Variazioni_Per_Data;
      if (map && typeof map === "object") {
        if (tipoPasto && map[`${dStr}_${tipoPasto}`] && String(map[`${dStr}_${tipoPasto}`]).trim() !== "") {
          return String(map[`${dStr}_${tipoPasto}`]).trim();
        }
        if (map[`${dStr}_entrambi`] && String(map[`${dStr}_entrambi`]).trim() !== "") {
          return String(map[`${dStr}_entrambi`]).trim();
        }
        if (map[dStr]) {
          if (typeof map[dStr] === "object") {
            if (tipoPasto && map[dStr][tipoPasto] && String(map[dStr][tipoPasto]).trim() !== "") {
              return String(map[dStr][tipoPasto]).trim();
            }
            if (map[dStr].entrambi && String(map[dStr].entrambi).trim() !== "") {
              return String(map[dStr].entrambi).trim();
            }
            if (!tipoPasto) return map[dStr].pranzo || map[dStr].cena || map[dStr].entrambi || null;
          } else if (typeof map[dStr] === "string" && String(map[dStr]).trim() !== "") {
            return String(map[dStr]).trim();
          }
        }
      }
    } catch (e) {}
  }

  // 2. Controllo configurazione standard: Data_Variazione_Menu + Pasto_Variazione + Testo_Variazione
  const dataVar = String(appState.cachedConfig.Data_Variazione_Menu || "").split("T")[0];
  if (dataVar === dStr && appState.cachedConfig.Testo_Variazione && String(appState.cachedConfig.Testo_Variazione).trim() !== "") {
    const pastoVar = (appState.cachedConfig.Pasto_Variazione || "entrambi").toLowerCase();
    if (!tipoPasto) return String(appState.cachedConfig.Testo_Variazione).trim();
    if (pastoVar === "entrambi" || pastoVar === tipoPasto) {
      return String(appState.cachedConfig.Testo_Variazione).trim();
    }
  }
  return null;
}

function renderMensaView() {
  const container = document.getElementById("mensa-container");
  if (!container) return;

  const dataSel = appState.selectedDateMensa || new Date();
  const lunediSettimana = getLunediDellaSettimana(dataSel);
  const domenicaSettimana = new Date(lunediSettimana);
  domenicaSettimana.setDate(lunediSettimana.getDate() + 6);

  const settimanaCiclo = getSettimanaMenu(lunediSettimana);
  const numSettimana = (settimanaCiclo === "settimana1") ? 1 : 2;

  const mode = appState.mensaViewMode || "settimana";

  const dataInizioFmt = lunediSettimana.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const dataFineFmt = domenicaSettimana.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });

  const dataVariazione = appState.cachedConfig.Data_Variazione_Menu;
  const testoVariazione = appState.cachedConfig.Testo_Variazione;
  const pastoVariazione = (appState.cachedConfig.Pasto_Variazione || "entrambi").toLowerCase();
  const isMaster = haPermessiMaster() || (appState.user && appState.user.perm_mensa);

  let html = `
    <!-- Barra Navigazione Settimanale -->
    <div class="mensa-header-card card">
      <div class="week-nav-bar">
        <button type="button" class="week-nav-btn" onclick="cambiaSettimanaMensa(-1)" title="Settimana Precedente">◀</button>
        <div class="week-nav-label">
          <span>Settimana ${dataInizioFmt} - ${dataFineFmt}</span>
          <span class="week-nav-sub">Menu Ciclico • Settimana ${numSettimana} del ciclo</span>
        </div>
        <button type="button" class="week-nav-btn" onclick="cambiaSettimanaMensa(1)" title="Settimana Successiva">▶</button>
      </div>

      <!-- Tabs di visualizzazione: Settimana Scorrevole o Singolo Giorno -->
      <div class="mensa-view-mode-tabs">
        <button type="button" class="mode-tab-btn ${mode === 'settimana' ? 'active' : ''}" onclick="setMensaViewMode('settimana')">
          📅 Settimana Completa
        </button>
        <button type="button" class="mode-tab-btn ${mode === 'giorno' ? 'active' : ''}" onclick="setMensaViewMode('giorno')">
          ☀️ Vista Dettagliata Giorno
        </button>
      </div>

      <!-- Selettore rapido dei giorni (Pills) -->
      <div class="mensa-day-pills">
        ${renderDayPills(dataSel)}
      </div>

      ${appState.bypassTimeLock ? '<div class="banner-test-mode">⚙️ Modalità Test: Blocchi orari 13:30/18:30 disattivati per valutazione</div>' : ''}
    </div>

    <!-- NOTA / VARIAZIONE DEL MASTER MENSA (SE PRESENTE) -->
    ${(testoVariazione && testoVariazione.trim() !== '') ? `
      <div class="variation-master-card card animate-fade">
        <div class="flex-between">
          <div class="flex-align">
            <span style="font-size: 20px;">📢</span>
            <div>
              <div class="flex-align" style="gap: 6px; flex-wrap: wrap;">
                <strong style="color: #92400e; font-size: 13.5px;">Nota della Cucina / Variazione Menù:</strong>
                ${pastoVariazione === 'pranzo' ? '<span class="badge" style="background:#ffedd5; color:#9a3412; font-size:11px;">☀️ Solo Pranzo</span>' : ''}
                ${pastoVariazione === 'cena' ? '<span class="badge" style="background:#e0e7ff; color:#3730a3; font-size:11px;">🌙 Solo Cena</span>' : ''}
                ${pastoVariazione === 'entrambi' ? '<span class="badge" style="background:#fef3c7; color:#92400e; font-size:11px;">🍽️ Pranzo & Cena</span>' : ''}
                ${dataVariazione ? `<span style="font-size: 11px; color: #b45309;">(Applicata al giorno: ${dataVariazione})</span>` : ''}
              </div>
              <p style="color: #78350f; font-size: 13px; margin-top: 4px; line-height: 1.4;">${escapeHtml(testoVariazione)}</p>
            </div>
          </div>
          ${isMaster ? `
            <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="apriModalVariazioneCuoca('${dataVariazione || formatYMD(dataSel)}')">Modifica</button>
          ` : ''}
        </div>
      </div>
    ` : (isMaster ? `
      <div class="card" style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 10px 14px; margin-bottom: 14px;">
        <div class="flex-between">
          <span style="font-size: 12px; color: #64748b;">Sei Master Mensa: nessuna variazione attiva. Vuoi aggiungere una nota o variazione al menù?</span>
          <button type="button" class="btn btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="apriModalVariazioneCuoca('${formatYMD(dataSel)}')">+ Aggiungi Variazione</button>
        </div>
      </div>
    ` : '')}
  `;

  if (mode === "settimana") {
    // RENDER DELLA SETTIMANA SCORREVOLE CON TUTTI I 7 GIORNI
    html += renderWeeklyScrollView(lunediSettimana);
  } else {
    // RENDER DETTAGLIATO DEL SINGOLO GIORNO SELEZIONATO
    html += renderDailyDetailedView(dataSel);
  }

  container.innerHTML = html;
}

/**
 * Genera la vista scorrevole con i 7 giorni della settimana
 */
function renderWeeklyScrollView(lunediDate) {
  const giorniNomi = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
  const giorniLabels = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
  let out = `<div class="weekly-scroll-container">`;

  for (let i = 0; i < 7; i++) {
    const d = new Date(lunediDate);
    d.setDate(lunediDate.getDate() + i);
    const dStr = formatYMD(d);
    const isToday = dStr === formatYMD(new Date());
    const isSelected = dStr === formatYMD(appState.selectedDateMensa || new Date());

    const giornoKey = giorniNomi[i];
    const giornoLabel = giorniLabels[i];
    const dataFmt = d.toLocaleDateString("it-IT", { day: "numeric", month: "long" });

    const cicloSettimana = getSettimanaMenu(d);
    const menuGiorno = MENU_14_GIORNI[cicloSettimana][giornoKey] || {};
    const isTuesdayOrThursday = (giornoKey === "martedi" || giornoKey === "giovedi");
    const variazionePranzo = getVariazioneCuocaPerData(dStr, "pranzo");
    const variazioneCena = getVariazioneCuocaPerData(dStr, "cena");
    const isMaster = haPermessiMaster() || (appState.user && appState.user.perm_mensa);

    const pranzoLocked = isPranzoBloccato(d);
    const cenaLocked = isCenaBloccata(d);

    const emailUtente = appState.user ? appState.user.email.toLowerCase() : "";
    const prenPranzo = appState.mensaBookings.find(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === "pranzo" && m.email.toLowerCase() === emailUtente);
    const prenCena = appState.mensaBookings.find(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === "cena" && m.email.toLowerCase() === emailUtente);

    out += `
      <div class="weekly-day-card ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" id="day-card-${dStr}">
        <div class="weekly-day-header">
          <div class="weekly-day-title">
            <span>${giornoLabel}, ${dataFmt}</span>
            ${isToday ? '<span class="badge badge-accent" style="font-size: 10px;">Oggi</span>' : ''}
          </div>
          <button type="button" class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="apriDettaglioGiornoMensa('${dStr}')">
            Dettagli & Note
          </button>
        </div>

        <!-- RIGA PRANZO -->
        <div class="weekly-meal-row">
          <div class="weekly-meal-header">
            <div class="weekly-meal-title">
              <span>☀️ Pranzo (14:30)</span>
              ${prenPranzo ? `
                <span class="meal-status-pill booked">✓ Presente ${prenPranzo.busta ? '(Busta)' : ''} ${prenPranzo.ritardo ? '(Ritardo)' : ''}</span>
              ` : `
                <span class="meal-status-pill not-booked">Non segnato</span>
              `}
              ${isMaster ? `
                <span class="master-attendees-badge" title="Visualizza presenti nel Pannello Master" onclick="switchTab('master')">
                  👥 Presenti: <span class="count-num">${appState.mensaBookings.filter(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === 'pranzo').length}</span>
                </span>
              ` : ''}
            </div>
            <span class="badge ${pranzoLocked ? 'badge-danger' : 'badge-success'}" style="font-size: 10px;">
              ${pranzoLocked ? 'Chiuso' : 'Aperto'}
            </span>
          </div>

          <div class="weekly-meal-dishes">
            ${isTuesdayOrThursday ? `
              <div>
                <span style="color: #c2410c; font-weight: 700;">🥪 Classici di Busta:</span>
                <span style="font-size: 12px; color: #475569;"> Panino imbottito • Frutta di stagione • Snack • Acqua</span>
              </div>
              ${variazionePranzo ? `
                <div class="cuoca-inline-variation">
                  👩‍🍳 <strong>Variazione Pranzo:</strong> ${escapeHtml(variazionePranzo)}
                </div>
              ` : ''}
              ${isMaster ? `
                <div style="margin-top: 4px;">
                  <button type="button" class="btn-link-cuoca" onclick="apriModalVariazioneCuoca('${dStr}', 'pranzo')">
                    👩‍🍳 ${variazionePranzo ? 'Modifica Variazione Pranzo' : '+ Variazione Pranzo'}
                  </button>
                </div>
              ` : ''}
            ` : `
              <div>
                <strong>1°:</strong> ${menuGiorno.pranzo?.primo || '-'} • 
                <strong>2°:</strong> ${menuGiorno.pranzo?.secondo || '-'} • 
                <strong>Cont.:</strong> ${menuGiorno.pranzo?.contorno || '-'} • 
                <strong>Dessert:</strong> ${menuGiorno.pranzo?.dessert || '-'}
              </div>
              ${variazionePranzo ? `
                <div class="cuoca-inline-variation">
                  👩‍🍳 <strong>Variazione Pranzo:</strong> ${escapeHtml(variazionePranzo)}
                </div>
              ` : ''}
              ${isMaster ? `
                <div style="margin-top: 4px;">
                  <button type="button" class="btn-link-cuoca" onclick="apriModalVariazioneCuoca('${dStr}', 'pranzo')">
                    👩‍🍳 ${variazionePranzo ? 'Modifica Variazione Pranzo' : '+ Variazione Pranzo'}
                  </button>
                </div>
              ` : ''}
            `}
          </div>

          <div class="booking-inline-controls">
            ${prenPranzo ? `
              <span class="presence-summary-badge">✅ Presenza Confermata</span>
              <button type="button" class="btn-quick-cancel" ${pranzoLocked ? 'disabled' : ''} onclick="quickCancelPresenza('${dStr}', 'pranzo')">
                Annulla Presenza
              </button>
            ` : `
              <button type="button" class="btn-quick-book" ${pranzoLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'pranzo', false, false)">
                ${isTuesdayOrThursday ? '🥪 Presente (Busta)' : '🍽️ Presente'}
              </button>
              <button type="button" class="btn-quick-book" style="border-color: #64748b; color: #475569;" ${pranzoLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'pranzo', false, true)">
                ⏰ In Ritardo
              </button>
              ${isTuesdayOrThursday ? `
                <button type="button" class="btn-quick-book" style="border-color: #d97706; color: #b45309;" ${pranzoLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'pranzo', true, false)">
                  🥪 Richiedi Busta
                </button>
              ` : ''}
            `}
          </div>
        </div>

        <!-- RIGA CENA -->
        <div class="weekly-meal-row cena-row">
          <div class="weekly-meal-header">
            <div class="weekly-meal-title">
              <span>🌙 Cena (19:30)</span>
              ${prenCena ? `
                <span class="meal-status-pill booked">✓ Presente ${prenCena.busta ? '(Busta)' : ''} ${prenCena.ritardo ? '(Ritardo)' : ''}</span>
              ` : `
                <span class="meal-status-pill not-booked">Non segnato</span>
              `}
              ${(haPermessiMaster() || (appState.user && appState.user.perm_mensa)) ? `
                <span class="master-attendees-badge" title="Visualizza presenti nel Pannello Master" onclick="switchTab('master')">
                  👥 Presenti: <span class="count-num">${appState.mensaBookings.filter(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === 'cena').length}</span>
                </span>
              ` : ''}
            </div>
            <span class="badge ${cenaLocked ? 'badge-danger' : 'badge-success'}" style="font-size: 10px;">
              ${cenaLocked ? 'Chiuso' : 'Aperto'}
            </span>
          </div>

          <div class="weekly-meal-dishes">
            <div>
              <strong>1°:</strong> ${menuGiorno.cena?.primo || '-'} • 
              <strong>2°:</strong> ${menuGiorno.cena?.secondo || '-'} • 
              <strong>Cont.:</strong> ${menuGiorno.cena?.contorno || '-'} • 
              <strong>Dessert:</strong> ${menuGiorno.cena?.dessert || '-'}
            </div>
            ${variazioneCena ? `
              <div class="cuoca-inline-variation">
                👩‍🍳 <strong>Variazione Cena:</strong> ${escapeHtml(variazioneCena)}
              </div>
            ` : ''}
            ${isMaster ? `
              <div style="margin-top: 4px;">
                <button type="button" class="btn-link-cuoca" onclick="apriModalVariazioneCuoca('${dStr}', 'cena')">
                  👩‍🍳 ${variazioneCena ? 'Modifica Variazione Cena' : '+ Variazione Cena'}
                </button>
              </div>
            ` : ''}
          </div>

          <div class="booking-inline-controls">
            ${prenCena ? `
              <span class="presence-summary-badge">✅ Presenza Confermata</span>
              <button type="button" class="btn-quick-cancel" ${cenaLocked ? 'disabled' : ''} onclick="quickCancelPresenza('${dStr}', 'cena')">
                Annulla Presenza
              </button>
            ` : `
              <button type="button" class="btn-quick-book" ${cenaLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'cena', false, false)">
                🍽️ Presente
              </button>
              <button type="button" class="btn-quick-book" style="border-color: #64748b; color: #475569;" ${cenaLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'cena', false, true)">
                ⏰ In Ritardo
              </button>
              ${isTuesdayOrThursday ? `
                <button type="button" class="btn-quick-book" style="border-color: #d97706; color: #b45309;" ${cenaLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'cena', true, false)">
                  🥪 Richiedi Busta
                </button>
              ` : ''}
            `}
          </div>
        </div>
      </div>
    `;
  }

  out += `</div>`;
  return out;
}

/**
 * Vista dettagliata per il singolo giorno selezionato con form per note personalizzate
 */
function renderDailyDetailedView(dataSel) {
  const dStr = formatYMD(dataSel);
  const settimana = getSettimanaMenu(dataSel);
  const giornoKey = getNomeGiorno(dataSel);
  const menuGiorno = MENU_14_GIORNI[settimana][giornoKey] || {};

  const isTuesdayOrThursday = (giornoKey === "martedi" || giornoKey === "giovedi");
  const variazionePranzo = getVariazioneCuocaPerData(dStr, "pranzo");
  const variazioneCena = getVariazioneCuocaPerData(dStr, "cena");
  const isMaster = haPermessiMaster() || (appState.user && appState.user.perm_mensa);
  const pranzoLocked = isPranzoBloccato(dataSel);
  const cenaLocked = isCenaBloccata(dataSel);

  const nomeGiornoFormat = capitalize(giornoKey);
  const dataFormattata = dataSel.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

  const emailUtente = appState.user ? appState.user.email.toLowerCase() : "";
  const prenPranzo = appState.mensaBookings.find(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === "pranzo" && m.email.toLowerCase() === emailUtente);
  const prenCena = appState.mensaBookings.find(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === "cena" && m.email.toLowerCase() === emailUtente);

  return `
    <div class="card" style="margin-bottom: 12px; background: var(--surface-alt);">
      <div class="flex-between">
        <h3 style="font-size: 15px; font-weight: 700; color: var(--primary);">
          📅 Dettaglio: ${nomeGiornoFormat}, ${dataFormattata}
        </h3>
        <button type="button" class="btn btn-secondary" style="font-size: 11.5px; padding: 4px 10px;" onclick="setMensaViewMode('settimana')">
          Torna alla Settimana
        </button>
      </div>
    </div>

    <!-- SEZIONE PRANZO -->
    <div class="card meal-card ${pranzoLocked ? 'card-disabled' : ''}">
      <div class="flex-between">
        <div class="flex-align">
          <span class="meal-icon">☀️</span>
          <div>
            <h3 class="meal-title">Pranzo delle 14:30</h3>
            <span class="meal-sub">${pranzoLocked ? '🔒 Chiuso (limite ore 13:30)' : '🟢 Prenotazioni aperte fino alle 13:30'}</span>
          </div>
        </div>
        ${prenPranzo ? '<span class="meal-status-pill booked">✓ Presente</span>' : ''}
        ${isMaster ? `
          <span class="master-attendees-badge" title="Visualizza presenti nel Pannello Master" onclick="switchTab('master')">
            👥 Presenti: <span class="count-num">${appState.mensaBookings.filter(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === 'pranzo').length}</span>
          </span>
        ` : ''}
        <span class="badge ${pranzoLocked ? 'badge-danger' : 'badge-success'}">${pranzoLocked ? 'Chiuso' : 'Aperto'}</span>
      </div>

      <div class="meal-menu-body">
        ${isTuesdayOrThursday ? `
          <div class="busta-classici-container">
            <div class="busta-classici-header">
              <span style="font-size: 26px;">🥪</span>
              <div>
                <strong style="color: #9a3412; font-size: 14px;">Pranzo al Sacco — Classici di Busta</strong>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #7c2d12;">
                  Il ${nomeGiornoFormat} a pranzo non c'è menù cotto: sono previsti i classici di busta, con possibilità di variazione della cuoca.
                </p>
              </div>
            </div>

            <div class="busta-chips-grid">
              ${CLASSICI_BUSTA.map(item => `
                <div class="busta-chip">
                  <span class="chip-icon">${item.icon}</span>
                  <div>
                    <strong>${item.nome}</strong>
                    <small>${item.desc}</small>
                  </div>
                </div>
              `).join("")}
            </div>

            <!-- Variazione Cuoca per pranzo -->
            ${variazionePranzo ? `
              <div class="cuoca-var-box has-var">
                <div class="flex-between">
                  <div class="flex-align">
                    <span style="font-size: 18px;">👩‍🍳</span>
                    <strong style="color: #92400e; font-size: 13px;">Variazione della Cuoca per il Pranzo:</strong>
                  </div>
                  ${isMaster ? `
                    <button type="button" class="btn btn-secondary" style="font-size: 11px; padding: 2px 8px;" onclick="apriModalVariazioneCuoca('${dStr}', 'pranzo')">Modifica</button>
                  ` : ''}
                </div>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #78350f; line-height: 1.4;">
                  ${escapeHtml(variazionePranzo)}
                </p>
              </div>
            ` : `
              <div class="cuoca-var-box no-var">
                <div class="flex-between">
                  <span style="font-size: 12px; color: #64748b;">
                    👩‍🍳 <em>Nessuna variazione speciale per il pranzo: valgono i classici di busta.</em>
                  </span>
                  ${isMaster ? `
                    <button type="button" class="btn btn-secondary" style="font-size: 11px; padding: 2px 8px;" onclick="apriModalVariazioneCuoca('${dStr}', 'pranzo')">+ Aggiungi Variazione Pranzo</button>
                  ` : ''}
                </div>
              </div>
            `}
          </div>
        ` : `
          <div class="dish-list">
            <div class="dish-item"><span class="dish-type">Primo:</span> <span class="dish-name">${menuGiorno.pranzo?.primo || '-'}</span></div>
            <div class="dish-item"><span class="dish-type">Secondo:</span> <span class="dish-name">${menuGiorno.pranzo?.secondo || '-'}</span></div>
            <div class="dish-item"><span class="dish-type">Contorno:</span> <span class="dish-name">${menuGiorno.pranzo?.contorno || '-'}</span></div>
            <div class="dish-item"><span class="dish-type">Dessert:</span> <span class="dish-name">${menuGiorno.pranzo?.dessert || '-'}</span></div>
          </div>
          ${variazionePranzo ? `
            <div class="cuoca-var-box has-var" style="margin-top: 10px;">
              <div class="flex-between">
                <div class="flex-align">
                  <span style="font-size: 18px;">👩‍🍳</span>
                  <strong style="color: #92400e; font-size: 13px;">Variazione della Cuoca per il Pranzo:</strong>
                </div>
                ${isMaster ? `
                  <button type="button" class="btn btn-secondary" style="font-size: 11px; padding: 2px 8px;" onclick="apriModalVariazioneCuoca('${dStr}', 'pranzo')">Modifica</button>
                ` : ''}
              </div>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #78350f; line-height: 1.4;">
                ${escapeHtml(variazionePranzo)}
              </p>
            </div>
          ` : (isMaster ? `
            <div style="margin-top: 8px; text-align: right;">
              <button type="button" class="btn-link-cuoca" onclick="apriModalVariazioneCuoca('${dStr}', 'pranzo')">
                👩‍🍳 + Aggiungi Variazione Cuoca per il Pranzo
              </button>
            </div>
          ` : '')}
        `}
      </div>

      <form id="form-prenota-pranzo" onsubmit="handlePrenotazioneMensa(event, 'pranzo')">
        <div class="checkbox-group">
          ${isTuesdayOrThursday ? `
            <label class="custom-checkbox">
              <input type="checkbox" id="pranzo-busta" checked ${pranzoLocked ? 'disabled' : ''}>
              <span>Richiedi Busta (Pranzo al sacco)</span>
            </label>
          ` : ''}
          <label class="custom-checkbox">
            <input type="checkbox" id="pranzo-ritardo" ${prenPranzo?.ritardo ? 'checked' : ''} ${pranzoLocked ? 'disabled' : ''}>
            <span>Arrivo in Ritardo (Lasciare piatto coperto con nome)</span>
          </label>
        </div>

        <div class="form-group" style="margin-top: 10px;">
          <input type="text" id="pranzo-note" class="input-text" placeholder="Note per la cucina (opzionale)..." value="${escapeHtml(prenPranzo?.note || '')}" ${pranzoLocked ? 'disabled' : ''}>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;" ${pranzoLocked ? 'disabled' : ''}>
            ${prenPranzo ? 'Aggiorna Presenza' : (isTuesdayOrThursday ? 'Presente (Busta)' : 'Presente')}
          </button>
          ${prenPranzo ? `
            <button type="button" class="btn-quick-cancel" ${pranzoLocked ? 'disabled' : ''} onclick="quickCancelPresenza('${dStr}', 'pranzo')">
              Annulla Presenza
            </button>
          ` : ''}
        </div>
      </form>
    </div>

    <!-- SEZIONE CENA -->
    <div class="card meal-card ${cenaLocked ? 'card-disabled' : ''}">
      <div class="flex-between">
        <div class="flex-align">
          <span class="meal-icon">🌙</span>
          <div>
            <h3 class="meal-title">Cena delle 19:30</h3>
            <span class="meal-sub">${cenaLocked ? '🔒 Chiuso (limite ore 18:30)' : '🟢 Prenotazioni aperte fino alle 18:30'}</span>
          </div>
        </div>
        ${prenCena ? '<span class="meal-status-pill booked">✓ Presente</span>' : ''}
        ${(haPermessiMaster() || (appState.user && appState.user.perm_mensa)) ? `
          <span class="master-attendees-badge" title="Visualizza presenti nel Pannello Master" onclick="switchTab('master')">
            👥 Presenti: <span class="count-num">${appState.mensaBookings.filter(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === 'cena').length}</span>
          </span>
        ` : ''}
        <span class="badge ${cenaLocked ? 'badge-danger' : 'badge-success'}">${cenaLocked ? 'Chiuso' : 'Aperto'}</span>
      </div>

      <div class="meal-menu-body">
        <div class="dish-list">
          <div class="dish-item"><span class="dish-type">Primo:</span> <span class="dish-name">${menuGiorno.cena?.primo || '-'}</span></div>
          <div class="dish-item"><span class="dish-type">Secondo:</span> <span class="dish-name">${menuGiorno.cena?.secondo || '-'}</span></div>
          <div class="dish-item"><span class="dish-type">Contorno:</span> <span class="dish-name">${menuGiorno.cena?.contorno || '-'}</span></div>
          <div class="dish-item"><span class="dish-type">Dessert:</span> <span class="dish-name">${menuGiorno.cena?.dessert || '-'}</span></div>
        </div>
        ${variazioneCena ? `
          <div class="cuoca-var-box has-var" style="margin-top: 10px;">
            <div class="flex-between">
              <div class="flex-align">
                <span style="font-size: 18px;">👩‍🍳</span>
                <strong style="color: #92400e; font-size: 13px;">Variazione della Cuoca per la Cena:</strong>
              </div>
              ${isMaster ? `
                <button type="button" class="btn btn-secondary" style="font-size: 11px; padding: 2px 8px;" onclick="apriModalVariazioneCuoca('${dStr}', 'cena')">Modifica</button>
              ` : ''}
            </div>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #78350f; line-height: 1.4;">
              ${escapeHtml(variazioneCena)}
            </p>
          </div>
        ` : (isMaster ? `
          <div style="margin-top: 8px; text-align: right;">
            <button type="button" class="btn-link-cuoca" onclick="apriModalVariazioneCuoca('${dStr}', 'cena')">
              👩‍🍳 + Aggiungi Variazione Cuoca per la Cena
            </button>
          </div>
        ` : '')}
      </div>

      <form id="form-prenota-cena" onsubmit="handlePrenotazioneMensa(event, 'cena')">
        <div class="checkbox-group">
          ${isTuesdayOrThursday ? `
            <label class="custom-checkbox">
              <input type="checkbox" id="cena-busta" ${prenCena?.busta ? 'checked' : ''} ${cenaLocked ? 'disabled' : ''}>
              <span>Richiedi Busta (Cena al sacco)</span>
            </label>
          ` : ''}
          <label class="custom-checkbox">
            <input type="checkbox" id="cena-ritardo" ${prenCena?.ritardo ? 'checked' : ''} ${cenaLocked ? 'disabled' : ''}>
            <span>Arrivo in Ritardo (Lasciare piatto coperto con nome)</span>
          </label>
        </div>

        <div class="form-group" style="margin-top: 10px;">
          <input type="text" id="cena-note" class="input-text" placeholder="Note per la cucina (opzionale)..." value="${escapeHtml(prenCena?.note || '')}" ${cenaLocked ? 'disabled' : ''}>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;" ${cenaLocked ? 'disabled' : ''}>
            ${prenCena ? 'Aggiorna Presenza' : 'Presente'}
          </button>
          ${prenCena ? `
            <button type="button" class="btn-quick-cancel" ${cenaLocked ? 'disabled' : ''} onclick="quickCancelPresenza('${dStr}', 'cena')">
              Annulla Presenza
            </button>
          ` : ''}
        </div>
      </form>
    </div>
  `;
}

/**
 * Genera i pulsanti per i giorni della settimana corrente
 */
function renderDayPills(currentSelected) {
  const giorniAbbr = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  let pills = "";

  const curr = new Date(currentSelected);
  const firstDayOfWeek = getLunediDellaSettimana(curr);

  for (let i = 0; i < 7; i++) {
    const d = new Date(firstDayOfWeek);
    d.setDate(firstDayOfWeek.getDate() + i);

    const isSelected = formatYMD(d) === formatYMD(currentSelected);
    const isToday = formatYMD(d) === formatYMD(new Date());
    const abbr = giorniAbbr[d.getDay()];
    const num = d.getDate();

    pills += `
      <button type="button" class="day-pill ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''}" onclick="selezionaGiornoMensa('${formatYMD(d)}')">
        <span class="day-abbr">${abbr}</span>
        <span class="day-num">${num}</span>
      </button>
    `;
  }
  return pills;
}

window.cambiaSettimanaMensa = function(offsetSettimane) {
  const curr = appState.selectedDateMensa || new Date();
  const nuovaData = new Date(curr);
  nuovaData.setDate(curr.getDate() + (offsetSettimane * 7));
  appState.selectedDateMensa = nuovaData;
  renderMensaView();
};

window.setMensaViewMode = function(mode) {
  appState.mensaViewMode = mode;
  renderMensaView();
};

window.apriDettaglioGiornoMensa = function(ymd) {
  appState.selectedDateMensa = new Date(ymd + "T00:00:00");
  appState.mensaViewMode = "giorno";
  renderMensaView();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.selezionaGiornoMensa = function(ymd) {
  appState.selectedDateMensa = new Date(ymd + "T00:00:00");
  renderMensaView();
};

window.quickSegnaPresenza = async function(dataStr, tipoPasto, busta, ritardo) {
  if (!appState.user) {
    mostraModalAuth(true);
    return;
  }

  const payload = {
    data: dataStr,
    email: appState.user.email,
    tipo_pasto: tipoPasto,
    busta: Boolean(busta),
    ritardo: Boolean(ritardo),
    note: ""
  };

  try {
    const res = await callApi("prenotaMensa", payload);
    if (res.success) {
      // Aggiorna lo stato locale
      const existIdx = appState.mensaBookings.findIndex(m => String(m.data).split("T")[0] === dataStr && m.tipo_pasto === tipoPasto && m.email.toLowerCase() === appState.user.email.toLowerCase());
      const entry = {
        id: res.id || ("M_" + Date.now()),
        data: dataStr,
        email: appState.user.email,
        tipo_pasto: tipoPasto,
        busta: Boolean(busta),
        ritardo: Boolean(ritardo),
        note: ""
      };
      if (existIdx !== -1) {
        appState.mensaBookings[existIdx] = entry;
      } else {
        appState.mensaBookings.push(entry);
      }

      mostraToast(`Presenza a ${tipoPasto} segnata con successo!`, "success");
      renderMensaView();
      if (haPermessiMaster()) caricaDatiMaster();
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile salvare la presenza"), "error");
    }
  } catch (err) {
    mostraToast("Errore di connessione", "error");
  }
};

window.quickCancelPresenza = async function(dataStr, tipoPasto) {
  if (!appState.user) {
    mostraModalAuth(true);
    return;
  }

  try {
    const res = await callApi("cancellaPrenotazioneMensa", {
      data: dataStr,
      email: appState.user.email,
      tipo_pasto: tipoPasto
    });

    if (res.success) {
      appState.mensaBookings = appState.mensaBookings.filter(m => !(String(m.data).split("T")[0] === dataStr && m.tipo_pasto === tipoPasto && m.email.toLowerCase() === appState.user.email.toLowerCase()));
      mostraToast(`Presenza a ${tipoPasto} cancellata`, "info");
      renderMensaView();
      if (haPermessiMaster()) caricaDatiMaster();
    } else {
      mostraToast("Errore durante la cancellazione", "error");
    }
  } catch (err) {
    mostraToast("Errore di rete", "error");
  }
};

window.handlePrenotazioneMensa = async function(event, tipoPasto) {
  event.preventDefault();

  if (!appState.user) {
    mostraModalAuth(true);
    return;
  }

  const dataStr = formatYMD(appState.selectedDateMensa || new Date());
  const busta = document.getElementById(`${tipoPasto}-busta`)?.checked || false;
  const ritardo = document.getElementById(`${tipoPasto}-ritardo`)?.checked || false;
  const note = document.getElementById(`${tipoPasto}-note`)?.value || "";

  const payload = {
    data: dataStr,
    email: appState.user.email,
    tipo_pasto: tipoPasto,
    busta: busta,
    ritardo: ritardo,
    note: note
  };

  const btn = event.target.querySelector("button[type='submit']");
  const originalText = btn.innerText;
  btn.disabled = true;
  btn.innerText = "Salvataggio in corso...";

  try {
    const res = await callApi("prenotaMensa", payload);
    if (res.success) {
      const existIdx = appState.mensaBookings.findIndex(m => String(m.data).split("T")[0] === dataStr && m.tipo_pasto === tipoPasto && m.email.toLowerCase() === appState.user.email.toLowerCase());
      const entry = {
        id: res.id || ("M_" + Date.now()),
        data: dataStr,
        email: appState.user.email,
        tipo_pasto: tipoPasto,
        busta: Boolean(busta),
        ritardo: Boolean(ritardo),
        note: note
      };
      if (existIdx !== -1) {
        appState.mensaBookings[existIdx] = entry;
      } else {
        appState.mensaBookings.push(entry);
      }

      mostraToast(`Presenza ${tipoPasto} confermata con successo!`, "success");
      renderMensaView();
      if (haPermessiMaster()) caricaDatiMaster();
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile prenotare"), "error");
    }
  } catch (err) {
    mostraToast("Errore di connessione", "error");
  } finally {
    btn.disabled = false;
    btn.innerText = originalText;
  }
};

// ----------------------------------------------------------------------------
// LOGICA SEZIONE 3: SPAZI (CHIESA E SALA TV - SLOT 30 MINUTI)
// ----------------------------------------------------------------------------

function renderSpaziView() {
  const container = document.getElementById("spazi-container");
  if (!container) return;

  if (!appState.selectedSpazioRisorsa) {
    appState.selectedSpazioRisorsa = "Chiesa";
  }
  if (!appState.selectedSpazioData) {
    appState.selectedSpazioData = formatYMD(new Date());
  }
  if (!appState.selectedSpazioFascia) {
    appState.selectedSpazioFascia = "tutti";
  }

  const risorsaAttiva = appState.selectedSpazioRisorsa;
  const dataAttiva = appState.selectedSpazioData;
  const fasciaAttiva = appState.selectedSpazioFascia;
  const oggiYMD = formatYMD(new Date());

  // Genera ribbon per 14 giorni
  const giorniSettimanaBrevi = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];
  const mesiBrevi = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];

  let ribbonHtml = "";
  const baseDate = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dYMD = formatYMD(d);
    const isSel = (dYMD === dataAttiva);
    const dayName = i === 0 ? "OGGI" : giorniSettimanaBrevi[d.getDay()];
    const dayNum = d.getDate();
    const monthName = mesiBrevi[d.getMonth()];

    ribbonHtml += `
      <div class="date-chip ${isSel ? 'active' : ''}" onclick="cambiaDataSpazio('${dYMD}')">
        <span class="date-chip-day">${dayName}</span>
        <span class="date-chip-num">${dayNum}</span>
        <span class="date-chip-month">${monthName}</span>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- HEADER PRESENTAZIONE AMBIENTI -->
    <div class="card" style="margin-bottom: 12px;">
      <h2 class="card-title">Prenotazione Ambienti Comuni</h2>
      <p class="card-desc">Riserva uno slot per la Chiesa / Cappella o per la Sala TV. Slot da 30 minuti con attivazione immediata.</p>

      <!-- SELETTORE RISORSE: SOLO CHIESA E SALA TV -->
      <div class="spazi-resource-selector">
        <button type="button" class="spazi-resource-btn ${risorsaAttiva === 'Chiesa' ? 'active' : ''}" onclick="cambiaRisorsaSpazio('Chiesa')">
          <span class="spazi-res-icon">⛪</span>
          <span class="spazi-res-title">Chiesa / Cappella</span>
          <span class="spazi-res-sub">Slot 30 min • Preghiera & Liturgia</span>
        </button>

        <button type="button" class="spazi-resource-btn ${risorsaAttiva === 'Sala TV' ? 'active' : ''}" onclick="cambiaRisorsaSpazio('Sala TV')">
          <span class="spazi-res-icon">📺</span>
          <span class="spazi-res-title">Sala TV / Cinema</span>
          <span class="spazi-res-sub">Slot 30 min • Visione & Comunità</span>
        </button>
      </div>

      <!-- SELETTORE DATA: RIBBON ORIZZONTALE + PICKER -->
      <div class="date-ribbon-wrap">
        <div class="date-ribbon-title">
          <span>Seleziona Data (${dataAttiva === oggiYMD ? 'Oggi' : dataAttiva})</span>
          <input type="date" class="input-date-small" value="${dataAttiva}" min="${oggiYMD}" onchange="cambiaDataSpazio(this.value)" title="Scegli qualsiasi data">
        </div>
        <div class="date-ribbon">
          ${ribbonHtml}
        </div>
      </div>

      <!-- FILTRI FASCE ORARIE -->
      <div class="time-filter-row">
        <button type="button" class="time-filter-chip ${fasciaAttiva === 'tutti' ? 'active' : ''}" onclick="cambiaFasciaSpazio('tutti')">
          Tutti gli orari
        </button>
        <button type="button" class="time-filter-chip ${fasciaAttiva === 'mattina' ? 'active' : ''}" onclick="cambiaFasciaSpazio('mattina')">
          🌅 Mattina (06:30 - 12:30)
        </button>
        <button type="button" class="time-filter-chip ${fasciaAttiva === 'pomeriggio' ? 'active' : ''}" onclick="cambiaFasciaSpazio('pomeriggio')">
          ☀️ Pomeriggio (12:30 - 18:30)
        </button>
        <button type="button" class="time-filter-chip ${fasciaAttiva === 'sera' ? 'active' : ''}" onclick="cambiaFasciaSpazio('sera')">
          🌙 Sera (18:30 - 23:30)
        </button>
      </div>

      <!-- STATUS BAR & CONTEGGIO DISPONIBILITÀ -->
      <div id="spazi-availability-summary" class="flex-between text-xs text-muted" style="margin-bottom: 10px; padding: 4px 2px;">
        <!-- Inserito dinamicamente da renderSlotSpazi -->
      </div>

      <!-- GRIGLIA SLOT 30 MINUTI V2 -->
      <div id="slots-grid-container" class="slots-grid-v2">
        <!-- Inseriti dinamicamente da renderSlotSpazi -->
      </div>
    </div>

    <!-- CARD MIE PRENOTAZIONI ATTIVE -->
    <div class="card" style="margin-top: 14px;">
      <h3 class="card-title-sm">Le Mie Prenotazioni Attive</h3>
      <div id="mie-prenotazioni-spazi-list" class="mini-list">
        <!-- Renderizzate dinamicamente -->
      </div>
    </div>
  `;

  renderSlotSpazi();
}

window.cambiaRisorsaSpazio = function(risorsa) {
  appState.selectedSpazioRisorsa = risorsa;
  renderSpaziView();
};

window.cambiaDataSpazio = function(dateStr) {
  if (!dateStr) return;
  appState.selectedSpazioData = dateStr;
  renderSpaziView();
};

window.cambiaFasciaSpazio = function(fascia) {
  appState.selectedSpazioFascia = fascia;
  renderSpaziView();
};

/**
 * Genera l'elenco completo degli slot a 30 minuti dalle 06:30 alle 23:30
 */
function getTuttiSlotOrari30Min() {
  const slots = [];
  let currentHour = 6;
  let currentMin = 30;

  while (currentHour < 23 || (currentHour === 23 && currentMin <= 30)) {
    const startH = String(currentHour).padStart(2, "0");
    const startM = String(currentMin).padStart(2, "0");

    let endHour = currentHour;
    let endMin = currentMin + 30;
    if (endMin >= 60) {
      endHour++;
      endMin = 0;
    }

    const endH = String(endHour).padStart(2, "0");
    const endM = String(endMin).padStart(2, "0");

    slots.push(`${startH}:${startM} - ${endH}:${endM}`);

    currentHour = endHour;
    currentMin = endMin;
  }
  return slots;
}

/**
 * Filtra gli slot per fascia oraria
 */
function filtraSlotPerFascia(slot, fascia) {
  if (fascia === "tutti") return true;
  const startPart = slot.split(" - ")[0]; // "07:30"
  const [h, m] = startPart.split(":").map(Number);
  const timeVal = h * 60 + m;

  if (fascia === "mattina") {
    // 06:30 (390) fino a 12:30 (750)
    return timeVal >= 390 && timeVal < 750;
  }
  if (fascia === "pomeriggio") {
    // 12:30 (750) fino a 18:30 (1110)
    return timeVal >= 750 && timeVal < 1110;
  }
  if (fascia === "sera") {
    // 18:30 (1110) in poi
    return timeVal >= 1110;
  }
  return true;
}

/**
 * Genera e visualizza gli slot orari nella griglia V2 con schede dedicate
 */
function renderSlotSpazi() {
  const grid = document.getElementById("slots-grid-container");
  const summaryEl = document.getElementById("spazi-availability-summary");
  if (!grid) return;

  const selRisorsa = appState.selectedSpazioRisorsa || "Chiesa";
  const selData = appState.selectedSpazioData || formatYMD(new Date());
  const selFascia = appState.selectedSpazioFascia || "tutti";

  const tuttiSlot = getTuttiSlotOrari30Min();
  const slotFiltrati = tuttiSlot.filter(s => filtraSlotPerFascia(s, selFascia));

  // Estrai gli slot già occupati per risorsa e data
  const occupati = (appState.prenotazioniSpazi || []).filter(p => {
    const pData = String(p.data).split("T")[0];
    return p.risorsa === selRisorsa && pData === selData;
  });

  const occupatiMap = {};
  occupati.forEach(p => {
    occupatiMap[p.slot_orario] = p;
  });

  const isMaster = haPermessiMaster();
  const currentUserEmail = appState.user ? appState.user.email.toLowerCase() : "";

  let totaliFascia = slotFiltrati.length;
  let disponibiliFascia = 0;

  let html = "";
  slotFiltrati.forEach(slot => {
    const pren = occupatiMap[slot];
    const isOccupato = Boolean(pren);
    const prenEmail = pren ? String(pren.email).toLowerCase() : "";
    const isMio = isOccupato && currentUserEmail && (prenEmail === currentUserEmail);

    if (!isOccupato) {
      disponibiliFascia++;
      html += `
        <div class="slot-card-v2 slot-available" onclick="prenotaSlotDiretto('${slot}')" title="Clicca per prenotare questo slot di 30 minuti">
          <div class="slot-time-text">${slot}</div>
          <span class="slot-status-pill">🟢 Disponibile</span>
        </div>
      `;
    } else if (isMio) {
      html += `
        <div class="slot-card-v2 slot-mine">
          <div class="slot-time-text">${slot}</div>
          <span class="slot-status-pill">⭐ La tua prenotazione</span>
          <button type="button" class="slot-cancel-btn" onclick="cancellaSlotSpazio('${pren.id || ''}', '${slot}', false)">
            Annulla Prenotazione
          </button>
        </div>
      `;
    } else if (isMaster) {
      // Per il Master: mostra chi occupa lo slot e pulsante per liberarlo
      html += `
        <div class="slot-card-v2 slot-master">
          <div class="slot-time-text">${slot}</div>
          <span class="slot-status-pill" title="${escapeHtml(pren.email)}">👑 Occupato: ${escapeHtml(pren.email.split('@')[0])}</span>
          <button type="button" class="slot-cancel-btn" onclick="cancellaSlotSpazio('${pren.id || ''}', '${slot}', true)">
            Libera Slot (Master)
          </button>
        </div>
      `;
    } else {
      // Per gli altri residenti: slot occupato, preservando la privacy
      html += `
        <div class="slot-card-v2 slot-occupied" title="Questo slot è già stato riservato">
          <div class="slot-time-text">${slot}</div>
          <span class="slot-status-pill">🔒 Occupato</span>
        </div>
      `;
    }
  });

  grid.innerHTML = html || `<p class="empty-state-text" style="grid-column: 1 / -1;">Nessuno slot trovato per i filtri selezionati.</p>`;

  if (summaryEl) {
    summaryEl.innerHTML = `
      <span>Ambiente: <strong>${selRisorsa === 'Chiesa' ? 'Chiesa / Cappella' : 'Sala TV'}</strong> • ${selData}</span>
      <span class="badge" style="background:#f1f5f9; font-weight: 700;">${disponibiliFascia} / ${totaliFascia} liberi</span>
    `;
  }

  renderMiePrenotazioniSpazi();
}

/**
 * Prenotazione diretta immediata a 1 click dello slot
 */
window.prenotaSlotDiretto = async function(slot) {
  if (!appState.user) {
    mostraModalAuth(true);
    return;
  }

  const risorsa = appState.selectedSpazioRisorsa || "Chiesa";
  const data = appState.selectedSpazioData || formatYMD(new Date());
  const nomeRisorsa = risorsa === "Chiesa" ? "Chiesa / Cappella" : "Sala TV";

  const ok = confirm(`Confermi la prenotazione per ${nomeRisorsa} il giorno ${data} nello slot ${slot}?`);
  if (!ok) return;

  try {
    const res = await callApi("prenotaSpazio", {
      risorsa,
      data,
      slot_orario: slot,
      email: appState.user.email
    });

    if (res.success) {
      mostraToast("Slot prenotato con successo!", "success");
      // Aggiungi alla cache locale
      if (!appState.prenotazioniSpazi) appState.prenotazioniSpazi = [];
      appState.prenotazioniSpazi.push({
        id: res.id || ("S_" + Date.now()),
        risorsa,
        data,
        slot_orario: slot,
        email: appState.user.email,
        timestamp: new Date().toISOString()
      });
      renderSlotSpazi();
    } else {
      mostraToast("Errore: " + (res.error || "Slot non disponibile"), "error");
    }
  } catch (err) {
    mostraToast("Errore di connessione", "error");
  }
};

/**
 * Cancellazione slot (per l'utente proprietario o per il Master)
 */
window.cancellaSlotSpazio = async function(id, slot, isMasterAction) {
  if (!appState.user) return;
  const risorsa = appState.selectedSpazioRisorsa || "Chiesa";
  const data = appState.selectedSpazioData || formatYMD(new Date());

  const msg = isMasterAction
    ? `Come Amministratore / Master, confermi di voler liberare lo slot ${slot} per ${risorsa} del ${data}?`
    : `Vuoi annullare la tua prenotazione per ${risorsa} nello slot ${slot}?`;

  if (!confirm(msg)) return;

  try {
    const res = await callApi("cancellaPrenotazioneSpazio", {
      id,
      risorsa,
      data,
      slot_orario: slot,
      email: isMasterAction ? "" : appState.user.email
    });

    if (res.success) {
      mostraToast("Prenotazione annullata", "info");
      // Aggiorna cache locale
      appState.prenotazioniSpazi = (appState.prenotazioniSpazi || []).filter(p => {
        if (id && String(p.id) === String(id)) return false;
        const pData = String(p.data).split("T")[0];
        if (p.risorsa === risorsa && pData === data && p.slot_orario === slot) return false;
        return true;
      });
      renderSlotSpazi();
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile annullare"), "error");
    }
  } catch (err) {
    mostraToast("Errore di connessione", "error");
  }
};

function renderMiePrenotazioniSpazi() {
  const container = document.getElementById("mie-prenotazioni-spazi-list");
  if (!container) return;

  if (!appState.user) {
    container.innerHTML = `<p class="empty-state-text">Effettua il login per visualizzare le tue prenotazioni.</p>`;
    return;
  }

  const mie = (appState.prenotazioniSpazi || []).filter(p => p.email && p.email.toLowerCase() === appState.user.email.toLowerCase());
  if (mie.length === 0) {
    container.innerHTML = `<p class="empty-state-text">Nessuna prenotazione attiva registrata.</p>`;
    return;
  }

  // Ordina per data e orario decrescente
  mie.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  container.innerHTML = mie.map(p => `
    <div class="mini-item flex-between" style="padding: 8px 6px;">
      <div>
        <div class="flex-align" style="gap: 6px;">
          <span style="font-size: 16px;">${p.risorsa === 'Chiesa' ? '⛪' : '📺'}</span>
          <strong>${escapeHtml(p.risorsa)}</strong>
          <span class="badge" style="background:#f1f5f9; font-size:11px;">${p.slot_orario}</span>
        </div>
        <div class="text-muted text-xs" style="margin-top: 2px;">📅 ${String(p.data).split('T')[0]}</div>
      </div>
      <button type="button" class="btn btn-secondary btn-sm" onclick="cancellaSlotSpazio('${p.id || ''}', '${p.slot_orario}', false)" style="color: #dc2626; border-color: #fca5a5; background: #fff;">
        Annulla
      </button>
    </div>
  `).join("");
}

// ----------------------------------------------------------------------------
// LOGICA SEZIONE 4: MANUTENZIONE (CON RESIZE CANVAS A MAX 800PX)
// ----------------------------------------------------------------------------

/**
 * Ridimensiona l'immagine selezionata tramite un <canvas> invisibile in memoria.
 * Dimensione massima: 800px (larghezza o altezza).
 * Comprime in formato JPEG (qualità 0.75) per prevenire i timeout di Apps Script.
 */
function processImageResize(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Il file caricato non è un'immagine valida."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calcolo dimensioni con vincolo max 800px
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        // Creazione canvas invisibile offscreen
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compressione JPEG qualità 0.75
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
        resolve({
          dataUrl: compressedDataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize: Math.round((compressedDataUrl.length * 3) / 4)
        });
      };
      img.onerror = () => reject(new Error("Errore durante il caricamento dell'immagine."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Impossibile leggere il file."));
    reader.readAsDataURL(file);
  });
}

function setupManutenzioneHandlers() {
  const fileInput = document.getElementById("manutenzione-foto-input");
  const previewBox = document.getElementById("manutenzione-foto-preview-box");
  const previewImg = document.getElementById("manutenzione-foto-preview");
  const previewInfo = document.getElementById("manutenzione-resize-info");

  if (!fileInput) return;

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) {
      appState.compressedImageBase64 = null;
      if (previewBox) previewBox.style.display = "none";
      return;
    }

    try {
      if (previewInfo) previewInfo.innerText = "Ottimizzazione immagine in corso...";
      if (previewBox) previewBox.style.display = "block";

      const result = await processImageResize(file);
      appState.compressedImageBase64 = result.dataUrl;

      if (previewImg) previewImg.src = result.dataUrl;
      if (previewInfo) {
        const origKb = Math.round(result.originalSize / 1024);
        const compKb = Math.round(result.compressedSize / 1024);
        previewInfo.innerText = `Risoluzione: ${result.width}x${result.height}px • Peso compresso: ${compKb} KB (da ${origKb} KB)`;
      }
    } catch (err) {
      console.error(err);
      mostraToast(err.message, "error");
      fileInput.value = "";
      appState.compressedImageBase64 = null;
      if (previewBox) previewBox.style.display = "none";
    }
  });

  const form = document.getElementById("form-segnala-guasto");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!appState.user) {
        mostraModalAuth(true);
        return;
      }

      const descrizione = document.getElementById("manutenzione-descrizione")?.value.trim();
      const luogo = document.getElementById("manutenzione-luogo")?.value.trim();

      if (!descrizione) {
        mostraToast("Inserisci una descrizione del guasto", "warning");
        return;
      }

      const testoCompleto = luogo ? `[${luogo}] ${descrizione}` : descrizione;
      const submitBtn = document.getElementById("btn-submit-guasto");
      submitBtn.disabled = true;
      submitBtn.innerText = "Invio in corso...";

      try {
        const res = await callApi("caricaGuasto", {
          email: appState.user.email,
          descrizione: testoCompleto,
          fotoBase64: appState.compressedImageBase64 || "",
          mimeType: "image/jpeg"
        });

        if (res.success) {
          mostraToast("Segnalazione inviata con successo!", "success");
          form.reset();
          appState.compressedImageBase64 = null;
          if (previewBox) previewBox.style.display = "none";
          if (haPermessiMaster()) caricaDatiMaster();
          caricaGuastiRecenti();
        } else {
          mostraToast("Errore invio: " + (res.error || "Impossibile salvare"), "error");
        }
      } catch (err) {
        mostraToast("Errore di rete nell'invio del guasto", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Invia Segnalazione Guasto";
      }
    });
  }
}

async function caricaGuastiRecenti() {
  const feed = document.getElementById("manutenzione-recenti-list");
  if (!feed) return;

  // Mostra i guasti attuali salvati
  const data = await callApi("getMasterData", { email: appState.user ? appState.user.email : "" });
  if (data && data.guasti) {
    appState.guasti = data.guasti;
    renderFeedGuasti(feed, appState.guasti.slice(0, 5));
  }
}

function renderFeedGuasti(container, guastiList) {
  if (!guastiList || guastiList.length === 0) {
    container.innerHTML = `<p class="empty-state-text">Nessun guasto segnalato recentemente.</p>`;
    return;
  }

  container.innerHTML = guastiList.map(g => {
    const isRisolto = g.stato === "Risolto";
    return `
      <div class="guasto-card card-inner">
        <div class="flex-between">
          <span class="badge ${isRisolto ? 'badge-success' : 'badge-danger'}">${g.stato}</span>
          <span class="text-xs text-muted">${new Date(g.timestamp).toLocaleDateString("it-IT")}</span>
        </div>
        <p class="guasto-desc">${escapeHtml(g.descrizione)}</p>
        ${g.link_foto ? `
          <div class="guasto-thumb-wrap">
            <img src="${g.link_foto}" alt="Foto guasto" class="guasto-thumb" onclick="apriFotoInNuovaScheda('${g.link_foto}')">
            <span class="text-xs text-muted">Clicca per ingrandire</span>
          </div>
        ` : ''}
        <div class="text-xs text-muted">Segnalato da: ${escapeHtml(g.email)}</div>
      </div>
    `;
  }).join("");
}

window.apriFotoInNuovaScheda = function(url) {
  if (url.startsWith("data:image")) {
    const w = window.open("");
    w.document.write(`<img src="${url}" style="max-width: 100%; height: auto;" />`);
  } else {
    window.open(url, "_blank");
  }
};

// ----------------------------------------------------------------------------
// LOGICA SEZIONE 5: SEZIONE MASTER (DINAMICA IN BASE AI PERMESSI)
// ----------------------------------------------------------------------------

function haPermessiMaster() {
  if (!appState.user) return false;
  return Boolean(appState.user.perm_admin || appState.user.perm_mensa || appState.user.perm_manutenzione);
}

async function caricaDatiMaster() {
  const masterTabBtn = document.getElementById("nav-tab-master");
  if (masterTabBtn) {
    if (haPermessiMaster()) {
      masterTabBtn.style.display = "flex";
    } else {
      masterTabBtn.style.display = "none";
      return;
    }
  }

  try {
    const res = await callApi("getMasterData", { email: appState.user.email });
    if (res.success) {
      appState.utentiInAttesa = res.utentiInAttesa || [];
      appState.mensaBookings = res.mensa || [];
      appState.guasti = res.guasti || [];
      appState.cachedConfig = res.config || appState.cachedConfig;

      renderMasterSection();
    }
  } catch (err) {
    console.error("Errore caricamento Master Data:", err);
  }
}

function renderMasterSection() {
  const container = document.getElementById("master-dynamic-content");
  if (!container || !appState.user) return;

  const { perm_admin, perm_mensa, perm_manutenzione } = appState.user;

  let html = "";

  // 1. SUB-PANNELLO ADMIN: Utenti in attesa & Modifica Regolamento/Contatti
  if (perm_admin) {
    html += `
      <div class="master-block card">
        <div class="master-header">
          <span class="master-tag">ADMIN</span>
          <h3 class="card-title">Gestione Utenti & Approvazioni</h3>
        </div>

        <div class="sub-section">
          <h4>Utenti in Attesa di Registrazione (${appState.utentiInAttesa.length})</h4>
          <div id="admin-utenti-attesa-list">
            ${appState.utentiInAttesa.length === 0 ? '<p class="empty-state-text">Nessun utente in attesa di approvazione.</p>' : ''}
            ${appState.utentiInAttesa.map(u => `
              <div class="user-approval-row card-inner">
                <div class="user-info">
                  <strong>${escapeHtml(u.nome)}</strong>
                  <span class="text-muted text-sm">${escapeHtml(u.email)}</span>
                </div>
                <div class="permessi-grid">
                  <label><input type="checkbox" id="p-mensa-${escapeHtml(u.email)}"> Mensa</label>
                  <label><input type="checkbox" id="p-manut-${escapeHtml(u.email)}"> Manut.</label>
                  <label><input type="checkbox" id="p-spazi-${escapeHtml(u.email)}" checked> Spazi</label>
                  <label><input type="checkbox" id="p-admin-${escapeHtml(u.email)}"> Admin</label>
                </div>
                <button type="button" class="btn btn-success btn-sm" onclick="approvaUtente('${escapeHtml(u.email)}')">
                  Approva Accesso
                </button>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="sub-section" style="margin-top: 24px;">
          <h4>Modifica Testi Bacheca Istituzionale</h4>
          <form onsubmit="handleAggiornaTestiBacheca(event)">
            <div class="form-group">
              <label for="admin-regolamento">Info_Regolamento</label>
              <textarea id="admin-regolamento" class="input-textarea" rows="4">${escapeHtml(appState.cachedConfig.Info_Regolamento || '')}</textarea>
            </div>
            <div class="form-group">
              <label for="admin-contatti">Info_Contatti</label>
              <textarea id="admin-contatti" class="input-textarea" rows="3">${escapeHtml(appState.cachedConfig.Info_Contatti || '')}</textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Salva Modifiche Bacheca</button>
          </form>
        </div>
      </div>

      <!-- GESTIONE BACHECA & APPUNTAMENTI MASTER -->
      <div class="master-block card">
        <div class="master-header flex-between" style="flex-wrap: wrap; gap: 8px;">
          <div class="flex-align">
            <span class="master-tag" style="background:#0284c7; color:#fff;">MASTER BACHECA</span>
            <h3 class="card-title" style="margin: 0;">Gestione Appuntamenti, Ricorrenze & Avvisi</h3>
          </div>
          <span class="badge" style="background:#f1f5f9; font-weight:700;">${(appState.bacheca || []).length} appuntamenti attivi</span>
        </div>
        <p class="card-desc" style="margin-top: 4px; font-size: 13px;">
          Da questa sezione puoi pubblicare direttamente in Bacheca nuovi appuntamenti comunitari, compleanni sacerdotali o di residenti, ricorrenze e ritiri spirituali, oppure consultare ed eliminare quelli esistenti.
        </p>

        <!-- FORM RAPIDO INSERIMENTO MASTER -->
        <div class="card-inner" style="background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 18px; border-radius: 8px; padding: 14px;">
          <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; display: flex; align-items: center; gap: 6px;">
            <span>➕</span> <strong>Nuovo Appuntamento / Avviso per la Bacheca</strong>
          </h4>
          <form onsubmit="handleMasterAggiungiAppuntamento(event)">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 10px;">
              <div class="form-group" style="margin: 0;">
                <label for="master-bacheca-tipo" style="font-size: 12px; font-weight: 600;">Tipologia</label>
                <select id="master-bacheca-tipo" class="input-select" style="padding: 7px 10px; font-size: 13px;">
                  <option value="avviso">📢 Avviso Comunitario / Direzione</option>
                  <option value="compleanno">🎂 Compleanno</option>
                  <option value="anniversario">🔔 Anniversario Sacerdotale / Professione</option>
                  <option value="evento">📆 Incontro / Serata Comunitaria</option>
                  <option value="speciale">⛪ Celebrazione Speciale / Ritiro</option>
                </select>
              </div>
              <div class="form-group" style="margin: 0;">
                <label for="master-bacheca-data" style="font-size: 12px; font-weight: 600;">Data dell'Evento</label>
                <input type="date" id="master-bacheca-data" class="input-date" style="padding: 6px 10px; font-size: 13px;" value="${formatYMD(new Date())}" required>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label for="master-bacheca-titolo" style="font-size: 12px; font-weight: 600;">Titolo dell'Appuntamento</label>
              <input type="text" id="master-bacheca-titolo" class="input-text" style="padding: 7px 10px; font-size: 13px;" placeholder="Es. Compleanno Don Andrea Dotti, Serata Fraterna, Ritiro Spirituale..." required>
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label for="master-bacheca-desc" style="font-size: 12px; font-weight: 600;">Dettagli / Programma / Luogo (opzionale)</label>
              <textarea id="master-bacheca-desc" class="input-textarea" rows="2" style="font-size: 13px;" placeholder="Es. Ore 20:45 in Sala TV o Cappella..."></textarea>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-bottom: 12px;">
              <div class="form-group" style="margin: 0;">
                <label for="master-bacheca-autore" style="font-size: 12px; font-weight: 600;">Autore / Firmato da</label>
                <input type="text" id="master-bacheca-autore" class="input-text" style="padding: 6px 10px; font-size: 13px;" value="${escapeHtml(appState.user?.nome || 'Direzione')}">
              </div>
              <div class="form-group" style="margin: 0;">
                <label for="master-bacheca-priorita" style="font-size: 12px; font-weight: 600;">Priorità</label>
                <select id="master-bacheca-priorita" class="input-select" style="padding: 6px 10px; font-size: 13px;">
                  <option value="normale">Normale</option>
                  <option value="alta">⭐ In Evidenza (Alta priorità)</option>
                </select>
              </div>
            </div>

            <button type="submit" id="btn-master-pubblica-bacheca" class="btn btn-primary btn-block">
              ➕ Inserisci in Bacheca da Master
            </button>
          </form>
        </div>

        <!-- ELENCO APPUNTAMENTI IN BACHECA -->
        <div class="sub-section">
          <div class="flex-between" style="margin-bottom: 8px;">
            <h4 style="margin: 0; font-size: 14px;">Elenco Appuntamenti Attivi (${(appState.bacheca || []).length})</h4>
          </div>
          <div class="table-responsive">
            <table class="master-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th>Titolo & Note</th>
                  <th>Autore</th>
                  <th>Azione</th>
                </tr>
              </thead>
              <tbody>
                ${(appState.bacheca || []).length === 0 ? `<tr><td colspan="5" style="text-align:center; padding: 18px; color: #64748b;">Nessun appuntamento presente in bacheca. Compila il modulo sopra per pubblicarne uno.</td></tr>` : ''}
                ${(appState.bacheca || []).map(b => {
                  let badgeType = "badge-primary";
                  let icon = "📢";
                  if (b.tipo === "compleanno") { badgeType = "badge-accent"; icon = "🎂"; }
                  else if (b.tipo === "anniversario") { badgeType = "badge-warning"; icon = "🔔"; }
                  else if (b.tipo === "evento") { badgeType = "badge-info"; icon = "📆"; }
                  else if (b.tipo === "speciale") { badgeType = "badge-secondary"; icon = "⛪"; }

                  return `
                    <tr>
                      <td><span class="badge ${badgeType}">${icon} ${escapeHtml(b.tipo || 'avviso')}</span></td>
                      <td><strong>${String(b.data).split('T')[0]}</strong></td>
                      <td>
                        <strong>${escapeHtml(b.titolo)}</strong>
                        ${b.descrizione ? `<div class="text-xs text-muted" style="margin-top:2px;">${escapeHtml(b.descrizione)}</div>` : ''}
                        ${b.priorita === 'alta' ? '<span class="badge badge-danger" style="font-size:10px; margin-top:2px;">⭐ In evidenza</span>' : ''}
                      </td>
                      <td class="text-sm">${escapeHtml(b.autore || '-')}</td>
                      <td>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="eliminaAvvisoBacheca('${escapeHtml(b.id)}')" style="color: #dc2626; border-color: #fca5a5; padding: 4px 8px; font-size: 11px;">
                          🗑️ Elimina
                        </button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // 2. SUB-PANNELLO MENSA: Totali presenti, buste, note e variazione straordinaria
  if (perm_mensa) {
    const dataFiltroYMD = appState.masterMensaDate || formatYMD(new Date());
    const prenotazioniGiorno = appState.mensaBookings.filter(m => String(m.data).split("T")[0] === dataFiltroYMD);

    const countPranzo = prenotazioniGiorno.filter(m => m.tipo_pasto === "pranzo").length;
    const countCena = prenotazioniGiorno.filter(m => m.tipo_pasto === "cena").length;
    const countBuste = prenotazioniGiorno.filter(m => m.busta).length;
    const countRitardi = prenotazioniGiorno.filter(m => m.ritardo).length;

    html += `
      <div class="master-block card">
        <div class="master-header flex-between" style="flex-wrap: wrap; gap: 8px;">
          <div class="flex-align">
            <span class="master-tag">MENSA</span>
            <h3 class="card-title" style="margin: 0;">Presenze & Gestione Cucina</h3>
          </div>
          <div class="flex-align" style="gap: 6px;">
            <label for="master-mensa-date-picker" style="font-size: 12px; font-weight: 600; color: #475569;">Giorno:</label>
            <input type="date" id="master-mensa-date-picker" class="input-date" style="padding: 3px 8px; font-size: 12px;" value="${dataFiltroYMD}" onchange="cambiaDataMasterMensa(this.value)">
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="metrics-grid">
          <div class="metric-card" style="border-top: 3px solid var(--primary);">
            <span class="metric-val" style="color: var(--primary);">${countPranzo}</span>
            <span class="metric-lbl">Presenti Pranzo (14:30)</span>
          </div>
          <div class="metric-card" style="border-top: 3px solid #2563eb;">
            <span class="metric-val" style="color: #2563eb;">${countCena}</span>
            <span class="metric-lbl">Presenti Cena (19:30)</span>
          </div>
          <div class="metric-card" style="border-top: 3px solid #d97706;">
            <span class="metric-val" style="color: #d97706;">${countBuste}</span>
            <span class="metric-lbl">Buste / Al sacco</span>
          </div>
          <div class="metric-card" style="border-top: 3px solid #475569;">
            <span class="metric-val" style="color: #475569;">${countRitardi}</span>
            <span class="metric-lbl">Con Ritardo</span>
          </div>
        </div>

        <!-- Elenco Nominativi e Note Pasti del Giorno -->
        <div class="sub-section" style="margin-top: 16px;">
          <div class="flex-between" style="margin-bottom: 8px;">
            <h4 style="margin: 0;">Elenco Presenti (${dataFiltroYMD}) — Totale: ${prenotazioniGiorno.length}</h4>
            <div style="font-size: 12px; color: #64748b;">
              ☀️ Pranzo: <strong>${countPranzo}</strong> | 🌙 Cena: <strong>${countCena}</strong>
            </div>
          </div>
          <div class="table-responsive">
            <table class="master-table">
              <thead>
                <tr>
                  <th>Residente</th>
                  <th>Pasto</th>
                  <th>Busta</th>
                  <th>Ritardo</th>
                  <th>Note Cucina</th>
                </tr>
              </thead>
              <tbody>
                ${prenotazioniGiorno.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding: 18px; color: #64748b;">Nessuna presenza segnata per il ${dataFiltroYMD}.</td></tr>` : ''}
                ${prenotazioniGiorno.map(p => `
                  <tr>
                    <td><strong>${escapeHtml(p.email)}</strong></td>
                    <td><span class="badge ${p.tipo_pasto === 'pranzo' ? 'badge-accent' : 'badge-primary'}">${p.tipo_pasto === 'pranzo' ? '☀️ Pranzo 14:30' : '🌙 Cena 19:30'}</span></td>
                    <td>${p.busta ? '🥪 Sì (Busta)' : '—'}</td>
                    <td>${p.ritardo ? '⏰ Sì (Ritardo)' : '—'}</td>
                    <td class="text-sm">${escapeHtml(p.note || '-')}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Form Variazione Straordinaria Menu -->
        <div class="sub-section" style="margin-top: 24px;">
          <h4>Variazione Straordinaria Menu (Alert Banner)</h4>
          <form onsubmit="handleSalvaVariazioneMenu(event)">
            <div class="form-group">
              <label for="admin-data-variazione">Data di Applicazione dell'Alert</label>
              <input type="date" id="admin-data-variazione" class="input-date" value="${appState.cachedConfig.Data_Variazione_Menu || oggiYMD}">
            </div>
            <div class="form-group">
              <label for="admin-pasto-variazione">Pasto di Applicazione</label>
              <select id="admin-pasto-variazione" class="input-select">
                <option value="entrambi" ${(appState.cachedConfig.Pasto_Variazione || 'entrambi') === 'entrambi' ? 'selected' : ''}>🍽️ Entrambi i pasti (Pranzo e Cena)</option>
                <option value="pranzo" ${appState.cachedConfig.Pasto_Variazione === 'pranzo' ? 'selected' : ''}>☀️ Solo Pranzo (14:30)</option>
                <option value="cena" ${appState.cachedConfig.Pasto_Variazione === 'cena' ? 'selected' : ''}>🌙 Solo Cena (19:30)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="admin-testo-variazione">Testo dell'Alert</label>
              <textarea id="admin-testo-variazione" class="input-textarea" rows="2" placeholder="Es. Oggi il dessert è sostituito da gelato...">${escapeHtml(appState.cachedConfig.Testo_Variazione || '')}</textarea>
            </div>
            <button type="submit" class="btn btn-accent btn-block">Pubblica Variazione Straordinaria</button>
          </form>
        </div>
      </div>
    `;
  }

  // 3. SUB-PANNELLO MANUTENZIONE: Feed visivo guasti con foto e tasto "Segna come Risolto"
  if (perm_manutenzione) {
    const guastiDaFare = appState.guasti.filter(g => g.stato !== "Risolto");
    const guastiRisolti = appState.guasti.filter(g => g.stato === "Risolto");

    html += `
      <div class="master-block card">
        <div class="master-header">
          <span class="master-tag">MANUTENZIONE</span>
          <h3 class="card-title">Feed Lavori & Interventi Tecnici</h3>
        </div>

        <h4>Guasti Aperti (${guastiDaFare.length})</h4>
        <div class="guasti-feed-grid">
          ${guastiDaFare.length === 0 ? '<p class="empty-state-text">Nessun guasto aperto al momento! Ottimo lavoro.</p>' : ''}
          ${guastiDaFare.map(g => `
            <div class="guasto-master-card card-inner">
              <div class="flex-between">
                <span class="badge badge-danger">Da fare</span>
                <span class="text-xs text-muted">${new Date(g.timestamp).toLocaleString("it-IT")}</span>
              </div>
              <p class="guasto-desc"><strong>Descrizione:</strong> ${escapeHtml(g.descrizione)}</p>
              ${g.link_foto ? `
                <div class="guasto-photo-box">
                  <img src="${g.link_foto}" alt="Foto guasto" class="guasto-photo-img" onclick="apriFotoInNuovaScheda('${g.link_foto}')">
                </div>
              ` : '<div class="text-xs text-muted" style="margin: 8px 0;">Nessuna foto allegata</div>'}
              <div class="text-xs text-muted" style="margin-bottom: 12px;">Segnalato da: ${escapeHtml(g.email)}</div>
              <button type="button" class="btn btn-success btn-block btn-sm" onclick="segnaGuastoRisolto('${escapeHtml(g.id)}')">
                ✅ Segna come Risolto
              </button>
            </div>
          `).join("")}
        </div>

        ${guastiRisolti.length > 0 ? `
          <h4 style="margin-top: 24px;">Ultimi Risolti (${guastiRisolti.length})</h4>
          <div class="mini-list">
            ${guastiRisolti.slice(0, 4).map(g => `
              <div class="mini-item flex-between">
                <div>
                  <span>${escapeHtml(g.descrizione)}</span>
                  <div class="text-xs text-muted">${new Date(g.timestamp).toLocaleDateString("it-IT")} • ${escapeHtml(g.email)}</div>
                </div>
                <span class="badge badge-success">Risolto</span>
              </div>
            `).join("")}
          </div>
        ` : ''}
      </div>
    `;
  }

  container.innerHTML = html;
}

window.approvaUtente = async function(email) {
  const permMensa = document.getElementById(`p-mensa-${email}`)?.checked || false;
  const permManut = document.getElementById(`p-manut-${email}`)?.checked || false;
  const permSpazi = document.getElementById(`p-spazi-${email}`)?.checked || true;
  const permAdmin = document.getElementById(`p-admin-${email}`)?.checked || false;

  try {
    const res = await callApi("approvaUtente", {
      emailTarget: email,
      perm_mensa: permMensa,
      perm_manutenzione: permManut,
      perm_spazi: permSpazi,
      perm_admin: permAdmin
    });

    if (res.success) {
      mostraToast(`Utente ${email} approvato!`, "success");
      caricaDatiMaster();
    } else {
      mostraToast("Errore approvazione: " + res.error, "error");
    }
  } catch (err) {
    mostraToast("Errore di rete", "error");
  }
};

window.handleAggiornaTestiBacheca = async function(e) {
  e.preventDefault();
  const regolamento = document.getElementById("admin-regolamento")?.value || "";
  const contatti = document.getElementById("admin-contatti")?.value || "";

  try {
    const res = await callApi("aggiornaConfig", {
      Info_Regolamento: regolamento,
      Info_Contatti: contatti
    });

    if (res.success) {
      appState.cachedConfig.Info_Regolamento = regolamento;
      appState.cachedConfig.Info_Contatti = contatti;
      renderBachecaInfo();
      mostraToast("Bacheca aggiornata con successo!", "success");
    } else {
      mostraToast("Errore aggiornamento bacheca", "error");
    }
  } catch (err) {
    mostraToast("Errore di rete", "error");
  }
};

window.handleMasterAggiungiAppuntamento = async function(e) {
  e.preventDefault();
  const tipo = document.getElementById("master-bacheca-tipo")?.value || "avviso";
  const data = document.getElementById("master-bacheca-data")?.value || formatYMD(new Date());
  const titolo = document.getElementById("master-bacheca-titolo")?.value?.trim() || "";
  const descrizione = document.getElementById("master-bacheca-desc")?.value?.trim() || "";
  const autore = document.getElementById("master-bacheca-autore")?.value?.trim() || (appState.user?.nome || "Direzione");
  const priorita = document.getElementById("master-bacheca-priorita")?.value || "normale";

  if (!titolo) {
    mostraToast("Inserisci un titolo per l'appuntamento", "warning");
    return;
  }

  const btn = document.getElementById("btn-master-pubblica-bacheca");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Salvataggio in corso...";
  }

  try {
    const payload = {
      tipo,
      data,
      titolo,
      descrizione,
      autore,
      priorita
    };

    const res = await callApi("salvaAvvisoBacheca", payload);
    if (res.success) {
      mostraToast("Appuntamento aggiunto in bacheca con successo!", "success");
      if (!appState.bacheca) appState.bacheca = [];
      const item = {
        id: res.id || ("B_" + Date.now()),
        ...payload,
        timestamp: new Date().toISOString()
      };
      appState.bacheca.unshift(item);

      // Svuota i campi testo
      const tInput = document.getElementById("master-bacheca-titolo");
      if (tInput) tInput.value = "";
      const dInput = document.getElementById("master-bacheca-desc");
      if (dInput) dInput.value = "";

      renderMasterSection();
      renderBachecaView();
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile salvare"), "error");
    }
  } catch (err) {
    mostraToast("Errore di connessione", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "➕ Inserisci in Bacheca da Master";
    }
  }
};

window.cambiaDataMasterMensa = function(nuovaDataStr) {
  appState.masterMensaDate = nuovaDataStr;
  renderMasterView();
};

window.handleSalvaVariazioneMenu = async function(e) {
  e.preventDefault();
  const dataVar = document.getElementById("admin-data-variazione")?.value || "";
  const pastoVar = document.getElementById("admin-pasto-variazione")?.value || "entrambi";
  const testoVar = document.getElementById("admin-testo-variazione")?.value || "";

  try {
    const res = await callApi("aggiornaConfig", {
      Data_Variazione_Menu: dataVar,
      Pasto_Variazione: pastoVar,
      Testo_Variazione: testoVar
    });

    if (res.success) {
      appState.cachedConfig.Data_Variazione_Menu = dataVar;
      appState.cachedConfig.Pasto_Variazione = pastoVar;
      appState.cachedConfig.Testo_Variazione = testoVar;
      verificaAlertVariazione();
      renderMensaView();
      mostraToast("Variazione menu salvata!", "success");
    } else {
      mostraToast("Errore salvataggio variazione", "error");
    }
  } catch (err) {
    mostraToast("Errore di rete", "error");
  }
};

window.apriModalVariazioneCuoca = function(dataStr, tipoPasto) {
  const modal = document.getElementById("modal-variazione-cuoca");
  if (!modal) return;
  const inputData = document.getElementById("cuoca-modal-data");
  const selectPasto = document.getElementById("cuoca-modal-pasto");
  const textareaTesto = document.getElementById("cuoca-modal-testo");

  const targetDate = dataStr || formatYMD(appState.selectedDateMensa || new Date());
  if (inputData) inputData.value = targetDate;
  if (selectPasto) {
    selectPasto.value = tipoPasto || (appState.cachedConfig.Pasto_Variazione ? appState.cachedConfig.Pasto_Variazione.toLowerCase() : "pranzo");
  }

  const pastoCorrente = selectPasto ? selectPasto.value : tipoPasto;
  const testoEsistente = getVariazioneCuocaPerData(targetDate, pastoCorrente) || "";
  if (textareaTesto) {
    textareaTesto.value = testoEsistente;
    setTimeout(() => textareaTesto.focus(), 60);
  }

  modal.style.display = "flex";
};

window.onCuocaModalDataChange = function() {
  const inputData = document.getElementById("cuoca-modal-data");
  const selectPasto = document.getElementById("cuoca-modal-pasto");
  const textareaTesto = document.getElementById("cuoca-modal-testo");
  if (!inputData || !textareaTesto) return;
  const dStr = inputData.value;
  const pStr = selectPasto ? selectPasto.value : "pranzo";
  textareaTesto.value = getVariazioneCuocaPerData(dStr, pStr) || "";
};

window.onCuocaModalPastoChange = function() {
  const inputData = document.getElementById("cuoca-modal-data");
  const selectPasto = document.getElementById("cuoca-modal-pasto");
  const textareaTesto = document.getElementById("cuoca-modal-testo");
  if (!inputData || !textareaTesto) return;
  const dStr = inputData.value;
  const pStr = selectPasto ? selectPasto.value : "pranzo";
  textareaTesto.value = getVariazioneCuocaPerData(dStr, pStr) || "";
};

window.chiudiModalVariazioneCuoca = function() {
  const modal = document.getElementById("modal-variazione-cuoca");
  if (modal) modal.style.display = "none";
};

window.handleSalvaVariazioneCuocaModal = async function(e) {
  e.preventDefault();
  const dataVar = document.getElementById("cuoca-modal-data")?.value || "";
  const pastoVar = document.getElementById("cuoca-modal-pasto")?.value || "entrambi";
  const testoVar = document.getElementById("cuoca-modal-testo")?.value || "";

  if (!dataVar) {
    mostraToast("Seleziona una data", "warning");
    return;
  }

  try {
    const res = await callApi("aggiornaConfig", {
      Data_Variazione_Menu: dataVar,
      Pasto_Variazione: pastoVar,
      Testo_Variazione: testoVar
    });

    if (res.success) {
      appState.cachedConfig.Data_Variazione_Menu = dataVar;
      appState.cachedConfig.Pasto_Variazione = pastoVar;
      appState.cachedConfig.Testo_Variazione = testoVar;
      chiudiModalVariazioneCuoca();
      verificaAlertVariazione();
      renderMensaView();
      if (appState.currentTab === "master") renderMasterView();
      const pastoLabel = pastoVar === "pranzo" ? "per il Pranzo" : (pastoVar === "cena" ? "per la Cena" : "per entrambi i pasti");
      mostraToast(`Variazione della cuoca salvata (${pastoLabel})!`, "success");
    } else {
      mostraToast("Errore durante il salvataggio", "error");
    }
  } catch (err) {
    mostraToast("Errore di rete", "error");
  }
};

window.handleCancellaVariazioneCuocaModal = async function() {
  const dataVar = document.getElementById("cuoca-modal-data")?.value || "";
  const pastoVar = document.getElementById("cuoca-modal-pasto")?.value || "entrambi";
  try {
    const res = await callApi("aggiornaConfig", {
      Data_Variazione_Menu: dataVar,
      Pasto_Variazione: pastoVar,
      Testo_Variazione: ""
    });

    if (res.success) {
      if (appState.cachedConfig.Data_Variazione_Menu === dataVar) {
        appState.cachedConfig.Testo_Variazione = "";
      }
      chiudiModalVariazioneCuoca();
      verificaAlertVariazione();
      renderMensaView();
      if (appState.currentTab === "master") renderMasterView();
      mostraToast("Variazione rimossa", "info");
    }
  } catch (err) {
    mostraToast("Errore di rete", "error");
  }
};

window.segnaGuastoRisolto = async function(id) {
  try {
    const res = await callApi("risolviGuasto", { id });
    if (res.success) {
      mostraToast("Guasto contrassegnato come Risolto!", "success");
      caricaDatiMaster();
      caricaGuastiRecenti();
    } else {
      mostraToast("Errore: " + res.error, "error");
    }
  } catch (err) {
    mostraToast("Errore di rete", "error");
  }
};

// ----------------------------------------------------------------------------
// MODULO AUTH & ONBOARDING
// ----------------------------------------------------------------------------

function mostraModalAuth(mostra) {
  const modal = document.getElementById("modal-auth");
  if (!modal) return;
  modal.style.display = mostra ? "flex" : "none";

  if (mostra) {
    document.getElementById("auth-step-email")?.classList.remove("hidden");
    document.getElementById("auth-step-register")?.classList.add("hidden");
    document.getElementById("auth-step-waiting")?.classList.add("hidden");
  }
}

function setupEventListeners() {
  // Tab routing
  const tabs = document.querySelectorAll(".bottom-nav-item");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");
      switchTab(target);
    });
  });

  // Setup form Auth
  const formEmail = document.getElementById("form-auth-email");
  if (formEmail) {
    formEmail.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("auth-input-email")?.value.trim().toLowerCase();
      if (!email) return;

      const btn = document.getElementById("btn-check-email");
      btn.disabled = true;
      btn.innerText = "Verifica in corso...";

      try {
        const res = await callApi("login", { email });
        if (res.success && res.utente) {
          if (res.utente.stato === "Approvato") {
            // Utente approvato -> Salva e sblocca
            appState.user = res.utente;
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.utente));
            aggiornaUIUtente();
            mostraModalAuth(false);
            caricaDatiBackend();
            mostraToast(`Bentornato, ${res.utente.nome}!`, "success");
          } else {
            // In attesa di approvazione
            document.getElementById("auth-step-email").classList.add("hidden");
            document.getElementById("auth-step-waiting").classList.remove("hidden");
            document.getElementById("waiting-user-email").innerText = email;
          }
        } else if (res.notFound) {
          // Non registrato -> Mostra form registrazione
          document.getElementById("auth-step-email").classList.add("hidden");
          document.getElementById("auth-step-register").classList.remove("hidden");
          document.getElementById("reg-input-email").value = email;
        } else {
          mostraToast("Errore: " + (res.error || "Accesso non riuscito"), "error");
        }
      } catch (err) {
        mostraToast("Errore di connessione", "error");
      } finally {
        btn.disabled = false;
        btn.innerText = "Continua";
      }
    });
  }

  const formRegister = document.getElementById("form-auth-register");
  if (formRegister) {
    formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("reg-input-email")?.value.trim().toLowerCase();
      const nome = document.getElementById("reg-input-nome")?.value.trim();
      if (!email || !nome) return;

      const btn = document.getElementById("btn-submit-register");
      btn.disabled = true;
      btn.innerText = "Invio richiesta...";

      try {
        const res = await callApi("registraUtente", { email, nome });
        if (res.success) {
          document.getElementById("auth-step-register").classList.add("hidden");
          document.getElementById("auth-step-waiting").classList.remove("hidden");
          document.getElementById("waiting-user-email").innerText = email;
          mostraToast("Richiesta inviata al Direttore!", "success");
        } else {
          mostraToast("Errore: " + res.error, "error");
        }
      } catch (err) {
        mostraToast("Errore di connessione", "error");
      } finally {
        btn.disabled = false;
        btn.innerText = "Invia Richiesta di Registrazione";
      }
    });
  }

  // Setup Manutenzione foto & form
  setupManutenzioneHandlers();

  // Settings & Backend Modal
  document.getElementById("btn-open-settings")?.addEventListener("click", () => {
    document.getElementById("input-gas-url").value = appState.backendUrl;
    document.getElementById("checkbox-bypass-timelock").checked = appState.bypassTimeLock;
    document.getElementById("modal-settings").style.display = "flex";
  });

  document.getElementById("btn-save-settings")?.addEventListener("click", () => {
    const url = document.getElementById("input-gas-url")?.value.trim() || "";
    const bypass = document.getElementById("checkbox-bypass-timelock")?.checked || false;

    appState.backendUrl = url;
    appState.bypassTimeLock = bypass;
    appState.isOfflineMode = !url;

    localStorage.setItem(STORAGE_KEYS.BACKEND_URL, url);
    localStorage.setItem(STORAGE_KEYS.BYPASS_TIME_LOCK, String(bypass));

    aggiornaIndicatoreConnessione();
    document.getElementById("modal-settings").style.display = "none";
    mostraToast("Impostazioni salvate!", "success");
    caricaDatiBackend();
    renderMensaView();
  });

  // Utenti preset per test rapido
  document.querySelectorAll(".quick-login-btn").forEach(b => {
    b.addEventListener("click", () => {
      const em = b.getAttribute("data-email");
      const inp = document.getElementById("auth-input-email");
      if (inp) {
        inp.value = em;
        inp.focus();
      }
    });
  });
}

function switchTab(tabId) {
  appState.currentTab = tabId;

  // Toggle active class nav
  document.querySelectorAll(".bottom-nav-item").forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Toggle views
  const views = ["info", "mensa", "spazi", "manutenzione", "master"];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === tabId) {
        el.classList.remove("hidden");
        el.classList.add("active-view");
      } else {
        el.classList.add("hidden");
        el.classList.remove("active-view");
      }
    }
  });

  // Azioni specifiche per tab
  if (tabId === "mensa") renderMensaView();
  if (tabId === "spazi") renderSpaziView();
  if (tabId === "manutenzione") caricaGuastiRecenti();
  if (tabId === "master") caricaDatiMaster();
}

function aggiornaUIUtente() {
  const avatarText = document.getElementById("header-user-avatar");
  const userName = document.getElementById("header-user-name");
  const userRole = document.getElementById("header-user-role");
  const masterNav = document.getElementById("nav-tab-master");

  if (appState.user) {
    if (avatarText) {
      const parts = (appState.user.nome || "CN").split(" ");
      avatarText.innerText = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
    }
    if (userName) userName.innerText = appState.user.nome;
    if (userRole) {
      let ruoli = [];
      if (appState.user.perm_admin) ruoli.push("Admin");
      if (appState.user.perm_mensa) ruoli.push("Mensa");
      if (appState.user.perm_manutenzione) ruoli.push("Tecnico");
      userRole.innerText = ruoli.length > 0 ? ruoli.join(" • ") : "Residente";
    }

    if (masterNav) {
      masterNav.style.display = haPermessiMaster() ? "flex" : "none";
    }
  }
}

function aggiornaIndicatoreConnessione() {
  const badge = document.getElementById("header-connection-badge");
  if (!badge) return;
  if (appState.backendUrl) {
    badge.className = "connection-badge live";
    badge.title = "Connesso a Google Apps Script";
    badge.innerText = "GAS Live";
  } else {
    badge.className = "connection-badge demo";
    badge.title = "Modalità Demo Locale (Fai clic per inserire URL GAS)";
    badge.innerText = "Demo";
  }
}

window.logout = function() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  appState.user = null;
  location.reload();
};

// ----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// ----------------------------------------------------------------------------

function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
  if (!text) return "";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function mostraToast(messaggio, tipo = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo} animate-slide-up`;
  toast.innerText = messaggio;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-fade-out");
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

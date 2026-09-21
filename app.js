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

// Bindings globali immediati per gli eventi inline HTML onclick
window.mostraModalAuth = function(mostra) {
  const modal = document.getElementById("modal-auth");
  if (!modal) return;
  modal.style.display = mostra ? "flex" : "none";
  if (mostra) {
    document.getElementById("auth-step-email")?.classList.remove("hidden");
    document.getElementById("auth-step-register")?.classList.add("hidden");
    document.getElementById("auth-step-waiting")?.classList.add("hidden");
  }
};

window.testaConnessioneGoogleFogli = async function() {
  const urlInput = document.getElementById("input-gas-url");
  if (urlInput && urlInput.value.trim()) {
    appState.backendUrl = urlInput.value.trim();
    localStorage.setItem(STORAGE_KEYS.BACKEND_URL, appState.backendUrl);
    if (typeof aggiornaIndicatoreConnessione === "function") {
      aggiornaIndicatoreConnessione();
    }
  }
  const resEl = document.getElementById("gas-test-result");
  if (resEl) {
    resEl.style.display = "block";
    resEl.innerHTML = `<span style="color:#0284c7;">🔄 Test di connessione in corso...</span>`;
  }
  if (typeof window.testaConnessioneGAS === "function") {
    await window.testaConnessioneGAS();
  }
  if (resEl) {
    if (appState.backendUrl) {
      resEl.innerHTML = `<span style="color:#166534; font-weight:600;">✅ URL Google Apps Script configurato e testato!</span>`;
    } else {
      resEl.innerHTML = `<span style="color:#92400e;">⚠️ Modalità Stand-alone Locale attiva (nessun URL specificato).</span>`;
    }
  }
};

window.switchTab = function(tabId) {
  if (typeof switchTab === "function") {
    switchTab(tabId);
  }
};

// Data di ancoraggio per la Settimana 1 del Menu: Lunedì 21 Settembre 2026
// (Settimana 1 inizia con Paella di carne alla Valenciana e Saltimbocca alla Romana)
const MENU_ANCHOR_DATE = new Date("2026-09-21T00:00:00");

// Componenti standard della Busta (Pranzo al Sacco - Martedì e Giovedì)
const CLASSICI_BUSTA = [
  { icon: "🥖", nome: "Panino o Focaccia imbottita", desc: "Farcito con salumi o formaggi" },
  { icon: "🍎", nome: "Frutta fresca di stagione", desc: "Mela, banana o frutto del giorno (o succo)" },
  { icon: "🍪", nome: "Snack / Dolce", desc: "Biscotti o merendina confezionata" },
  { icon: "💧", nome: "Acqua minerale", desc: "Bottiglietta da 50 cl" }
];

// Menu ciclico di 14 giorni (Settimana 1 e Settimana 2)
// Completo di 1° piatto, 2° piatto, contorno 1 e 2, dessert per pranzo e cena
const MENU_14_GIORNI = {
  settimana1: {
    lunedi: {
      pranzo: {
        primo: "Paella di carne alla Valenciana",
        secondo: "Saltimbocca alla Romana",
        contorno: "Insalata di cetrioli, pomodori e cipolla",
        contorno2: "Spinaci",
        dessert: "Frutta fresca"
      },
      cena: {
        primo: "Spaghetti alle vongole",
        secondo: "Scaloppine di Tacchino",
        contorno: "Fagioli",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      }
    },
    martedi: {
      pranzo: {
        primo: "Tortellini alla Boscaiola",
        secondo: "Cotolette di Pollo (panate)",
        contorno: "Finocchi Julienne al Forno",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca",
        opzioneBustaDisponibile: true
      },
      cena: {
        primo: "Linguine al profumo di mare",
        secondo: "Salmone al Forno",
        contorno: "Piselli all'olio",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      }
    },
    mercoledi: {
      pranzo: {
        primo: "Paccheri al salmone e pomodorini",
        secondo: "Cotoletta alla milanese",
        contorno: "Zucchine ripassate",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      },
      cena: {
        primo: "Risotto al radicchio",
        secondo: "Straccetti con rucola",
        contorno: "Insalata di pomodori e cetrioli",
        contorno2: "Patate gratinate",
        dessert: "Frutta fresca"
      }
    },
    giovedi: {
      pranzo: {
        primo: "Pasta cacio e pepe",
        secondo: "Insalata di pollo saporita",
        contorno: "Carote Julienne ripassate",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca",
        opzioneBustaDisponibile: true
      },
      cena: {
        primo: "Pasta allo zafferano e gorgonzola",
        secondo: "Sovracoscia di Tacchino",
        contorno: "Patatine fritte",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      }
    },
    venerdi: {
      pranzo: {
        primo: "Risotto alla Marinara",
        secondo: "Frittura di Calamari",
        contorno: "Melanzane al Forno",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      },
      cena: {
        primo: "Paccheri al sugo di calamari",
        secondo: "Pesce Spada grigliato con pomodori e olive",
        contorno: "Carciofi ripassati",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      }
    },
    sabato: {
      pranzo: {
        primo: "Pasta al ragù di carne",
        secondo: "Straccetti con rucola",
        contorno: "Zucchine ripassate",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      },
      cena: {
        primo: "Supplì e arancini",
        secondo: "Insalata di patate tonnate con uova sode",
        contorno: "Finocchi Julienne",
        contorno2: "Insalata mista",
        dessert: "Dolce della casa"
      }
    },
    domenica: {
      pranzo: {
        primo: "Fettuccine alla papalina",
        secondo: "Bistecca di manzo alla griglia",
        contorno: "Patate al forno",
        contorno2: "Insalata mista",
        dessert: "Dolce festivo"
      },
      cena: {
        primo: "Spaghetti aglio olio e peperoncino",
        secondo: "Pollo tonnato",
        contorno: "Pomodori rossi",
        contorno2: "Carote",
        dessert: "Frutta fresca"
      }
    }
  },
  settimana2: {
    lunedi: {
      pranzo: {
        primo: "Ravioli Burro e Salvia",
        secondo: "Polpette di Carne fatte in casa",
        contorno: "Fagiolini",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      },
      cena: {
        primo: "Pasta al pesto",
        secondo: "Gamberoni in Padella",
        contorno: "Pomodori e basilico all'olio",
        contorno2: "Biete",
        dessert: "Frutta fresca"
      }
    },
    martedi: {
      pranzo: {
        primo: "Spaghetti allo scoglio",
        secondo: "Polpo con patate",
        contorno: "Carciofi",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca",
        opzioneBustaDisponibile: true
      },
      cena: {
        primo: "Spaghetti alle Cozze",
        secondo: "Salmone gratinato",
        contorno: "Carote Prezzemolate",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      }
    },
    mercoledi: {
      pranzo: {
        primo: "Parmigiana al ragù",
        secondo: "Saltimbocca alla Romana",
        contorno: "Melanzane",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      },
      cena: {
        primo: "Risotto Asparagi e Speck",
        secondo: "Arrosto",
        contorno: "Fagioli",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      }
    },
    giovedi: {
      pranzo: {
        primo: "Pasta alle Vongole",
        secondo: "Pollo sovracoscia o cosce di pollo",
        contorno: "Pomodori rossi",
        contorno2: "Patate lesse",
        dessert: "Frutta fresca",
        opzioneBustaDisponibile: true
      },
      cena: {
        primo: "Linguine al pomodoro fresco di stagione",
        secondo: "Straccetti con rucola",
        contorno: "Tris di Verdure estive",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      }
    },
    venerdi: {
      pranzo: {
        primo: "Riso alla cantonese",
        secondo: "Spigola al forno",
        contorno: "Bieta ripassata",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      },
      cena: {
        primo: "Farfalle al Salmone",
        secondo: "Branzino al cartoccio",
        contorno: "Insalata di cetrioli pomodori e cipolla",
        contorno2: "Melanzane gratinate o al forno con mozzarella",
        dessert: "Frutta fresca"
      }
    },
    sabato: {
      pranzo: {
        primo: "Pasta alla Carbonara",
        secondo: "Arista di maiale",
        contorno: "Tris di verdure estive",
        contorno2: "Insalata mista",
        dessert: "Frutta fresca"
      },
      cena: {
        primo: "Torta salata",
        secondo: "Insalata di tonno",
        contorno: "Insalata di carote",
        contorno2: "Insalata mista",
        dessert: "Dolce della casa"
      }
    },
    domenica: {
      pranzo: {
        primo: "Cannelloni di carne al forno",
        secondo: "Pollo arrosto o petto di pollo alla norma",
        contorno: "Patate caramellate",
        contorno2: "Insalata mista",
        dessert: "Dolce festivo"
      },
      cena: {
        primo: "Tagliatelle paglia e fieno",
        secondo: "Braciole di maiale",
        contorno: "Pomodori rossi",
        contorno2: "Finocchi al forno",
        dessert: "Frutta fresca"
      }
    }
  }
};

// Database Mock Locale iniziale (attivo quando non è configurato un backend GAS)
const INITIAL_MOCK_DB = {
  utenti: [
    { email: "donandreadotti@gmail.com", nome: "Don Andrea Dotti", stato: "Approvato", perm_mensa: true, perm_manutenzione: true, perm_spazi: true, perm_admin: true },
    { email: "donrocco@newman.it", nome: "Don Rocco", stato: "Approvato", perm_mensa: true, perm_manutenzione: false, perm_spazi: true, perm_admin: false },
    { email: "donsergio@newman.it", nome: "Don Sergio", stato: "Approvato", perm_mensa: true, perm_manutenzione: false, perm_spazi: true, perm_admin: false },
    { email: "francesco.studente@newman.it", nome: "Francesco Rossi", stato: "Approvato", perm_mensa: true, perm_manutenzione: true, perm_spazi: true, perm_admin: false }
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
    {
      id: "SEG_001",
      timestamp: "2026-09-14T11:20:00Z",
      email: "donrocco@newman.it",
      categoria: "manutenzione",
      luogo: "Bagno Piano 2",
      descrizione: "Perdita d'acqua dal rubinetto del lavabo al piano 2",
      link_foto: "",
      priorita: "Alta",
      stato: "In Lavorazione",
      note_intervento: "Contattato idraulico convenzionato per sostituzione guarnizione",
      tecnico: "Idraulico Mario",
      data_chiusura: ""
    },
    {
      id: "SEG_002",
      timestamp: "2026-09-12T16:00:00Z",
      email: "donandreadotti@gmail.com",
      categoria: "servizi",
      luogo: "Lavanderia Comune",
      descrizione: "Mancanza detersivi e richiesta sanificazione cestelli lavatrice 2",
      link_foto: "",
      priorita: "Media",
      stato: "Risolto",
      note_intervento: "Riforniti flaconi detersivo e igienizzati i cestelli dalla cooperativa",
      tecnico: "Impresa Pulizie",
      data_chiusura: "2026-09-13T10:00:00Z"
    }
  ],
  configurazione: {
    Messaggio_Supermaster: "Cari sacerdoti e residenti, benvenuti nella nostra Residenza. Ricordo a tutti che gli orari di mensa vanno rispettati per agevolare il servizio della cuoca. Per qualsiasi esigenza pastorale o accademica la porta della Direzione è sempre aperta.",
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
  guasti: [],                  // Lista segnalazioni / guasti
  manutenzioneList: [],        // Alias per garantire compatibilità ovunque
  tuttiUtenti: [],             // Elenco completo residenti (per Admin)
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
  // Se nessun utente salvato, accedi automaticamente con il profilo Don Andrea Dotti (Master / Direzione)
  const defaultUser = INITIAL_MOCK_DB.utenti[0];
  appState.user = { ...defaultUser };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(appState.user));
  aggiornaUIUtente();
  caricaDatiBackend();
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
 * Helper unificato per formattare e normalizzare date per confronti (YYYY-MM-DD)
 */
function formattaDataConfronto(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return formatYMD(val);
  }
  const s = String(val).trim();
  if (s.includes("T")) return s.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return formatYMD(d);
  }
  return s;
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

      // Ogni residente ha il permesso per prenotare gli spazi comuni (Chiesa e Sala TV)
      const nuovo = { email, nome, stato: "Approvato", perm_mensa: true, perm_manutenzione: true, perm_spazi: true, perm_admin: false };
      db.utenti.push(nuovo);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, status: "Approvato", message: "Registrazione completata con successo!" };
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
      const dataStr = formattaDataConfronto(data);
      const existIdx = db.mensa.findIndex(m => formattaDataConfronto(m.data) === dataStr && m.email.toLowerCase() === email.toLowerCase() && m.tipo_pasto === tipo_pasto);
      const entry = {
        id: "M_" + Date.now(),
        data: dataStr,
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
      const dataStr = formattaDataConfronto(data);
      db.mensa = db.mensa.filter(m => !(formattaDataConfronto(m.data) === dataStr && m.email.toLowerCase() === email.toLowerCase() && m.tipo_pasto === tipo_pasto));
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true };
    }

    case "prenotaSpazio": {
      const { risorsa, data, slot_orario, email } = params;
      const dataStr = formattaDataConfronto(data);
      const occupied = db.prenotazioni_spazi.some(p => p.risorsa === risorsa && formattaDataConfronto(p.data) === dataStr && p.slot_orario === slot_orario);
      if (occupied) return { success: false, error: "Slot già occupato da un altro residente" };

      const prenotazione = {
        id: "S_" + Date.now(),
        risorsa,
        data: dataStr,
        slot_orario,
        email,
        timestamp: new Date().toISOString()
      };
      db.prenotazioni_spazi.push(prenotazione);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, id: prenotazione.id };
    }

    case "caricaGuasto": {
      const { email, descrizione, fotoBase64, categoria, luogo } = params;
      const guasto = {
        id: "SEG_" + Date.now().toString().slice(-6),
        timestamp: new Date().toISOString(),
        email,
        categoria: categoria || "manutenzione",
        luogo: luogo || "",
        descrizione: descrizione || "",
        link_foto: fotoBase64 ? fotoBase64 : "",
        priorita: params.priorita || "Media",
        stato: "Da fare",
        note_intervento: "",
        tecnico: "",
        data_chiusura: ""
      };
      db.manutenzione.unshift(guasto);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, id: guasto.id, linkFoto: guasto.link_foto, message: "Segnalazione salvata nel database" };
    }

    case "risolviGuasto": {
      const g = db.manutenzione.find(item => String(item.id) === String(params.id));
      if (g) {
        g.stato = "Risolto";
        g.data_chiusura = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true };
      }
      return { success: false, error: "Segnalazione non trovata" };
    }

    case "aggiornaSegnalazione": {
      const g = db.manutenzione.find(item => String(item.id) === String(params.id));
      if (g) {
        if (params.stato !== undefined) g.stato = params.stato;
        if (params.priorita !== undefined) g.priorita = params.priorita;
        if (params.note_intervento !== undefined) g.note_intervento = params.note_intervento;
        if (params.tecnico !== undefined) g.tecnico = params.tecnico;
        if (params.categoria !== undefined) g.categoria = params.categoria;
        if (params.luogo !== undefined) g.luogo = params.luogo;
        if (g.stato === "Risolto" && !g.data_chiusura) {
          g.data_chiusura = new Date().toISOString();
        } else if (g.stato !== "Risolto") {
          g.data_chiusura = "";
        }
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, message: "Segnalazione aggiornata con successo!" };
      }
      return { success: false, error: "Segnalazione non trovata" };
    }

    case "aggiornaRuoliUtente": {
      const emailTarget = String(params.emailTarget || "").trim().toLowerCase();
      const utente = db.utenti.find(u => u.email.toLowerCase() === emailTarget);
      if (utente) {
        if (params.perm_mensa !== undefined) utente.perm_mensa = Boolean(params.perm_mensa);
        if (params.perm_manutenzione !== undefined) utente.perm_manutenzione = Boolean(params.perm_manutenzione);
        if (params.perm_spazi !== undefined) utente.perm_spazi = Boolean(params.perm_spazi);
        if (params.perm_admin !== undefined) utente.perm_admin = Boolean(params.perm_admin);
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, message: "Ruoli aggiornati per " + emailTarget };
      }
      return { success: false, error: "Utente non trovato" };
    }

    case "eliminaUtente": {
      const emailTarget = String(params.emailTarget || "").trim().toLowerCase();
      const idx = db.utenti.findIndex(u => u.email.toLowerCase() === emailTarget);
      if (idx !== -1) {
        db.utenti.splice(idx, 1);
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, message: "Residente rimosso con successo!" };
      }
      return { success: false, error: "Utente non trovato" };
    }

    case "importaElencoUtenti": {
      const lista = params.utenti || [];
      let aggiunti = 0;
      lista.forEach(item => {
        const email = String(item.email || "").trim().toLowerCase();
        const nome = String(item.nome || "").trim();
        if (email && !db.utenti.some(u => u.email.toLowerCase() === email)) {
          db.utenti.push({
            email,
            nome: nome || email.split("@")[0],
            stato: "Approvato",
            perm_mensa: item.perm_mensa !== undefined ? Boolean(item.perm_mensa) : true,
            perm_manutenzione: item.perm_manutenzione !== undefined ? Boolean(item.perm_manutenzione) : false,
            perm_spazi: item.perm_spazi !== undefined ? Boolean(item.perm_spazi) : true,
            perm_admin: item.perm_admin !== undefined ? Boolean(item.perm_admin) : false
          });
          aggiunti++;
        }
      });
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, aggiunti, message: `${aggiunti} utenti aggiunti ed abilitati con successo!` };
    }

    case "cancellaPrenotazioneSpazio": {
      const { id, risorsa, data, slot_orario, email } = params;
      const initialLen = db.prenotazioni_spazi.length;
      const dataStr = formattaDataConfronto(data);
      db.prenotazioni_spazi = db.prenotazioni_spazi.filter(p => {
        if (id && String(p.id) === String(id)) return false;
        if (risorsa && dataStr && slot_orario) {
          const pData = formattaDataConfronto(p.data);
          if (p.risorsa === risorsa && pData === dataStr && p.slot_orario === slot_orario) {
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

    case "importaEventiCalendario": {
      if (!db.bacheca) db.bacheca = [];
      const eventi = params.eventi || [];
      let count = 0;
      const nowStr = new Date().toISOString();
      eventi.forEach(ev => {
        if (ev && ev.titolo) {
          const item = {
            id: ev.id || ("B_" + Date.now() + "_" + Math.floor(Math.random() * 1000)),
            tipo: ev.tipo || "evento",
            data: ev.data || formatYMD(new Date()),
            titolo: String(ev.titolo).trim(),
            descrizione: ev.descrizione ? String(ev.descrizione).trim() : "",
            autore: ev.autore ? String(ev.autore).trim() : "Direzione",
            priorita: ev.priorita || "normale",
            timestamp: nowStr
          };
          db.bacheca.unshift(item);
          count++;
        }
      });
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, count, message: `${count} eventi importati con successo nel database locale` };
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
      if (params.Messaggio_Supermaster !== undefined) db.configurazione.Messaggio_Supermaster = params.Messaggio_Supermaster;
      if (params.Info_Regolamento !== undefined) db.configurazione.Info_Regolamento = params.Info_Regolamento;
      if (params.Info_Contatti !== undefined) db.configurazione.Info_Contatti = params.Info_Contatti;
      if (params.Data_Variazione_Menu !== undefined) db.configurazione.Data_Variazione_Menu = params.Data_Variazione_Menu;
      if (params.Testo_Variazione !== undefined) db.configurazione.Testo_Variazione = params.Testo_Variazione;
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, message: "Configurazione salvata!" };
    }

    case "ping": {
      return {
        success: true,
        status: "ok",
        timestamp: new Date().toISOString(),
        nomeSpreadsheet: "Simulatore Database Locale (Indexed/LocalStorage)",
        fogliAttivi: ["Utenti", "Mensa", "Prenotazioni_Spazi", "Manutenzione", "Configurazione", "Bacheca"],
        conteggi: {
          utenti: db.utenti.length,
          spazi: db.prenotazioni_spazi.length,
          mensa: db.mensa.length,
          guasti: db.manutenzione.length,
          bacheca: (db.bacheca || []).length
        },
        app: "Residenza Card. Newman (Local Mode)"
      };
    }

    case "inizializzaDati": {
      return {
        success: true,
        message: "Dati inizializzati con successo nel database!"
      };
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

      <div class="roman-liturgy-badge" style="border-left: 4px solid ${cal.coloreHex}; background: rgba(0, 0, 0, 0.28);">
        <div class="liturgy-row" style="display: flex; align-items: center; gap: 8px;">
          <span class="liturgy-dot" style="background-color: ${cal.coloreHex}; box-shadow: 0 0 10px ${cal.coloreHex}; width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
          <span style="font-weight: 700; color: #ffffff; font-size: 15px;">${escapeHtml(cal.tempoLiturgico)} <span style="font-weight: 800; color: ${cal.coloreHex === '#16a34a' ? '#4ade80' : (cal.coloreHex === '#dc2626' || cal.coloreHex === '#ef4444' ? '#fca5a5' : '#fef08a')};">(${escapeHtml(cal.coloreLiturgico)})</span></span>
        </div>
        <div class="liturgy-saint" style="font-size: 14.5px; font-weight: 600; color: #ffffff; margin-top: 5px; line-height: 1.4;">
          ⛪ ${escapeHtml(cal.santo)}
        </div>
      </div>

      ${isMasterOrAdmin ? `
        <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
          <button type="button" class="btn btn-sm" onclick="apriModalMasterAppuntamento('Chiesa', '${dataYMD}')" style="background: rgba(255,255,255,0.18); color: #fff; border: 1px solid rgba(255,255,255,0.3); font-size: 12px; font-weight: 600;">
            👑 ➕ Inserisci Appuntamento per questo giorno
          </button>
        </div>
      ` : ''}

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
          <h3 class="card-title" style="margin: 0;">Bacheca & Calendario Eventi</h3>
          <span class="text-xs text-muted">
            Avvisi, ricorrenze ed eventi per ${isOggi ? 'oggi' : cal.dataItaliana}
          </span>
        </div>
        ${isMasterOrAdmin ? `
          <div style="display: flex; gap: 6px; align-items: center;">
            <button type="button" class="btn btn-outline btn-sm" onclick="apriModalImportaCalendarioCSV()" style="font-size: 11px; padding: 4px 8px; font-weight: 600;" title="Carica file CSV con eventi">
              📤 Carica CSV
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="apriModalBacheca('${dataYMD}')" style="font-weight: 700; font-size: 11px;">
              👑 + Aggiungi Evento
            </button>
          </div>
        ` : ''}
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
              <div style="display: flex; gap: 4px; align-items: center;">
                <button type="button" class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 11px; font-weight: 600;" onclick="modificaAvvisoBacheca('${item.id}')" title="Modifica evento">
                  ✏️ Modifica
                </button>
                <button type="button" class="btn-delete-bacheca" onclick="eliminaAvvisoBacheca('${item.id}')" title="Elimina dalla bacheca">
                  ✕
                </button>
              </div>
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
          <div style="display: flex; gap: 4px; align-items: center;">
            <span class="badge" style="background:#f1f5f9; font-size: 10.5px;">Vedi</span>
            ${isMasterOrAdmin ? `
              <button type="button" class="btn btn-outline btn-sm" style="padding: 2px 6px; font-size: 11px;" onclick="event.stopPropagation(); modificaAvvisoBacheca('${item.id}')" title="Modifica evento">
                ✏️
              </button>
            ` : ''}
          </div>
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

  const msgSupermaster = appState.cachedConfig.Messaggio_Supermaster || "Cari residenti, benvenuti nel portale digitale della Residenza Newman. Per qualsiasi necessità o urgenza la Direzione è a vostra disposizione.";

  container.innerHTML = `
    <!-- CARD PORTAMI ALLA RESIDENZA (NAVIGATORE GOOGLE MAPS) -->
    <div class="card" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; border: 1px solid rgba(255,255,255,0.12); padding: 18px;">
      <div class="flex-between" style="flex-wrap: wrap; gap: 12px;">
        <div class="flex-align" style="gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(22, 163, 74, 0.2); border: 1px solid rgba(22, 163, 74, 0.4); display: flex; align-items: center; justify-content: center; font-size: 24px;">
            📍
          </div>
          <div>
            <h2 class="card-title" style="margin: 0; color: #ffffff; font-size: 17px;">Dove Siamo & Raggiungi la Struttura</h2>
            <div style="font-size: 12.5px; color: #94a3b8; margin-top: 2px;">Residenza Cardinal Newman • Roma</div>
          </div>
        </div>
        <a href="https://maps.app.goo.gl/dPn1ccwpTPbCG8RX6" target="_blank" rel="noopener noreferrer" class="btn btn-primary" id="btn-portami-residenza" style="background: #16a34a; border-color: #16a34a; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; padding: 10px 18px; border-radius: 8px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4);">
          <span>🗺️</span>
          <span>Portami alla residenza</span>
          <span style="font-size: 13px;">↗</span>
        </a>
      </div>
      <p style="font-size: 12.5px; color: #cbd5e1; margin: 12px 0 0 0; line-height: 1.45;">
        Tocca il pulsante per avviare il navigatore in tempo reale su Google Maps con le indicazioni a piedi, in auto o tramite trasporto pubblico verso la Residenza.
      </p>
    </div>

    <!-- CARD SPAZIO TESTO DEL SUPERMASTER / COMUNICAZIONE DIREZIONE -->
    <div class="card" style="border-left: 4px solid #f59e0b;">
      <div class="flex-between" style="margin-bottom: 8px;">
        <div class="flex-align" style="gap: 8px;">
          <span style="font-size: 22px;">👑</span>
          <div>
            <h2 class="card-title" style="margin: 0;">Comunicazione della Direzione (Supermaster)</h2>
            <span class="text-xs text-muted">Messaggio ufficiale del Superamministratore per tutti i residenti</span>
          </div>
        </div>
        ${haPermessiMaster() ? `
          <button type="button" class="btn btn-secondary btn-sm" onclick="apriModalMessaggioSupermaster()">
            ✏️ Modifica
          </button>
        ` : ''}
      </div>
      <div class="residenza-text-box" style="background: #fffbeb; border-color: #fde68a; color: #78350f; font-size: 13.5px; line-height: 1.5;">
        ${escapeHtml(msgSupermaster)}
      </div>
    </div>

    <!-- CARD SPAZIO BACHECA DELLA RESIDENZA (COMUNICAZIONI & RICORRENZE) -->
    <div class="card" style="border-top: 4px solid #0284c7;">
      <div class="flex-between" style="margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <div class="flex-align" style="gap: 8px;">
          <span style="font-size: 24px;">📌</span>
          <div>
            <h2 class="card-title" style="margin: 0; font-size: 17px;">Bacheca della Residenza</h2>
            <span class="text-xs text-muted">Comunicazioni, avvisi comunitari, compleanni ed eventi della struttura</span>
          </div>
        </div>
        <div style="display: flex; gap: 6px; align-items: center;">
          ${haPermessiMaster() ? `
            <button type="button" class="btn btn-primary btn-sm" onclick="apriModalBacheca()" style="font-weight: 700;">
              👑 + Nuovo Avviso
            </button>
          ` : ''}
          <button type="button" class="btn btn-outline btn-sm" onclick="switchTab('info')" style="font-size: 11px;">
            📅 Calendario Completo
          </button>
        </div>
      </div>

      ${(!appState.bacheca || appState.bacheca.length === 0) ? `
        <div class="empty-state-card card-inner" style="text-align: center; padding: 20px; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">
          <div style="font-size: 28px; margin-bottom: 4px;">🕊️</div>
          <p style="margin: 0; font-weight: 600;">Nessun avviso presente in bacheca al momento.</p>
          <span class="text-xs text-muted" style="display: block; margin-top: 2px;">I messaggi e gli annunci ufficiali per la comunità compariranno qui.</span>
        </div>
      ` : `
        <div class="residenza-bacheca-feed" style="display: flex; flex-direction: column; gap: 10px;">
          ${appState.bacheca.slice(0, 6).map(item => {
            const isEvidenza = item.priorita === "alta";
            let icon = "📢";
            let badgeStyle = "background: #e0f2fe; color: #0369a1;";
            if (item.tipo === "compleanno") { icon = "🎂"; badgeStyle = "background: #fef3c7; color: #92400e;"; }
            else if (item.tipo === "anniversario") { icon = "🔔"; badgeStyle = "background: #f3e8ff; color: #6b21a8;"; }
            else if (item.tipo === "evento") { icon = "📆"; badgeStyle = "background: #dcfce7; color: #166534;"; }

            return `
              <div class="card-inner" style="background: ${isEvidenza ? '#fffbeb' : '#ffffff'}; border: 1px solid ${isEvidenza ? '#fcd34d' : '#e2e8f0'}; border-radius: 8px; padding: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <div class="flex-between" style="margin-bottom: 6px;">
                  <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                    <span class="badge" style="${badgeStyle} font-weight: 700; font-size: 11px;">${icon} ${item.tipo ? item.tipo.toUpperCase() : 'AVVISO'}</span>
                    ${isEvidenza ? '<span class="badge" style="background: #fee2e2; color: #991b1b; font-weight: 700; font-size: 10.5px;">⭐ In Evidenza</span>' : ''}
                    <span class="text-xs text-muted" style="font-weight: 600;">📅 ${item.data ? formattaDataConfronto(item.data) : ''}</span>
                  </div>
                  ${haPermessiMaster() ? `
                    <div style="display: flex; gap: 4px;">
                      <button type="button" class="btn btn-outline btn-sm" style="padding: 1px 6px; font-size: 10.5px;" onclick="modificaAvvisoBacheca('${item.id}')" title="Modifica">✏️</button>
                      <button type="button" class="btn btn-outline btn-sm" style="padding: 1px 6px; font-size: 10.5px; color: #dc2626;" onclick="eliminaAvvisoBacheca('${item.id}')" title="Elimina">✕</button>
                    </div>
                  ` : ''}
                </div>
                <h4 style="margin: 2px 0 4px 0; font-size: 14.5px; color: #0f172a; font-weight: 700;">${escapeHtml(item.titolo)}</h4>
                ${item.descrizione ? `<p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.45;">${escapeHtml(item.descrizione)}</p>` : ''}
                <div class="text-xs text-muted" style="margin-top: 6px; font-style: italic;">
                  Pubblicato da: <strong>${escapeHtml(item.autore || 'Direzione')}</strong>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    </div>

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

    <!-- CARD REGOLAMENTO INTERNO (SINCRONIZZATO GOOGLE FOGLI) -->
    <div class="card">
      <div class="flex-between" style="margin-bottom: 8px;">
        <div class="flex-align">
          <span style="font-size: 22px; margin-right: 8px;">📜</span>
          <h2 class="card-title" style="margin: 0;">Regolamento Interno</h2>
        </div>
        ${haPermessiMaster() ? `
          <button type="button" class="btn btn-secondary btn-sm" onclick="apriModalTestiResidenza()">
            ✏️ Modifica Testi
          </button>
        ` : ''}
      </div>
      <div class="residenza-text-box">
        ${escapeHtml(regText)}
      </div>
    </div>

    <!-- CARD CONTATTI E RECAPITI (SINCRONIZZATO GOOGLE FOGLI) -->
    <div class="card">
      <div class="flex-between" style="margin-bottom: 8px;">
        <div class="flex-align">
          <span style="font-size: 22px; margin-right: 8px;">📞</span>
          <h2 class="card-title" style="margin: 0;">Contatti & Numeri Utili</h2>
        </div>
        ${haPermessiMaster() ? `
          <button type="button" class="btn btn-secondary btn-sm" onclick="apriModalTestiResidenza()">
            ✏️ Modifica Testi
          </button>
        ` : ''}
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
// MODAL GESTIONE MESSAGGIO SUPERMASTER / DIREZIONE
// ----------------------------------------------------------------------------
window.apriModalMessaggioSupermaster = function() {
  const currentMsg = appState.cachedConfig.Messaggio_Supermaster || "Cari residenti, benvenuti nel portale digitale della Residenza Newman. Per qualsiasi necessità o urgenza la Direzione è a vostra disposizione.";
  
  let modal = document.getElementById("modal-messaggio-supermaster");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-messaggio-supermaster";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 520px;">
        <div class="modal-header">
          <div style="font-size: 32px; margin-bottom: 6px;">👑</div>
          <h3 class="modal-title" style="margin: 0;">Spazio Testo del Supermaster</h3>
          <p class="modal-subtitle">Aggiorna la comunicazione ufficiale della Direzione visibile a tutti i residenti.</p>
        </div>
        <form onsubmit="salvaMessaggioSupermaster(event)">
          <div class="form-group">
            <label for="textarea-messaggio-supermaster" style="font-weight: 700;">Testo del Messaggio / Avviso Ufficiale:</label>
            <textarea id="textarea-messaggio-supermaster" class="input-textarea" rows="6" style="font-size: 13.5px; line-height: 1.5;" required placeholder="Scrivi la comunicazione della Direzione..."></textarea>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;">
            <button type="button" class="btn btn-secondary" onclick="chiudiModalMessaggioSupermaster()">Annulla</button>
            <button type="submit" class="btn btn-primary" style="background: #f59e0b; border-color: #d97706; color: #000; font-weight: 700;">💾 Salva & Pubblica per Tutti</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const textarea = document.getElementById("textarea-messaggio-supermaster");
  if (textarea) textarea.value = currentMsg;
  modal.style.display = "flex";
};

window.chiudiModalMessaggioSupermaster = function() {
  const modal = document.getElementById("modal-messaggio-supermaster");
  if (modal) modal.style.display = "none";
};

window.salvaMessaggioSupermaster = async function(event) {
  if (event) event.preventDefault();
  const textarea = document.getElementById("textarea-messaggio-supermaster");
  if (!textarea) return;

  const nuovoTesto = textarea.value.trim();
  if (!nuovoTesto) {
    mostraToast("Il testo non può essere vuoto", "warning");
    return;
  }

  try {
    const res = await callApi("aggiornaConfig", { Messaggio_Supermaster: nuovoTesto });
    if (res.success) {
      appState.cachedConfig.Messaggio_Supermaster = nuovoTesto;
      mostraToast("✅ Messaggio del Supermaster aggiornato!", "success");
      chiudiModalMessaggioSupermaster();
      renderResidenzaView();
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile salvare"), "error");
    }
  } catch (err) {
    mostraToast("Errore durante il salvataggio", "error");
  }
};

// ----------------------------------------------------------------------------
// MODAL GESTIONE TESTI RESIDENZA (REGOLAMENTO & CONTATTI GOOGLE FOGLI)
// ----------------------------------------------------------------------------
window.apriModalTestiResidenza = function() {
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
5. MANUTENZIONE: Segnalare tempestivamente qualsiasi anomalia nell'apposita sezione Guasti.`;

  const contText = appState.cachedConfig.Info_Contatti || `CONTATTI E RECAPITI DELLA RESIDENZA:
• Portineria / Accoglienza: Tel. +39 06 87654321 (Int. 101) - Attiva 07:00 - 22:30
• Direzione Generale: direzione@residenzanewman.org (Int. 102)
• Emergenze Notturne Custode: +39 333 1122334
• Economato & Servizio Mensa: mensa@residenzanewman.org
• Assistenza Tecnica Manutenzione: manutenzione@residenzanewman.org`;

  let modal = document.getElementById("modal-testi-residenza");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-testi-residenza";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 600px;">
        <div class="modal-header" style="margin-bottom: 14px;">
          <div style="font-size: 28px; margin-bottom: 4px;">📜</div>
          <h3 class="modal-title" style="margin: 0;">Spazio Testi della Residenza (Google Fogli)</h3>
          <p class="modal-subtitle" style="font-size: 12.5px; color: #64748b; margin-top: 4px;">
            I testi inseriti qui vengono memorizzati nel foglio <strong>Configurazione</strong> di Google Fogli e visualizzati da tutti i residenti.
          </p>
        </div>
        <form onsubmit="salvaTestiResidenza(event)">
          <div class="form-group" style="margin-bottom: 14px;">
            <label for="textarea-regolamento-edit" style="font-weight: 700; font-size: 13px;">📜 Testo Regolamento Interno:</label>
            <textarea id="textarea-regolamento-edit" class="input-textarea" rows="7" style="font-size: 12.5px; line-height: 1.45;" required></textarea>
          </div>
          <div class="form-group" style="margin-bottom: 14px;">
            <label for="textarea-contatti-edit" style="font-weight: 700; font-size: 13px;">📞 Testo Contatti & Recapiti Utili:</label>
            <textarea id="textarea-contatti-edit" class="input-textarea" rows="5" style="font-size: 12.5px; line-height: 1.45;" required></textarea>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;">
            <button type="button" class="btn btn-secondary" onclick="chiudiModalTestiResidenza()">Annulla</button>
            <button type="submit" class="btn btn-primary" style="font-weight: 700;">💾 Salva nel Foglio Google</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const tReg = document.getElementById("textarea-regolamento-edit");
  const tCont = document.getElementById("textarea-contatti-edit");
  if (tReg) tReg.value = regText;
  if (tCont) tCont.value = contText;

  modal.style.display = "flex";
};

window.chiudiModalTestiResidenza = function() {
  const modal = document.getElementById("modal-testi-residenza");
  if (modal) modal.style.display = "none";
};

window.salvaTestiResidenza = async function(event) {
  if (event) event.preventDefault();
  const reg = document.getElementById("textarea-regolamento-edit")?.value || "";
  const cont = document.getElementById("textarea-contatti-edit")?.value || "";

  try {
    const res = await callApi("aggiornaConfig", {
      Info_Regolamento: reg,
      Info_Contatti: cont
    });
    if (res.success) {
      if (!appState.cachedConfig) appState.cachedConfig = {};
      appState.cachedConfig.Info_Regolamento = reg;
      appState.cachedConfig.Info_Contatti = cont;
      mostraToast("✅ Testi salvati nel foglio Google e aggiornati!", "success");
      chiudiModalTestiResidenza();
      renderResidenzaView();
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile salvare"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete nel salvataggio", "error");
  }
};

// ----------------------------------------------------------------------------
// MODAL GESTIONE BACHECA (NUOVO AVVISO / COMPLEANNO)
// ----------------------------------------------------------------------------

window.apriModalBacheca = function(prefillData) {
  const modal = document.getElementById("modal-bacheca");
  if (!modal) return;

  const form = document.getElementById("form-nuovo-avviso-bacheca");
  if (form) form.reset();

  const idInput = document.getElementById("bacheca-modal-id");
  if (idInput) idInput.value = "";

  const titleEl = document.getElementById("bacheca-modal-title-text");
  if (titleEl) titleEl.innerText = "Nuovo Elemento in Bacheca";

  const btn = document.getElementById("btn-submit-bacheca");
  if (btn) btn.innerText = "Pubblica in Bacheca";

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

window.modificaAvvisoBacheca = function(id) {
  const item = (appState.bacheca || []).find(b => String(b.id) === String(id));
  if (!item) {
    mostraToast("Elemento non trovato", "warning");
    return;
  }
  const modal = document.getElementById("modal-bacheca");
  if (!modal) return;

  const idInput = document.getElementById("bacheca-modal-id");
  if (idInput) idInput.value = item.id;

  const tipoSelect = document.getElementById("bacheca-modal-tipo");
  if (tipoSelect) tipoSelect.value = item.tipo || "avviso";

  const dataInput = document.getElementById("bacheca-modal-data");
  if (dataInput) dataInput.value = formattaDataConfronto(item.data) || formatYMD(new Date());

  const titoloInput = document.getElementById("bacheca-modal-titolo");
  if (titoloInput) titoloInput.value = item.titolo || "";

  const descInput = document.getElementById("bacheca-modal-desc");
  if (descInput) descInput.value = item.descrizione || "";

  const autoreInput = document.getElementById("bacheca-modal-autore");
  if (autoreInput) autoreInput.value = item.autore || (appState.user ? appState.user.nome : "Direzione");

  const prioritaSelect = document.getElementById("bacheca-modal-priorita");
  if (prioritaSelect) prioritaSelect.value = item.priorita || "normale";

  const titleEl = document.getElementById("bacheca-modal-title-text");
  if (titleEl) titleEl.innerText = "✏️ Modifica Evento / Bacheca";

  const btn = document.getElementById("btn-submit-bacheca");
  if (btn) btn.innerText = "💾 Salva Modifiche Evento";

  modal.style.display = "flex";
};

window.chiudiModalBacheca = function() {
  const modal = document.getElementById("modal-bacheca");
  if (modal) modal.style.display = "none";
};

window.handleSalvaAvvisoBacheca = async function(e) {
  e.preventDefault();

  const id = document.getElementById("bacheca-modal-id")?.value?.trim() || "";
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
    btn.innerText = id ? "Salvataggio modifiche..." : "Pubblicazione in corso...";
  }

  try {
    const payload = {
      id: id || undefined,
      tipo,
      data,
      titolo,
      descrizione,
      autore,
      priorita
    };

    const res = await callApi("salvaAvvisoBacheca", payload);
    if (res.success) {
      mostraToast(id ? "✅ Evento aggiornato con successo!" : "✅ Pubblicato in bacheca con successo!", "success");
      // Aggiorna cache locale
      if (!appState.bacheca) appState.bacheca = [];
      const updatedId = res.id || id || ("B_" + Date.now());
      const item = {
        id: updatedId,
        tipo,
        data,
        titolo,
        descrizione,
        autore,
        priorita,
        timestamp: new Date().toISOString()
      };

      const existingIdx = appState.bacheca.findIndex(b => String(b.id) === String(updatedId));
      if (existingIdx !== -1) {
        appState.bacheca[existingIdx] = item;
      } else {
        appState.bacheca.unshift(item);
      }

      chiudiModalBacheca();
      renderBachecaView();
      renderResidenzaView();
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
      btn.innerText = id ? "💾 Salva Modifiche Evento" : "Pubblica in Bacheca";
    }
  }
};

let avvisoIdDaEliminare = null;

window.eliminaAvvisoBacheca = function(id) {
  avvisoIdDaEliminare = id;
  const modal = document.getElementById("modal-conferma-elimina-bacheca");
  if (modal) {
    modal.style.display = "flex";
  }
};

window.chiudiModalEliminaBacheca = function() {
  const modal = document.getElementById("modal-conferma-elimina-bacheca");
  if (modal) {
    modal.style.display = "none";
  }
  avvisoIdDaEliminare = null;
};

window.eseguiEliminazioneBachecaConfermata = async function() {
  const id = avvisoIdDaEliminare;
  if (!id) return;

  const btn = document.getElementById("btn-esegui-elimina-bacheca");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Rimozione in corso...";
  }

  try {
    const res = await callApi("eliminaAvvisoBacheca", { id });
    if (res.success) {
      mostraToast("Elemento rimosso dalla bacheca", "info");
      appState.bacheca = (appState.bacheca || []).filter(b => String(b.id) !== String(id));
      chiudiModalEliminaBacheca();
      renderBachecaView();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile eliminare"), "error");
    }
  } catch (err) {
    mostraToast("Errore di connessione", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Sì, Rimuovi";
    }
    chiudiModalEliminaBacheca();
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
 * Ancoraggio impostato a Lunedì 21 Settembre 2026 (Settimana 1: Paella e Saltimbocca alla Romana)
 * Supporta anche lo scambio dinamico delle settimane impostato dal Master
 */
function getSettimanaMenu(dataTarget) {
  const dTarget = new Date(dataTarget.getFullYear(), dataTarget.getMonth(), dataTarget.getDate());
  const dAnchor = new Date(MENU_ANCHOR_DATE.getFullYear(), MENU_ANCHOR_DATE.getMonth(), MENU_ANCHOR_DATE.getDate());

  const diffMs = dTarget.getTime() - dAnchor.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

  // modulo ciclico a 2 settimane (gestendo anche date antecedenti l'ancora)
  let isSettimana1 = Math.abs(diffWeeks) % 2 === 0;

  // Inversione configurata dal Master (salvata in Google Sheets o in locale)
  const isInvertito = appState.cachedConfig?.Inverti_Ciclo_Menu === "true" || localStorage.getItem("newman_inverti_menu") === "true";
  if (isInvertito) {
    isSettimana1 = !isSettimana1;
  }

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
            <div>
              <strong>1°:</strong> ${escapeHtml(menuGiorno.pranzo?.primo || '-')} • 
              <strong>2°:</strong> ${escapeHtml(menuGiorno.pranzo?.secondo || '-')} • 
              <strong>Cont.:</strong> ${escapeHtml(menuGiorno.pranzo?.contorno || '-')}${menuGiorno.pranzo?.contorno2 ? ' • ' + escapeHtml(menuGiorno.pranzo.contorno2) : ''} • 
              <strong>Dessert:</strong> ${escapeHtml(menuGiorno.pranzo?.dessert || '-')}
            </div>
            ${isTuesdayOrThursday ? `
              <div style="margin-top: 3px; font-size: 11px; color: #c2410c;">
                🥪 <em>Opzione Busta da asporto sempre selezionabile</em>
              </div>
            ` : ''}
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
              <strong>1°:</strong> ${escapeHtml(menuGiorno.cena?.primo || '-')} • 
              <strong>2°:</strong> ${escapeHtml(menuGiorno.cena?.secondo || '-')} • 
              <strong>Cont.:</strong> ${escapeHtml(menuGiorno.cena?.contorno || '-')}${menuGiorno.cena?.contorno2 ? ' • ' + escapeHtml(menuGiorno.cena.contorno2) : ''} • 
              <strong>Dessert:</strong> ${escapeHtml(menuGiorno.cena?.dessert || '-')}
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
        <div class="dish-list">
          <div class="dish-item"><span class="dish-type">Primo:</span> <span class="dish-name">${escapeHtml(menuGiorno.pranzo?.primo || '-')}</span></div>
          <div class="dish-item"><span class="dish-type">Secondo:</span> <span class="dish-name">${escapeHtml(menuGiorno.pranzo?.secondo || '-')}</span></div>
          <div class="dish-item">
            <span class="dish-type">Contorno:</span> 
            <span class="dish-name">
              ${escapeHtml(menuGiorno.pranzo?.contorno || '-')}
              ${menuGiorno.pranzo?.contorno2 ? ` • ${escapeHtml(menuGiorno.pranzo.contorno2)}` : ''}
            </span>
          </div>
          <div class="dish-item"><span class="dish-type">Dessert:</span> <span class="dish-name">${escapeHtml(menuGiorno.pranzo?.dessert || '-')}</span></div>
        </div>

        ${isTuesdayOrThursday ? `
          <div class="busta-classici-container" style="margin-top: 12px;">
            <div class="busta-classici-header">
              <span style="font-size: 24px;">🥪</span>
              <div>
                <strong style="color: #9a3412; font-size: 13px;">Disponibile opzione Busta da asporto</strong>
                <p style="margin: 2px 0 0 0; font-size: 11px; color: #7c2d12;">
                  Puoi richiedere la busta al sacco spuntando la casella sottostante.
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
          </div>
        ` : ''}

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
          <div class="dish-item"><span class="dish-type">Primo:</span> <span class="dish-name">${escapeHtml(menuGiorno.cena?.primo || '-')}</span></div>
          <div class="dish-item"><span class="dish-type">Secondo:</span> <span class="dish-name">${escapeHtml(menuGiorno.cena?.secondo || '-')}</span></div>
          <div class="dish-item">
            <span class="dish-type">Contorno:</span> 
            <span class="dish-name">
              ${escapeHtml(menuGiorno.cena?.contorno || '-')}
              ${menuGiorno.cena?.contorno2 ? ` • ${escapeHtml(menuGiorno.cena.contorno2)}` : ''}
            </span>
          </div>
          <div class="dish-item"><span class="dish-type">Dessert:</span> <span class="dish-name">${escapeHtml(menuGiorno.cena?.dessert || '-')}</span></div>
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

      ${haPermessiMaster() ? `
        <!-- BARRA MASTER DIRETTA SUGLI SPAZI -->
        <div class="card-inner" style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong style="color: #9d174d; font-size: 13px;">👑 Azioni Master ${risorsaAttiva === 'Chiesa' ? 'Chiesa' : 'Sala TV'}</strong>
            <div class="text-xs text-muted">Puoi riservare celebrazioni, bloccare orari e liberare slot occupati.</div>
          </div>
          <button type="button" class="btn btn-sm btn-primary" onclick="apriModalMasterAppuntamento('${risorsaAttiva}', '${dataAttiva}')" style="background: #9d174d; border-color: #9d174d; font-weight: 600;">
            ➕ Inserisci Appuntamento Master
          </button>
        </div>
      ` : ''}

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
    const pData = formattaDataConfronto(p.data);
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
 * Gestione dello stato del modal di prenotazione spazio
 */
let slotInPrenotazione = null;
let slotInCancellazione = null;

window.chiudiModalPrenotaSpazio = function() {
  const modal = document.getElementById("modal-prenota-spazio");
  if (modal) modal.style.display = "none";
  slotInPrenotazione = null;
};

window.chiudiModalCancellaSpazio = function() {
  const modal = document.getElementById("modal-cancella-spazio");
  if (modal) modal.style.display = "none";
  slotInCancellazione = null;
};

window.onSpazioResidentSelectChange = function() {
  const select = document.getElementById("spazio-quick-resident-select");
  const customFields = document.getElementById("spazio-custom-user-fields");
  if (select && customFields) {
    customFields.style.display = (select.value === "custom") ? "flex" : "none";
  }
};

/**
 * Prenotazione accessibile e diretta per ogni utente
 */
window.prenotaSlotDiretto = function(slot) {
  slotInPrenotazione = slot;
  const risorsa = appState.selectedSpazioRisorsa || "Chiesa";
  const data = appState.selectedSpazioData || formatYMD(new Date());
  const nomeRisorsa = risorsa === "Chiesa" ? "Chiesa / Cappella" : "Sala TV";
  const icon = risorsa === "Chiesa" ? "⛪" : "📺";

  const modal = document.getElementById("modal-prenota-spazio");
  if (!modal) return;

  const iconEl = document.getElementById("modal-spazio-icon");
  if (iconEl) iconEl.textContent = icon;

  const titoloEl = document.getElementById("modal-spazio-titolo");
  if (titoloEl) titoloEl.textContent = `Prenota ${nomeRisorsa}`;

  const resEl = document.getElementById("modal-spazio-dettaglio-risorsa");
  if (resEl) resEl.textContent = nomeRisorsa;

  const dataEl = document.getElementById("modal-spazio-dettaglio-data");
  if (dataEl) dataEl.textContent = data;

  const slotEl = document.getElementById("modal-spazio-dettaglio-slot");
  if (slotEl) slotEl.textContent = slot;

  const userBlock = document.getElementById("modal-spazio-utente-blocco");
  if (userBlock) {
    if (appState.user) {
      userBlock.innerHTML = `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; font-size: 13px;">
          <div style="color: #166534; font-weight: 600; margin-bottom: 2px;">Prenotazione a nome di:</div>
          <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${escapeHtml(appState.user.nome || appState.user.email)}</div>
          <div style="font-size: 12px; color: #64748b;">${escapeHtml(appState.user.email)}</div>
        </div>
      `;
    } else {
      const utentiList = (appState.tuttiUtenti || INITIAL_MOCK_DB.utenti || []).filter(u => u.stato === "Approvato");
      userBlock.innerHTML = `
        <div class="form-group" style="margin-bottom: 8px;">
          <label for="spazio-quick-resident-select" style="font-size: 12px; font-weight: 600; color: #334155;">Seleziona il tuo profilo residente:</label>
          <select id="spazio-quick-resident-select" class="input-select" onchange="onSpazioResidentSelectChange()">
            ${utentiList.map(u => `<option value="${escapeHtml(u.email)}" data-nome="${escapeHtml(u.nome)}">${escapeHtml(u.nome)} (${escapeHtml(u.email)})</option>`).join("")}
            <option value="custom">Altro Residente / Inserisci Dati</option>
          </select>
        </div>
        <div id="spazio-custom-user-fields" style="display: none; flex-direction: column; gap: 8px;">
          <input type="text" id="spazio-custom-nome" class="input-text" placeholder="Nome e Cognome (es. Marco Bianchi)">
          <input type="email" id="spazio-custom-email" class="input-text" placeholder="Email residente">
        </div>
      `;
    }
  }

  modal.style.display = "flex";
};

window.eseguiPrenotazioneSpazioConfermata = async function() {
  const slot = slotInPrenotazione;
  if (!slot) return;

  let emailPrenotante = "";
  let nomePrenotante = "";

  if (appState.user) {
    emailPrenotante = appState.user.email;
    nomePrenotante = appState.user.nome;
  } else {
    const sel = document.getElementById("spazio-quick-resident-select");
    if (sel && sel.value !== "custom") {
      emailPrenotante = sel.value;
      const opt = sel.options[sel.selectedIndex];
      nomePrenotante = opt ? opt.getAttribute("data-nome") : emailPrenotante;
      // Imposta come utente attivo nella sessione
      appState.user = {
        email: emailPrenotante,
        nome: nomePrenotante,
        stato: "Approvato",
        perm_mensa: true,
        perm_manutenzione: true,
        perm_spazi: true,
        perm_admin: emailPrenotante.includes("dotti")
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(appState.user));
      aggiornaUIUtente();
    } else {
      nomePrenotante = (document.getElementById("spazio-custom-nome")?.value || "").trim();
      emailPrenotante = (document.getElementById("spazio-custom-email")?.value || "").trim().toLowerCase();
      if (!emailPrenotante || !nomePrenotante) {
        mostraToast("Inserisci nome ed email per prenotare", "warning");
        return;
      }
      appState.user = {
        email: emailPrenotante,
        nome: nomePrenotante,
        stato: "Approvato",
        perm_mensa: true,
        perm_manutenzione: true,
        perm_spazi: true,
        perm_admin: false
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(appState.user));
      aggiornaUIUtente();
    }
  }

  const risorsa = appState.selectedSpazioRisorsa || "Chiesa";
  const data = appState.selectedSpazioData || formatYMD(new Date());
  const nomeRisorsa = risorsa === "Chiesa" ? "Chiesa / Cappella" : "Sala TV";

  const btn = document.getElementById("btn-conferma-spazio-azione");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Registrazione in corso...";
  }

  try {
    const res = await callApi("prenotaSpazio", {
      risorsa,
      data,
      slot_orario: slot,
      email: emailPrenotante
    });

    if (res.success) {
      mostraToast(`✅ Slot ${slot} per ${nomeRisorsa} prenotato!`, "success");
      if (!appState.prenotazioniSpazi) appState.prenotazioniSpazi = [];
      appState.prenotazioniSpazi.push({
        id: res.id || ("S_" + Date.now()),
        risorsa,
        data,
        slot_orario: slot,
        email: emailPrenotante,
        timestamp: new Date().toISOString()
      });
      chiudiModalPrenotaSpazio();
      renderSlotSpazi();
      if (document.getElementById("master-dynamic-content") && haPermessiMaster()) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Slot non disponibile"), "error");
    }
  } catch (err) {
    mostraToast("Errore di connessione", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "✅ Conferma Prenotazione";
    }
  }
};

/**
 * Cancellazione slot (per l'utente proprietario o per il Master) con modal
 */
window.cancellaSlotSpazio = function(id, slot, isMasterAction) {
  const risorsa = appState.selectedSpazioRisorsa || "Chiesa";
  const data = appState.selectedSpazioData || formatYMD(new Date());
  const nomeRisorsa = risorsa === "Chiesa" ? "Chiesa / Cappella" : "Sala TV";

  slotInCancellazione = { id, slot, isMasterAction, risorsa, data };

  const modal = document.getElementById("modal-cancella-spazio");
  const testo = document.getElementById("cancella-spazio-testo");
  if (!modal) return;

  if (testo) {
    if (isMasterAction) {
      testo.innerHTML = `Come <strong>Amministratore / Master</strong>, confermi di voler liberare lo slot <strong>${escapeHtml(slot)}</strong> per <strong>${escapeHtml(nomeRisorsa)}</strong> del giorno <strong>${escapeHtml(data)}</strong>?`;
    } else {
      testo.innerHTML = `Confermi di voler annullare la tua prenotazione per <strong>${escapeHtml(nomeRisorsa)}</strong> nello slot <strong>${escapeHtml(slot)}</strong> del giorno <strong>${escapeHtml(data)}</strong>?`;
    }
  }

  modal.style.display = "flex";
};

window.eseguiCancellazioneSpazioConfermata = async function() {
  if (!slotInCancellazione) return;
  const { id, slot, isMasterAction, risorsa, data } = slotInCancellazione;

  const btn = document.getElementById("btn-esegui-cancella-spazio");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Liberazione in corso...";
  }

  try {
    const res = await callApi("cancellaPrenotazioneSpazio", {
      id,
      risorsa,
      data,
      slot_orario: slot,
      email: isMasterAction ? "" : (appState.user ? appState.user.email : "")
    });

    if (res.success) {
      mostraToast("Slot liberato con successo", "info");
      appState.prenotazioniSpazi = (appState.prenotazioniSpazi || []).filter(p => {
        if (id && String(p.id) === String(id)) return false;
        const pData = formattaDataConfronto(p.data);
        if (p.risorsa === risorsa && pData === data && p.slot_orario === slot) return false;
        return true;
      });
      chiudiModalCancellaSpazio();
      renderSlotSpazi();
      if (document.getElementById("master-dynamic-content") && haPermessiMaster()) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile annullare"), "error");
    }
  } catch (err) {
    mostraToast("Errore durante la cancellazione", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Sì, Libera Slot";
    }
    chiudiModalCancellaSpazio();
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

      const categoria = document.getElementById("manutenzione-categoria")?.value || "manutenzione";
      const luogo = document.getElementById("manutenzione-luogo")?.value.trim() || "";
      const descrizione = document.getElementById("manutenzione-descrizione")?.value.trim() || "";

      if (!descrizione) {
        mostraToast("Inserisci una descrizione della segnalazione", "warning");
        return;
      }

      const testoCompleto = luogo ? `[${luogo}] ${descrizione}` : descrizione;
      const submitBtn = document.getElementById("btn-submit-guasto");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Invio in corso...";
      }

      try {
        const res = await callApi("caricaGuasto", {
          email: appState.user.email,
          categoria,
          luogo,
          descrizione: testoCompleto,
          fotoBase64: appState.compressedImageBase64 || "",
          mimeType: "image/jpeg"
        });

        if (res.success) {
          mostraToast("✅ Segnalazione inviata ai Masters con successo!", "success");
          form.reset();
          appState.compressedImageBase64 = null;
          if (previewBox) previewBox.style.display = "none";
          if (haPermessiMaster()) caricaDatiMaster();
          caricaGuastiRecenti();
        } else {
          mostraToast("Errore invio: " + (res.error || "Impossibile salvare"), "error");
        }
      } catch (err) {
        mostraToast("Errore di rete nell'invio della segnalazione", "error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Invia Segnalazione";
        }
      }
    });
  }
}

async function caricaGuastiRecenti() {
  const feed = document.getElementById("manutenzione-recenti-list");
  if (!feed) return;

  const data = await callApi("getMasterData", { email: appState.user ? appState.user.email : "" });
  if (data && data.guasti) {
    appState.guasti = data.guasti;
    appState.manutenzioneList = data.guasti;
  }

  // Riservatezza: gli utenti normali vedono ESCLUSIVAMENTE le proprie segnalazioni
  let listToShow = appState.guasti || [];
  if (!haPermessiMaster()) {
    listToShow = listToShow.filter(g => g.email && appState.user && g.email.toLowerCase() === appState.user.email.toLowerCase());
  }

  renderFeedGuasti(feed, listToShow.slice(0, 10));
}

function renderFeedGuasti(container, guastiList) {
  if (!guastiList || guastiList.length === 0) {
    const isMaster = haPermessiMaster();
    container.innerHTML = `
      <div class="empty-state-card card-inner" style="text-align: center; padding: 24px; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">
        <div style="font-size: 28px; margin-bottom: 6px;">📋</div>
        <p style="margin: 0; font-weight: 600;">${isMaster ? 'Nessuna segnalazione registrata al momento.' : 'Non hai inviato ancora nessuna segnalazione.'}</p>
        <span class="text-xs text-muted" style="display: block; margin-top: 4px;">
          ${isMaster ? 'Le segnalazioni dei residenti compariranno qui e nel Pannello Master.' : 'Per motivi di riservatezza, puoi visualizzare solo le segnalazioni inviate dal tuo account.'}
        </span>
      </div>
    `;
    return;
  }

  container.innerHTML = guastiList.map(g => {
    const isRisolto = g.stato === "Risolto";
    const isServizi = g.categoria === "servizi";
    const priorita = g.priorita || "Media";
    let prioritaBadge = `<span class="badge" style="background:#e0e7ff; color:#3730a3; font-size:11px;">Priorità: ${priorita}</span>`;
    if (priorita === "Alta" || priorita === "Urgente") {
      prioritaBadge = `<span class="badge" style="background:#fee2e2; color:#991b1b; font-weight:700; font-size:11px;">⚠️ ${priorita}</span>`;
    }

    return `
      <div class="guasto-card card-inner" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div class="flex-between" style="flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <span class="badge" style="font-weight: 700; background: ${isServizi ? '#e0f2fe' : '#fef3c7'}; color: ${isServizi ? '#0369a1' : '#92400e'};">
              ${isServizi ? '🧹 Servizi Residenza' : '🛠️ Manutenzione Tecnica'}
            </span>
            ${g.id ? `<span class="badge" style="background: #f1f5f9; color: #475569; font-size: 11px;">ID: ${escapeHtml(g.id)}</span>` : ''}
            ${prioritaBadge}
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="badge ${isRisolto ? 'badge-success' : 'badge-danger'}" style="font-weight: 700;">${g.stato || 'Da fare'}</span>
            <span class="text-xs text-muted">${g.timestamp ? new Date(g.timestamp).toLocaleDateString("it-IT") : ''}</span>
          </div>
        </div>

        ${g.luogo ? `<div style="font-size: 12px; color: #0284c7; font-weight: 700; margin-bottom: 4px;">📍 Luogo: ${escapeHtml(g.luogo)}</div>` : ''}
        <p class="guasto-desc" style="font-size: 13.5px; line-height: 1.5; color: #1e293b; margin: 4px 0 8px 0;">${escapeHtml(g.descrizione)}</p>

        ${g.note_intervento ? `
          <div style="background: #f0fdf4; border-left: 3px solid #16a34a; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #166534; margin: 8px 0;">
            <strong>Nota Tecnico/Master:</strong> ${escapeHtml(g.note_intervento)}
            ${g.tecnico ? `<span style="display: block; font-size: 11px; color: #15803d; margin-top: 2px;">Incaricato: ${escapeHtml(g.tecnico)}</span>` : ''}
          </div>
        ` : ''}

        ${g.link_foto ? `
          <div class="guasto-thumb-wrap" style="margin: 8px 0;">
            <img src="${g.link_foto}" alt="Foto allegata" class="guasto-thumb" style="max-height: 100px; border-radius: 6px; cursor: pointer;" onclick="apriFotoInNuovaScheda('${g.link_foto}')">
            <span class="text-xs text-muted" style="display: block; margin-top: 2px;">Clicca sulla foto per ingrandirla</span>
          </div>
        ` : ''}

        <div class="text-xs text-muted" style="margin-top: 8px; border-top: 1px dashed #f1f5f9; padding-top: 6px;">
          Segnalato da: <strong>${escapeHtml(g.email)}</strong>
          ${g.data_chiusura ? ` • <span style="color: #16a34a; font-weight: 600;">Chiuso il ${new Date(g.data_chiusura).toLocaleDateString("it-IT")}</span>` : ''}
        </div>
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
    const res = await callApi("getMasterData", { email: appState.user ? appState.user.email : "" });
    if (res && res.success) {
      appState.utentiInAttesa = res.utentiInAttesa || [];
      appState.tuttiUtenti = res.tuttiUtenti || [];
      appState.mensaBookings = res.mensa || [];
      appState.guasti = res.guasti || [];
      appState.manutenzioneList = appState.guasti;
      appState.cachedConfig = res.config || appState.cachedConfig || {};
      if (res.bacheca) appState.bacheca = res.bacheca;
      if (res.prenotazioniSpazi) appState.prenotazioniSpazi = res.prenotazioniSpazi;
    }
    renderMasterSection();
  } catch (err) {
    console.error("Errore caricamento Master Data:", err);
    renderMasterSection();
  }
}

// Filtri attivi per la visualizzazione Master Segnalazioni
let masterSegnalazioniFiltroCategoria = "tutte";
let masterSegnalazioniFiltroStato = "tutte";

window.filtraMasterSegnalazioni = function(categoria, stato) {
  if (categoria !== undefined) masterSegnalazioniFiltroCategoria = categoria;
  if (stato !== undefined) masterSegnalazioniFiltroStato = stato;
  renderMasterSection();
};

function renderMasterSection() {
  const container = document.getElementById("master-dynamic-content");
  if (!container || !appState.user) return;

  const { perm_admin, perm_mensa, perm_manutenzione } = appState.user;
  const tuttiUtenti = appState.tuttiUtenti || [];
  const utentiInAttesa = appState.utentiInAttesa || [];
  const mensaBookings = appState.mensaBookings || [];
  const prenotazioniSpazi = appState.prenotazioniSpazi || [];
  const tutteSegnalazioni = appState.guasti || appState.manutenzioneList || [];
  const bachecaItems = appState.bacheca || [];

  let html = `
    <!-- BARRA DI COMANDO RAPIDO MASTER -->
    <div class="card" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #fff; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.12); padding: 18px; border-radius: 10px;">
      <div class="flex-between" style="flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #f59e0b; font-weight: 700;">Amministrazione & Direzione Residenza</div>
          <h2 style="font-size: 21px; font-weight: 800; color: #fff; margin: 2px 0 4px 0;">👑 Pannello Master & Gestione Globale</h2>
          <p style="font-size: 13px; color: #94a3b8; margin: 0;">
            Gestione ruoli residenti, appuntamenti, prenotazioni Chiesa e Sala TV, segnalazioni e sincronizzazione Google Fogli.
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary" onclick="apriModalMasterAppuntamento()" style="background: #9d174d; border-color: #9d174d; display: flex; align-items: center; gap: 6px; font-weight: 700;">
            <span>➕</span> Inserisci Appuntamento Master
          </button>
          <button type="button" class="btn btn-secondary" onclick="apriModalCodiceGas()" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 6px;">
            <span>📊</span> Guida Google Fogli (Code.gs)
          </button>
        </div>
      </div>
    </div>
  `;

  // ==========================================================================
  // 1. SUB-PANNELLO ADMIN (SUPERAMMINISTRATORE)
  // ==========================================================================
  if (perm_admin) {
    html += `
      <!-- GESTIONE UTENTI E RUOLI ESCLUSIVA SUPERAMMINISTRATORE -->
      <div class="master-block card" style="border-top: 4px solid #f59e0b;">
        <div class="master-header flex-between" style="flex-wrap: wrap; gap: 8px;">
          <div class="flex-align" style="gap: 8px;">
            <span style="font-size: 22px;">👑</span>
            <div>
              <h3 class="card-title" style="margin: 0;">Gestione Ruoli Residenti & Approvazioni (Superamministratore)</h3>
              <span class="text-xs text-muted">Solo il Superamministratore può assegnare o revocare i ruoli Master e Admin</span>
            </div>
          </div>
          <span class="badge" style="background: #fef3c7; color: #92400e; font-weight: 700;">Ruolo: Superamministratore</span>
        </div>

        <!-- 1.1 UTENTI IN ATTESA DI APPROVAZIONE -->
        <div class="sub-section" style="margin-top: 14px;">
          <div class="flex-between" style="margin-bottom: 8px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: 700;">⏳ Utenti in Attesa di Registrazione (${utentiInAttesa.length})</h4>
          </div>
          <div id="admin-utenti-attesa-list">
            ${utentiInAttesa.length === 0 ? '<p class="empty-state-text" style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px dashed #cbd5e1; font-size: 13px;">Nessun utente in attesa di approvazione.</p>' : ''}
            ${utentiInAttesa.map(u => `
              <div class="user-approval-row card-inner" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; padding: 12px; margin-bottom: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <div class="user-info">
                  <strong>${escapeHtml(u.nome)}</strong>
                  <span class="text-muted text-sm" style="display: block;">${escapeHtml(u.email)}</span>
                </div>
                <div class="permessi-grid" style="display: flex; gap: 10px; font-size: 12px; font-weight: 600;">
                  <label><input type="checkbox" id="p-mensa-${escapeHtml(u.email)}"> Mensa</label>
                  <label><input type="checkbox" id="p-manut-${escapeHtml(u.email)}"> Manutenzione/Servizi</label>
                  <label><input type="checkbox" id="p-spazi-${escapeHtml(u.email)}" checked> Spazi</label>
                  <label><input type="checkbox" id="p-admin-${escapeHtml(u.email)}"> Admin</label>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <button type="button" class="btn btn-success btn-sm" onclick="approvaUtente('${escapeHtml(u.email)}')" style="font-weight: 700;">
                    ✅ Approva & Attiva
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" onclick="eliminaUtente('${escapeHtml(u.email)}', '${escapeHtml(u.nome)}')" style="font-weight: 600; color: #dc2626; border-color: #fca5a5;" title="Rifiuta o elimina richiesta">
                    🗑️ Rifiuta
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- 1.2 ELENCO TUTTI GLI UTENTI REGISTRATI & ASSEGNAZIONE RUOLI -->
        <div class="sub-section" style="margin-top: 20px;">
          <div class="flex-between" style="margin-bottom: 8px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: 700;">👥 Elenco Residenti Registrati & Modifica Ruoli Master (${tuttiUtenti.length})</h4>
            <span class="text-xs text-muted">Assegna i ruoli di Master Mensa, Master Manutenzione o Admin</span>
          </div>
          <div class="table-responsive">
            <table class="master-table">
              <thead>
                <tr>
                  <th>Residente</th>
                  <th>Stato</th>
                  <th>Mensa</th>
                  <th>Manutenzione / Servizi</th>
                  <th>Spazi Comuni</th>
                  <th>Supermaster (Admin)</th>
                  <th>Azione</th>
                </tr>
              </thead>
              <tbody>
                ${tuttiUtenti.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding: 14px; color: #64748b;">Nessun utente caricato.</td></tr>' : ''}
                ${tuttiUtenti.map(u => `
                  <tr>
                    <td>
                      <strong>${escapeHtml(u.nome || u.email)}</strong>
                      <div class="text-xs text-muted">${escapeHtml(u.email)}</div>
                    </td>
                    <td>
                      <span class="badge ${u.stato === 'Approvato' ? 'badge-success' : 'badge-warning'}">${escapeHtml(u.stato || 'Attivo')}</span>
                    </td>
                    <td style="text-align: center;">
                      <input type="checkbox" id="edit-p-mensa-${escapeHtml(u.email)}" ${u.perm_mensa ? 'checked' : ''} title="Permesso Master Mensa">
                    </td>
                    <td style="text-align: center;">
                      <input type="checkbox" id="edit-p-manut-${escapeHtml(u.email)}" ${u.perm_manutenzione ? 'checked' : ''} title="Permesso Master Manutenzione e Servizi">
                    </td>
                    <td style="text-align: center;">
                      <input type="checkbox" id="edit-p-spazi-${escapeHtml(u.email)}" ${u.perm_spazi ? 'checked' : ''} title="Permesso Prenotazione Chiesa e Sala TV">
                    </td>
                    <td style="text-align: center;">
                      <input type="checkbox" id="edit-p-admin-${escapeHtml(u.email)}" ${u.perm_admin ? 'checked' : ''} title="Permesso Superamministratore">
                    </td>
                    <td>
                      <div style="display: flex; gap: 4px; align-items: center;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="salvaRuoliUtente('${escapeHtml(u.email)}')" style="font-size: 11px; padding: 4px 8px; font-weight: 600;" title="Salva modifiche ruoli">
                          💾 Salva
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" onclick="eliminaUtente('${escapeHtml(u.email)}', '${escapeHtml(u.nome || u.email)}')" style="font-size: 11px; padding: 4px 8px; font-weight: 600; color: #dc2626; border-color: #fca5a5;" title="Rimuovi utente dal sistema e dal foglio Google">
                          🗑️ Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 1.3 INSERIMENTO / IMPORTAZIONE RAPIDA ELENCO RESIDENTI -->
        <div class="sub-section" style="margin-top: 20px; background: #fdf8f6; border: 1px solid #fed7aa; padding: 14px; border-radius: 8px;">
          <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #9a3412; display: flex; align-items: center; gap: 6px;">
            <span>📋</span> <strong>Importa o Inserisci Elenco Residenti Pre-Approvati</strong>
          </h4>
          <p class="text-xs text-muted" style="margin-bottom: 10px;">
            Puoi inserire o incollare un elenco di residenti (uno per riga) nel formato: <code>email, Nome Cognome</code>.<br>
            Verranno registrati ed approvati automaticamente con i permessi standard di residente (Spazi e Mensa abilitati).
          </p>
          <form onsubmit="importaElencoUtentiMaster(event)">
            <textarea id="import-utenti-textarea" class="input-textarea" rows="3" style="font-size: 12.5px; font-family: monospace;" placeholder="donmario@newman.it, Don Mario Rossi&#10;francesco@newman.it, Francesco Bianchi"></textarea>
            <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
              <button type="submit" class="btn btn-primary btn-sm" style="background: #ea580c; border-color: #c2410c; font-weight: 700;">
                ➕ Importa & Abilita Tutti i Residenti
              </button>
            </div>
          </form>
        </div>

        <!-- 1.4 SPAZIO TESTO DEL SUPERMASTER -->
        <div class="sub-section" style="margin-top: 24px; border-top: 1px dashed #e2e8f0; padding-top: 16px;">
          <div class="flex-between" style="margin-bottom: 8px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: 700;">👑 Spazio Testo del Supermaster (Messaggio ai Residenti)</h4>
            <button type="button" class="btn btn-outline btn-sm" onclick="apriModalMessaggioSupermaster()">✏️ Modifica con Modal</button>
          </div>
          <form onsubmit="handleSalvaMessaggioSupermasterRapido(event)">
            <div class="form-group" style="margin-bottom: 10px;">
              <label for="admin-messaggio-supermaster" style="font-size: 12px; font-weight: 600;">Comunicazione Ufficiale della Direzione visibile a tutti i residenti nella pagina della Residenza:</label>
              <textarea id="admin-messaggio-supermaster" class="input-textarea" rows="3" style="font-size: 13px;">${escapeHtml(appState.cachedConfig.Messaggio_Supermaster || '')}</textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-sm" style="background: #f59e0b; border-color: #d97706; color: #000; font-weight: 700;">
              💾 Salva Messaggio della Direzione
            </button>
          </form>
        </div>

        <!-- 1.5 REGOLAMENTO E CONTATTI -->
        <div class="sub-section" style="margin-top: 20px; border-top: 1px dashed #e2e8f0; padding-top: 16px;">
          <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700;">📜 Modifica Regolamento & Contatti Ufficiali</h4>
          <form onsubmit="handleAggiornaTestiBacheca(event)">
            <div class="form-group">
              <label for="admin-regolamento" style="font-size: 12px; font-weight: 600;">Info_Regolamento</label>
              <textarea id="admin-regolamento" class="input-textarea" rows="4" style="font-size: 12.5px;">${escapeHtml(appState.cachedConfig.Info_Regolamento || '')}</textarea>
            </div>
            <div class="form-group">
              <label for="admin-contatti" style="font-size: 12px; font-weight: 600;">Info_Contatti</label>
              <textarea id="admin-contatti" class="input-textarea" rows="3" style="font-size: 12.5px;">${escapeHtml(appState.cachedConfig.Info_Contatti || '')}</textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Salva Regolamento & Contatti</button>
          </form>
        </div>
      </div>

      <!-- ==================================================================
           GESTIONE CALENDARIO & DATE DA GOOGLE FOGLI (GUIDA & SINCRONIZZAZIONE)
           ================================================================== -->
      <div class="master-block card" id="master-calendario-card" style="border-top: 4px solid #0284c7;">
        <div class="master-header flex-between" style="flex-wrap: wrap; gap: 8px;">
          <div class="flex-align" style="gap: 8px;">
            <span style="font-size: 22px;">📅</span>
            <div>
              <h3 class="card-title" style="margin: 0;">Gestione Calendario, Date da Google Fogli & Eventi</h3>
              <span class="text-xs text-muted">Come sincronizzare le date dal Foglio "Bacheca" e aggiungere eventi dall'App</span>
            </div>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary btn-sm" onclick="apriModalImportaCalendarioCSV()" style="font-size: 11px; padding: 5px 10px; font-weight: 700;">
              📤 Carica CSV Calendario
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="scaricaModelloCalendarioCSV()" style="font-size: 11px; padding: 5px 10px;">
              📥 Scarica Modello (CSV)
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="sincronizzaTuttoDaGoogleFogli()" style="font-size: 11px; padding: 5px 10px;">
              🔄 Sincronizza Date da Fogli
            </button>
          </div>
        </div>

        <!-- GUIDA ESPLICATIVA PASSO PASSO -->
        <div class="card-inner" style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin: 12px 0;">
          <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 13.5px; display: flex; align-items: center; gap: 6px;">
            <span>ℹ️</span> <strong>Come gestire le date e gli eventi del Calendario:</strong>
          </h4>
          <ol style="margin: 0; padding-left: 18px; font-size: 12.5px; line-height: 1.6; color: #1e3a8a;">
            <li><strong>📤 Caricamento rapido da CSV:</strong> Clicca su <em>"Carica CSV Calendario"</em> in alto per importare un intero file con compleanni, ricorrenze ed eventi in un solo clic!</li>
            <li><strong>Dal Foglio Google:</strong> Nel foglio denominato <code>Bacheca</code> puoi compilare o incollare direttamente le righe con: <em>ID, Data (YYYY-MM-DD, es. 2026-10-04), Tipo (compleanno, anniversario, evento, speciale, avviso), Titolo, Descrizione, Autore, Priorita (normale o alta)</em>.</li>
            <li><strong>Dall'App:</strong> Usa il modulo sottostante o il pulsante rapido <em>"➕ Inserisci Appuntamento Master"</em> per pubblicare subito un evento senza aprire il foglio.</li>
            <li><strong>Sincronizzazione Automatica:</strong> Cliccando su <em>"Sincronizza Date da Fogli"</em> l'app ricarica tutte le ricorrenze e le festività presenti nel foglio Google!</li>
          </ol>
        </div>

        <!-- FORM RAPIDO INSERIMENTO MASTER -->
        <div class="card-inner" style="background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 18px; border-radius: 8px; padding: 14px;">
          <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; display: flex; align-items: center; gap: 6px;">
            <span>➕</span> <strong>Aggiungi Nuovo Evento / Data dall'App</strong>
          </h4>
          <form onsubmit="handleMasterAggiungiAppuntamento(event)">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 10px;">
              <div class="form-group" style="margin: 0;">
                <label for="master-bacheca-tipo" style="font-size: 12px; font-weight: 600;">Tipologia</label>
                <select id="master-bacheca-tipo" class="input-select" style="padding: 7px 10px; font-size: 13px;">
                  <option value="avviso">📢 Avviso Comunitario / Direzione</option>
                  <option value="compleanno">🎂 Compleanno</option>
                  <option value="anniversario">🔔 Anniversario Sacerdotale / Ordinazione</option>
                  <option value="evento">📆 Incontro / Serata Comunitaria</option>
                  <option value="speciale">⛪ Celebrazione Speciale / Ritiro</option>
                </select>
              </div>
              <div class="form-group" style="margin: 0;">
                <label for="master-bacheca-data" style="font-size: 12px; font-weight: 600;">Data dell'Evento (YYYY-MM-DD)</label>
                <input type="date" id="master-bacheca-data" class="input-date" style="padding: 6px 10px; font-size: 13px;" value="${formatYMD(new Date())}" required>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label for="master-bacheca-titolo" style="font-size: 12px; font-weight: 600;">Titolo dell'Appuntamento o Ricorrenza</label>
              <input type="text" id="master-bacheca-titolo" class="input-text" style="padding: 7px 10px; font-size: 13px;" placeholder="Es. Compleanno Don Andrea Dotti, Memoria San Newman, Serata Sala TV..." required>
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label for="master-bacheca-desc" style="font-size: 12px; font-weight: 600;">Dettagli / Programma / Luogo (opzionale)</label>
              <textarea id="master-bacheca-desc" class="input-textarea" rows="2" style="font-size: 13px;" placeholder="Es. S. Messa ore 07:00 in Cappella, incontro ore 20:45 in Sala TV..."></textarea>
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
              ➕ Inserisci nel Calendario & Salva su Fogli
            </button>
          </form>
        </div>

        <!-- ELENCO APPUNTAMENTI ATTIVI -->
        <div class="sub-section">
          <div class="flex-between" style="margin-bottom: 8px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: 700;">Elenco Date & Appuntamenti Attivi (${bachecaItems.length})</h4>
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
                ${bachecaItems.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding: 18px; color: #64748b;">Nessun appuntamento presente. Compila il modulo sopra o sincronizza con Google Fogli.</td></tr>` : ''}
                ${bachecaItems.map(b => {
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

      <!-- ==================================================================
           GESTIONE AMBIENTI (CHIESA E SALA TV)
           ================================================================== -->
      <div class="master-block card" id="master-spazi-management-card" style="border-top: 4px solid #9d174d;">
        <div class="master-header flex-between" style="flex-wrap: wrap; gap: 8px;">
          <div class="flex-align" style="gap: 8px;">
            <span style="font-size: 22px;">⛪</span>
            <div>
              <h3 class="card-title" style="margin: 0;">Gestione Appuntamenti & Prenotazioni Ambienti (Chiesa & Sala TV)</h3>
              <span class="text-xs text-muted">Controlla gli slot riservati, inserisci celebrazioni o libera spazi</span>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-primary" onclick="apriModalMasterAppuntamento()" style="background: #9d174d; border-color: #9d174d; font-weight: 700;">
            ➕ Inserisci Appuntamento
          </button>
        </div>

        <div class="table-responsive" style="margin-top: 12px;">
          <table class="master-table">
            <thead>
              <tr>
                <th>Ambiente</th>
                <th>Data</th>
                <th>Orario / Slot</th>
                <th>Riservato da</th>
                <th>Azione Master</th>
              </tr>
            </thead>
            <tbody>
              ${prenotazioniSpazi.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 18px; color: #64748b;">Nessuna prenotazione attiva per Chiesa o Sala TV.</td></tr>' : ''}
              ${prenotazioniSpazi.map(p => {
                const isChiesa = p.risorsa === "Chiesa";
                return `
                  <tr>
                    <td>
                      <span class="badge ${isChiesa ? 'badge-primary' : 'badge-info'}" style="${isChiesa ? 'background:#831843; color:#fff;' : ''}">
                        ${isChiesa ? '⛪ Chiesa' : '📺 Sala TV'}
                      </span>
                    </td>
                    <td><strong>${formattaDataConfronto(p.data)}</strong></td>
                    <td><strong style="color: #0f172a;">${escapeHtml(p.slot_orario)}</strong></td>
                    <td><span class="text-sm font-semibold">${escapeHtml(p.email)}</span></td>
                    <td>
                      <button type="button" class="btn btn-secondary btn-sm" onclick="eliminaPrenotazioneSpazioMaster('${escapeHtml(p.id)}')" style="color: #dc2626; border-color: #fca5a5; padding: 4px 8px; font-size: 11px;">
                        🗑️ Libera
                      </button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================================================================
           CONFIGURAZIONE GOOGLE SPREADSHEET (APPS SCRIPT LIVE)
           ================================================================== -->
      <div class="master-block card" id="master-google-sheets-card" style="border-top: 4px solid #059669;">
        <div class="master-header flex-between" style="flex-wrap: wrap; gap: 8px;">
          <div class="flex-align" style="gap: 8px;">
            <span style="font-size: 22px;">📊</span>
            <div>
              <h3 class="card-title" style="margin: 0;">Database Google Fogli (Cloud Spreadsheet)</h3>
              <span class="text-xs text-muted">Collegamento e sincronizzazione con Google Apps Script</span>
            </div>
          </div>
          <div>
            ${appState.backendUrl ? `
              <span class="badge" style="background: #dcfce7; color: #166534; font-weight: 700; border: 1px solid #86efac; padding: 5px 10px;">
                🟢 Connesso a Google Spreadsheet Live
              </span>
            ` : `
              <span class="badge" style="background: #fef3c7; color: #92400e; font-weight: 700; border: 1px solid #fde68a; padding: 5px 10px;">
                🟡 Modalità Stand-alone Locale
              </span>
            `}
          </div>
        </div>

        <div class="card-inner" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 14px; margin: 12px 0; border-radius: 8px;">
          <label for="master-gas-url-input" style="font-size: 12px; font-weight: 700; color: #1e293b; display: block; margin-bottom: 4px;">
            URL Web App Google Apps Script (terminante in <code>/exec</code>):
          </label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <input type="url" id="master-gas-url-input" class="input-text" style="flex: 1; min-width: 260px;" placeholder="https://script.google.com/macros/s/.../exec" value="${escapeHtml(appState.backendUrl || '')}">
            <button type="button" class="btn btn-primary btn-sm" onclick="salvaUrlGasMaster()" style="font-weight: 600;">
              💾 Salva URL
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="testaConnessioneGAS()" style="font-weight: 600;">
              🔍 Test Connessione
            </button>
          </div>
          <div id="master-gas-test-result" style="margin-top: 8px;"></div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
          <button type="button" class="btn btn-outline btn-sm" onclick="sincronizzaTuttoDaGoogleFogli()">🔄 Sincronizza Dati</button>
          <button type="button" class="btn btn-outline btn-sm" onclick="inizializzaGoogleFogli()">📤 Inizializza Fogli</button>
          <button type="button" class="btn btn-outline btn-sm" onclick="apriModalCodiceGas()">📋 Codice Code.gs</button>
          <button type="button" class="btn btn-outline btn-sm" onclick="esportaBackupLocale()">📥 Esporta Backup</button>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 2. SUB-PANNELLO MENSA (MASTER MENSA)
  // ==========================================================================
  if (perm_mensa) {
    const dataFiltroYMD = appState.masterMensaDate || formatYMD(new Date());
    const prenotazioniGiorno = mensaBookings.filter(m => String(m.data).split("T")[0] === dataFiltroYMD);

    const countPranzo = prenotazioniGiorno.filter(m => m.tipo_pasto === "pranzo").length;
    const countCena = prenotazioniGiorno.filter(m => m.tipo_pasto === "cena").length;
    const countBuste = prenotazioniGiorno.filter(m => m.busta).length;
    const countRitardi = prenotazioniGiorno.filter(m => m.ritardo).length;

    html += `
      <div class="master-block card" style="border-top: 4px solid var(--primary);">
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
                ${prenotazioniGiorno.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding: 18px; color: #64748b;">Nessuna presenza registrata per il ${dataFiltroYMD}.</td></tr>` : ''}
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

        <!-- Controllo Ciclo Settimane Menu -->
        <div class="sub-section" style="margin-top: 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
          <div class="flex-between" style="flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 700; font-size: 13.5px; color: #1e293b; display: flex; align-items: center; gap: 6px;">
                <span>📅</span>
                <span>Ciclo Menu Attivo: <strong>${getSettimanaMenu(new Date()) === 'settimana1' ? 'Settimana 1 (Paella & Saltimbocca)' : 'Settimana 2 (Gnocchi & Arrosto)'}</strong></span>
              </div>
              <span class="text-xs text-muted" style="display: block; margin-top: 2px;">
                Permette di invertire istantaneamente l'ordine delle due settimane del menu in rotazione.
              </span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" onclick="toggleScambiaSettimaneMenu()" style="font-weight: 700; border-color: #cbd5e1;">
              🔄 Scambia Settimana 1 ↔ 2
            </button>
          </div>
        </div>

        <!-- Form Variazione Straordinaria Menu -->
        <div class="sub-section" style="margin-top: 24px; border-top: 1px dashed #e2e8f0; padding-top: 16px;">
          <h4>📢 Variazione Straordinaria Menu (Alert Banner)</h4>
          <form onsubmit="handleSalvaVariazioneMenu(event)">
            <div class="form-group">
              <label for="admin-data-variazione">Data di Applicazione dell'Alert</label>
              <input type="date" id="admin-data-variazione" class="input-date" value="${appState.cachedConfig.Data_Variazione_Menu || formatYMD(new Date())}">
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

  // ==========================================================================
  // 3. SUB-PANNELLO MANUTENZIONE & SERVIZI (MASTER MANUTENZIONE)
  // ==========================================================================
  if (perm_manutenzione) {
    // Filtraggio per categoria e per stato
    let filteredSegnalazioni = tutteSegnalazioni.slice();
    if (masterSegnalazioniFiltroCategoria !== "tutte") {
      filteredSegnalazioni = filteredSegnalazioni.filter(g => (g.categoria || "manutenzione") === masterSegnalazioniFiltroCategoria);
    }
    if (masterSegnalazioniFiltroStato === "aperte") {
      filteredSegnalazioni = filteredSegnalazioni.filter(g => g.stato !== "Risolto");
    } else if (masterSegnalazioniFiltroStato === "risolte") {
      filteredSegnalazioni = filteredSegnalazioni.filter(g => g.stato === "Risolto");
    } else if (masterSegnalazioniFiltroStato === "lavorazione") {
      filteredSegnalazioni = filteredSegnalazioni.filter(g => g.stato === "In Lavorazione");
    }

    const aperteCount = tutteSegnalazioni.filter(g => g.stato !== "Risolto").length;
    const risolteCount = tutteSegnalazioni.filter(g => g.stato === "Risolto").length;
    const manutenzioneCount = tutteSegnalazioni.filter(g => (g.categoria || "manutenzione") === "manutenzione").length;
    const serviziCount = tutteSegnalazioni.filter(g => g.categoria === "servizi").length;

    html += `
      <div class="master-block card" style="border-top: 4px solid #d97706;">
        <div class="master-header flex-between" style="flex-wrap: wrap; gap: 8px;">
          <div>
            <span class="master-tag" style="background:#d97706; color:#fff;">MASTER SEGNALAZIONI</span>
            <h3 class="card-title" style="margin: 4px 0 0 0;">Gestione Segnalazioni & Riparazioni (Manutenzione & Servizi)</h3>
            <p class="text-xs text-muted" style="margin: 2px 0 0 0;">
              Riservato ai Master autorizzati. Gestione priorità, ditte incaricate, note di intervento e chiusura riparazioni.
            </p>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <span class="badge" style="background:#fef3c7; color:#92400e; font-weight:700;">Aperte: ${aperteCount}</span>
            <span class="badge" style="background:#dcfce7; color:#166534; font-weight:700;">Risolte: ${risolteCount}</span>
          </div>
        </div>

        <!-- BARRA FILTRI CATEGORIA E STATO -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin: 12px 0; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 12px; font-weight: 700; color: #475569;">Categoria:</span>
            <button type="button" class="btn btn-sm ${masterSegnalazioniFiltroCategoria === 'tutte' ? 'btn-primary' : 'btn-secondary'}" onclick="filtraMasterSegnalazioni('tutte', undefined)" style="padding: 3px 8px; font-size: 11px;">
              Tutte (${tutteSegnalazioni.length})
            </button>
            <button type="button" class="btn btn-sm ${masterSegnalazioniFiltroCategoria === 'manutenzione' ? 'btn-primary' : 'btn-secondary'}" onclick="filtraMasterSegnalazioni('manutenzione', undefined)" style="padding: 3px 8px; font-size: 11px;">
              🛠️ Manutenzione (${manutenzioneCount})
            </button>
            <button type="button" class="btn btn-sm ${masterSegnalazioniFiltroCategoria === 'servizi' ? 'btn-primary' : 'btn-secondary'}" onclick="filtraMasterSegnalazioni('servizi', undefined)" style="padding: 3px 8px; font-size: 11px;">
              🧹 Servizi Residenza (${serviziCount})
            </button>
          </div>

          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 12px; font-weight: 700; color: #475569;">Stato:</span>
            <button type="button" class="btn btn-sm ${masterSegnalazioniFiltroStato === 'tutte' ? 'btn-primary' : 'btn-secondary'}" onclick="filtraMasterSegnalazioni(undefined, 'tutte')" style="padding: 3px 8px; font-size: 11px;">
              Tutti
            </button>
            <button type="button" class="btn btn-sm ${masterSegnalazioniFiltroStato === 'aperte' ? 'btn-primary' : 'btn-secondary'}" onclick="filtraMasterSegnalazioni(undefined, 'aperte')" style="padding: 3px 8px; font-size: 11px;">
              Da fare (${aperteCount})
            </button>
            <button type="button" class="btn btn-sm ${masterSegnalazioniFiltroStato === 'lavorazione' ? 'btn-primary' : 'btn-secondary'}" onclick="filtraMasterSegnalazioni(undefined, 'lavorazione')" style="padding: 3px 8px; font-size: 11px;">
              In Lavorazione
            </button>
            <button type="button" class="btn btn-sm ${masterSegnalazioniFiltroStato === 'risolte' ? 'btn-primary' : 'btn-secondary'}" onclick="filtraMasterSegnalazioni(undefined, 'risolte')" style="padding: 3px 8px; font-size: 11px;">
              Risolte (${risolteCount})
            </button>
          </div>
        </div>

        <!-- ELENCO SCHEDE SEGNALAZIONI & CONTROLLI MASTER -->
        <div class="guasti-feed-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; margin-top: 14px;">
          ${filteredSegnalazioni.length === 0 ? '<p class="empty-state-text" style="grid-column: 1 / -1; padding: 24px; text-align: center;">Nessuna segnalazione corrisponde ai filtri selezionati.</p>' : ''}
          ${filteredSegnalazioni.map(g => {
            const isRisolto = g.stato === "Risolto";
            const isServizi = g.categoria === "servizi";
            const idSeg = g.id || ("SEG_" + Math.random().toString().slice(2, 6));

            return `
              <div class="guasto-master-card card-inner" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div class="flex-between" style="margin-bottom: 8px;">
                    <span class="badge" style="background: ${isServizi ? '#e0f2fe' : '#fef3c7'}; color: ${isServizi ? '#0369a1' : '#92400e'}; font-weight: 700;">
                      ${isServizi ? '🧹 Servizi' : '🛠️ Manutenzione'}
                    </span>
                    <span class="badge" style="background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700;">ID: ${escapeHtml(idSeg)}</span>
                  </div>

                  ${g.luogo ? `<div style="font-size: 12px; font-weight: 700; color: #0284c7; margin-bottom: 4px;">📍 Luogo: ${escapeHtml(g.luogo)}</div>` : ''}
                  <p class="guasto-desc" style="font-size: 13.5px; line-height: 1.5; color: #1e293b; margin: 4px 0 10px 0;">${escapeHtml(g.descrizione)}</p>

                  ${g.link_foto ? `
                    <div class="guasto-photo-box" style="margin-bottom: 10px;">
                      <img src="${g.link_foto}" alt="Foto allegata" class="guasto-photo-img" style="max-height: 120px; border-radius: 6px; cursor: pointer;" onclick="apriFotoInNuovaScheda('${g.link_foto}')">
                    </div>
                  ` : ''}

                  <div class="text-xs text-muted" style="margin-bottom: 10px;">
                    Segnalato da: <strong>${escapeHtml(g.email)}</strong> • ${g.timestamp ? new Date(g.timestamp).toLocaleString("it-IT") : ''}
                  </div>

                  <!-- CONTROLLI MASTER INTERATTIVI -->
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                      <div>
                        <label style="font-size: 11px; font-weight: 700; color: #475569; display: block; margin-bottom: 2px;">Priorità:</label>
                        <select id="seg-priorita-${escapeHtml(idSeg)}" class="input-select" style="font-size: 12px; padding: 4px 6px;">
                          <option value="Bassa" ${g.priorita === 'Bassa' ? 'selected' : ''}>Bassa</option>
                          <option value="Media" ${(!g.priorita || g.priorita === 'Media') ? 'selected' : ''}>Media</option>
                          <option value="Alta" ${g.priorita === 'Alta' ? 'selected' : ''}>Alta</option>
                          <option value="Urgente" ${g.priorita === 'Urgente' ? 'selected' : ''}>⚠️ Urgente</option>
                        </select>
                      </div>
                      <div>
                        <label style="font-size: 11px; font-weight: 700; color: #475569; display: block; margin-bottom: 2px;">Stato:</label>
                        <select id="seg-stato-${escapeHtml(idSeg)}" class="input-select" style="font-size: 12px; padding: 4px 6px;">
                          <option value="Da fare" ${(!g.stato || g.stato === 'Da fare') ? 'selected' : ''}>Da fare / Aperta</option>
                          <option value="In Lavorazione" ${g.stato === 'In Lavorazione' ? 'selected' : ''}>In Lavorazione</option>
                          <option value="In Attesa Ricambi" ${g.stato === 'In Attesa Ricambi' ? 'selected' : ''}>In Attesa Ricambi</option>
                          <option value="Risolto" ${g.stato === 'Risolto' ? 'selected' : ''}>✅ Risolto / Chiuso</option>
                        </select>
                      </div>
                    </div>

                    <div style="margin-bottom: 6px;">
                      <label style="font-size: 11px; font-weight: 700; color: #475569; display: block; margin-bottom: 2px;">Tecnico / Ditta Assegnata:</label>
                      <input type="text" id="seg-tecnico-${escapeHtml(idSeg)}" class="input-text" style="font-size: 12px; padding: 4px 8px;" placeholder="Es. Idraulico Mario, Ditta Elettrica..." value="${escapeHtml(g.tecnico || '')}">
                    </div>

                    <div>
                      <label style="font-size: 11px; font-weight: 700; color: #475569; display: block; margin-bottom: 2px;">Note Tecnico / Intervento:</label>
                      <input type="text" id="seg-note-${escapeHtml(idSeg)}" class="input-text" style="font-size: 12px; padding: 4px 8px;" placeholder="Es. Guarnizione sostituita, ordine effettuato..." value="${escapeHtml(g.note_intervento || '')}">
                    </div>
                  </div>
                </div>

                <!-- AZIONI SALVATAGGIO / CHIUSURA -->
                <div style="display: flex; gap: 6px; margin-top: 6px;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="salvaModificheSegnalazione('${escapeHtml(idSeg)}')" style="flex: 1; font-size: 11px; font-weight: 600;">
                    💾 Salva Modifiche
                  </button>
                  ${!isRisolto ? `
                    <button type="button" class="btn btn-success btn-sm" onclick="risolviSegnalazioneMaster('${escapeHtml(idSeg)}')" style="font-size: 11px; font-weight: 700;">
                      ✅ Risolvi & Chiudi
                    </button>
                  ` : `
                    <span class="badge badge-success" style="padding: 6px 10px; font-weight: 700;">Archiviata</span>
                  `}
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <!-- ==============================================================
             GUIDA INTEGRAZIONE PIATTAFORME ESTERNE & WEBHOOK (GOOGLE FOGLI)
             ============================================================== -->
        <div class="card-inner" style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 14px; margin-top: 20px;">
          <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>🔗</span> <strong>Dialogo con Piattaforme Esterne & Ditte (Google Fogli Integration)</strong>
          </h4>
          <p style="font-size: 12.5px; color: #14532d; line-height: 1.5; margin: 0 0 8px 0;">
            Il foglio di calcolo <code>Manutenzione</code> su Google Fogli è configurato per consentire a piattaforme esterne (es. <em>Make.com, Zapier, Webhook, Bot WhatsApp per artigiani, o software di manutenzione</em>) di leggere e modificare in tempo reale lo stato dei lavori:
          </p>
          <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #166534; line-height: 1.6;">
            <li><strong>ID Univoco:</strong> Ogni segnalazione possiede un ID permanente (es. <code>${tutteSegnalazioni[0]?.id || 'SEG_001'}</code>) che fa da chiave di raccordo con i sistemi esterni.</li>
            <li><strong>Colonne Modificabili dall'esterno:</strong> Una piattaforma o un tecnico esterno può aggiornare direttamente nel Foglio Google: <code>Priorita</code>, <code>Stato</code> (<em>Da fare / In Lavorazione / Risolto</em>), <code>Note_Intervento</code>, <code>Tecnico_Assegnato</code> e <code>Data_Chiusura</code>.</li>
            <li><strong>Sincronizzazione Bidirezionale:</strong> Quando il fornitore esterno aggiorna una riga nel Foglio Google, la modifica compare istantaneamente sia nel portale dei Masters che nella scheda personale del residente.</li>
          </ul>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ----------------------------------------------------------------------------
// HANDLER MASTER: SALVATAGGIO RUOLI UTENTE
// ----------------------------------------------------------------------------
window.salvaRuoliUtente = async function(email) {
  const permMensa = document.getElementById(`edit-p-mensa-${email}`)?.checked || false;
  const permManut = document.getElementById(`edit-p-manut-${email}`)?.checked || false;
  const permSpazi = document.getElementById(`edit-p-spazi-${email}`)?.checked || false;
  const permAdmin = document.getElementById(`edit-p-admin-${email}`)?.checked || false;

  try {
    const res = await callApi("aggiornaRuoliUtente", {
      emailTarget: email,
      perm_mensa: permMensa,
      perm_manutenzione: permManut,
      perm_spazi: permSpazi,
      perm_admin: permAdmin
    });

    if (res.success) {
      mostraToast(`✅ Ruoli aggiornati per ${email}!`, "success");
      // Aggiorna stato locale se stiamo modificando l'utente loggato
      if (appState.user && appState.user.email.toLowerCase() === email.toLowerCase()) {
        appState.user.perm_mensa = permMensa;
        appState.user.perm_manutenzione = permManut;
        appState.user.perm_spazi = permSpazi;
        appState.user.perm_admin = permAdmin;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(appState.user));
      }
      caricaDatiMaster();
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile aggiornare"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete nell'aggiornamento dei ruoli", "error");
  }
};

window.eliminaUtente = async function(email, nome) {
  if (!email) return;
  const label = nome ? `"${nome}" (${email})` : email;
  const confermato = window.confirm(`Sei sicuro di voler eliminare il residente ${label}?\n\nL'utente verrà rimosso dall'elenco del sistema e dal Foglio Google.`);
  if (!confermato) return;

  try {
    const res = await callApi("eliminaUtente", { emailTarget: email });
    if (res && res.success) {
      mostraToast(`✅ Residente ${email} rimosso con successo!`, "success");
      await caricaDatiMaster();
      if (appState.currentTab === "master") {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore durante l'eliminazione: " + (res?.error || "Errore sconosciuto"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete durante l'eliminazione: " + err.message, "error");
  }
};

// ----------------------------------------------------------------------------
// HANDLER MASTER: IMPORTAZIONE BATCH UTENTI
// ----------------------------------------------------------------------------
window.importaElencoUtentiMaster = async function(e) {
  if (e) e.preventDefault();
  const textarea = document.getElementById("import-utenti-textarea");
  if (!textarea) return;

  const testo = textarea.value.trim();
  if (!testo) {
    mostraToast("Inserisci almeno una riga con email e nome", "warning");
    return;
  }

  const righe = testo.split("\n");
  const utentiDaImportare = [];

  for (const riga of righe) {
    const r = riga.trim();
    if (!r) continue;
    const parts = r.split(/[,;\t]/);
    const email = (parts[0] || "").trim();
    const nome = (parts[1] || "").trim() || email.split("@")[0];
    if (email && email.includes("@")) {
      utentiDaImportare.push({ email, nome });
    }
  }

  if (utentiDaImportare.length === 0) {
    mostraToast("Nessun indirizzo email valido trovato nel testo", "warning");
    return;
  }

  try {
    const res = await callApi("importaElencoUtenti", { utenti: utentiDaImportare });
    if (res.success) {
      mostraToast(`✅ ${res.aggiunti || utentiDaImportare.length} residenti importati ed abilitati!`, "success");
      textarea.value = "";
      caricaDatiMaster();
    } else {
      mostraToast("Errore importazione: " + (res.error || "Impossibile salvare"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete durante l'importazione", "error");
  }
};

// ----------------------------------------------------------------------------
// HANDLER MASTER: SALVATAGGIO RAPIDO MESSAGGIO SUPERMASTER
// ----------------------------------------------------------------------------
window.handleSalvaMessaggioSupermasterRapido = async function(e) {
  if (e) e.preventDefault();
  const textarea = document.getElementById("admin-messaggio-supermaster");
  if (!textarea) return;

  const nuovoTesto = textarea.value.trim();
  if (!nuovoTesto) {
    mostraToast("Inserisci un testo per la comunicazione", "warning");
    return;
  }

  try {
    const res = await callApi("aggiornaConfig", { Messaggio_Supermaster: nuovoTesto });
    if (res.success) {
      appState.cachedConfig.Messaggio_Supermaster = nuovoTesto;
      mostraToast("✅ Comunicazione del Supermaster salvata!", "success");
      renderMasterSection();
    } else {
      mostraToast("Errore nel salvataggio del messaggio", "error");
    }
  } catch (err) {
    mostraToast("Errore di rete", "error");
  }
};

// ----------------------------------------------------------------------------
// HANDLER MASTER: SALVATAGGIO MODIFICHE SEGNALAZIONE
// ----------------------------------------------------------------------------
window.salvaModificheSegnalazione = async function(id) {
  const priorita = document.getElementById(`seg-priorita-${id}`)?.value || "Media";
  const stato = document.getElementById(`seg-stato-${id}`)?.value || "Da fare";
  const tecnico = document.getElementById(`seg-tecnico-${id}`)?.value?.trim() || "";
  const note = document.getElementById(`seg-note-${id}`)?.value?.trim() || "";

  try {
    const res = await callApi("aggiornaSegnalazione", {
      id,
      priorita,
      stato,
      tecnico,
      note_intervento: note
    });

    if (res.success) {
      mostraToast("✅ Modifiche segnalazione salvate!", "success");
      caricaDatiMaster();
      caricaGuastiRecenti();
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile aggiornare"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete", "error");
  }
};

window.risolviSegnalazioneMaster = async function(id) {
  try {
    const res = await callApi("aggiornaSegnalazione", {
      id,
      stato: "Risolto",
      data_chiusura: new Date().toISOString()
    });

    if (res.success) {
      mostraToast("✅ Segnalazione contrassegnata come Risolta & Archiviata!", "success");
      caricaDatiMaster();
      caricaGuastiRecenti();
    } else {
      mostraToast("Errore durante la chiusura: " + (res.error || "Errore sconosciuto"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete nella chiusura della segnalazione", "error");
  }
};

// ----------------------------------------------------------------------------
// DOWNLOAD MODELLO CALENDARIO CSV PER GOOGLE FOGLI
// ----------------------------------------------------------------------------
window.scaricaModelloCalendarioCSV = function() {
  const csvRows = [
    ["ID", "Data", "Tipo", "Titolo", "Descrizione", "Autore", "Priorita", "Timestamp"],
    ["B_101", "2026-10-04", "speciale", "Festa di San Francesco d'Assisi", "Celebrazione solenne della S. Messa ore 18:30 con benedizione comunitaria.", "Direzione", "alta", new Date().toISOString()],
    ["B_102", "2026-10-09", "speciale", "Solennità di San John Henry Newman", "Patrono della Residenza: Santa Messa solenne e pranzo di gala comunitario.", "Direzione", "alta", new Date().toISOString()],
    ["B_103", "2026-10-15", "compleanno", "Compleanno Don Andrea Dotti", "Auguri e preghiera comunitaria per il compleanno del Padre Direttore.", "Comunità", "normale", new Date().toISOString()],
    ["B_104", "2026-10-20", "evento", "Incontro Culturale & Accademico", "Serata di condivisione tesi e studi in Sala TV.", "Comitato Residenti", "normale", new Date().toISOString()]
  ];
  const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Modello_Bacheca_Calendario_Newman.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  mostraToast("📥 Modello CSV Calendario scaricato con successo!", "success");
};

// ----------------------------------------------------------------------------
// IMPORTAZIONE FILE CSV PER CALENDARIO & BACHECA
// ----------------------------------------------------------------------------
let eventiCSVAnalizzati = [];

window.apriModalImportaCalendarioCSV = function() {
  const modal = document.getElementById("modal-importa-calendario-csv");
  if (!modal) return;
  eventiCSVAnalizzati = [];
  aggiornaAnteprimaCSV([]);
  const textEl = document.getElementById("textarea-csv-calendario");
  if (textEl) textEl.value = "";
  const fileEl = document.getElementById("input-file-csv-calendario");
  if (fileEl) fileEl.value = "";
  modal.style.display = "flex";
  setupDropzoneCSV();
};

window.chiudiModalImportaCalendarioCSV = function() {
  const modal = document.getElementById("modal-importa-calendario-csv");
  if (modal) modal.style.display = "none";
};

window.toggleTextareaCSV = function() {
  const container = document.getElementById("container-textarea-csv");
  const btn = document.getElementById("btn-toggle-textarea-csv");
  if (!container) return;
  const isHidden = container.style.display === "none";
  container.style.display = isHidden ? "block" : "none";
  if (btn) btn.innerText = isHidden ? "📁 Nascondi testo CSV" : "✍️ Oppure incolla testo CSV";
};

function setupDropzoneCSV() {
  const dropzone = document.getElementById("dropzone-csv");
  if (!dropzone || dropzone.dataset.initialized) return;
  dropzone.dataset.initialized = "true";

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.style.background = "#dbeafe";
      dropzone.style.borderColor = "#2563eb";
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.style.background = "#eff6ff";
      dropzone.style.borderColor = "#93c5fd";
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      leggiFileCSV(files[0]);
    }
  }, false);
}

window.handleFileCSVSelezionato = function(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    leggiFileCSV(files[0]);
  }
};

function leggiFileCSV(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const textEl = document.getElementById("textarea-csv-calendario");
    if (textEl) textEl.value = content;
    const eventi = parseCalendarCSV(content);
    eventiCSVAnalizzati = eventi;
    aggiornaAnteprimaCSV(eventi);
  };
  reader.onerror = function() {
    mostraToast("Errore durante la lettura del file CSV", "error");
  };
  reader.readAsText(file);
}

window.handleTextareaCSVInput = function(event) {
  const content = event.target.value;
  const eventi = parseCalendarCSV(content);
  eventiCSVAnalizzati = eventi;
  aggiornaAnteprimaCSV(eventi);
};

function parseCalendarCSV(csvText) {
  if (!csvText || !csvText.trim()) return [];

  const rawLines = csvText.split(/\r?\n/);
  const rows = [];

  for (let rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) continue;

    const countSemi = (line.match(/;/g) || []).length;
    const countComma = (line.match(/,/g) || []).length;
    const delimiter = countSemi > countComma ? ";" : ",";

    const cells = [];
    let currentCell = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        cells.push(currentCell.trim());
        currentCell = "";
      } else {
        currentCell += ch;
      }
    }
    cells.push(currentCell.trim());
    rows.push(cells);
  }

  if (rows.length === 0) return [];

  let startIndex = 0;
  let colMap = { id: -1, data: -1, tipo: -1, titolo: -1, descrizione: -1, autore: -1, priorita: -1 };
  const firstRow = rows[0].map(c => c.toLowerCase());

  const hasHeader = firstRow.some(c => 
    c.includes("titolo") || c.includes("title") || c.includes("data") || c.includes("date") || c.includes("tipo") || c.includes("id")
  );

  if (hasHeader) {
    firstRow.forEach((col, idx) => {
      if (col.includes("titolo") || col.includes("title") || col.includes("nome") || col.includes("evento")) colMap.titolo = idx;
      else if (col.includes("data") || col.includes("date") || col.includes("giorno")) colMap.data = idx;
      else if (col.includes("tipo") || col.includes("type") || col.includes("categoria")) colMap.tipo = idx;
      else if (col.includes("desc") || col.includes("dettagli") || col.includes("note")) colMap.descrizione = idx;
      else if (col.includes("autor") || col.includes("chi")) colMap.autore = idx;
      else if (col.includes("prior") || col.includes("urgente")) colMap.priorita = idx;
      else if (col === "id") colMap.id = idx;
    });
    startIndex = 1;
  }

  if (colMap.titolo === -1) {
    if (rows[0].length >= 4) {
      colMap = { id: 0, data: 1, tipo: 2, titolo: 3, descrizione: 4, autore: 5, priorita: 6 };
    } else {
      colMap = { id: -1, data: 0, tipo: 1, titolo: 2, descrizione: 3, autore: -1, priorita: -1 };
    }
  }

  const results = [];
  for (let r = startIndex; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0 || row.every(c => !c)) continue;

    let titolo = colMap.titolo !== -1 && row[colMap.titolo] ? row[colMap.titolo] : "";
    let dataStr = colMap.data !== -1 && row[colMap.data] ? row[colMap.data] : "";
    let tipo = colMap.tipo !== -1 && row[colMap.tipo] ? row[colMap.tipo].toLowerCase() : "evento";
    let desc = colMap.descrizione !== -1 && row[colMap.descrizione] ? row[colMap.descrizione] : "";
    let autore = colMap.autore !== -1 && row[colMap.autore] ? row[colMap.autore] : "Direzione";
    let priorita = colMap.priorita !== -1 && row[colMap.priorita] ? row[colMap.priorita].toLowerCase() : "normale";
    let id = colMap.id !== -1 && row[colMap.id] ? row[colMap.id] : "";

    if (!titolo && row.length === 1) {
      titolo = row[0];
    }
    if (!titolo) continue;

    // Pulizia e normalizzazione data
    dataStr = dataStr.trim().replace(/\//g, "-").replace(/\./g, "-");
    const dmyMatch = dataStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, "0");
      const month = dmyMatch[2].padStart(2, "0");
      const year = dmyMatch[3];
      dataStr = `${year}-${month}-${day}`;
    }

    if (tipo.includes("compleann") || tipo.includes("birth")) tipo = "compleanno";
    else if (tipo.includes("anniversar") || tipo.includes("ordinaz")) tipo = "anniversario";
    else if (tipo.includes("special") || tipo.includes("festa") || tipo.includes("celebraz")) tipo = "speciale";
    else if (tipo.includes("avvis") || tipo.includes("comunicaz")) tipo = "avviso";
    else tipo = "evento";

    if (priorita.includes("alta") || priorita.includes("high") || priorita.includes("urgente") || priorita.includes("evidenza")) {
      priorita = "alta";
    } else {
      priorita = "normale";
    }

    results.push({
      id: id || ("B_" + Date.now() + "_" + Math.floor(Math.random() * 10000)),
      data: dataStr || formatYMD(new Date()),
      tipo,
      titolo: titolo.replace(/^"|"$/g, ""),
      descrizione: desc.replace(/^"|"$/g, ""),
      autore: autore.replace(/^"|"$/g, ""),
      priorita
    });
  }

  return results;
}

function aggiornaAnteprimaCSV(eventi) {
  const container = document.getElementById("preview-csv-container");
  const countEl = document.getElementById("preview-csv-count");
  const tbody = document.getElementById("preview-csv-tbody");
  const btn = document.getElementById("btn-conferma-import-csv");

  if (!container || !tbody || !btn) return;

  if (!eventi || eventi.length === 0) {
    container.style.display = "none";
    tbody.innerHTML = "";
    btn.disabled = true;
    btn.innerText = "💾 Importa 0 Eventi nel Calendario";
    return;
  }

  container.style.display = "block";
  if (countEl) countEl.innerText = `Trovati ${eventi.length} eventi validi:`;
  btn.disabled = false;
  btn.innerText = `💾 Importa ${eventi.length} Eventi nel Calendario`;

  const previewList = eventi.slice(0, 10);
  tbody.innerHTML = previewList.map(ev => {
    let tipoBadge = "📅 Evento";
    if (ev.tipo === "compleanno") tipoBadge = "🎂 Compleanno";
    else if (ev.tipo === "anniversario") tipoBadge = "🔔 Anniversario";
    else if (ev.tipo === "speciale") tipoBadge = "⛪ Speciale";
    else if (ev.tipo === "avviso") tipoBadge = "📢 Avviso";

    return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 6px 8px; font-weight: 600; color: #1e293b; white-space: nowrap;">${escapeHtml(ev.data)}</td>
        <td style="padding: 6px 8px; white-space: nowrap;"><span class="badge" style="font-size: 10px;">${tipoBadge}</span></td>
        <td style="padding: 6px 8px; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><strong>${escapeHtml(ev.titolo)}</strong></td>
        <td style="padding: 6px 8px; white-space: nowrap;">${ev.priorita === 'alta' ? '<span style="color:#b91c1c; font-weight:700;">Alta ⭐</span>' : '<span style="color:#64748b;">Normale</span>'}</td>
      </tr>
    `;
  }).join("") + (eventi.length > 10 ? `<tr><td colspan="4" style="text-align: center; padding: 6px; font-style: italic; color: #64748b;">...ed altri ${eventi.length - 10} eventi</td></tr>` : "");
}

window.eseguiImportazioneEventiCalendario = async function() {
  if (!eventiCSVAnalizzati || eventiCSVAnalizzati.length === 0) {
    mostraToast("Nessun evento da importare. Seleziona prima un file CSV valido.", "warning");
    return;
  }

  const btn = document.getElementById("btn-conferma-import-csv");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "⏳ Importazione in corso...";
  }

  try {
    const res = await callApi("importaEventiCalendario", { eventi: eventiCSVAnalizzati });
    if (res && res.success) {
      mostraToast(`✅ ${res.count || eventiCSVAnalizzati.length} eventi importati con successo nel Calendario!`, "success");
      chiudiModalImportaCalendarioCSV();

      // Sincronizza dati aggiornati
      if (typeof caricaDatiInfo === "function") await caricaDatiInfo();
      if (typeof caricaDatiMaster === "function") await caricaDatiMaster();
      if (appState.currentTab === "info" && typeof renderBachecaView === "function") {
        renderBachecaView();
      } else if (appState.currentTab === "residenza" && typeof renderResidenzaSection === "function") {
        renderResidenzaSection();
      }
    } else {
      mostraToast("Errore durante l'importazione: " + (res?.error || "Errore sconosciuto"), "error");
      if (btn) {
        btn.disabled = false;
        btn.innerText = `💾 Importa ${eventiCSVAnalizzati.length} Eventi nel Calendario`;
      }
    }
  } catch (err) {
    mostraToast("Errore di rete durante l'importazione: " + err.message, "error");
    if (btn) {
      btn.disabled = false;
      btn.innerText = `💾 Importa ${eventiCSVAnalizzati.length} Eventi nel Calendario`;
    }
  }
};

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

window.toggleScambiaSettimaneMenu = async function() {
  const current = appState.cachedConfig?.Inverti_Ciclo_Menu === "true" || localStorage.getItem("newman_inverti_menu") === "true";
  const nuovoVal = (!current).toString();
  localStorage.setItem("newman_inverti_menu", nuovoVal);
  if (!appState.cachedConfig) appState.cachedConfig = {};
  appState.cachedConfig.Inverti_Ciclo_Menu = nuovoVal;

  try {
    await callApi("aggiornaConfig", { Inverti_Ciclo_Menu: nuovoVal });
    mostraToast("✅ Ordine delle settimane scambiato con successo!", "success");
  } catch (e) {
    mostraToast("Ordine settimane aggiornato in locale", "info");
  }

  // Ricarica le viste
  renderMensaView();
  if (typeof renderMasterSection === "function") {
    renderMasterSection();
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

// ============================================================================
// GESTIONE MASTER APPUNTAMENTI & PRENOTAZIONE AMBIENTI
// ============================================================================

window.apriModalMasterAppuntamento = function(risorsaDefault, dataDefault) {
  const modal = document.getElementById("modal-master-nuovo-appuntamento");
  if (!modal) return;

  const ambSelect = document.getElementById("master-app-ambiente");
  if (ambSelect) ambSelect.value = risorsaDefault || "Chiesa";

  const dataInput = document.getElementById("master-app-data");
  if (dataInput) dataInput.value = dataDefault || appState.selectedSpazioData || formatYMD(new Date());

  const orarioSelect = document.getElementById("master-app-orario");
  if (orarioSelect) {
    const defaultSlots = [
      { val: "07:00 - 08:00", label: "07:00 - 08:00 (S. Messa del Mattino)" },
      { val: "07:30 - 08:30", label: "07:30 - 08:30" },
      { val: "08:00 - 09:00", label: "08:00 - 09:00" },
      { val: "12:00 - 13:00", label: "12:00 - 13:00 (Ora Media / Angelus)" },
      { val: "18:00 - 19:00", label: "18:00 - 19:00 (S. Messa della Sera / Rosario)" },
      { val: "18:30 - 19:30", label: "18:30 - 19:30 (Vespri & Adorazione)" },
      { val: "20:30 - 21:30", label: "20:30 - 21:30" },
      { val: "20:45 - 22:30", label: "20:45 - 22:30 (Cineforum / Serata)" },
      { val: "21:00 - 22:00", label: "21:00 - 22:00 (Compieta / Preghiera Notturna)" }
    ];

    const slot30 = getTuttiSlotOrari30Min();
    let optionsHtml = `<optgroup label="Fasce e Celebrazioni Tipiche">`;
    defaultSlots.forEach(s => {
      optionsHtml += `<option value="${s.val}">${s.label}</option>`;
    });
    optionsHtml += `</optgroup><optgroup label="Slot Singoli da 30 Minuti">`;
    slot30.forEach(s => {
      optionsHtml += `<option value="${s}">${s}</option>`;
    });
    optionsHtml += `</optgroup>`;
    orarioSelect.innerHTML = optionsHtml;
  }

  const titInput = document.getElementById("master-app-titolo");
  if (titInput) titInput.value = "";

  const descInput = document.getElementById("master-app-descrizione");
  if (descInput) descInput.value = "";

  onMasterAppAmbienteChange();
  modal.style.display = "flex";
};

window.chiudiModalMasterAppuntamento = function() {
  const modal = document.getElementById("modal-master-nuovo-appuntamento");
  if (modal) modal.style.display = "none";
};

window.impostaTitoloPredefinito = function(titolo) {
  const titInput = document.getElementById("master-app-titolo");
  if (titInput) titInput.value = titolo;
};

window.onMasterAppAmbienteChange = function() {
  const ambSelect = document.getElementById("master-app-ambiente");
  const slotGroup = document.getElementById("master-app-slot-group");
  const bloccaCheck = document.getElementById("master-app-blocca-slot");
  if (ambSelect && slotGroup) {
    if (ambSelect.value === "Bacheca") {
      slotGroup.style.display = "none";
      if (bloccaCheck) bloccaCheck.checked = false;
    } else {
      slotGroup.style.display = "block";
      if (bloccaCheck) bloccaCheck.checked = true;
    }
  }
};

window.salvaMasterAppuntamento = async function(e) {
  e.preventDefault();
  const ambiente = document.getElementById("master-app-ambiente")?.value || "Chiesa";
  const titolo = document.getElementById("master-app-titolo")?.value?.trim() || "";
  const data = document.getElementById("master-app-data")?.value || formatYMD(new Date());
  const orario = document.getElementById("master-app-orario")?.value || "";
  const descrizione = document.getElementById("master-app-descrizione")?.value?.trim() || "";
  const bloccaSlot = document.getElementById("master-app-blocca-slot")?.checked || false;
  const pubblicaBacheca = document.getElementById("master-app-pubblica-bacheca")?.checked || false;

  if (!titolo) {
    mostraToast("Inserisci un titolo per l'appuntamento", "warning");
    return;
  }

  const btn = document.getElementById("btn-submit-master-app");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Salvataggio in corso...";
  }

  try {
    // 1. Se bloccaSlot è attivo e ambiente è Chiesa o Sala TV, prenota tutti gli slot da 30 min compresi
    if (bloccaSlot && ambiente !== "Bacheca" && orario) {
      const parts = orario.split(" - ");
      const startT = parts[0]?.trim();
      const endT = parts[1] ? parts[1].trim().split(" ")[0] : "";

      const tutti30 = getTuttiSlotOrari30Min();
      const slotsToBlock = [];

      if (tutti30.includes(orario)) {
        slotsToBlock.push(orario);
      } else if (startT && endT && startT.includes(":") && endT.includes(":")) {
        const [sh, sm] = startT.split(":").map(Number);
        const [eh, em] = endT.split(":").map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;

        tutti30.forEach(s => {
          const [sPart] = s.split(" - ");
          const [h, m] = sPart.split(":").map(Number);
          const tMin = h * 60 + m;
          if (tMin >= startMin && tMin < endMin) {
            slotsToBlock.push(s);
          }
        });
      }

      if (slotsToBlock.length === 0) {
        slotsToBlock.push(orario);
      }

      for (const s of slotsToBlock) {
        await callApi("prenotaSpazio", {
          risorsa: ambiente,
          data: data,
          slot_orario: s,
          email: `Master (${titolo})`
        });
        if (!appState.prenotazioniSpazi) appState.prenotazioniSpazi = [];
        appState.prenotazioniSpazi = appState.prenotazioniSpazi.filter(p => !(p.risorsa === ambiente && formattaDataConfronto(p.data) === data && p.slot_orario === s));
        appState.prenotazioniSpazi.push({
          id: "S_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          risorsa: ambiente,
          data: data,
          slot_orario: s,
          email: `Master (${titolo})`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 2. Se pubblicaBacheca è attivo, crea l'avviso in bacheca
    if (pubblicaBacheca) {
      const payloadBacheca = {
        tipo: ambiente === "Chiesa" ? "speciale" : (ambiente === "Sala TV" ? "evento" : "avviso"),
        data: data,
        titolo: (ambiente !== "Bacheca" ? `[${ambiente}] ` : "") + titolo,
        descrizione: (orario ? `⏰ Orario: ${orario}\n` : "") + (descrizione || ""),
        autore: appState.user?.nome || "Direzione / Master",
        priorita: "alta"
      };
      const resB = await callApi("salvaAvvisoBacheca", payloadBacheca);
      if (!appState.bacheca) appState.bacheca = [];
      appState.bacheca.unshift({
        id: resB.id || ("B_" + Date.now()),
        ...payloadBacheca,
        timestamp: new Date().toISOString()
      });
    }

    mostraToast("✅ Appuntamento registrato con successo!", "success");
    chiudiModalMasterAppuntamento();

    // Aggiorna tutte le viste
    renderBachecaView();
    renderSpaziView();
    if (haPermessiMaster()) {
      renderMasterSection();
    }
  } catch (err) {
    mostraToast("Errore durante il salvataggio dell'appuntamento", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "💾 Salva e Programma Appuntamento";
    }
  }
};

window.eliminaPrenotazioneSpazioMaster = async function(id) {
  if (!confirm("Sei sicuro di voler liberare questa prenotazione?")) return;
  try {
    const res = await callApi("cancellaPrenotazioneSpazio", { id });
    if (res.success) {
      mostraToast("Slot liberato con successo", "success");
      appState.prenotazioniSpazi = (appState.prenotazioniSpazi || []).filter(p => String(p.id) !== String(id));
      renderSlotSpazi();
      if (haPermessiMaster()) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile liberare lo slot"), "error");
    }
  } catch (e) {
    mostraToast("Errore di rete", "error");
  }
};

// ============================================================================
// GESTIONE GOOGLE FOGLI DATABASE (SPREADSHEET & GOOGLE APPS SCRIPT)
// ============================================================================

window.salvaUrlGasMaster = function() {
  const input = document.getElementById("master-gas-url-input");
  if (!input) return;
  const url = input.value.trim();
  if (!url) {
    localStorage.removeItem(STORAGE_KEYS.BACKEND_URL);
    appState.backendUrl = "";
    mostraToast("Modalità locale stand-alone ripristinata", "info");
  } else {
    localStorage.setItem(STORAGE_KEYS.BACKEND_URL, url);
    appState.backendUrl = url;
    mostraToast("URL Google Apps Script salvato! Esegui il Test Connessione.", "success");
  }
  aggiornaIndicatoreConnessione();
  renderMasterSection();
};

window.testaConnessioneGAS = async function() {
  const resultEl = document.getElementById("master-gas-test-result");
  if (resultEl) {
    resultEl.innerHTML = `<span style="color:#0284c7;">🔄 Connessione a Google Apps Script in corso...</span>`;
  }
  const t0 = performance.now();
  try {
    const res = await callApi("ping");
    const t1 = performance.now();
    const ms = Math.round(t1 - t0);
    if (res && (res.status === "online" || res.success)) {
      mostraToast(`✅ Connessione riuscita in ${ms}ms!`, "success");
      if (resultEl) {
        resultEl.innerHTML = `
          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 8px 12px; color: #166534; font-size: 13px;">
            <strong>✅ Google Apps Script Attivo!</strong> Risposta in ${ms}ms.<br>
            ${res.spreadsheetName ? `Spreadsheet: <strong>${escapeHtml(res.spreadsheetName)}</strong><br>` : ''}
            ${res.activeSheets ? `Fogli attivi: <em>${escapeHtml(res.activeSheets.join(', '))}</em>` : 'Tutti i 6 fogli operativi (Utenti, Mensa, Spazi, Manutenzione, Bacheca, Configurazione)'}
          </div>
        `;
      }
    } else {
      mostraToast("Risposta dal server: " + JSON.stringify(res), "warning");
      if (resultEl) {
        resultEl.innerHTML = `<span style="color:#b45309;">⚠️ Risposta: ${JSON.stringify(res)}</span>`;
      }
    }
  } catch (err) {
    mostraToast("Errore connessione: " + err.message, "error");
    if (resultEl) {
      resultEl.innerHTML = `<span style="color:#dc2626;">❌ Connessione fallita. Verifica l'URL o i permessi 'Chiunque' nella distribuzione Web App.</span>`;
    }
  }
};

window.sincronizzaTuttoDaGoogleFogli = async function() {
  mostraToast("Sincronizzazione in corso con Google Fogli...", "info");
  try {
    await inizializzaApp();
    mostraToast("✅ Dati sincronizzati con Google Fogli!", "success");
    if (haPermessiMaster()) {
      renderMasterSection();
    }
  } catch (err) {
    mostraToast("Errore durante la sincronizzazione: " + err.message, "error");
  }
};

window.inizializzaGoogleFogli = async function() {
  if (!confirm("Vuoi inviare la richiesta di inizializzazione dei 6 fogli di lavoro al tuo Google Spreadsheet?")) return;
  mostraToast("Inizializzazione struttura Fogli Google in corso...", "info");
  try {
    const res = await callApi("inizializzaDati");
    if (res && res.success) {
      mostraToast("✅ Database Google Fogli inizializzato con successo!", "success");
      sincronizzaTuttoDaGoogleFogli();
    } else {
      mostraToast("Risultato: " + (res.message || res.error || "Operazione completata"), "info");
    }
  } catch (err) {
    mostraToast("Errore inizializzazione: " + err.message, "error");
  }
};

window.apriModalCodiceGas = async function() {
  const modal = document.getElementById("modal-codice-gas");
  const textarea = document.getElementById("gas-source-code-textarea");
  if (!modal) return;

  if (textarea) {
    textarea.value = "Caricamento codice Code.gs...";
    try {
      const resp = await fetch("/Code.gs");
      if (resp.ok) {
        textarea.value = await resp.text();
      } else {
        textarea.value = "// Consulta il file Code.gs nella radice del progetto per il codice completo.";
      }
    } catch (e) {
      textarea.value = "// Consulta il file Code.gs nella radice del progetto per il codice completo.";
    }
  }
  modal.style.display = "flex";
};

window.chiudiModalCodiceGas = function() {
  const modal = document.getElementById("modal-codice-gas");
  if (modal) modal.style.display = "none";
};

window.copiaCodiceGasNegliAppunti = function() {
  const textarea = document.getElementById("gas-source-code-textarea");
  if (!textarea) return;
  textarea.select();
  navigator.clipboard.writeText(textarea.value).then(() => {
    mostraToast("📋 Codice Code.gs copiato negli appunti!", "success");
  }).catch(() => {
    document.execCommand("copy");
    mostraToast("📋 Codice copiato!", "success");
  });
};

window.esportaBackupLocale = function() {
  const data = localStorage.getItem(STORAGE_KEYS.LOCAL_DB) || JSON.stringify(INITIAL_MOCK_DB);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup_residenza_newman_${formatYMD(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
  mostraToast("📥 Backup esportato con successo!", "success");
};

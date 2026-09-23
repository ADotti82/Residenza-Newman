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

// URL predefinito del Backend Google Apps Script per tutti i residenti
// Quando inserito, l'app si collegherà automaticamente in diretta al Foglio Google
const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycbwGOPkCRL8gIHEcvv_yTmmlSWwyt2r5_jqrU7JMqzNorN6By4hccBIwB-GhvmLwoY3pTw/exec";

// Bindings globali immediati per gli eventi inline HTML onclick
window.mostraModalAuth = function(mostra) {
  const modal = document.getElementById("modal-auth");
  if (!modal) return;
  modal.style.display = mostra ? "flex" : "none";
  if (mostra) {
    document.getElementById("auth-step-email")?.classList.remove("hidden");
    document.getElementById("auth-step-register")?.classList.add("hidden");
    document.getElementById("auth-step-waiting")?.classList.add("hidden");
    const inp = document.getElementById("auth-input-email");
    if (inp) setTimeout(() => inp.focus(), 100);
  }
};

window.gestisciClickUserPill = function() {
  if (appState.user) {
    apriModalSettings();
  } else {
    window.mostraModalAuth(true);
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

// Menu ciclico di 14 giorni (Settimana 1 e Settimana 2) di default
// Modificabile dinamicamente dal foglio Google "Menu_Base" senza intaccare le variazioni comunicate dalla cucina
const DEFAULT_MENU_14_GIORNI = {
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

// Istanza attiva del Menu 14 giorni (inizializzata con i valori predefiniti e aggiornabile da Google Sheets)
let MENU_14_GIORNI = JSON.parse(JSON.stringify(DEFAULT_MENU_14_GIORNI));

/**
 * Applica i dati del menu base provenienti dal foglio Google "Menu_Base".
 * Questo definisce il menu di base ciclico a 14 giorni, senza toccare né alterare
 * la logica separata delle variazioni comunicate dalla cucina per giorni specifici.
 */
function applicaMenuBaseDaGoogleSheets(menuBase) {
  if (!menuBase || typeof menuBase !== "object") return;
  ["settimana1", "settimana2"].forEach(sett => {
    if (menuBase[sett]) {
      if (!MENU_14_GIORNI[sett]) MENU_14_GIORNI[sett] = {};
      Object.keys(menuBase[sett]).forEach(giorno => {
        if (!MENU_14_GIORNI[sett][giorno]) MENU_14_GIORNI[sett][giorno] = {};
        if (menuBase[sett][giorno].pranzo) {
          MENU_14_GIORNI[sett][giorno].pranzo = {
            ...(MENU_14_GIORNI[sett][giorno].pranzo || {}),
            ...menuBase[sett][giorno].pranzo
          };
        }
        if (menuBase[sett][giorno].cena) {
          MENU_14_GIORNI[sett][giorno].cena = {
            ...(MENU_14_GIORNI[sett][giorno].cena || {}),
            ...menuBase[sett][giorno].cena
          };
        }
      });
    }
  });
}

// Database Mock Locale iniziale (attivo quando non è configurato un backend GAS)
const INITIAL_MOCK_DB = {
  utenti: [
    { email: "donandreadotti@gmail.com", nome: "Don Andrea Dotti", stato: "Approvato", is_utente_mensa: true, perm_mensa: true, perm_manutenzione: true, perm_spazi: true, perm_admin: true, notif_manutenzione: true, notif_spazi: true, password: "newman2026" },
    { email: "donrocco@newman.it", nome: "Don Rocco", stato: "Approvato", is_utente_mensa: true, perm_mensa: true, perm_manutenzione: false, perm_spazi: true, perm_admin: false, notif_manutenzione: false, notif_spazi: true, password: "newman2026" },
    { email: "donsergio@newman.it", nome: "Don Sergio", stato: "Approvato", is_utente_mensa: true, perm_mensa: true, perm_manutenzione: false, perm_spazi: true, perm_admin: false, notif_manutenzione: false, notif_spazi: false, password: "newman2026" },
    { email: "francesco.studente@newman.it", nome: "Francesco Rossi", stato: "Approvato", is_utente_mensa: true, perm_mensa: true, perm_manutenzione: true, perm_spazi: true, perm_admin: false, notif_manutenzione: true, notif_spazi: false, password: "newman2026" }
  ],
  mensa: [
    { id: "M_001", data: "2026-09-16", email: "donrocco@newman.it", tipo_pasto: "pranzo", busta: false, ritardo: false, ospiti: 0, stato_presenza: "Presente", note: "Piatto standard", timestamp: "2026-09-16T09:00:00Z" },
    { id: "M_002", data: "2026-09-16", email: "donandreadotti@gmail.com", tipo_pasto: "pranzo", busta: false, ritardo: true, ospiti: 0, stato_presenza: "Ritardo", note: "Arrivo alle 13:45 causa lezioni", timestamp: "2026-09-16T09:30:00Z" }
  ],
  accoglienza: [
    {
      id: "ACC_001",
      data_richiesta: "2026-09-20T10:00:00Z",
      email_richiedente: "francesco.studente@newman.it",
      nome_richiedente: "Francesco Rossi",
      ospite_nome: "Prof. Mario Rossi",
      checkin: "2026-09-25",
      checkout: "2026-09-27",
      num_ospiti: 1,
      camera_richiesta: "Camera 1",
      camera_assegnata: "Camera 1",
      stato: "Confermata",
      autorizzato1_da: "donandreadotti@gmail.com",
      data_autorizzazione1: "2026-09-21T09:00:00Z",
      autorizzato2_da: "donandreadotti@gmail.com",
      data_autorizzazione2: "2026-09-22T08:30:00Z",
      note: "Docente in visita accademica"
    }
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
    Nome_Camera_1: "Camera Newman",
    Nome_Camera_2: "Camera San Filippo Neri",
    Nome_Camera_3: "Camera Santa Teresa",
    Max_Ospiti_Mensa: "5",
    Info_Regolamento: `REGOLAMENTO INTERNO DELLA RESIDENZA CARDINAL NEWMAN
1. VITA COMUNITARIA: Il clima di studio, preghiera e fraternità sacerdotale e accademica è alla base della nostra convivenza.
2. ORARI DI SILENZIO: Dalle ore 23:00 alle ore 07:30 del mattino è richiesto il silenzio nei corridoi e negli spazi comuni per favorire il riposo e la preghiera.
3. MENSA COMUNITARIA:
   • Pranzo alle 14:30.
   • Cena alle 19:30.
   • Martedì e Giovedì a pranzo: pasto, frutta e snack/dolce, acqua e succo.
4. PRENOTAZIONE DEGLI SPAZI COMUNI:
   • Gli unici spazi soggetti a richiesta di prenotazione sono la Chiesa / Cappella e la Sala TV.
   • Gli slot sono di 30 minuti ciascuno. Ogni prenotazione costituisce una richiesta soggetta ad autorizzazione del Master.
   • Riservatezza: l'utente visualizza le proprie richieste; il Master visualizza l'occupante; tutti gli altri residenti vedono lo slot come 'Occupato' o 'In Valutazione'.
5. ACCOGLIENZA E OSPITALITÀ:
   • La disponibilità delle 3 camere dedicate è gestita tramite procedura a doppia autorizzazione (richiesta -> assegnazione camera da Master -> conferma definitiva).
6. MANUTENZIONE E CURA DEI LOCALI:
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
  currentTab: "info",          // Tab corrente: info | mensa | accoglienza | spazi | manutenzione | master
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
  accoglienzaList: [],         // Richieste e prenotazioni camere accoglienza
  guasti: [],                  // Lista segnalazioni / guasti
  manutenzioneList: [],        // Alias per garantire compatibilità ovunque
  tuttiUtenti: [],             // Elenco completo residenti (per Admin)
  utentiInAttesa: [],          // Lista utenti in attesa (per Admin)
  compressedImageBase64: null, // Stringa JPEG compressa dal canvas
  isOfflineMode: false,
  bypassTimeLock: false,
  masterActiveTab: "utenti",   // Scheda attiva pannello master: "utenti" | "spazi" | "mensa" | "manutenzione" | "sistema"
  masterVistaSchede: true,     // Vista suddivisa a schede orizzontali (true) o vista completa a scorrimento (false)
  cucinaModalState: { pasto: "pranzo", dataYMD: "", filtro: "tutti", search: "" }
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
  let storedBackendUrl = localStorage.getItem(STORAGE_KEYS.BACKEND_URL);
  if (!storedBackendUrl && DEFAULT_GAS_URL) {
    storedBackendUrl = DEFAULT_GAS_URL;
    localStorage.setItem(STORAGE_KEYS.BACKEND_URL, DEFAULT_GAS_URL);
  }
  appState.backendUrl = storedBackendUrl || DEFAULT_GAS_URL || "";
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
      if (parsed.utenti) {
        parsed.utenti.forEach(u => {
          if (u.notif_manutenzione === undefined) {
            u.notif_manutenzione = Boolean(u.perm_manutenzione || u.perm_admin);
            needsSave = true;
          }
          if (u.notif_spazi === undefined) {
            u.notif_spazi = Boolean(u.perm_spazi || u.perm_admin);
            needsSave = true;
          }
          if (u.is_utente_mensa === undefined) {
            u.is_utente_mensa = true;
            needsSave = true;
          }
        });
      }
      if (!parsed.accoglienza || parsed.accoglienza.length === 0) {
        parsed.accoglienza = INITIAL_MOCK_DB.accoglienza;
        needsSave = true;
      }
      if (!parsed.configurazione) {
        parsed.configurazione = INITIAL_MOCK_DB.configurazione;
        needsSave = true;
      } else {
        if (!parsed.configurazione.Nome_Camera_1) parsed.configurazione.Nome_Camera_1 = "Camera Newman";
        if (!parsed.configurazione.Nome_Camera_2) parsed.configurazione.Nome_Camera_2 = "Camera San Filippo Neri";
        if (!parsed.configurazione.Nome_Camera_3) parsed.configurazione.Nome_Camera_3 = "Camera Santa Teresa";
        if (!parsed.configurazione.Max_Ospiti_Mensa) parsed.configurazione.Max_Ospiti_Mensa = "5";
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
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }
  // Nessun utente salvato in sessione: stato ospite non autenticato
  appState.user = null;
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
 * Helper unificato per visualizzare SEMPRE le date nel formato italiano GG-MM-AAAA
 */
function formattaDataItaliana(val) {
  if (!val) return "";
  if (val instanceof Date) {
    const gg = String(val.getDate()).padStart(2, "0");
    const mm = String(val.getMonth() + 1).padStart(2, "0");
    const aaaa = val.getFullYear();
    return `${gg}-${mm}-${aaaa}`;
  }
  const s = String(val).trim();
  if (!s) return "";
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s.replace(/\//g, "-");
  const part = s.includes("T") ? s.split("T")[0] : s.split(" ")[0];
  const m = part.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return `${m[3]}-${m[2]}-${m[1]}`;
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const gg = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const aaaa = d.getFullYear();
    return `${gg}-${mm}-${aaaa}`;
  }
  return s;
}
window.formattaDataItaliana = formattaDataItaliana;

/**
 * Simulatore Backend per funzionamento standalone immediato
 */
function mockBackendExecution(action, params) {
  const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_DB) || JSON.stringify(INITIAL_MOCK_DB));

  switch (action) {
    case "login": {
      const email = String(params.email || "").trim().toLowerCase();
      const password = String(params.password || "").trim();
      const utente = db.utenti.find(u => u.email.toLowerCase() === email);
      if (!utente) {
        return { success: false, notFound: true, message: "Utente non presente" };
      }
      // Se l'utente ha una password nel database
      if (utente.password) {
        if (!password) {
          return { success: false, requirePassword: true, error: "Inserisci la tua password per accedere" };
        }
        if (utente.password !== password) {
          return { success: false, requirePassword: true, error: "Password errata. Riprova o chiedi il reset alla Direzione." };
        }
      } else {
        // Se non aveva una password salvata e l'ha inserita, diventa la sua password iniziale
        if (password) {
          utente.password = password;
          localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        }
      }
      return { success: true, utente: { ...utente, hasPassword: Boolean(utente.password) } };
    }

    case "registraUtente": {
      const email = String(params.email || "").trim().toLowerCase();
      const nome = String(params.nome || "").trim();
      const password = String(params.password || "newman2026").trim();
      const exists = db.utenti.some(u => u.email.toLowerCase() === email);
      if (exists) return { success: false, error: "Email già registrata" };

      // Ogni residente ha il permesso per prenotare gli spazi comuni (Chiesa e Sala TV)
      const nuovo = { email, nome, stato: "Approvato", perm_mensa: true, perm_manutenzione: true, perm_spazi: true, perm_admin: false, password };
      db.utenti.push(nuovo);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, status: "Approvato", message: "Registrazione completata con successo!", utente: nuovo };
    }

    case "cambiaPassword": {
      const email = String(params.email || "").trim().toLowerCase();
      const passwordAttuale = String(params.passwordAttuale || "").trim();
      const nuovaPassword = String(params.nuovaPassword || "").trim();

      const utente = db.utenti.find(u => u.email.toLowerCase() === email);
      if (!utente) return { success: false, error: "Utente non trovato" };

      if (utente.password && utente.password !== passwordAttuale) {
        return { success: false, error: "La password attuale inserita non è corretta." };
      }
      if (!nuovaPassword || nuovaPassword.length < 4) {
        return { success: false, error: "La nuova password deve contenere almeno 4 caratteri." };
      }

      utente.password = nuovaPassword;
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, message: "Password aggiornata con successo!" };
    }

    case "resetPasswordUtente": {
      const emailTarget = String(params.emailTarget || "").trim().toLowerCase();
      const nuovaPassword = String(params.nuovaPassword || "newman2026").trim();
      const utente = db.utenti.find(u => u.email.toLowerCase() === emailTarget);
      if (!utente) return { success: false, error: "Utente non trovato" };

      utente.password = nuovaPassword;
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, message: `Password per ${emailTarget} reimpostata con successo a: ${nuovaPassword}` };
    }

    case "approvaUtente": {
      const emailTarget = String(params.emailTarget || "").trim().toLowerCase();
      const idx = db.utenti.findIndex(u => u.email.toLowerCase() === emailTarget);
      if (idx !== -1) {
        db.utenti[idx].stato = "Approvato";
        if (params.is_utente_mensa !== undefined) db.utenti[idx].is_utente_mensa = Boolean(params.is_utente_mensa);
        if (params.perm_mensa !== undefined) db.utenti[idx].perm_mensa = Boolean(params.perm_mensa);
        if (params.perm_manutenzione !== undefined) db.utenti[idx].perm_manutenzione = Boolean(params.perm_manutenzione);
        if (params.perm_spazi !== undefined) db.utenti[idx].perm_spazi = Boolean(params.perm_spazi);
        if (params.perm_admin !== undefined) db.utenti[idx].perm_admin = Boolean(params.perm_admin);
        if (params.notif_manutenzione !== undefined) db.utenti[idx].notif_manutenzione = Boolean(params.notif_manutenzione);
        if (params.notif_spazi !== undefined) db.utenti[idx].notif_spazi = Boolean(params.notif_spazi);
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, message: "Utente approvato!" };
      }
      return { success: false, error: "Utente non trovato" };
    }

    case "prenotaMensa": {
      const { data, email, tipo_pasto, busta, ritardo, note, ospiti, stato_presenza } = params;
      const dataStr = formattaDataConfronto(data);
      const existIdx = db.mensa.findIndex(m => formattaDataConfronto(m.data) === dataStr && m.email.toLowerCase() === email.toLowerCase() && m.tipo_pasto === tipo_pasto);
      const entry = {
        id: "M_" + Date.now(),
        data: dataStr,
        email,
        tipo_pasto,
        busta: Boolean(busta),
        ritardo: Boolean(ritardo),
        ospiti: parseInt(ospiti) || 0,
        stato_presenza: stato_presenza || (ritardo ? "Ritardo" : "Presente"),
        note: note || "",
        timestamp: new Date().toISOString()
      };
      if (existIdx !== -1) {
        db.mensa[existIdx] = { ...db.mensa[existIdx], ...entry };
      } else {
        db.mensa.push(entry);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, id: entry.id };
    }

    case "segnaAssenteMensa": {
      const { data, email, tipo_pasto } = params;
      const dataStr = formattaDataConfronto(data);
      const existIdx = db.mensa.findIndex(m => formattaDataConfronto(m.data) === dataStr && m.email.toLowerCase() === email.toLowerCase() && m.tipo_pasto === tipo_pasto);
      const entry = {
        id: "M_" + Date.now(),
        data: dataStr,
        email,
        tipo_pasto,
        busta: false,
        ritardo: false,
        ospiti: 0,
        stato_presenza: "Assente",
        note: params.note || "Segnalata assenza",
        timestamp: new Date().toISOString()
      };
      if (existIdx !== -1) {
        db.mensa[existIdx] = entry;
      } else {
        db.mensa.push(entry);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, message: "Assenza registrata" };
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
      const occupied = (db.prenotazioni_spazi || []).some(p => p.risorsa === risorsa && formattaDataConfronto(p.data) === dataStr && p.slot_orario === slot_orario && p.stato !== "Rifiutata");
      if (occupied) return { success: false, error: "Slot già occupato o con richiesta in attesa" };

      // Se la prenotazione è fatta da un Master/Admin, viene approvata subito; se da un residente, va in attesa di approvazione
      const isMasterUser = haPermessiMaster() || (appState.user && (appState.user.perm_admin || appState.user.perm_spazi));
      const stato = isMasterUser ? "Approvata" : "In Attesa";

      const prenotazione = {
        id: "S_" + Date.now(),
        risorsa,
        data: dataStr,
        slot_orario,
        email,
        timestamp: new Date().toISOString(),
        stato: stato,
        approvato_da: isMasterUser ? email : ""
      };
      if (!db.prenotazioni_spazi) db.prenotazioni_spazi = [];
      db.prenotazioni_spazi.push(prenotazione);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));

      // Simula notifica email per il Master in caso di richiesta da residente
      const masterEmailNotifiche = appState.cachedConfig.Email_Notifiche_Master || "donandreadotti@gmail.com";
      console.log(`[NOTIFICA EMAIL SIMULATA] Invio a: ${masterEmailNotifiche} | Oggetto: Richiesta Spazio: ${risorsa} da ${email} (${stato})`);

      return {
        success: true,
        id: prenotazione.id,
        stato: stato,
        message: stato === "Approvata" ? "Prenotazione registrata e confermata" : "Richiesta inviata ai Master. In attesa di approvazione."
      };
    }

    case "approvaPrenotazioneSpazio": {
      const { id, approvatoreEmail } = params;
      const pren = (db.prenotazioni_spazi || []).find(p => String(p.id) === String(id));
      if (pren) {
        pren.stato = "Approvata";
        pren.approvato_da = approvatoreEmail || (appState.user ? appState.user.email : "Master");
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, message: "Prenotazione spazio approvata con successo" };
      }
      return { success: false, error: "Prenotazione non trovata" };
    }

    case "rifiutaPrenotazioneSpazio": {
      const { id } = params;
      db.prenotazioni_spazi = (db.prenotazioni_spazi || []).filter(p => String(p.id) !== String(id));
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, message: "Richiesta spazio rifiutata/liberata" };
    }

    case "aggiornaConfig": {
      for (const k in params) {
        if (k !== "action") {
          appState.cachedConfig[k] = params[k];
          if (!db.config) db.config = {};
          db.config[k] = params[k];
        }
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, message: "Configurazione salvata con successo", config: appState.cachedConfig };
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

      // Simula invio notifica email al Master e referenti manutenzione
      const emailMaster = appState.cachedConfig.Email_Notifiche_Master || "donandreadotti@gmail.com";
      console.log(`[NOTIFICA EMAIL SIMULATA] Invio a: ${emailMaster} | Oggetto: Nuova Segnalazione Manutenzione: ${luogo || 'Generale'} da ${email}`);

      return { success: true, id: guasto.id, linkFoto: guasto.link_foto, message: "Segnalazione salvata e notifica inviata al Master" };
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
        if (params.is_utente_mensa !== undefined) utente.is_utente_mensa = Boolean(params.is_utente_mensa);
        if (params.perm_mensa !== undefined) utente.perm_mensa = Boolean(params.perm_mensa);
        if (params.perm_manutenzione !== undefined) utente.perm_manutenzione = Boolean(params.perm_manutenzione);
        if (params.perm_spazi !== undefined) utente.perm_spazi = Boolean(params.perm_spazi);
        if (params.perm_admin !== undefined) utente.perm_admin = Boolean(params.perm_admin);
        if (params.notif_manutenzione !== undefined) utente.notif_manutenzione = Boolean(params.notif_manutenzione);
        if (params.notif_spazi !== undefined) utente.notif_spazi = Boolean(params.notif_spazi);
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
            is_utente_mensa: item.is_utente_mensa !== undefined ? Boolean(item.is_utente_mensa) : true,
            perm_mensa: item.perm_mensa !== undefined ? Boolean(item.perm_mensa) : true,
            perm_manutenzione: item.perm_manutenzione !== undefined ? Boolean(item.perm_manutenzione) : false,
            perm_spazi: item.perm_spazi !== undefined ? Boolean(item.perm_spazi) : true,
            perm_admin: item.perm_admin !== undefined ? Boolean(item.perm_admin) : false,
            password: item.password || "newman2026"
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

    case "richiediAccoglienza":
    case "richiestaAccoglienza": {
      if (!db.accoglienza) db.accoglienza = [];
      const item = {
        id: "ACC_" + Date.now().toString().slice(-6),
        data_richiesta: new Date().toISOString(),
        richiedente_email: (params.email || params.email_richiedente || (appState.user ? appState.user.email : "")).toLowerCase(),
        richiedente_nome: params.nome || params.nome_richiedente || (appState.user ? appState.user.nome : ""),
        nome_ospite: params.nome_ospite || params.ospite_nome || "",
        numero_ospiti: Math.max(1, parseInt(params.numero_ospiti || params.num_ospiti || 1, 10)),
        data_checkin: params.data_checkin || params.checkin || "",
        data_checkout: params.data_checkout || params.checkout || "",
        camera_preferita: params.camera_preferita || params.camera_richiesta || "",
        camera_assegnata: "",
        stato: "In Attesa 1a Autorizzazione",
        auth1_email: "",
        auth1_data: "",
        auth1_note: "",
        auth2_email: "",
        auth2_data: "",
        auth2_note: "",
        motivo: params.motivo || "",
        note: params.note || params.motivo || ""
      };
      db.accoglienza.unshift(item);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, id: item.id, item, message: "Richiesta inviata. In attesa della 1ª autorizzazione Master." };
    }

    case "autorizza1Accoglienza": {
      if (!db.accoglienza) db.accoglienza = [];
      const { id, camera_assegnata, approvatoreEmail, note } = params;
      const acc = db.accoglienza.find(a => String(a.id) === String(id));
      if (acc) {
        acc.camera_assegnata = camera_assegnata || acc.camera_preferita || "Camera 1";
        acc.stato = "1a Autorizzazione Concessa";
        acc.auth1_email = approvatoreEmail || (appState.user ? appState.user.email : "Master");
        acc.auth1_data = new Date().toISOString();
        acc.auth1_note = note || "";
        if (note) acc.note = (acc.note ? acc.note + " | " : "") + note;
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, message: `1ª Autorizzazione concessa. Camera assegnata: ${acc.camera_assegnata}` };
      }
      return { success: false, error: "Richiesta non trovata" };
    }

    case "autorizza2Accoglienza": {
      if (!db.accoglienza) db.accoglienza = [];
      const { id, approvatoreEmail, note } = params;
      const acc = db.accoglienza.find(a => String(a.id) === String(id));
      if (acc) {
        acc.stato = "Confermata";
        acc.auth2_email = approvatoreEmail || (appState.user ? appState.user.email : "Master");
        acc.auth2_data = new Date().toISOString();
        acc.auth2_note = note || "";
        if (note) acc.note = (acc.note ? acc.note + " | " : "") + note;
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, message: "2ª Autorizzazione completata. Prenotazione Confermata!" };
      }
      return { success: false, error: "Richiesta non trovata" };
    }

    case "rifiutaAccoglienza": {
      if (!db.accoglienza) db.accoglienza = [];
      const { id, motivo, note, approvatoreEmail } = params;
      const acc = db.accoglienza.find(a => String(a.id) === String(id));
      if (acc) {
        acc.stato = "Rifiutata";
        acc.auth1_note = "Rifiutata da " + (approvatoreEmail || "Master") + (motivo || note ? ": " + (motivo || note) : "");
        if (motivo || note) acc.note = (acc.note ? acc.note + " | " : "") + (motivo || note);
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, message: "Richiesta ospitalità rifiutata" };
      }
      return { success: false, error: "Richiesta non trovata" };
    }

    case "cancellaAccoglienza": {
      if (!db.accoglienza) db.accoglienza = [];
      const { id } = params;
      db.accoglienza = db.accoglienza.filter(a => String(a.id) !== String(id));
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, message: "Richiesta ospitalità cancellata" };
    }

    case "getAccoglienzaData": {
      return {
        success: true,
        accoglienza: db.accoglienza || [],
        config: db.configurazione || {}
      };
    }

    case "getInfoData": {
      return {
        success: true,
        config: db.configurazione,
        prenotazioniSpazi: db.prenotazioni_spazi,
        prenotazioniMensa: db.mensa,
        bacheca: db.bacheca || [],
        accoglienza: db.accoglienza || []
      };
    }

    case "getMasterData": {
      return {
        success: true,
        utentiInAttesa: db.utenti.filter(u => u.stato === "In Attesa"),
        tuttiUtenti: db.utenti,
        mensa: db.mensa,
        guasti: db.manutenzione,
        prenotazioniSpazi: db.prenotazioni_spazi || [],
        bacheca: db.bacheca || [],
        accoglienza: db.accoglienza || [],
        config: db.configurazione
      };
    }

    case "aggiornaConfig": {
      if (params.Messaggio_Supermaster !== undefined) db.configurazione.Messaggio_Supermaster = params.Messaggio_Supermaster;
      if (params.Info_Regolamento !== undefined) db.configurazione.Info_Regolamento = params.Info_Regolamento;
      if (params.Info_Contatti !== undefined) db.configurazione.Info_Contatti = params.Info_Contatti;
      if (params.Data_Variazione_Menu !== undefined) db.configurazione.Data_Variazione_Menu = params.Data_Variazione_Menu;
      if (params.Testo_Variazione !== undefined) db.configurazione.Testo_Variazione = params.Testo_Variazione;
      if (params.Nome_Camera_1 !== undefined) db.configurazione.Nome_Camera_1 = params.Nome_Camera_1;
      if (params.Nome_Camera_2 !== undefined) db.configurazione.Nome_Camera_2 = params.Nome_Camera_2;
      if (params.Nome_Camera_3 !== undefined) db.configurazione.Nome_Camera_3 = params.Nome_Camera_3;
      if (params.Max_Ospiti_Mensa !== undefined) db.configurazione.Max_Ospiti_Mensa = String(params.Max_Ospiti_Mensa);
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
  if (typeof renderAccoglienzaView === "function") renderAccoglienzaView();

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
      if (data.menuBase) {
        applicaMenuBaseDaGoogleSheets(data.menuBase);
      }
      if (data.accoglienza) {
        appState.accoglienzaList = data.accoglienza;
      }

      // Aggiorna viste
      renderBachecaView();
      renderResidenzaView();
      verificaAlertVariazione();
      renderSlotSpazi();
      renderMensaView();
      if (typeof renderAccoglienzaView === "function") renderAccoglienzaView();
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
        <div class="roman-italian-date-large" style="font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: 0.2px;">${escapeHtml(cal.dataItaliana)}</div>
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

      <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: space-between; flex-wrap: wrap; align-items: center;">
        <button type="button" class="btn btn-sm" onclick="switchTab('calendario')" style="background: rgba(255,255,255,0.22); color: #fff; border: 1px solid rgba(255,255,255,0.35); font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px;">
          <span>📅</span> <strong>Visualizza Tutti gli Appuntamenti</strong>
        </button>
        ${isMasterOrAdmin ? `
          <button type="button" class="btn btn-sm" onclick="apriModalMasterAppuntamento('Chiesa', '${dataYMD}')" style="background: #9d174d; color: #fff; border: 1px solid #be185d; font-size: 12px; font-weight: 700;">
            👑 ➕ Inserisci Appuntamento
          </button>
        ` : ''}
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
            <span class="text-xs text-muted">📅 ${formattaDataItaliana(item.data)}</span>
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
              <div class="text-xs text-muted">${formattaDataItaliana(item.data)} • ${escapeHtml(item.autore || 'Direzione')}</div>
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

  const rawReg = appState.cachedConfig?.Info_Regolamento;
  const regText = (rawReg && typeof rawReg === "string" && rawReg.trim().length > 5) 
    ? rawReg.trim() 
    : `REGOLAMENTO INTERNO DELLA RESIDENZA CARDINAL NEWMAN
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

  const rawCont = appState.cachedConfig?.Info_Contatti;
  const contText = (rawCont && typeof rawCont === "string" && rawCont.trim().length > 5)
    ? rawCont.trim()
    : `CONTATTI E RECAPITI DELLA RESIDENZA:
• Portineria / Accoglienza: Tel. +39 06 87654321 (Int. 101) - Attiva 07:00 - 22:30
• Direzione Generale: direzione@residenzanewman.org (Int. 102)
• Emergenze Notturne Custode: +39 333 1122334
• Economato & Servizio Mensa: mensa@residenzanewman.org
• Assistenza Tecnica Manutenzione: manutenzione@residenzanewman.org`;

  const rawMsg = appState.cachedConfig?.Messaggio_Supermaster;
  const msgSupermaster = (rawMsg && typeof rawMsg === "string" && rawMsg.trim().length > 0)
    ? rawMsg.trim()
    : "Cari residenti, benvenuti nel portale digitale della Residenza Newman. Per qualsiasi necessità o urgenza la Direzione è a vostra disposizione.";

  container.innerHTML = `
    <!-- CARD PORTAMI ALLA RESIDENZA (NAVIGATORE GOOGLE MAPS) -->
    <div class="card" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; border: 1px solid rgba(255,255,255,0.15); padding: 18px; border-radius: var(--radius-md); box-shadow: var(--shadow-md);">
      <div class="flex-between" style="flex-wrap: wrap; gap: 12px;">
        <div class="flex-align" style="gap: 12px;">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: rgba(22, 163, 74, 0.25); border: 1px solid rgba(22, 163, 74, 0.5); display: flex; align-items: center; justify-content: center; font-size: 24px;">
            📍
          </div>
          <div>
            <h2 class="card-title" style="margin: 0; color: #ffffff; font-size: 17px; font-weight: 700;">Dove Siamo &amp; Raggiungi la Struttura</h2>
            <div style="font-size: 12.5px; color: #94a3b8; margin-top: 2px;">Residenza Cardinal Newman • Via Cardinal Newman</div>
          </div>
        </div>
        <a href="https://maps.app.goo.gl/XUH7wqFcZ7jjNJRdA" target="_blank" rel="noopener noreferrer" class="btn btn-primary" id="btn-portami-residenza" style="background: #16a34a; border-color: #16a34a; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; padding: 11px 20px; border-radius: 8px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.45); font-size: 14px;">
          <span>🗺️</span>
          <span>Portami alla residenza</span>
          <span style="font-size: 14px;">↗</span>
        </a>
      </div>
      <p style="font-size: 12.5px; color: #cbd5e1; margin: 12px 0 0 0; line-height: 1.5;">
        Tocca il pulsante per avviare subito il navigatore in tempo reale su Google Maps con percorso pedonale, automobilistico o con i mezzi pubblici verso la Residenza Newman.
      </p>
    </div>

    <!-- CARD SPAZIO TESTO DEL SUPERMASTER / COMUNICAZIONE DIREZIONE -->
    ${(() => {
      const rawPub = appState.cachedConfig?.Messaggio_Supermaster_Data_Pubblicazione;
      const rawScad = appState.cachedConfig?.Messaggio_Supermaster_Data_Scadenza;
      const nowTime = new Date().getTime();
      const pubTime = rawPub ? new Date(rawPub).getTime() : 0;
      const scadTime = rawScad ? new Date(rawScad).getTime() : 0;
      const isScaduto = scadTime > 0 && nowTime > scadTime;
      const isProgrammato = pubTime > 0 && nowTime < pubTime;

      // Se scaduto o programmato per un residente normale
      if (!haPermessiMaster()) {
        if (isScaduto) {
          return `
            <div class="card" style="border-left: 4px solid #94a3b8; background: #f8fafc;">
              <div class="flex-align" style="gap: 8px;">
                <span style="font-size: 20px;">ℹ️</span>
                <div>
                  <h3 class="card-title" style="margin: 0; font-size: 15px; color: #475569;">Comunicazione della Direzione</h3>
                  <span class="text-xs text-muted">Nessuna comunicazione straordinaria attiva al momento.</span>
                </div>
              </div>
            </div>
          `;
        }
        if (isProgrammato) {
          return ''; // Non ancora visibile
        }
      }

      let timingBadgesHtml = '';
      if (rawPub || rawScad) {
        timingBadgesHtml = `
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; font-size: 11.5px;">
            ${rawPub ? `
              <span class="badge" style="background: #e0f2fe; color: #0369a1; font-weight: 600;">
                📅 Inizio: ${escapeHtml(rawPub.replace("T", " ore "))}
              </span>
            ` : ''}
            ${rawScad ? `
              <span class="badge" style="${isScaduto ? 'background: #fee2e2; color: #991b1b;' : 'background: #fef3c7; color: #92400e;'} font-weight: 600;">
                ${isScaduto ? '⚠️ Scaduto il' : '⌛ Scade il'}: ${escapeHtml(rawScad.replace("T", " ore "))}
              </span>
            ` : '<span class="badge" style="background: #f1f5f9; color: #475569; font-weight: 600;">⌛ Nessuna scadenza</span>'}
            ${isProgrammato ? '<span class="badge" style="background: #ede9fe; color: #6d28d9; font-weight: 700;">⏳ Programmato (Non ancora attivo per i residenti)</span>' : ''}
            ${isScaduto ? '<span class="badge" style="background: #dc2626; color: #ffffff; font-weight: 700;">⚠️ SCADUTO</span>' : ''}
          </div>
        `;
      }

      return `
        <div class="card" style="border-left: 4px solid ${isScaduto ? '#dc2626' : (isProgrammato ? '#8b5cf6' : '#f59e0b')}; background: ${isScaduto ? '#fef2f2' : (isProgrammato ? '#faf5ff' : '#ffffff')};">
          <div class="flex-between" style="margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div class="flex-align" style="gap: 8px;">
              <span style="font-size: 22px;">👑</span>
              <div>
                <h2 class="card-title" style="margin: 0;">Comunicazione della Direzione (Supermaster)</h2>
                <span class="text-xs text-muted">Messaggio ufficiale del Superamministratore per tutta la comunità</span>
              </div>
            </div>
            ${haPermessiMaster() ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="apriModalMessaggioSupermaster()">
                ✏️ Modifica &amp; Date
              </button>
            ` : ''}
          </div>
          <div class="residenza-text-box" style="background: ${isScaduto ? '#fee2e2' : (isProgrammato ? '#f3e8ff' : '#fffbeb')}; border-color: ${isScaduto ? '#fca5a5' : (isProgrammato ? '#ddd6fe' : '#fde68a')}; color: ${isScaduto ? '#991b1b' : (isProgrammato ? '#581c87' : '#78350f')}; font-size: 13.5px; line-height: 1.5;">
            ${escapeHtml(msgSupermaster)}
          </div>
          ${timingBadgesHtml}
        </div>
      `;
    })()}

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
// MODAL: MESSAGGIO DEL SUPERMASTER / COMUNICAZIONE DIREZIONE
// ----------------------------------------------------------------------------
window.apriModalMessaggioSupermaster = function() {
  const currentMsg = appState.cachedConfig.Messaggio_Supermaster || "Cari residenti, benvenuti nel portale digitale della Residenza Newman. Per qualsiasi necessità o urgenza la Direzione è a vostra disposizione.";
  const currentPub = appState.cachedConfig.Messaggio_Supermaster_Data_Pubblicazione || "";
  const currentScad = appState.cachedConfig.Messaggio_Supermaster_Data_Scadenza || "";
  
  let modal = document.getElementById("modal-messaggio-supermaster");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-messaggio-supermaster";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 540px;">
        <div class="modal-header">
          <div style="font-size: 32px; margin-bottom: 6px;">👑</div>
          <h3 class="modal-title" style="margin: 0;">Comunicazione della Direzione (Supermaster)</h3>
          <p class="modal-subtitle">Aggiorna la comunicazione ufficiale della Direzione visibile a tutti i residenti.</p>
        </div>
        <form onsubmit="salvaMessaggioSupermaster(event)">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="textarea-messaggio-supermaster" style="font-weight: 700;">Testo del Messaggio / Avviso Ufficiale:</label>
            <textarea id="textarea-messaggio-supermaster" class="input-textarea" rows="5" style="font-size: 13.5px; line-height: 1.5;" required placeholder="Scrivi la comunicazione della Direzione..."></textarea>
          </div>

          <!-- DATE DI PUBBLICAZIONE E SCADENZA -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px;">
              ⏱️ Programmazione Pubblicazione & Scadenza:
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
              <div>
                <label for="supermaster-pubblicazione" style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Data e Ora Inizio:</label>
                <input type="datetime-local" id="supermaster-pubblicazione" class="input-text" style="font-size: 12px; padding: 6px 8px;">
              </div>
              <div>
                <label for="supermaster-scadenza" style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Data e Ora Scadenza:</label>
                <input type="datetime-local" id="supermaster-scadenza" class="input-text" style="font-size: 12px; padding: 6px 8px;" placeholder="Nessuna scadenza">
              </div>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn btn-outline btn-sm" style="font-size: 11px; padding: 2px 8px;" onclick="impostaPresetScadenzaSupermaster(0)">Nessuna Scadenza</button>
              <button type="button" class="btn btn-outline btn-sm" style="font-size: 11px; padding: 2px 8px;" onclick="impostaPresetScadenzaSupermaster(3)">+3 Giorni</button>
              <button type="button" class="btn btn-outline btn-sm" style="font-size: 11px; padding: 2px 8px;" onclick="impostaPresetScadenzaSupermaster(7)">+7 Giorni</button>
              <button type="button" class="btn btn-outline btn-sm" style="font-size: 11px; padding: 2px 8px;" onclick="impostaPresetScadenzaSupermaster(30)">+1 Mese</button>
            </div>
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

  const pubInput = document.getElementById("supermaster-pubblicazione");
  if (pubInput) {
    if (currentPub) {
      pubInput.value = currentPub;
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      pubInput.value = now.toISOString().slice(0, 16);
    }
  }

  const scadInput = document.getElementById("supermaster-scadenza");
  if (scadInput) scadInput.value = currentScad || "";

  modal.style.display = "flex";
};

window.impostaPresetScadenzaSupermaster = function(giorni) {
  const scadInput = document.getElementById("supermaster-scadenza");
  if (!scadInput) return;
  if (giorni <= 0) {
    scadInput.value = "";
    return;
  }
  const d = new Date();
  d.setDate(d.getDate() + giorni);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  scadInput.value = d.toISOString().slice(0, 16);
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

  const dataPub = document.getElementById("supermaster-pubblicazione")?.value || "";
  const dataScad = document.getElementById("supermaster-scadenza")?.value || "";

  try {
    const payload = {
      Messaggio_Supermaster: nuovoTesto,
      Messaggio_Supermaster_Data_Pubblicazione: dataPub,
      Messaggio_Supermaster_Data_Scadenza: dataScad
    };
    const res = await callApi("aggiornaConfig", payload);
    if (res.success) {
      appState.cachedConfig.Messaggio_Supermaster = nuovoTesto;
      appState.cachedConfig.Messaggio_Supermaster_Data_Pubblicazione = dataPub;
      appState.cachedConfig.Messaggio_Supermaster_Data_Scadenza = dataScad;
      mostraToast("✅ Comunicazione Direzione aggiornata con programmazione!", "success");
      chiudiModalMessaggioSupermaster();
      renderResidenzaView();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
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

  const pubInput = document.getElementById("bacheca-modal-pubblicazione");
  if (pubInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    pubInput.value = now.toISOString().slice(0, 16);
  }

  const scadInput = document.getElementById("bacheca-modal-scadenza");
  if (scadInput) scadInput.value = "";

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

  const pubInput = document.getElementById("bacheca-modal-pubblicazione");
  if (pubInput) pubInput.value = item.data_pubblicazione || "";

  const scadInput = document.getElementById("bacheca-modal-scadenza");
  if (scadInput) scadInput.value = item.data_scadenza || "";

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
  const data_pubblicazione = document.getElementById("bacheca-modal-pubblicazione")?.value || "";
  const data_scadenza = document.getElementById("bacheca-modal-scadenza")?.value || "";

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
      priorita,
      data_pubblicazione,
      data_scadenza
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
        data_pubblicazione,
        data_scadenza,
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
 * Ancoraggio impostato a Lunedì 21 Settembre 2026 (Settimana 2: Ravioli burro e salvia)
 * Supporta anche lo scambio dinamico delle settimane o modifiche da Google Sheets
 */
function getSettimanaMenu(dataTarget) {
  const dTarget = new Date(dataTarget.getFullYear(), dataTarget.getMonth(), dataTarget.getDate());
  const dAnchor = new Date(MENU_ANCHOR_DATE.getFullYear(), MENU_ANCHOR_DATE.getMonth(), MENU_ANCHOR_DATE.getDate());

  const diffMs = dTarget.getTime() - dAnchor.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

  // Modulo ciclico a 2 settimane: Lunedì 21 Settembre 2026 corrisponde alla Settimana 2 (Ravioli burro e salvia)
  let isSettimana2 = Math.abs(diffWeeks) % 2 === 0;

  // Inversione configurata dal Master (salvata in Google Sheets o in locale)
  const isInvertito = appState.cachedConfig?.Inverti_Ciclo_Menu === "true" || localStorage.getItem("newman_inverti_menu") === "true";
  if (isInvertito) {
    isSettimana2 = !isSettimana2;
  }

  return isSettimana2 ? "settimana2" : "settimana1";
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
 * Restituisce gli orari limite correnti (configurabili dal Master tramite SHEET_CONFIG o pannello Master)
 */
function getOrariLimitePasti() {
  const cfg = appState.cachedConfig || {};
  return {
    limitePranzo: cfg.Orario_Limite_Pranzo || "09:00",
    limiteCena: cfg.Orario_Limite_Cena || "14:30",
    limiteBusta: cfg.Orario_Limite_Busta || "14:00"
  };
}

/**
 * Parsing di una stringa orario "HH:MM" in ore e minuti
 */
function parseTimeHHMM(timeStr, defaultH, defaultM) {
  if (!timeStr) return { ore: defaultH, minuti: defaultM };
  const parts = String(timeStr).trim().split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return {
    ore: isNaN(h) ? defaultH : h,
    minuti: isNaN(m) ? defaultM : m
  };
}

/**
 * Verifica blocco orario per il Pranzo:
 * Non è possibile prenotare o modificare il pranzo oltre l'orario limite (default 09:00 del mattino).
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

  // Se è oggi, controlla rispetto all'orario limite configurato dal Master (default 09:00)
  const { limitePranzo } = getOrariLimitePasti();
  const { ore: limiteOre, minuti: limiteMin } = parseTimeHHMM(limitePranzo, 9, 0);

  const ore = adesso.getHours();
  const minuti = adesso.getMinutes();
  return (ore > limiteOre) || (ore === limiteOre && minuti >= limiteMin);
}

/**
 * Verifica blocco orario per la Cena:
 * Non è possibile prenotare o modificare la cena oltre l'orario limite (default 14:30 del giorno stesso).
 */
function isCenaBloccata(dataSelezionata) {
  if (appState.bypassTimeLock) return false;
  const adesso = new Date();
  const dataScelta = new Date(dataSelezionata.getFullYear(), dataSelezionata.getMonth(), dataSelezionata.getDate());
  const dataOggi = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate());

  if (dataScelta < dataOggi) return true;
  if (dataScelta > dataOggi) return false;

  // Se è oggi, controlla rispetto all'orario limite configurato dal Master (default 14:30)
  const { limiteCena } = getOrariLimitePasti();
  const { ore: limiteOre, minuti: limiteMin } = parseTimeHHMM(limiteCena, 14, 30);

  const ore = adesso.getHours();
  const minuti = adesso.getMinutes();
  return (ore > limiteOre) || (ore === limiteOre && minuti >= limiteMin);
}

/**
 * Verifica blocco per la Busta (Martedì e Giovedì al sacco):
 * La busta deve essere prenotata entro le 14:00 del giorno precedente.
 */
function isBustaBloccata(dataSelezionata) {
  if (appState.bypassTimeLock) return false;
  const adesso = new Date();
  const dataScelta = new Date(dataSelezionata.getFullYear(), dataSelezionata.getMonth(), dataSelezionata.getDate());
  
  const { limiteBusta } = getOrariLimitePasti();
  const { ore: limiteOre, minuti: limiteMin } = parseTimeHHMM(limiteBusta, 14, 0);

  // La scadenza per la busta è il giorno prima alle ore limiteOre:limiteMin
  const deadlineBusta = new Date(dataScelta.getFullYear(), dataScelta.getMonth(), dataScelta.getDate() - 1, limiteOre, limiteMin, 0);
  return adesso > deadlineBusta;
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

  const dataInizioFmt = formattaDataItaliana(lunediSettimana);
  const dataFineFmt = formattaDataItaliana(domenicaSettimana);

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

      <!-- Tabs di visualizzazione: Settimana Scorrevole o Singolo Giorno + Vista Cuoca -->
      <div class="mensa-view-mode-tabs" style="display: flex; flex-wrap: wrap; gap: 6px;">
        <button type="button" class="mode-tab-btn ${mode === 'settimana' ? 'active' : ''}" onclick="setMensaViewMode('settimana')">
          📅 Settimana Completa
        </button>
        <button type="button" class="mode-tab-btn ${mode === 'giorno' ? 'active' : ''}" onclick="setMensaViewMode('giorno')">
          ☀️ Vista Giorno
        </button>
        <button type="button" class="mode-tab-btn" style="background: #fff7ed; color: #c2410c; border: 1px solid #fdba74; font-weight: 700;" onclick="switchTab('cucina')">
          👩‍🍳 Vista Cuoca / Presenze
        </button>
      </div>

      <!-- Selettore rapido dei giorni (Pills) -->
      <div class="mensa-day-pills">
        ${renderDayPills(dataSel)}
      </div>

      <!-- Promemoria Orari Limite Dinamici -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; margin-top: 8px; font-size: 11.5px; color: #475569; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
        <span>⏰ <strong>Limiti prenotazione:</strong> Pranzo entro le <strong>${getOrariLimitePasti().limitePranzo}</strong> • Cena entro le <strong>${getOrariLimitePasti().limiteCena}</strong> • Busta entro le <strong>${getOrariLimitePasti().limiteBusta}</strong> (ieri)</span>
        ${isMaster ? `<button type="button" class="btn-link" onclick="switchTab('master')" style="font-size: 11px; text-decoration: underline; color: var(--primary);">⚙️ Modifica orari</button>` : ''}
      </div>

      ${appState.bypassTimeLock ? '<div class="banner-test-mode">⚙️ Modalità Test: Blocchi orari disattivati per valutazione</div>' : ''}
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
                ${dataVariazione ? `<span style="font-size: 11px; color: #b45309;">(Applicata al giorno: ${formattaDataItaliana(dataVariazione)})</span>` : ''}
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
            <span>${giornoLabel}, ${formattaDataItaliana(d)}</span>
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
              ${prenPranzo ? (
                (prenPranzo.stato_presenza === 'assente' || prenPranzo.stato_presenza === 'Assente') ?
                  `<span class="meal-status-pill not-booked" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;">❌ Segnato Assente</span>` :
                  `<span class="meal-status-pill booked">✓ Presente ${prenPranzo.ospiti > 0 ? `(+${prenPranzo.ospiti} ospiti)` : ''} ${prenPranzo.busta ? '(Busta)' : ''} ${prenPranzo.ritardo ? '(Ritardo)' : ''}</span>`
              ) : `
                <span class="meal-status-pill not-booked">Non segnato</span>
              `}
              ${isMaster ? `
                <span class="master-attendees-badge" title="Visualizza presenti nel Pannello Master" onclick="switchTab('master')">
                  👥 Pasti: <span class="count-num">${appState.mensaBookings.filter(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === 'pranzo' && m.stato_presenza !== 'assente' && m.stato_presenza !== 'Assente').reduce((sum, m) => sum + 1 + (parseInt(m.ospiti, 10) || 0), 0)}</span>
                </span>
              ` : ''}
            </div>
            <span class="badge ${pranzoLocked ? 'badge-danger' : 'badge-success'}" style="font-size: 10px;">
              ${pranzoLocked ? 'Chiuso' : 'Aperto'}
            </span>
          </div>

          <div class="weekly-meal-dishes">
            ${isTuesdayOrThursday ? `
              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 8px 10px; margin-bottom: 4px;">
                <div style="font-weight: 700; color: #9a3412; font-size: 12.5px;">🥪 Pranzo al sacco: Busta da Asporto</div>
                <div style="font-size: 11.5px; color: #7c2d12; margin-top: 2px;">
                  Comprende: <strong>pasto, frutta e snack/dolce, acqua e succo</strong>. (Menù servito in sala non previsto).
                </div>
              </div>
            ` : `
              <div>
                <strong>1°:</strong> ${escapeHtml(menuGiorno.pranzo?.primo || '-')} • 
                <strong>2°:</strong> ${escapeHtml(menuGiorno.pranzo?.secondo || '-')} • 
                <strong>Cont.:</strong> ${escapeHtml(menuGiorno.pranzo?.contorno || '-')}${menuGiorno.pranzo?.contorno2 ? ' • ' + escapeHtml(menuGiorno.pranzo.contorno2) : ''} • 
                <strong>Dessert:</strong> ${escapeHtml(menuGiorno.pranzo?.dessert || '-')}
              </div>
            `}
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
            ${prenPranzo ? (
              (prenPranzo.stato_presenza === 'assente' || prenPranzo.stato_presenza === 'Assente') ? `
                <span class="presence-summary-badge" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;">❌ Segnato Assente</span>
                <button type="button" class="btn-quick-cancel" ${pranzoLocked ? 'disabled' : ''} onclick="quickCancelPresenza('${dStr}', 'pranzo')">
                  Rimuovi Assenza
                </button>
              ` : `
                <span class="presence-summary-badge">✅ Presenza ${prenPranzo.ospiti > 0 ? `(+${prenPranzo.ospiti})` : ''} ${isTuesdayOrThursday ? '(Busta)' : ''}</span>
                <button type="button" class="btn-quick-cancel" ${pranzoLocked ? 'disabled' : ''} onclick="quickCancelPresenza('${dStr}', 'pranzo')">
                  Annulla Presenza
                </button>
              `
            ) : (isTuesdayOrThursday ? `
              <button type="button" class="btn-quick-book" ${pranzoLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'pranzo', true, false)">
                🥪 Richiedi Busta Pranzo
              </button>
              <button type="button" class="btn-quick-book" style="border-color: #64748b; color: #475569;" ${pranzoLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'pranzo', true, true)">
                ⏰ Ritiro Posticipato
              </button>
              <button type="button" class="btn-quick-cancel" style="color: #dc2626; border-color: #fca5a5; font-size: 11px;" ${pranzoLocked ? 'disabled' : ''} onclick="quickSegnaAssente('${dStr}', 'pranzo')">
                ❌ Assente
              </button>
            ` : `
              <button type="button" class="btn-quick-book" ${pranzoLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'pranzo', false, false)">
                🍽️ Presente
              </button>
              <button type="button" class="btn-quick-book" style="border-color: #64748b; color: #475569;" ${pranzoLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'pranzo', false, true)">
                ⏰ In Ritardo
              </button>
              <button type="button" class="btn-quick-cancel" style="color: #dc2626; border-color: #fca5a5; font-size: 11px;" ${pranzoLocked ? 'disabled' : ''} onclick="quickSegnaAssente('${dStr}', 'pranzo')">
                ❌ Assente
              </button>
            `)}
          </div>
        </div>

        <!-- RIGA CENA -->
        <div class="weekly-meal-row cena-row">
          <div class="weekly-meal-header">
            <div class="weekly-meal-title">
              <span>🌙 Cena (19:30)</span>
              ${prenCena ? (
                (prenCena.stato_presenza === 'assente' || prenCena.stato_presenza === 'Assente') ?
                  `<span class="meal-status-pill not-booked" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;">❌ Segnato Assente</span>` :
                  `<span class="meal-status-pill booked">✓ Presente ${prenCena.ospiti > 0 ? `(+${prenCena.ospiti} ospiti)` : ''} ${prenCena.ritardo ? '(Ritardo)' : ''}</span>`
              ) : `
                <span class="meal-status-pill not-booked">Non segnato</span>
              `}
              ${(haPermessiMaster() || (appState.user && appState.user.perm_mensa)) ? `
                <span class="master-attendees-badge" title="Visualizza presenti nel Pannello Master" onclick="switchTab('master')">
                  👥 Pasti: <span class="count-num">${appState.mensaBookings.filter(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === 'cena' && m.stato_presenza !== 'assente' && m.stato_presenza !== 'Assente').reduce((sum, m) => sum + 1 + (parseInt(m.ospiti, 10) || 0), 0)}</span>
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
            ${prenCena ? (
              (prenCena.stato_presenza === 'assente' || prenCena.stato_presenza === 'Assente') ? `
                <span class="presence-summary-badge" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;">❌ Segnato Assente</span>
                <button type="button" class="btn-quick-cancel" ${cenaLocked ? 'disabled' : ''} onclick="quickCancelPresenza('${dStr}', 'cena')">
                  Rimuovi Assenza
                </button>
              ` : `
                <span class="presence-summary-badge">✅ Presenza ${prenCena.ospiti > 0 ? `(+${prenCena.ospiti})` : ''}</span>
                <button type="button" class="btn-quick-cancel" ${cenaLocked ? 'disabled' : ''} onclick="quickCancelPresenza('${dStr}', 'cena')">
                  Annulla Presenza
                </button>
              `
            ) : `
              <button type="button" class="btn-quick-book" ${cenaLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'cena', false, false)">
                🍽️ Presente
              </button>
              <button type="button" class="btn-quick-book" style="border-color: #64748b; color: #475569;" ${cenaLocked ? 'disabled' : ''} onclick="quickSegnaPresenza('${dStr}', 'cena', false, true)">
                ⏰ In Ritardo
              </button>
              <button type="button" class="btn-quick-cancel" style="color: #dc2626; border-color: #fca5a5; font-size: 11px;" ${cenaLocked ? 'disabled' : ''} onclick="quickSegnaAssente('${dStr}', 'cena')">
                ❌ Assente
              </button>
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
  const maxOspiti = parseInt(appState.cachedConfig?.Max_Ospiti_Mensa || 5, 10);

  const nomeGiornoFormat = capitalize(giornoKey);
  const dataFormattata = formattaDataItaliana(dataSel);

  const emailUtente = appState.user ? appState.user.email.toLowerCase() : "";
  const prenPranzo = appState.mensaBookings.find(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === "pranzo" && m.email.toLowerCase() === emailUtente);
  const prenCena = appState.mensaBookings.find(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === "cena" && m.email.toLowerCase() === emailUtente);

  const isAssentePranzo = prenPranzo && (prenPranzo.stato_presenza === 'assente' || prenPranzo.stato_presenza === 'Assente');
  const isAssenteCena = prenCena && (prenCena.stato_presenza === 'assente' || prenCena.stato_presenza === 'Assente');

  const totPastiPranzo = appState.mensaBookings.filter(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === 'pranzo' && m.stato_presenza !== 'assente' && m.stato_presenza !== 'Assente').reduce((sum, m) => sum + 1 + (parseInt(m.ospiti, 10) || 0), 0);
  const totPastiCena = appState.mensaBookings.filter(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === 'cena' && m.stato_presenza !== 'assente' && m.stato_presenza !== 'Assente').reduce((sum, m) => sum + 1 + (parseInt(m.ospiti, 10) || 0), 0);

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
        ${prenPranzo ? (
          isAssentePranzo ?
            `<span class="meal-status-pill not-booked" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;">❌ Segnato Assente</span>` :
            `<span class="meal-status-pill booked">✓ Presente ${prenPranzo.ospiti > 0 ? `(+${prenPranzo.ospiti})` : ''} ${prenPranzo.busta ? '(Busta)' : ''}</span>`
        ) : ''}
        ${isMaster ? `
          <span class="master-attendees-badge" title="Visualizza presenti nel Pannello Master" onclick="switchTab('master')">
            👥 Pasti: <span class="count-num">${totPastiPranzo}</span>
          </span>
        ` : ''}
        <span class="badge ${pranzoLocked ? 'badge-danger' : 'badge-success'}">${pranzoLocked ? 'Chiuso' : 'Aperto'}</span>
      </div>

      <div class="meal-menu-body">
        ${!isTuesdayOrThursday ? `
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
        ` : `
          <div class="busta-classici-container" style="margin-top: 4px; padding: 14px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
            <div class="flex-align" style="gap: 10px;">
              <span style="font-size: 26px;">🥪</span>
              <div>
                <strong style="color: #9a3412; font-size: 14px;">Pranzo del ${nomeGiornoFormat}: Solo Busta da Asporto</strong>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #7c2d12; line-height: 1.45;">
                  Il ${nomeGiornoFormat} a pranzo non è previsto il menù servito in sala. È disponibile esclusivamente il pranzo al sacco.
                </p>
                <div style="margin-top: 8px; font-size: 12.5px; font-weight: 600; color: #92400e; background: #fef3c7; padding: 6px 12px; border-radius: 6px; display: inline-block;">
                  🍱 <strong>La busta comprende:</strong> pasto, frutta e snack/dolce, acqua e succo.
                </div>
              </div>
            </div>
          </div>
        `}

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
              <input type="checkbox" id="pranzo-busta" checked disabled>
              <span><strong>Pranzo al sacco: Busta</strong> (pasto, frutta, snack/dolce, acqua e succo)</span>
            </label>
            <label class="custom-checkbox">
              <input type="checkbox" id="pranzo-ritardo" ${prenPranzo?.ritardo ? 'checked' : ''} ${pranzoLocked ? 'disabled' : ''}>
              <span>Ritiro posticipato della busta</span>
            </label>
          ` : `
            <label class="custom-checkbox">
              <input type="checkbox" id="pranzo-ritardo" ${prenPranzo?.ritardo ? 'checked' : ''} ${pranzoLocked ? 'disabled' : ''}>
              <span>Arrivo in Ritardo (Lasciare piatto coperto con nome)</span>
            </label>
          `}
        </div>

        <div style="margin-top: 10px; padding: 8px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div class="flex-between">
            <div>
              <label for="pranzo-ospiti" style="font-size: 12.5px; font-weight: 700; color: #1e293b; display: block;">👥 Ospiti al tavolo:</label>
              <span class="text-xs text-muted">Coperti aggiuntivi da preparare (max ${maxOspiti})</span>
            </div>
            <input type="number" id="pranzo-ospiti" class="input-text" min="0" max="${maxOspiti}" value="${prenPranzo?.ospiti || 0}" style="width: 65px; text-align: center; font-weight: 700; padding: 4px;" ${pranzoLocked ? 'disabled' : ''}>
          </div>
        </div>

        <div class="form-group" style="margin-top: 10px;">
          <input type="text" id="pranzo-note" class="input-text" placeholder="Note per la cucina (opzionale)..." value="${escapeHtml(prenPranzo?.note || '')}" ${pranzoLocked ? 'disabled' : ''}>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="submit" class="btn btn-primary" style="flex: 1;" ${pranzoLocked ? 'disabled' : ''}>
            ${prenPranzo && !isAssentePranzo ? 'Aggiorna Presenza' : (isTuesdayOrThursday ? 'Prenota Busta Pranzo' : 'Presente')}
          </button>
          <button type="button" class="btn btn-secondary" style="color: #dc2626; border-color: #fca5a5; font-size: 12px;" ${pranzoLocked ? 'disabled' : ''} onclick="quickSegnaAssente('${dStr}', 'pranzo')">
            ❌ Segna Assente
          </button>
          ${prenPranzo ? `
            <button type="button" class="btn-quick-cancel" ${pranzoLocked ? 'disabled' : ''} onclick="quickCancelPresenza('${dStr}', 'pranzo')">
              Annulla
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
        ${prenCena ? (
          isAssenteCena ?
            `<span class="meal-status-pill not-booked" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;">❌ Segnato Assente</span>` :
            `<span class="meal-status-pill booked">✓ Presente ${prenCena.ospiti > 0 ? `(+${prenCena.ospiti})` : ''}</span>`
        ) : ''}
        ${(haPermessiMaster() || (appState.user && appState.user.perm_mensa)) ? `
          <span class="master-attendees-badge" title="Visualizza presenti nel Pannello Master" onclick="switchTab('master')">
            👥 Pasti: <span class="count-num">${totPastiCena}</span>
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
          <label class="custom-checkbox">
            <input type="checkbox" id="cena-ritardo" ${prenCena?.ritardo ? 'checked' : ''} ${cenaLocked ? 'disabled' : ''}>
            <span>Arrivo in Ritardo (Lasciare piatto coperto con nome)</span>
          </label>
        </div>

        <div style="margin-top: 10px; padding: 8px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div class="flex-between">
            <div>
              <label for="cena-ospiti" style="font-size: 12.5px; font-weight: 700; color: #1e293b; display: block;">👥 Ospiti al tavolo:</label>
              <span class="text-xs text-muted">Coperti aggiuntivi da preparare (max ${maxOspiti})</span>
            </div>
            <input type="number" id="cena-ospiti" class="input-text" min="0" max="${maxOspiti}" value="${prenCena?.ospiti || 0}" style="width: 65px; text-align: center; font-weight: 700; padding: 4px;" ${cenaLocked ? 'disabled' : ''}>
          </div>
        </div>

        <div class="form-group" style="margin-top: 10px;">
          <input type="text" id="cena-note" class="input-text" placeholder="Note per la cucina (opzionale)..." value="${escapeHtml(prenCena?.note || '')}" ${cenaLocked ? 'disabled' : ''}>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="submit" class="btn btn-primary" style="flex: 1;" ${cenaLocked ? 'disabled' : ''}>
            ${prenCena && !isAssenteCena ? 'Aggiorna Presenza' : 'Presente'}
          </button>
          <button type="button" class="btn btn-secondary" style="color: #dc2626; border-color: #fca5a5; font-size: 12px;" ${cenaLocked ? 'disabled' : ''} onclick="quickSegnaAssente('${dStr}', 'cena')">
            ❌ Segna Assente
          </button>
          ${prenCena ? `
            <button type="button" class="btn-quick-cancel" ${cenaLocked ? 'disabled' : ''} onclick="quickCancelPresenza('${dStr}', 'cena')">
              Annulla
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
    ospiti: 0,
    stato_presenza: "presente",
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
        ospiti: 0,
        stato_presenza: "presente",
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

window.quickSegnaAssente = async function(dataStr, tipoPasto) {
  if (!appState.user) {
    mostraModalAuth(true);
    return;
  }

  const payload = {
    data: dataStr,
    email: appState.user.email,
    tipo_pasto: tipoPasto,
    stato_presenza: "assente",
    busta: false,
    ritardo: false,
    ospiti: 0,
    note: "Assente comunicato"
  };

  try {
    const res = await callApi("prenotaMensa", payload);
    if (res.success) {
      const existIdx = appState.mensaBookings.findIndex(m => String(m.data).split("T")[0] === dataStr && m.tipo_pasto === tipoPasto && m.email.toLowerCase() === appState.user.email.toLowerCase());
      const entry = {
        id: res.id || ("M_" + Date.now()),
        data: dataStr,
        email: appState.user.email,
        tipo_pasto: tipoPasto,
        busta: false,
        ritardo: false,
        ospiti: 0,
        stato_presenza: "assente",
        note: "Assente comunicato"
      };
      if (existIdx !== -1) {
        appState.mensaBookings[existIdx] = entry;
      } else {
        appState.mensaBookings.push(entry);
      }

      mostraToast(`Assenza a ${tipoPasto} comunicata alla cucina`, "info");
      renderMensaView();
      if (haPermessiMaster()) caricaDatiMaster();
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile registrare assenza"), "error");
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
  const giornoKey = getNomeGiorno(appState.selectedDateMensa || new Date());
  const isTuesdayOrThursday = (giornoKey === "martedi" || giornoKey === "giovedi");
  const busta = (isTuesdayOrThursday && tipoPasto === "pranzo") ? true : (document.getElementById(`${tipoPasto}-busta`)?.checked || false);
  const ritardo = document.getElementById(`${tipoPasto}-ritardo`)?.checked || false;
  const note = document.getElementById(`${tipoPasto}-note`)?.value || "";
  const ospiti = Math.max(0, parseInt(document.getElementById(`${tipoPasto}-ospiti`)?.value || "0", 10));

  const payload = {
    data: dataStr,
    email: appState.user.email,
    tipo_pasto: tipoPasto,
    busta: busta,
    ritardo: ritardo,
    ospiti: ospiti,
    stato_presenza: "presente",
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
        ospiti: ospiti,
        stato_presenza: "presente",
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
    const isPending = isOccupato && (pren.stato === "In Attesa");
    const isApproved = isOccupato && (pren.stato === "Approvata" || !pren.stato);

    if (!isOccupato) {
      disponibiliFascia++;
      html += `
        <div class="slot-card-v2 slot-available" onclick="prenotaSlotDiretto('${slot}')" title="Clicca per richiedere questo slot di 30 minuti">
          <div class="slot-time-text">${slot}</div>
          <span class="slot-status-pill">🟢 Disponibile</span>
        </div>
      `;
    } else if (isMio) {
      if (isPending) {
        html += `
          <div class="slot-card-v2 slot-mine" style="border-left: 4px solid #f59e0b; background: #fffbeb;">
            <div class="slot-time-text">${slot}</div>
            <span class="slot-status-pill" style="background: #fef3c7; color: #92400e;">⏳ Richiesta In Attesa Master</span>
            <button type="button" class="slot-cancel-btn" onclick="cancellaSlotSpazio('${pren.id || ''}', '${slot}', false)">
              Annulla Richiesta
            </button>
          </div>
        `;
      } else {
        html += `
          <div class="slot-card-v2 slot-mine">
            <div class="slot-time-text">${slot}</div>
            <span class="slot-status-pill">⭐ La tua prenotazione (Approvata)</span>
            <button type="button" class="slot-cancel-btn" onclick="cancellaSlotSpazio('${pren.id || ''}', '${slot}', false)">
              Annulla Prenotazione
            </button>
          </div>
        `;
      }
    } else if (isMaster) {
      if (isPending) {
        // Per il Master: mostra che è in attesa di approvazione e pulsanti Approva / Rifiuta
        html += `
          <div class="slot-card-v2" style="border-left: 4px solid #f59e0b; background: #fffbeb;">
            <div class="slot-time-text">${slot}</div>
            <span class="slot-status-pill" style="background: #fde68a; color: #78350f; font-weight: 700;">⏳ Richiesta da: ${escapeHtml(pren.email.split('@')[0])}</span>
            <div style="display: flex; gap: 4px; margin-top: 6px; width: 100%;">
              <button type="button" class="btn btn-sm" style="flex: 1; padding: 4px; font-size: 11px; font-weight: 700; background: #16a34a; color: #fff; border: none; border-radius: 4px;" onclick="approvaRichiestaSpazio('${pren.id}')">
                ✓ Approva
              </button>
              <button type="button" class="btn btn-sm" style="flex: 1; padding: 4px; font-size: 11px; font-weight: 700; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; border-radius: 4px;" onclick="rifiutaRichiestaSpazio('${pren.id}')">
                ✕ Rifiuta
              </button>
            </div>
          </div>
        `;
      } else {
        // Per il Master: già approvata, mostra chi occupa lo slot e pulsante per liberarlo
        html += `
          <div class="slot-card-v2 slot-master">
            <div class="slot-time-text">${slot}</div>
            <span class="slot-status-pill" title="${escapeHtml(pren.email)}">👑 Occupato: ${escapeHtml(pren.email.split('@')[0])} ${pren.approvato_da ? `(Approvato da ${escapeHtml(pren.approvato_da.split('@')[0])})` : ''}</span>
            <button type="button" class="slot-cancel-btn" onclick="cancellaSlotSpazio('${pren.id || ''}', '${slot}', true)">
              Libera Slot (Master)
            </button>
          </div>
        `;
      }
    } else {
      // Per gli altri residenti
      if (isPending) {
        html += `
          <div class="slot-card-v2 slot-occupied" style="opacity: 0.85;" title="Richiesta in fase di approvazione da parte dei Master">
            <div class="slot-time-text">${slot}</div>
            <span class="slot-status-pill" style="background: #f1f5f9; color: #475569;">⏳ In Valutazione Master</span>
          </div>
        `;
      } else {
        html += `
          <div class="slot-card-v2 slot-occupied" title="Questo slot è già stato confermato">
            <div class="slot-time-text">${slot}</div>
            <span class="slot-status-pill">🔒 Occupato</span>
          </div>
        `;
      }
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

  container.innerHTML = mie.map(p => {
    const isPending = p.stato === "In Attesa";
    return `
      <div class="mini-item flex-between" style="padding: 8px 6px;">
        <div>
          <div class="flex-align" style="gap: 6px; flex-wrap: wrap;">
            <span style="font-size: 16px;">${p.risorsa === 'Chiesa' ? '⛪' : '📺'}</span>
            <strong>${escapeHtml(p.risorsa)}</strong>
            <span class="badge" style="background:#f1f5f9; font-size:11px;">${escapeHtml(p.slot_orario)}</span>
            ${isPending 
              ? '<span class="badge" style="background:#fef3c7; color:#92400e; font-size:10.5px; font-weight:700;">⏳ In Attesa Approvazione</span>'
              : '<span class="badge" style="background:#dcfce7; color:#166534; font-size:10.5px; font-weight:700;">✓ Approvata</span>'
            }
          </div>
          <div class="text-muted text-xs" style="margin-top: 2px;">
            📅 ${String(p.data).split('T')[0]} ${p.approvato_da ? `• Approvato da: ${escapeHtml(p.approvato_da.split('@')[0])}` : ''}
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="cancellaSlotSpazio('${p.id || ''}', '${p.slot_orario}', false)" style="color: #dc2626; border-color: #fca5a5; background: #fff; font-size: 11px;">
          ${isPending ? 'Annulla Richiesta' : 'Annulla'}
        </button>
      </div>
    `;
  }).join("");
}

/**
 * Funzione Master: Approva richiesta prenotazione ambiente
 */
window.approvaRichiestaSpazio = async function(id) {
  if (!id) return;
  const masterEmail = appState.user ? appState.user.email : "Master";
  try {
    const res = await callApi("approvaPrenotazioneSpazio", { id, approvatoreEmail: masterEmail });
    if (res.success) {
      mostraToast("✅ Prenotazione ambiente approvata con successo!", "success");
      const pren = (appState.prenotazioniSpazi || []).find(p => String(p.id) === String(id));
      if (pren) {
        pren.stato = "Approvata";
        pren.approvato_da = masterEmail;
      }
      renderSlotSpazi();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile approvare"), "error");
    }
  } catch (err) {
    mostraToast("Errore durante l'approvazione dello spazio", "error");
  }
};

/**
 * Funzione Master: Rifiuta richiesta prenotazione ambiente
 */
window.rifiutaRichiestaSpazio = async function(id) {
  if (!id) return;
  if (!confirm("Confermi di voler rifiutare/cancellare questa richiesta di prenotazione?")) return;
  try {
    const res = await callApi("rifiutaPrenotazioneSpazio", { id });
    if (res.success) {
      mostraToast("Richiesta spazio rifiutata/liberata", "info");
      appState.prenotazioniSpazi = (appState.prenotazioniSpazi || []).filter(p => String(p.id) !== String(id));
      renderSlotSpazi();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile rifiutare"), "error");
    }
  } catch (err) {
    mostraToast("Errore durante il rifiuto dello spazio", "error");
  }
};

// ----------------------------------------------------------------------------
// LOGICA SEZIONE: ACCOGLIENZA E OSPITALITÀ 3 CAMERE (DOPPIA AUTORIZZAZIONE)
// ----------------------------------------------------------------------------

function getNomeCamera(camNum) {
  const cfg = appState.cachedConfig || {};
  if (camNum === 1 || camNum === "1" || camNum === "Camera 1") return cfg.Nome_Camera_1 || "Camera Newman";
  if (camNum === 2 || camNum === "2" || camNum === "Camera 2") return cfg.Nome_Camera_2 || "Camera San Filippo Neri";
  if (camNum === 3 || camNum === "3" || camNum === "Camera 3") return cfg.Nome_Camera_3 || "Camera Santa Teresa";
  return cfg[`Nome_Camera_${camNum}`] || `Camera ${camNum}`;
}

function getTutteCamereNomi() {
  return [
    getNomeCamera(1),
    getNomeCamera(2),
    getNomeCamera(3)
  ];
}

function calcolaNottiSoggiorno(checkinStr, checkoutStr) {
  if (!checkinStr || !checkoutStr) return 1;
  const d1 = new Date(checkinStr + "T00:00:00");
  const d2 = new Date(checkoutStr + "T00:00:00");
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

function renderAccoglienzaView() {
  const container = document.getElementById("accoglienza-container");
  if (!container) return;

  const camereNomi = getTutteCamereNomi();
  const accList = appState.accoglienzaList || [];
  const oggiYMD = formatYMD(new Date());
  const isMaster = haPermessiMaster();
  const userEmail = (appState.user?.email || "").toLowerCase();

  // Calcolo occupazione per ciascuna delle 3 camere
  const camereStato = camereNomi.map((nomeCam, idx) => {
    // Prenotazioni attive o autorizzate per questa camera
    const prenotazioniCam = accList.filter(a => {
      const cam = a.camera_assegnata || "";
      const st = a.stato || "";
      return (cam.toLowerCase() === nomeCam.toLowerCase() || cam === `Camera ${idx + 1}`) &&
             (st === "Confermata" || st === "1a Autorizzazione Concessa");
    });

    // Occupazione oggi
    const occupazioneOggi = prenotazioniCam.find(a => {
      const cIn = formattaDataConfronto(a.data_checkin || a.checkin);
      const cOut = formattaDataConfronto(a.data_checkout || a.checkout);
      return cIn <= oggiYMD && oggiYMD < cOut;
    });

    // Prossimi soggiorni
    const prossimiSoggiorni = prenotazioniCam.filter(a => {
      const cOut = formattaDataConfronto(a.data_checkout || a.checkout);
      return cOut >= oggiYMD;
    }).sort((a, b) => {
      const d1 = formattaDataConfronto(a.data_checkin || a.checkin);
      const d2 = formattaDataConfronto(b.data_checkin || b.checkin);
      return d1.localeCompare(d2);
    });

    return {
      num: idx + 1,
      nome: nomeCam,
      occupataOggi: Boolean(occupazioneOggi),
      dettagliOggi: occupazioneOggi,
      prossimi: prossimiSoggiorni
    };
  });

  // Filtro richieste da visualizzare: se master mostra tutte o permesse, se residente solo le sue
  const richiesteUtente = isMaster
    ? accList
    : accList.filter(a => {
        const em = (a.richiedente_email || a.email_richiedente || a.email || "").toLowerCase();
        return em === userEmail;
      });

  let html = `
    <!-- BANNER TESTATA ACCOGLIENZA -->
    <div class="card" style="margin-bottom: 14px; border-top: 4px solid #166534;">
      <div class="flex-between" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <h2 class="card-title" style="display: flex; align-items: center; gap: 8px; margin: 0 0 4px 0;">
            <span style="font-size: 24px;">🛏️</span> Ospitalità & Camere Ospiti
          </h2>
          <p class="card-desc" style="margin: 0;">
            Gestione delle 3 camere dedicate agli ospiti dei residenti. Procedura con doppia autorizzazione della Direzione.
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary" onclick="apriModalNuovaAccoglienza()" style="background: #166534; border-color: #166534; font-weight: 700; box-shadow: 0 2px 6px rgba(22,101,52,0.25);">
            ➕ Richiedi Alloggio Ospite
          </button>
          ${isMaster ? `
            <button type="button" class="btn btn-outline" onclick="switchTab('master'); window.cambiaSchedaMaster && window.cambiaSchedaMaster('accoglienza');" style="color: #166534; border-color: #86efac;">
              👑 Gestione Master Camere
            </button>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- PANORAMICA DELLE 3 CAMERE DEDICATE -->
    <div style="margin-bottom: 18px;">
      <h3 style="font-size: 14px; font-weight: 800; color: #1e293b; margin: 0 0 10px 4px; display: flex; align-items: center; gap: 6px;">
        <span>🚪</span> Disponibilità Camere Soggiorno
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
        ${camereStato.map(c => `
          <div class="card" style="margin: 0; padding: 14px; border: 1px solid ${c.occupataOggi ? '#fed7aa' : '#bbf7d0'}; background: ${c.occupataOggi ? '#fff7ed' : '#ffffff'};">
            <div class="flex-between" style="align-items: flex-start; margin-bottom: 8px;">
              <div>
                <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Camera ${c.num}</span>
                <h4 style="margin: 2px 0 0 0; font-size: 15px; font-weight: 700; color: #0f172a;">${escapeHtml(c.nome)}</h4>
              </div>
              <span class="badge" style="${c.occupataOggi ? 'background:#ffedd5; color:#c2410c;' : 'background:#dcfce7; color:#166534;'} font-weight: 700; font-size: 11px;">
                ${c.occupataOggi ? '🔴 Occupata Oggi' : '🟢 Libera Oggi'}
              </span>
            </div>

            <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
              Dotazioni: Letto matrimoniale/singolo, bagno privato, Wi-Fi, scrivania studio.
            </div>

            ${c.occupataOggi ? `
              <div style="background: rgba(255,255,255,0.7); border: 1px solid #fed7aa; border-radius: 6px; padding: 8px 10px; font-size: 12px; margin-bottom: 8px;">
                <strong>Ospite attuale:</strong> ${escapeHtml(c.dettagliOggi.nome_ospite || c.dettagliOggi.ospite_nome || 'Ospite')}<br>
                <span class="text-xs text-muted">Fino al ${formattaDataItaliana(c.dettagliOggi.data_checkout || c.dettagliOggi.checkout)}</span>
              </div>
            ` : ''}

            <!-- Prossimi soggiorni -->
            <div style="border-top: 1px solid var(--border); padding-top: 8px; margin-top: 6px;">
              <span style="font-size: 11.5px; font-weight: 700; color: #475569;">Prossimi soggiorni:</span>
              ${c.prossimi.length === 0 ? `
                <div style="font-size: 11.5px; color: #94a3b8; font-style: italic; margin-top: 2px;">Nessuna prenotazione futura programmata.</div>
              ` : `
                <ul style="margin: 4px 0 0 0; padding-left: 16px; font-size: 11.5px; color: #334155; line-height: 1.45;">
                  ${c.prossimi.slice(0, 3).map(p => `
                    <li>
                      <strong>${formattaDataItaliana(p.data_checkin || p.checkin)} ➜ ${formattaDataItaliana(p.data_checkout || p.checkout)}:</strong>
                      ${escapeHtml(p.nome_ospite || p.ospite_nome || 'Ospite')}
                      <span class="badge" style="font-size: 9.5px; padding: 1px 5px; ${p.stato === 'Confermata' ? 'background:#dcfce7; color:#166534;' : 'background:#dbeafe; color:#1e40af;'}">
                        ${p.stato === 'Confermata' ? 'Confermata' : '1ª Auth'}
                      </span>
                    </li>
                  `).join("")}
                </ul>
              `}
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- ELENCO RICHIESTE OSPITALITÀ -->
    <div class="card" style="margin-bottom: 16px;">
      <div class="flex-between" style="flex-wrap: wrap; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
        <div>
          <h3 class="card-title" style="margin: 0; font-size: 16px;">
            ${isMaster ? '📋 Tutte le Richieste di Ospitalità' : '📋 Le Mie Richieste di Ospitalità'}
          </h3>
          <span class="text-xs text-muted">
            ${isMaster ? 'Panoramica completa di tutte le richieste residenti con stato autorizzativo' : 'Stato delle tue richieste di prenotazione per ospiti'}
          </span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="caricaDatiBackend()" style="font-size: 11.5px;">
            🔄 Aggiorna
          </button>
        </div>
      </div>

      ${richiesteUtente.length === 0 ? `
        <div style="text-align: center; padding: 28px 14px; color: #64748b;">
          <div style="font-size: 38px; margin-bottom: 8px;">📭</div>
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Nessuna richiesta di ospitalità presente</div>
          <p style="font-size: 12.5px; max-width: 420px; margin: 0 auto 14px auto;">
            Puoi richiedere una delle 3 camere dedicate per ospitare familiari, sacerdoti o colleghi accademici per brevi soggiorni.
          </p>
          <button type="button" class="btn btn-primary btn-sm" onclick="apriModalNuovaAccoglienza()" style="background: #166534; border-color: #166534;">
            ➕ Invia Richiesta di Prenotazione
          </button>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${richiesteUtente.map(a => {
            const checkin = a.data_checkin || a.checkin || "";
            const checkout = a.data_checkout || a.checkout || "";
            const notti = calcolaNottiSoggiorno(checkin, checkout);
            const nomeOspite = a.nome_ospite || a.ospite_nome || "Ospite";
            const richiedente = a.richiedente_nome || a.nome_richiedente || a.richiedente_email || a.email_richiedente || "Residente";
            const stato = a.stato || "In Attesa 1a Autorizzazione";
            const camAss = a.camera_assegnata || "";
            const camPref = a.camera_preferita || a.camera_richiesta || "";
            const numPersone = parseInt(a.numero_ospiti || a.num_ospiti || 1, 10);
            const note = a.note || a.motivo || "";

            let statoBadge = "";
            if (stato === "Confermata") {
              statoBadge = `<span class="badge" style="background:#dcfce7; color:#166534; font-weight:700;">✓ Soggiorno Confermato</span>`;
            } else if (stato === "1a Autorizzazione Concessa") {
              statoBadge = `<span class="badge" style="background:#dbeafe; color:#1e40af; font-weight:700;">🔑 1ª Auth Concessa (${escapeHtml(camAss || 'Camera Assegnata')})</span>`;
            } else if (stato === "Rifiutata") {
              statoBadge = `<span class="badge" style="background:#fee2e2; color:#991b1b; font-weight:700;">✕ Rifiutata</span>`;
            } else {
              statoBadge = `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:700;">⏳ In Attesa 1ª Autorizzazione</span>`;
            }

            return `
              <div class="card-inner" style="border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; background: #ffffff;">
                <div class="flex-between" style="flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
                  <div class="flex-align" style="gap: 8px;">
                    <span style="font-size: 20px;">👤</span>
                    <div>
                      <strong style="font-size: 14px; color: #0f172a;">${escapeHtml(nomeOspite)}</strong>
                      ${isMaster ? `<span class="text-xs text-muted" style="margin-left: 6px;">(Richiesta di: ${escapeHtml(richiedente)})</span>` : ''}
                    </div>
                  </div>
                  <div>${statoBadge}</div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 12px; color: #475569; margin-bottom: 8px; background: #f8fafc; padding: 8px 10px; border-radius: 6px;">
                  <div>
                    <strong>Date:</strong> ${formattaDataItaliana(checkin)} ➜ ${formattaDataItaliana(checkout)}
                    <span class="text-xs text-muted">(${notti} ${notti === 1 ? 'notte' : 'notti'})</span>
                  </div>
                  <div>
                    <strong>Persone:</strong> ${numPersone} ${numPersone === 1 ? 'persona' : 'persone'}
                  </div>
                  <div>
                    <strong>Camera:</strong> ${camAss ? `<span style="color:#166534; font-weight:700;">${escapeHtml(camAss)}</span>` : (camPref ? `<span class="text-muted">Pref: ${escapeHtml(camPref)}</span>` : 'Nessuna preferenza')}
                  </div>
                  ${note ? `<div style="grid-column: 1 / -1;"><strong>Note / Motivo:</strong> ${escapeHtml(note)}</div>` : ''}
                </div>

                <!-- Dettagli Autorizzazioni Tracciate -->
                ${(a.auth1_email || a.auth2_email || a.autorizzato1_da || a.autorizzato2_da) ? `
                  <div style="font-size: 11.5px; color: #64748b; margin-bottom: 8px; padding-left: 4px;">
                    ${(a.auth1_email || a.autorizzato1_da) ? `<div>🔑 1ª Auth da: <strong>${escapeHtml((a.auth1_email || a.autorizzato1_da).split('@')[0])}</strong> ${a.auth1_data || a.data_autorizzazione1 ? `il ${formattaDataItaliana(a.auth1_data || a.data_autorizzazione1)}` : ''}</div>` : ''}
                    ${(a.auth2_email || a.autorizzato2_da) ? `<div>✓ 2ª Auth da: <strong>${escapeHtml((a.auth2_email || a.autorizzato2_da).split('@')[0])}</strong> ${a.auth2_data || a.data_autorizzazione2 ? `il ${formattaDataItaliana(a.auth2_data || a.data_autorizzazione2)}` : ''}</div>` : ''}
                  </div>
                ` : ''}

                <!-- Azioni Richiesta -->
                <div class="flex-between" style="flex-wrap: wrap; gap: 8px; border-top: 1px solid var(--border); padding-top: 8px; margin-top: 4px;">
                  <span class="text-xs text-muted">ID: ${escapeHtml(a.id || '')}</span>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${isMaster && stato === "In Attesa 1a Autorizzazione" ? `
                      <button type="button" class="btn btn-primary btn-sm" onclick="apriModalAutorizza1Accoglienza('${a.id}')" style="background: #166534; border-color: #166534; font-size: 11.5px; font-weight: 700;">
                        🔑 Assegna Camera (1ª Auth)
                      </button>
                      <button type="button" class="btn btn-secondary btn-sm" onclick="handleRifiutaAccoglienza('${a.id}')" style="color: #dc2626; border-color: #fca5a5; font-size: 11.5px;">
                        ✕ Rifiuta
                      </button>
                    ` : ''}

                    ${isMaster && stato === "1a Autorizzazione Concessa" ? `
                      <button type="button" class="btn btn-primary btn-sm" onclick="handleConfermaAutorizza2('${a.id}')" style="background: #2563eb; border-color: #2563eb; font-size: 11.5px; font-weight: 700;">
                        ✓ Conferma Definitiva (2ª Auth)
                      </button>
                      <button type="button" class="btn btn-secondary btn-sm" onclick="handleRifiutaAccoglienza('${a.id}')" style="color: #dc2626; border-color: #fca5a5; font-size: 11.5px;">
                        ✕ Rifiuta
                      </button>
                    ` : ''}

                    <button type="button" class="btn btn-secondary btn-sm" onclick="handleEliminaAccoglienza('${a.id}')" style="color: #dc2626; border-color: #fca5a5; font-size: 11px;">
                      🗑️ ${isMaster ? 'Elimina' : 'Annulla'}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    </div>

    <!-- GUIDA E REGOLAMENTO OSPITALITÀ -->
    <div class="card" style="background: #f8fafc; border: 1px solid #cbd5e1;">
      <h4 style="margin: 0 0 8px 0; font-size: 13.5px; color: #1e293b; display: flex; align-items: center; gap: 6px;">
        <span>ℹ️</span> <strong>Procedura e Regole di Ospitalità Residenza Newman:</strong>
      </h4>
      <div style="font-size: 12px; line-height: 1.55; color: #475569;">
        <ol style="margin: 0; padding-left: 20px;">
          <li><strong>Invio Richiesta:</strong> inoltra la richiesta con almeno 48 ore di anticipo indicando nome dell'ospite, date e numero di persone.</li>
          <li><strong>1ª Autorizzazione (Assegnazione Camera):</strong> il Master valuta la disponibilità e assegna formalmente una delle 3 camere dedicate.</li>
          <li><strong>2ª Autorizzazione (Conferma Direzione):</strong> la Direzione convalida definitivamente il soggiorno rilasciando la conferma.</li>
          <li><strong>Mensa per Ospiti:</strong> per prenotare i pasti per i tuoi ospiti, utilizza la scheda <strong>Mensa</strong> indicando il numero di ospiti (fino a 5 coperti).</li>
          <li><strong>Ritiro Chiavi:</strong> le chiavi della camera vanno ritirate in Portineria all'arrivo dell'ospite negli orari di servizio (07:00 - 22:30).</li>
        </ol>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// ----------------------------------------------------------------------------
// MODAL NUOVA RICHIESTA ACCOGLIENZA
// ----------------------------------------------------------------------------
function apriModalNuovaAccoglienza() {
  if (!appState.user) {
    mostraToast("Effettua l'accesso per richiedere l'ospitalità in camera", "info");
    mostraModalAuth(true);
    return;
  }

  const modal = document.getElementById("modal-nuova-accoglienza");
  if (!modal) return;

  // Aggiorna nomi camere nel select preferenze
  const c1 = getNomeCamera(1);
  const c2 = getNomeCamera(2);
  const c3 = getNomeCamera(3);

  const opt1 = document.getElementById("opt-cam-1");
  if (opt1) { opt1.value = c1; opt1.textContent = c1; }
  const opt2 = document.getElementById("opt-cam-2");
  if (opt2) { opt2.value = c2; opt2.textContent = c2; }
  const opt3 = document.getElementById("opt-cam-3");
  if (opt3) { opt3.value = c3; opt3.textContent = c3; }

  // Set min checkin date to today
  const oggiYMD = formatYMD(new Date());
  const inCheckin = document.getElementById("acc-checkin");
  const inCheckout = document.getElementById("acc-checkout");
  if (inCheckin) {
    inCheckin.min = oggiYMD;
    if (!inCheckin.value) inCheckin.value = oggiYMD;
  }
  if (inCheckout) {
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    inCheckout.min = formatYMD(domani);
    if (!inCheckout.value) inCheckout.value = formatYMD(domani);
  }

  modal.style.display = "flex";
}

function chiudiModalNuovaAccoglienza() {
  const modal = document.getElementById("modal-nuova-accoglienza");
  if (modal) modal.style.display = "none";
}

function aggiornaMinCheckout() {
  const inCheckin = document.getElementById("acc-checkin");
  const inCheckout = document.getElementById("acc-checkout");
  if (inCheckin && inCheckout && inCheckin.value) {
    const d = new Date(inCheckin.value + "T00:00:00");
    d.setDate(d.getDate() + 1);
    const minOut = formatYMD(d);
    inCheckout.min = minOut;
    if (inCheckout.value && inCheckout.value <= inCheckin.value) {
      inCheckout.value = minOut;
    }
  }
}

async function handleInviaRichiestaAccoglienza(event) {
  if (event) event.preventDefault();

  if (!appState.user) {
    mostraToast("Effettua l'accesso per richiedere l'ospitalità", "warning");
    mostraModalAuth(true);
    return;
  }

  const nomeOspite = document.getElementById("acc-ospite-nome")?.value?.trim();
  const checkin = document.getElementById("acc-checkin")?.value;
  const checkout = document.getElementById("acc-checkout")?.value;
  const numOspiti = document.getElementById("acc-num-ospiti")?.value || "1";
  const cameraPreferita = document.getElementById("acc-camera-preferita")?.value || "";
  const note = document.getElementById("acc-note")?.value?.trim() || "";

  if (!nomeOspite) {
    mostraToast("Inserisci il nome e cognome dell'ospite", "warning");
    return;
  }
  if (!checkin || !checkout) {
    mostraToast("Seleziona data di check-in e check-out", "warning");
    return;
  }
  if (checkout <= checkin) {
    mostraToast("La data di check-out deve essere successiva a quella di check-in", "warning");
    return;
  }

  const btnSubmit = document.getElementById("btn-submit-accoglienza");
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerText = "⏳ Invio richiesta...";
  }

  try {
    const payload = {
      email: appState.user.email,
      nome: appState.user.nome,
      nome_ospite: nomeOspite,
      numero_ospiti: parseInt(numOspiti, 10),
      data_checkin: checkin,
      data_checkout: checkout,
      camera_preferita: cameraPreferita,
      motivo: note,
      note: note
    };

    const res = await callApi("richiediAccoglienza", payload);

    if (res.success) {
      mostraToast("✅ Richiesta di ospitalità inviata! In attesa della 1ª autorizzazione Master.", "success");
      chiudiModalNuovaAccoglienza();
      document.getElementById("form-nuova-accoglienza")?.reset();

      // Aggiorna stato locale
      const nuovaRichiesta = res.item || {
        id: res.id || ("ACC_" + Date.now().toString().slice(-6)),
        data_richiesta: new Date().toISOString(),
        richiedente_email: appState.user.email,
        richiedente_nome: appState.user.nome,
        nome_ospite: nomeOspite,
        numero_ospiti: parseInt(numOspiti, 10),
        data_checkin: checkin,
        data_checkout: checkout,
        camera_preferita: cameraPreferita,
        camera_assegnata: "",
        stato: "In Attesa 1a Autorizzazione",
        note: note
      };

      if (!appState.accoglienzaList) appState.accoglienzaList = [];
      appState.accoglienzaList.unshift(nuovaRichiesta);

      renderAccoglienzaView();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile inviare la richiesta"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete durante l'invio della richiesta", "error");
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "📨 Invia Richiesta di Prenotazione";
    }
  }
}

// ----------------------------------------------------------------------------
// MODAL 1ª AUTORIZZAZIONE MASTER: ASSEGNAZIONE CAMERA
// ----------------------------------------------------------------------------
function apriModalAutorizza1Accoglienza(id) {
  if (!id) return;
  const acc = (appState.accoglienzaList || []).find(a => String(a.id) === String(id));
  if (!acc) {
    mostraToast("Richiesta non trovata", "warning");
    return;
  }

  const modal = document.getElementById("modal-autorizza1-accoglienza");
  if (!modal) return;

  const infoEl = document.getElementById("modal-autorizza1-info");
  const idInput = document.getElementById("auth1-richiesta-id");
  const camSelect = document.getElementById("auth1-camera-assegnata");

  if (idInput) idInput.value = id;

  // Aggiorna nomi camere nel select
  const c1 = getNomeCamera(1);
  const c2 = getNomeCamera(2);
  const c3 = getNomeCamera(3);

  const opt1 = document.getElementById("auth1-opt-cam-1");
  if (opt1) { opt1.value = c1; opt1.textContent = c1; }
  const opt2 = document.getElementById("auth1-opt-cam-2");
  if (opt2) { opt2.value = c2; opt2.textContent = c2; }
  const opt3 = document.getElementById("auth1-opt-cam-3");
  if (opt3) { opt3.value = c3; opt3.textContent = c3; }

  // Pre-seleziona camera richiesta se corrisponde
  const pref = acc.camera_preferita || acc.camera_richiesta || "";
  if (camSelect) {
    if (pref === c1 || pref === "Camera 1") camSelect.value = c1;
    else if (pref === c2 || pref === "Camera 2") camSelect.value = c2;
    else if (pref === c3 || pref === "Camera 3") camSelect.value = c3;
    else camSelect.value = c1;
  }

  const checkin = acc.data_checkin || acc.checkin;
  const checkout = acc.data_checkout || acc.checkout;
  const notti = calcolaNottiSoggiorno(checkin, checkout);

  if (infoEl) {
    infoEl.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">
        Ospite: ${escapeHtml(acc.nome_ospite || acc.ospite_nome || 'Ospite')}
      </div>
      <div class="text-xs text-muted">
        Richiedente: <strong>${escapeHtml(acc.richiedente_nome || acc.nome_richiedente || acc.richiedente_email || 'Residente')}</strong>
      </div>
      <div style="margin-top: 6px; font-size: 12px; color: #334155;">
        📅 <strong>Date:</strong> ${formattaDataItaliana(checkin)} ➜ ${formattaDataItaliana(checkout)} (${notti} ${notti === 1 ? 'notte' : 'notti'})<br>
        👥 <strong>Persone:</strong> ${acc.numero_ospiti || acc.num_ospiti || 1}<br>
        ${pref ? `🏷️ <strong>Preferenza indicata:</strong> ${escapeHtml(pref)}<br>` : ''}
        ${acc.note ? `💬 <strong>Note:</strong> ${escapeHtml(acc.note)}` : ''}
      </div>
    `;
  }

  modal.style.display = "flex";
}

function chiudiModalAutorizza1Accoglienza() {
  const modal = document.getElementById("modal-autorizza1-accoglienza");
  if (modal) modal.style.display = "none";
}

async function handleConfermaAutorizza1(event) {
  if (event) event.preventDefault();

  const id = document.getElementById("auth1-richiesta-id")?.value;
  const cameraAssegnata = document.getElementById("auth1-camera-assegnata")?.value;
  const noteMaster = document.getElementById("auth1-note-master")?.value?.trim() || "";

  if (!id || !cameraAssegnata) {
    mostraToast("Seleziona la camera da assegnare", "warning");
    return;
  }

  const btnSubmit = document.getElementById("btn-conferma-auth1");
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerText = "⏳ Assegnazione in corso...";
  }

  const masterEmail = appState.user?.email || "Master";

  try {
    const res = await callApi("autorizza1Accoglienza", {
      id,
      camera_assegnata: cameraAssegnata,
      note: noteMaster,
      approvatoreEmail: masterEmail
    });

    if (res.success) {
      mostraToast("✅ 1ª Autorizzazione concessa! Camera assegnata: " + cameraAssegnata, "success");
      chiudiModalAutorizza1Accoglienza();

      // Aggiorna localmente
      const acc = (appState.accoglienzaList || []).find(a => String(a.id) === String(id));
      if (acc) {
        acc.stato = "1a Autorizzazione Concessa";
        acc.camera_assegnata = cameraAssegnata;
        acc.auth1_email = masterEmail;
        acc.auth1_data = new Date().toISOString();
        if (noteMaster) acc.auth1_note = noteMaster;
      }

      renderAccoglienzaView();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile concedere 1ª autorizzazione"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete durante la prima autorizzazione", "error");
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "✓ Concedi 1ª Autorizzazione";
    }
  }
}

// ----------------------------------------------------------------------------
// 2ª AUTORIZZAZIONE MASTER: CONFERMA DEFINITIVA
// ----------------------------------------------------------------------------
async function handleConfermaAutorizza2(id) {
  if (!id) return;
  const acc = (appState.accoglienzaList || []).find(a => String(a.id) === String(id));
  const nomeOspite = acc?.nome_ospite || acc?.ospite_nome || "l'ospite";

  if (!confirm(`Confermi la 2ª autorizzazione definitiva per il soggiorno di ${nomeOspite}?`)) {
    return;
  }

  const masterEmail = appState.user?.email || "Master";

  try {
    const res = await callApi("autorizza2Accoglienza", {
      id,
      approvatoreEmail: masterEmail
    });

    if (res.success) {
      mostraToast("✅ 2ª Autorizzazione completata! Soggiorno definitivamente confermato.", "success");
      if (acc) {
        acc.stato = "Confermata";
        acc.auth2_email = masterEmail;
        acc.auth2_data = new Date().toISOString();
      }
      renderAccoglienzaView();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile completare 2ª autorizzazione"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete durante la 2ª autorizzazione", "error");
  }
}

// ----------------------------------------------------------------------------
// RIFIUTO RICHIESTA ACCOGLIENZA
// ----------------------------------------------------------------------------
async function handleRifiutaAccoglienza(id) {
  if (!id) return;
  const motivo = prompt("Motivo del rifiuto della richiesta di ospitalità (opzionale):");
  if (motivo === null) return; // Annullato da utente

  const masterEmail = appState.user?.email || "Master";

  try {
    const res = await callApi("rifiutaAccoglienza", {
      id,
      motivo: motivo || "",
      note: motivo || "",
      approvatoreEmail: masterEmail
    });

    if (res.success) {
      mostraToast("Richiesta di ospitalità contrassegnata come Rifiutata", "info");
      const acc = (appState.accoglienzaList || []).find(a => String(a.id) === String(id));
      if (acc) {
        acc.stato = "Rifiutata";
        acc.auth1_note = "Rifiutata da " + masterEmail + (motivo ? ": " + motivo : "");
      }
      renderAccoglienzaView();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile rifiutare la richiesta"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete durante il rifiuto della richiesta", "error");
  }
}

// ----------------------------------------------------------------------------
// ELIMINAZIONE / CANCELLAZIONE RICHIESTA ACCOGLIENZA
// ----------------------------------------------------------------------------
async function handleEliminaAccoglienza(id) {
  if (!id) return;
  if (!confirm("Confermi di voler eliminare/annullare questa richiesta di ospitalità?")) {
    return;
  }

  try {
    const res = await callApi("cancellaAccoglienza", { id });
    if (res.success) {
      mostraToast("Richiesta di ospitalità eliminata", "info");
      appState.accoglienzaList = (appState.accoglienzaList || []).filter(a => String(a.id) !== String(id));
      renderAccoglienzaView();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res.error || "Impossibile eliminare la richiesta"), "error");
    }
  } catch (err) {
    mostraToast("Errore durante l'eliminazione della richiesta", "error");
  }
}

// ----------------------------------------------------------------------------
// SALVATAGGIO CONFIGURAZIONE CAMERE MASTER
// ----------------------------------------------------------------------------
async function handleSalvaConfigurazioneCamere(event) {
  if (event) event.preventDefault();

  const cam1 = document.getElementById("cfg-camera-1")?.value?.trim() || "Camera Newman";
  const cam2 = document.getElementById("cfg-camera-2")?.value?.trim() || "Camera San Filippo Neri";
  const cam3 = document.getElementById("cfg-camera-3")?.value?.trim() || "Camera Santa Teresa";
  const maxOspiti = document.getElementById("cfg-max-ospiti-mensa")?.value?.trim() || "5";

  try {
    const res = await callApi("aggiornaConfig", {
      Nome_Camera_1: cam1,
      Nome_Camera_2: cam2,
      Nome_Camera_3: cam3,
      Max_Ospiti_Mensa: maxOspiti
    });

    if (res.success) {
      appState.cachedConfig = appState.cachedConfig || {};
      appState.cachedConfig.Nome_Camera_1 = cam1;
      appState.cachedConfig.Nome_Camera_2 = cam2;
      appState.cachedConfig.Nome_Camera_3 = cam3;
      appState.cachedConfig.Max_Ospiti_Mensa = maxOspiti;

      mostraToast("✅ Nomi delle camere e regole salvati con successo!", "success");
      renderAccoglienzaView();
      if (document.getElementById("master-dynamic-content")) {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore nel salvataggio della configurazione: " + (res.error || ""), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete durante il salvataggio della configurazione camere", "error");
  }
}

// Esposizione globale funzioni Accoglienza
window.renderAccoglienzaView = renderAccoglienzaView;
window.apriModalNuovaAccoglienza = apriModalNuovaAccoglienza;
window.chiudiModalNuovaAccoglienza = chiudiModalNuovaAccoglienza;
window.aggiornaMinCheckout = aggiornaMinCheckout;
window.handleInviaRichiestaAccoglienza = handleInviaRichiestaAccoglienza;
window.apriModalAutorizza1Accoglienza = apriModalAutorizza1Accoglienza;
window.chiudiModalAutorizza1Accoglienza = chiudiModalAutorizza1Accoglienza;
window.handleConfermaAutorizza1 = handleConfermaAutorizza1;
window.handleConfermaAutorizza2 = handleConfermaAutorizza2;
window.handleRifiutaAccoglienza = handleRifiutaAccoglienza;
window.handleEliminaAccoglienza = handleEliminaAccoglienza;
window.handleSalvaConfigurazioneCamere = handleSalvaConfigurazioneCamere;

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
  return Boolean(appState.user.perm_admin || appState.user.perm_mensa || appState.user.perm_manutenzione || appState.user.perm_spazi);
}

window.getDestinatariNotifiche = function(tipo) {
  const destinatari = [];
  const utenti = appState.tuttiUtenti || [];

  utenti.forEach(u => {
    const email = String(u.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) return;

    if (tipo === "manutenzione") {
      if ((u.perm_manutenzione || u.perm_admin) && u.notif_manutenzione) {
        if (!destinatari.includes(email)) destinatari.push(email);
      }
    } else if (tipo === "spazi") {
      if ((u.perm_spazi || u.perm_admin) && u.notif_spazi) {
        if (!destinatari.includes(email)) destinatari.push(email);
      }
    } else {
      if (u.perm_admin || u.notif_manutenzione || u.notif_spazi) {
        if (!destinatari.includes(email)) destinatari.push(email);
      }
    }
  });

  if (destinatari.length === 0) {
    const raw = (appState.cachedConfig && appState.cachedConfig.Email_Notifiche_Master) || "donandreadotti@gmail.com";
    raw.split(",").forEach(e => {
      const em = e.trim().toLowerCase();
      if (em.includes("@") && !destinatari.includes(em)) destinatari.push(em);
    });
  }

  return destinatari;
};

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
      if (res.accoglienza) appState.accoglienzaList = res.accoglienza;
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

// ----------------------------------------------------------------------------
// NAVIGAZIONE SCHEDE MASTER (ORIZZONTALE / CAROSELLO)
// ----------------------------------------------------------------------------
window.cambiaSchedaMaster = function(tabId) {
  appState.masterActiveTab = tabId;
  appState.masterVistaTutto = false;
  renderMasterSection();
  const el = document.getElementById(`master-tab-btn-${tabId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }
};

window.scrollMasterTabs = function(direction) {
  const container = document.getElementById("master-tabs-scroll-container");
  if (container) {
    container.scrollBy({ left: direction * 220, behavior: "smooth" });
  }
};

window.navigaSchedaMaster = function(step) {
  const tabs = window._masterTabsDisponibili || [];
  if (tabs.length === 0) return;
  const currentIdx = tabs.findIndex(t => t.id === appState.masterActiveTab);
  let nextIdx = (currentIdx === -1 ? 0 : currentIdx) + step;
  if (nextIdx < 0) nextIdx = 0;
  if (nextIdx >= tabs.length) nextIdx = tabs.length - 1;
  window.cambiaSchedaMaster(tabs[nextIdx].id);
};

window.toggleVistaMasterSchede = function() {
  appState.masterVistaTutto = !appState.masterVistaTutto;
  renderMasterSection();
};

function renderMasterSection() {
  const container = document.getElementById("master-dynamic-content");
  if (!container || !appState.user) return;

  const perm_admin = Boolean(appState.user && appState.user.perm_admin);
  const perm_mensa = Boolean(appState.user && (appState.user.perm_mensa || appState.user.perm_admin));
  const perm_manutenzione = Boolean(appState.user && (appState.user.perm_manutenzione || appState.user.perm_admin));
  const perm_spazi = Boolean(appState.user && (appState.user.perm_spazi || appState.user.perm_admin));

  const tuttiUtenti = appState.tuttiUtenti || [];
  const utentiInAttesa = appState.utentiInAttesa || [];
  const mensaBookings = appState.mensaBookings || [];
  const prenotazioniSpazi = appState.prenotazioniSpazi || [];
  const tutteSegnalazioni = appState.guasti || appState.manutenzioneList || [];
  const bachecaItems = appState.bacheca || [];

  const inAttesaSpazi = prenotazioniSpazi.filter(p => p.stato === "In Attesa");
  const guastiAperti = tutteSegnalazioni.filter(g => g.stato !== "Risolto");
  const accoglienzaList = appState.accoglienzaList || [];
  const inAttesaAccoglienza = accoglienzaList.filter(a => a.stato === "In Attesa 1a Autorizzazione" || a.stato === "1a Autorizzazione Concessa");

  // Calcolo schede disponibili in base ai permessi
  const tabsDisponibili = [];
  if (perm_admin) {
    tabsDisponibili.push({ id: "utenti", label: "Residenti & Ruoli", icon: "👥", badge: utentiInAttesa.length, color: "#d97706" });
    tabsDisponibili.push({ id: "accoglienza", label: "Accoglienza & Camere", icon: "🛏️", badge: inAttesaAccoglienza.length, color: "#166534" });
  }
  if (perm_spazi) {
    tabsDisponibili.push({ id: "spazi", label: "Ambienti & Approvazioni", icon: "⛪", badge: inAttesaSpazi.length, color: "#9d174d" });
  }
  if (perm_mensa) {
    tabsDisponibili.push({ id: "mensa", label: "Mensa & Pasti", icon: "🍽️", badge: 0, color: "#ea580c" });
  }
  if (perm_manutenzione) {
    tabsDisponibili.push({ id: "manutenzione", label: "Manutenzione & Guasti", icon: "🛠️", badge: guastiAperti.length, color: "#2563eb" });
  }
  if (perm_admin) {
    tabsDisponibili.push({ id: "sistema", label: "Calendario & Fogli", icon: "⚙️", badge: 0, color: "#059669" });
  }

  window._masterTabsDisponibili = tabsDisponibili;

  if (!appState.masterActiveTab || !tabsDisponibili.some(t => t.id === appState.masterActiveTab)) {
    appState.masterActiveTab = tabsDisponibili[0]?.id || "utenti";
  }

  const isVistaTutto = Boolean(appState.masterVistaTutto);
  const activeTab = appState.masterActiveTab;
  const currentTabIndex = tabsDisponibili.findIndex(t => t.id === activeTab);

  let html = `
    <!-- BARRA DI COMANDO RAPIDO MASTER -->
    <div class="card" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #fff; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.12); padding: 16px 18px; border-radius: 10px;">
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
            <span>➕</span> Inserisci Appuntamento
          </button>
          <button type="button" class="btn btn-secondary" onclick="apriModalCodiceGas()" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 6px;">
            <span>📊</span> Guida Google Fogli
          </button>
        </div>
      </div>
    </div>

    <!-- ==================================================================
         BOTTONIERA DI COMANDO AMBIENTI E SEZIONI MASTER
         ================================================================== -->
    <div class="master-bottoniera-deck" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
        <div style="font-size: 13px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 6px;">
          <span>🎛️</span> <span>Bottoniera Ambienti &amp; Gestione Master:</span>
        </div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button type="button" class="btn btn-sm btn-outline" onclick="toggleVistaMasterSchede()" style="font-size: 11px; padding: 4px 10px; border-color: #cbd5e1; font-weight: 600;">
            ${isVistaTutto ? '🎛️ Torna a Bottoniera' : '📜 Mostra Tutte le Sezioni'}
          </button>
        </div>
      </div>

      <!-- GRIGLIA TASTI BOTTONIERA (TACTILE BUTTON PAD) -->
      <div class="master-bottoniera-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
        ${tabsDisponibili.map(t => {
          const isActive = !isVistaTutto && t.id === activeTab;
          return `
            <button type="button"
              id="master-tab-btn-${t.id}"
              class="master-key-btn"
              onclick="cambiaSchedaMaster('${t.id}')"
              style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 14px 10px; border-radius: 10px; text-align: center; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); ${
                isActive
                  ? `background: ${t.color}; color: #ffffff; border: 2px solid ${t.color}; box-shadow: 0 4px 12px rgba(0,0,0,0.18); transform: translateY(-2px);`
                  : `background: #f8fafc; color: #1e293b; border: 2px solid #e2e8f0;`
              }"
            >
              ${t.badge > 0 ? `
                <span style="position: absolute; top: 6px; right: 6px; background: ${isActive ? '#ffffff' : t.color}; color: ${isActive ? t.color : '#ffffff'}; font-size: 10px; font-weight: 900; padding: 2px 7px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                  ${t.badge}
                </span>
              ` : ''}
              <span style="font-size: 24px; line-height: 1;">${t.icon}</span>
              <span style="font-size: 12px; font-weight: 700; line-height: 1.25;">${escapeHtml(t.label)}</span>
              ${isActive ? `<span style="width: 22px; height: 3px; background: #ffffff; border-radius: 2px; margin-top: 2px;"></span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // ==========================================================================
  // SCHEDA 1: RESIDENTI & RUOLI MASTER (ADMIN)
  // ==========================================================================
  if (perm_admin && (isVistaTutto || activeTab === "utenti")) {
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
                <div class="permessi-grid" style="display: flex; gap: 8px; font-size: 12px; font-weight: 600; flex-wrap: wrap;">
                  <label><input type="checkbox" id="p-mensa-${escapeHtml(u.email)}"> Mensa</label>
                  <label><input type="checkbox" id="p-manut-${escapeHtml(u.email)}"> Manutenzione</label>
                  <label><input type="checkbox" id="p-spazi-${escapeHtml(u.email)}" checked> Spazi</label>
                  <label><input type="checkbox" id="p-admin-${escapeHtml(u.email)}"> Admin</label>
                  <label style="color: #2563eb;" title="Invia notifica email quando residenti aprono segnalazioni di manutenzione"><input type="checkbox" id="p-notif-manut-${escapeHtml(u.email)}"> 🔔 Notif. Manut.</label>
                  <label style="color: #9d174d;" title="Invia notifica email quando residenti richiedono Chiesa o Sala TV"><input type="checkbox" id="p-notif-spazi-${escapeHtml(u.email)}"> 🔔 Notif. Ambienti</label>
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
                  <th style="color: #ea580c; text-align: center;" title="Abilita/disabilita accesso alla mensa comunitaria">🍽️ Utente Mensa</th>
                  <th>Master Mensa</th>
                  <th>Manutenzione</th>
                  <th>Spazi</th>
                  <th>Supermaster</th>
                  <th style="color: #1d4ed8; text-align: center;" title="Riceve notifica email per ogni nuova segnalazione di manutenzione">🔔 Notif. Manut.</th>
                  <th style="color: #9d174d; text-align: center;" title="Riceve notifica email per ogni nuova richiesta di Chiesa o Sala TV">🔔 Notif. Ambienti</th>
                  <th>Password</th>
                  <th>Azione</th>
                </tr>
              </thead>
              <tbody>
                ${tuttiUtenti.length === 0 ? '<tr><td colspan="11" style="text-align:center; padding: 14px; color: #64748b;">Nessun utente caricato.</td></tr>' : ''}
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
                      <input type="checkbox" id="edit-is-mensa-${escapeHtml(u.email)}" ${u.is_utente_mensa !== false ? 'checked' : ''} title="Abilitato alla Mensa comunitaria">
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
                    <td style="text-align: center;">
                      <input type="checkbox" id="edit-notif-manut-${escapeHtml(u.email)}" ${u.notif_manutenzione ? 'checked' : ''} title="Invia notifica email per nuove segnalazioni di manutenzione">
                    </td>
                    <td style="text-align: center;">
                      <input type="checkbox" id="edit-notif-spazi-${escapeHtml(u.email)}" ${u.notif_spazi ? 'checked' : ''} title="Invia notifica email per nuove richieste Chiesa o Sala TV">
                    </td>
                    <td style="font-size: 11px; white-space: nowrap;">
                      ${u.password ? `<span style="font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600; color: #0f172a; border: 1px solid #e2e8f0;">${escapeHtml(u.password)}</span>` : '<span class="text-xs text-muted">newman2026</span>'}
                    </td>
                    <td>
                      <div style="display: flex; gap: 4px; align-items: center;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="salvaRuoliUtente('${escapeHtml(u.email)}')" style="font-size: 11px; padding: 4px 7px; font-weight: 600;" title="Salva modifiche ruoli e notifiche">
                          💾 Salva
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" onclick="resetPasswordUtenteMaster('${escapeHtml(u.email)}', '${escapeHtml(u.nome || u.email)}')" style="font-size: 11px; padding: 4px 7px; font-weight: 600; color: #b45309; border-color: #fde68a;" title="Reimposta la password per questo utente">
                          🔑 Reset
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" onclick="eliminaUtente('${escapeHtml(u.email)}', '${escapeHtml(u.nome || u.email)}')" style="font-size: 11px; padding: 4px 7px; font-weight: 600; color: #dc2626; border-color: #fca5a5;" title="Rimuovi utente dal sistema e dal foglio Google">
                          🗑️
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
            Puoi inserire o incollare un elenco di residenti (uno per riga) nel formato: <code>email, Nome Cognome, eventuale_password</code>.<br>
            Se omessa, la password iniziale sarà automaticamente <code>newman2026</code>.
          </p>
          <form onsubmit="importaElencoUtentiMaster(event)">
            <textarea id="import-utenti-textarea" class="input-textarea" rows="3" style="font-size: 12.5px; font-family: monospace;" placeholder="donmario@newman.it, Don Mario Rossi, pass123&#10;francesco@newman.it, Francesco Bianchi"></textarea>
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
    `;
  }

  // ==========================================================================
  // SCHEDA ACCOGLIENZA: GESTIONE OSPITALITÀ, CAMERE E DOPPIA AUTORIZZAZIONE
  // ==========================================================================
  if (perm_admin && (isVistaTutto || activeTab === "accoglienza")) {
    const cam1 = getNomeCamera(1);
    const cam2 = getNomeCamera(2);
    const cam3 = getNomeCamera(3);
    const maxOspMensa = appState.cachedConfig?.Max_Ospiti_Mensa || "5";

    const inAttesa1 = accoglienzaList.filter(a => (a.stato || "") === "In Attesa 1a Autorizzazione");
    const inAttesa2 = accoglienzaList.filter(a => (a.stato || "") === "1a Autorizzazione Concessa");
    const confermate = accoglienzaList.filter(a => (a.stato || "") === "Confermata");
    const altre = accoglienzaList.filter(a => (a.stato || "") === "Rifiutata");

    html += `
      <!-- BLOCCO GESTIONE ACCOGLIENZA E CAMERE OSPITI -->
      <div class="master-block card" id="master-accoglienza-card" style="border-top: 4px solid #166534;">
        <div class="master-header flex-between" style="flex-wrap: wrap; gap: 8px;">
          <div class="flex-align" style="gap: 8px;">
            <span style="font-size: 22px;">🛏️</span>
            <div>
              <h3 class="card-title" style="margin: 0;">Gestione Camere Ospitalità & Autorizzazioni</h3>
              <span class="text-xs text-muted">Procedura a doppia autorizzazione (1ª Assegnazione Camera & 2ª Conferma Definitiva)</span>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="apriModalNuovaAccoglienza()" style="background: #166534; border-color: #166534; font-size: 11px; font-weight: 700;">
            ➕ Nuova Richiesta Rapida
          </button>
        </div>

        <!-- CONFIGURAZIONE NOMI CAMERE E MASSIMO OSPITI -->
        <div class="card-inner" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin: 12px 0;">
          <h4 style="margin: 0 0 10px 0; color: #166534; font-size: 13.5px; display: flex; align-items: center; gap: 6px;">
            <span>⚙️</span> <strong>Nomi delle 3 Camere Dedicate & Regole Ospiti:</strong>
          </h4>
          <form onsubmit="handleSalvaConfigurazioneCamere(event)">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 10px;">
              <div class="form-group">
                <label for="cfg-camera-1" class="form-label" style="font-size: 11.5px; font-weight: 700;">Nome Camera 1</label>
                <input type="text" id="cfg-camera-1" class="input-text" value="${escapeHtml(cam1)}" required style="font-size: 12px;">
              </div>
              <div class="form-group">
                <label for="cfg-camera-2" class="form-label" style="font-size: 11.5px; font-weight: 700;">Nome Camera 2</label>
                <input type="text" id="cfg-camera-2" class="input-text" value="${escapeHtml(cam2)}" required style="font-size: 12px;">
              </div>
              <div class="form-group">
                <label for="cfg-camera-3" class="form-label" style="font-size: 11.5px; font-weight: 700;">Nome Camera 3</label>
                <input type="text" id="cfg-camera-3" class="input-text" value="${escapeHtml(cam3)}" required style="font-size: 12px;">
              </div>
              <div class="form-group">
                <label for="cfg-max-ospiti-mensa" class="form-label" style="font-size: 11.5px; font-weight: 700;">Max Ospiti Mensa / Residente</label>
                <input type="number" id="cfg-max-ospiti-mensa" class="input-text" value="${escapeHtml(maxOspMensa)}" min="1" max="20" required style="font-size: 12px;">
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-sm" style="background: #166534; border-color: #166534; font-size: 11.5px; font-weight: 700;">
              💾 Salva Nomi Camere & Regole
            </button>
          </form>
        </div>

        <!-- 1. RICHIESTE IN ATTESA DELLA 1ª AUTORIZZAZIONE -->
        <div style="margin-top: 14px;">
          <h4 style="font-size: 13.5px; font-weight: 800; color: #92400e; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
            <span>⏳</span> In Attesa 1ª Autorizzazione (Assegnazione Camera) (${inAttesa1.length})
          </h4>
          <div class="table-responsive">
            <table class="master-table">
              <thead>
                <tr>
                  <th>Ospite</th>
                  <th>Richiedente</th>
                  <th>Date Soggiorno</th>
                  <th>Persone</th>
                  <th>Preferenza</th>
                  <th>Note</th>
                  <th style="text-align: right;">Azioni</th>
                </tr>
              </thead>
              <tbody>
                ${inAttesa1.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding: 12px; color: #64748b;">Nessuna richiesta in attesa di 1ª autorizzazione.</td></tr>' : ''}
                ${inAttesa1.map(a => {
                  const checkin = a.data_checkin || a.checkin || "";
                  const checkout = a.data_checkout || a.checkout || "";
                  const notti = calcolaNottiSoggiorno(checkin, checkout);
                  const ospite = a.nome_ospite || a.ospite_nome || "Ospite";
                  const richiedente = a.richiedente_nome || a.nome_richiedente || a.richiedente_email || "Residente";
                  const pref = a.camera_preferita || a.camera_richiesta || "Nessuna";
                  return `
                    <tr>
                      <td><strong>${escapeHtml(ospite)}</strong></td>
                      <td>${escapeHtml(richiedente)}</td>
                      <td>
                        <strong>${formattaDataItaliana(checkin)}</strong> ➜ <strong>${formattaDataItaliana(checkout)}</strong>
                        <div class="text-xs text-muted">(${notti} ${notti === 1 ? 'notte' : 'notti'})</div>
                      </td>
                      <td style="text-align: center;">${a.numero_ospiti || a.num_ospiti || 1}</td>
                      <td><span class="badge" style="background: #f1f5f9; color: #475569;">${escapeHtml(pref)}</span></td>
                      <td style="font-size: 11.5px; max-width: 180px;">${escapeHtml(a.note || a.motivo || '-')}</td>
                      <td style="text-align: right; white-space: nowrap;">
                        <button type="button" class="btn btn-primary btn-sm" onclick="apriModalAutorizza1Accoglienza('${a.id}')" style="background: #166534; border-color: #166534; font-size: 11px; font-weight: 700; padding: 3px 8px;">
                          🔑 Assegna Camera
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="handleRifiutaAccoglienza('${a.id}')" style="color: #dc2626; border-color: #fca5a5; font-size: 11px; padding: 3px 8px;">
                          ✕ Rifiuta
                        </button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. RICHIESTE IN ATTESA DELLA 2ª AUTORIZZAZIONE (CONFERMA DEFINITIVA) -->
        <div style="margin-top: 18px;">
          <h4 style="font-size: 13.5px; font-weight: 800; color: #1e40af; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
            <span>🔑</span> In Attesa 2ª Autorizzazione (Conferma Definitiva Direzione) (${inAttesa2.length})
          </h4>
          <div class="table-responsive">
            <table class="master-table">
              <thead>
                <tr>
                  <th>Ospite</th>
                  <th>Richiedente</th>
                  <th>Date Soggiorno</th>
                  <th>Camera Assegnata</th>
                  <th>1ª Auth da</th>
                  <th>Note</th>
                  <th style="text-align: right;">Azioni</th>
                </tr>
              </thead>
              <tbody>
                ${inAttesa2.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding: 12px; color: #64748b;">Nessuna richiesta in attesa di 2ª autorizzazione.</td></tr>' : ''}
                ${inAttesa2.map(a => {
                  const checkin = a.data_checkin || a.checkin || "";
                  const checkout = a.data_checkout || a.checkout || "";
                  const notti = calcolaNottiSoggiorno(checkin, checkout);
                  const ospite = a.nome_ospite || a.ospite_nome || "Ospite";
                  const richiedente = a.richiedente_nome || a.nome_richiedente || a.richiedente_email || "Residente";
                  const camAss = a.camera_assegnata || "Camera 1";
                  const auth1Da = a.auth1_email || a.autorizzato1_da || "Master";
                  return `
                    <tr>
                      <td><strong>${escapeHtml(ospite)}</strong></td>
                      <td>${escapeHtml(richiedente)}</td>
                      <td>
                        <strong>${formattaDataItaliana(checkin)}</strong> ➜ <strong>${formattaDataItaliana(checkout)}</strong>
                        <div class="text-xs text-muted">(${notti} ${notti === 1 ? 'notte' : 'notti'})</div>
                      </td>
                      <td><span class="badge" style="background: #dbeafe; color: #1e40af; font-weight: 700;">${escapeHtml(camAss)}</span></td>
                      <td style="font-size: 11px;">${escapeHtml(auth1Da.split('@')[0])}</td>
                      <td style="font-size: 11.5px; max-width: 180px;">${escapeHtml(a.note || a.motivo || '-')}</td>
                      <td style="text-align: right; white-space: nowrap;">
                        <button type="button" class="btn btn-primary btn-sm" onclick="handleConfermaAutorizza2('${a.id}')" style="background: #2563eb; border-color: #2563eb; font-size: 11px; font-weight: 700; padding: 3px 8px;">
                          ✓ Conferma Definitiva
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="handleRifiutaAccoglienza('${a.id}')" style="color: #dc2626; border-color: #fca5a5; font-size: 11px; padding: 3px 8px;">
                          ✕ Rifiuta
                        </button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. SOGGIORNI CONFERMATI & STORICO -->
        <div style="margin-top: 18px;">
          <h4 style="font-size: 13.5px; font-weight: 800; color: #166534; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
            <span>✓</span> Soggiorni Confermati & Storico Prenotazioni (${confermate.length + altre.length})
          </h4>
          <div class="table-responsive">
            <table class="master-table">
              <thead>
                <tr>
                  <th>Ospite</th>
                  <th>Richiedente</th>
                  <th>Date</th>
                  <th>Camera</th>
                  <th>Stato</th>
                  <th>Note</th>
                  <th style="text-align: right;">Elimina</th>
                </tr>
              </thead>
              <tbody>
                ${(confermate.length === 0 && altre.length === 0) ? '<tr><td colspan="7" style="text-align:center; padding: 12px; color: #64748b;">Nessun soggiorno confermato nello storico.</td></tr>' : ''}
                ${[...confermate, ...altre].map(a => {
                  const checkin = a.data_checkin || a.checkin || "";
                  const checkout = a.data_checkout || a.checkout || "";
                  const ospite = a.nome_ospite || a.ospite_nome || "Ospite";
                  const richiedente = a.richiedente_nome || a.nome_richiedente || a.richiedente_email || "Residente";
                  const camAss = a.camera_assegnata || "-";
                  const st = a.stato || "";
                  const badgeStyle = st === "Confermata" ? "background:#dcfce7; color:#166534;" : "background:#fee2e2; color:#991b1b;";
                  return `
                    <tr>
                      <td><strong>${escapeHtml(ospite)}</strong></td>
                      <td>${escapeHtml(richiedente)}</td>
                      <td>${formattaDataItaliana(checkin)} ➜ ${formattaDataItaliana(checkout)}</td>
                      <td>${escapeHtml(camAss)}</td>
                      <td><span class="badge" style="${badgeStyle} font-weight: 700; font-size: 10.5px;">${escapeHtml(st)}</span></td>
                      <td style="font-size: 11.5px; max-width: 180px;">${escapeHtml(a.note || a.motivo || '-')}</td>
                      <td style="text-align: right;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="handleEliminaAccoglienza('${a.id}')" style="color: #dc2626; border-color: #fca5a5; font-size: 10.5px; padding: 2px 6px;">
                          🗑️
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

  // ==========================================================================
  // SCHEDA 5 (PARTE 1): CALENDARIO & DATE DA GOOGLE FOGLI
  // ==========================================================================
  if (perm_admin && (isVistaTutto || activeTab === "sistema")) {
    html += `
      <!-- GESTIONE CALENDARIO & DATE DA GOOGLE FOGLI (GUIDA & SINCRONIZZAZIONE) -->
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
    `;
  }

  // ==========================================================================
  // SCHEDA 2: GESTIONE AMBIENTI (CHIESA E SALA TV) - APPROVAZIONE MASTER & NOTIFICHE
  // ==========================================================================
  if (perm_spazi && (isVistaTutto || activeTab === "spazi")) {
    html += `
      <!-- GESTIONE AMBIENTI (CHIESA E SALA TV) - APPROVAZIONE MASTER & NOTIFICHE -->
      <div class="master-block card" id="master-spazi-management-card" style="border-top: 4px solid #9d174d;">
        <div class="master-header flex-between" style="flex-wrap: wrap; gap: 8px;">
          <div class="flex-align" style="gap: 8px;">
            <span style="font-size: 22px;">⛪</span>
            <div>
              <h3 class="card-title" style="margin: 0;">Gestione Ambienti, Approvazioni & Notifiche (Chiesa & Sala TV)</h3>
              <span class="text-xs text-muted">Le richieste dei residenti richiedono approvazione manuale dei Master con notifica email</span>
            </div>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm btn-primary" onclick="apriModalMasterAppuntamento()" style="background: #9d174d; border-color: #9d174d; font-weight: 700;">
              ➕ Inserisci Appuntamento Master
            </button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="switchTab('spazi')">
              👀 Vista Griglia
            </button>
          </div>
        </div>

        <!-- BOX NOTIFICA REGOLE APPROVAZIONE -->
        <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; padding: 10px 14px; margin: 12px 0; font-size: 12.5px; color: #831843;">
          🔔 <strong>Regola di Approvazione Ambienti & Destinatari Notifiche:</strong> Le richieste dei residenti per Chiesa o Sala TV restano <strong>"In Attesa"</strong> fino ad approvazione del Master. L'avviso email viene inviato automaticamente ai responsabili con notifica abilitata: <strong>${(() => {
            const dest = getDestinatariNotifiche('spazi');
            return dest.map(e => `<code style="background: rgba(157,23,77,0.1); color: #9d174d; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${escapeHtml(e)}</code>`).join(', ');
          })()}</strong>. Solo l'approvazione del Master rende la prenotazione ufficiale.
        </div>

        ${(() => {
          const inAttesa = prenotazioniSpazi.filter(p => p.stato === "In Attesa");
          const confermate = prenotazioniSpazi.filter(p => p.stato !== "In Attesa");

          return `
            <!-- SEZIONE RICHIESTE IN ATTESA DI APPROVAZIONE -->
            <div style="margin-top: 14px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px;">
              <div class="flex-between" style="margin-bottom: 8px;">
                <h4 style="margin: 0; font-size: 13.5px; color: #92400e; display: flex; align-items: center; gap: 6px;">
                  <span>⏳</span> <strong>Richieste in Attesa di Approvazione Master (${inAttesa.length})</strong>
                </h4>
              </div>

              ${inAttesa.length === 0 ? `
                <p style="font-size: 12px; color: #78350f; margin: 0; padding: 6px 0;">Nessuna richiesta in attesa al momento. Tutti gli slot richiesti sono stati gestiti.</p>
              ` : `
                <div class="table-responsive">
                  <table class="master-table" style="background: #ffffff;">
                    <thead>
                      <tr style="background: #fef3c7;">
                        <th>Ambiente</th>
                        <th>Data</th>
                        <th>Slot</th>
                        <th>Richiedente</th>
                        <th>Azione Master</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${inAttesa.map(p => {
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
                              <div style="display: flex; gap: 6px;">
                                <button type="button" class="btn btn-sm" style="background: #16a34a; color: #fff; font-size: 11px; padding: 4px 8px; font-weight: 700; border: none; border-radius: 4px;" onclick="approvaRichiestaSpazio('${escapeHtml(p.id)}')">
                                  ✓ Approva
                                </button>
                                <button type="button" class="btn btn-sm btn-secondary" style="color: #dc2626; border-color: #fca5a5; font-size: 11px; padding: 4px 8px;" onclick="rifiutaRichiestaSpazio('${escapeHtml(p.id)}')">
                                  ✕ Rifiuta
                                </button>
                              </div>
                            </td>
                          </tr>
                        `;
                      }).join("")}
                    </tbody>
                  </table>
                </div>
              `}
            </div>

            <!-- SEZIONE PRENOTAZIONI CONFERMATE ED ATTIVE -->
            <div style="margin-top: 16px;">
              <h4 style="margin: 0 0 8px 0; font-size: 13.5px; color: #1e293b;">
                ✅ Prenotazioni & Appuntamenti Confermati (${confermate.length})
              </h4>
              <div class="table-responsive">
                <table class="master-table">
                  <thead>
                    <tr>
                      <th>Ambiente</th>
                      <th>Data</th>
                      <th>Orario / Slot</th>
                      <th>Riservato da</th>
                      <th>Stato / Approvatore</th>
                      <th>Azione Master</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${confermate.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 18px; color: #64748b;">Nessuna prenotazione confermata per Chiesa o Sala TV.</td></tr>' : ''}
                    ${confermate.map(p => {
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
                            <span class="badge" style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700;">
                              ✓ Confermato ${p.approvato_da ? `(${escapeHtml(p.approvato_da.split('@')[0])})` : ''}
                            </span>
                          </td>
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
          `;
        })()}
      </div>
    `;
  }

  // ==========================================================================
  // SCHEDA 5 (PARTE 2): CONFIGURAZIONE GOOGLE SPREADSHEET (APPS SCRIPT LIVE)
  // ==========================================================================
  if (perm_admin && (isVistaTutto || activeTab === "sistema")) {
    html += `
      <!-- CONFIGURAZIONE GOOGLE SPREADSHEET (APPS SCRIPT LIVE) -->
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
  // SCHEDA 3: SUB-PANNELLO MENSA (MASTER MENSA)
  // ==========================================================================
  if (perm_mensa && (isVistaTutto || activeTab === "mensa")) {
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
          <div class="flex-align" style="gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm btn-primary" onclick="switchTab('cucina')" style="background: #ea580c; border-color: #ea580c; font-weight: 700; font-size: 11.5px; padding: 4px 10px;">
              👩‍🍳 Vista Cuoca (Registro Presenze)
            </button>
            <label for="master-mensa-date-picker" style="font-size: 12px; font-weight: 600; color: #475569;">Giorno:</label>
            <input type="date" id="master-mensa-date-picker" class="input-date" style="padding: 3px 8px; font-size: 12px;" value="${dataFiltroYMD}" onchange="cambiaDataMasterMensa(this.value)">
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card" style="border-top: 3px solid var(--primary); cursor: pointer;" onclick="apriModalElencoPastiCucina('${dataFiltroYMD}', 'pranzo')" title="Clicca per aprire l'elenco nominativo dei prenotati a pranzo">
            <span class="metric-val" style="color: var(--primary);">${countPranzo} 🔍</span>
            <span class="metric-lbl">Presenti Pranzo (14:30)</span>
          </div>
          <div class="metric-card" style="border-top: 3px solid #2563eb; cursor: pointer;" onclick="apriModalElencoPastiCucina('${dataFiltroYMD}', 'cena')" title="Clicca per aprire l'elenco nominativo dei prenotati a cena">
            <span class="metric-val" style="color: #2563eb;">${countCena} 🔍</span>
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

        <!-- ==================================================================
             CONFIGURAZIONE ORARI LIMITE DINAMICI & NOTIFICHE (MASTER)
             ================================================================== -->
        <div class="sub-section" style="margin-top: 18px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 14px;">
          <div class="flex-between" style="flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
            <div>
              <h4 style="margin: 0; color: #9a3412; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                <span>⏰</span> <strong>Orari Limite Prenotazione Pasti & Notifiche Master</strong>
              </h4>
              <span class="text-xs text-muted" style="display: block; margin-top: 2px;">
                Modifica i limiti orari di prenotazione e cancella-pasti senza modificare la struttura dell'app.
              </span>
            </div>
            <button type="button" class="btn btn-sm btn-outline" onclick="switchTab('cucina')" style="border-color: #f97316; color: #ea580c; font-weight: 700;">
              👩‍🍳 Apri Registro Cuoca
            </button>
          </div>

          <form onsubmit="handleSalvaOrariLimite(event)">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px;">
              <div class="form-group" style="margin: 0;">
                <label for="cfg-limite-pranzo" style="font-size: 12px; font-weight: 700; color: #7c2d12;">
                  ☀️ Limite Prenotazione Pranzo (HH:MM)
                </label>
                <input type="text" id="cfg-limite-pranzo" class="input-text" style="font-weight: 700; font-size: 13px;" placeholder="09:00" value="${escapeHtml(appState.cachedConfig.Orario_Limite_Pranzo || '09:00')}" required>
                <span class="text-xs text-muted">Blocca modifiche oltre le ${appState.cachedConfig.Orario_Limite_Pranzo || '09:00'}</span>
              </div>

              <div class="form-group" style="margin: 0;">
                <label for="cfg-limite-cena" style="font-size: 12px; font-weight: 700; color: #7c2d12;">
                  🌙 Limite Prenotazione Cena (HH:MM)
                </label>
                <input type="text" id="cfg-limite-cena" class="input-text" style="font-weight: 700; font-size: 13px;" placeholder="14:30" value="${escapeHtml(appState.cachedConfig.Orario_Limite_Cena || '14:30')}" required>
                <span class="text-xs text-muted">Blocca modifiche oltre le ${appState.cachedConfig.Orario_Limite_Cena || '14:30'}</span>
              </div>

              <div class="form-group" style="margin: 0;">
                <label for="cfg-limite-busta" style="font-size: 12px; font-weight: 700; color: #7c2d12;">
                  🥪 Limite Busta Mar/Gio (Ieri alle HH:MM)
                </label>
                <input type="text" id="cfg-limite-busta" class="input-text" style="font-weight: 700; font-size: 13px;" placeholder="14:00" value="${escapeHtml(appState.cachedConfig.Orario_Limite_Busta || '14:00')}" required>
                <span class="text-xs text-muted">Entro le ore ${appState.cachedConfig.Orario_Limite_Busta || '14:00'} del giorno prima</span>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label for="cfg-email-notifiche-master" style="font-size: 12px; font-weight: 700; color: #7c2d12;">
                📧 Email Master per Ricezione Notifiche (Manutenzione & Richiesta Ambienti)
              </label>
              <input type="text" id="cfg-email-notifiche-master" class="input-text" style="font-size: 13px;" placeholder="donandreadotti@gmail.com, master2@example.com" value="${escapeHtml(appState.cachedConfig.Email_Notifiche_Master || 'donandreadotti@gmail.com')}">
              <span class="text-xs text-muted">Separa più indirizzi con una virgola. Riceveranno le notifiche email istantanee ad ogni richiesta.</span>
            </div>

            <button type="submit" id="btn-salva-orari-cfg" class="btn btn-primary btn-block" style="background: #c2410c; border-color: #c2410c; font-weight: 700;">
              💾 Salva Orari Limite & Email Notifiche Master
            </button>
          </form>
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
  // SCHEDA 4: SUB-PANNELLO MANUTENZIONE & SERVIZI (MASTER MANUTENZIONE)
  // ==========================================================================
  if (perm_manutenzione && (isVistaTutto || activeTab === "manutenzione")) {
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

        <!-- DIALOGO AMMINISTRAZIONE & NOTIFICHE EMAIL -->
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px;">
          <div class="flex-between" style="flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 12.5px; color: #78350f; line-height: 1.5; flex: 1; min-width: 250px;">
              <strong>📧 Notifiche & Monitoraggio Amministrazione:</strong> Ad ogni nuova segnalazione viene recapitata una mail ai responsabili selezionati: <strong>${(() => {
                const dest = getDestinatariNotifiche('manutenzione');
                return dest.map(e => `<code style="background: rgba(217,119,6,0.15); color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${escapeHtml(e)}</code>`).join(', ');
              })()}</strong> con descrizione, luogo e link alla foto. I dati dialogano costantemente con il foglio Google <strong>"Manutenzione"</strong> per permettere all'amministrazione di monitorare i costi, assegnare le ditte ed archiviare lo storico.
            </div>
            <button type="button" class="btn btn-sm btn-outline" onclick="window.print()" style="border-color: #d97706; color: #b45309; font-weight: 700; font-size: 11.5px; padding: 4px 10px;">
              🖨️ Stampa Scheda Interventi
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

  // NAVIGATORE INFERIORE TRA SCHEDE MASTER
  if (!isVistaTutto && tabsDisponibili.length > 1) {
    const currentTabObj = tabsDisponibili[currentTabIndex] || tabsDisponibili[0];
    const prevTabObj = currentTabIndex > 0 ? tabsDisponibili[currentTabIndex - 1] : null;
    const nextTabObj = currentTabIndex < tabsDisponibili.length - 1 ? tabsDisponibili[currentTabIndex + 1] : null;

    html += `
      <div class="card" style="margin-top: 18px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; border-radius: 8px;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="navigaSchedaMaster(-1)" ${!prevTabObj ? 'disabled style="opacity: 0.4; cursor: not-allowed; font-size: 12px;"' : 'style="font-weight: 700; font-size: 12px;"'}>
          ◀ ${prevTabObj ? escapeHtml(prevTabObj.label) : 'Inizio'}
        </button>
        <div style="font-size: 12.5px; font-weight: 600; color: #475569; text-align: center;">
          Scheda <strong>${currentTabIndex + 1}</strong> di <strong>${tabsDisponibili.length}</strong>: <span style="color: #0f172a; font-weight: 700;">${escapeHtml(currentTabObj ? currentTabObj.label : '')}</span>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="navigaSchedaMaster(1)" ${!nextTabObj ? 'disabled style="opacity: 0.4; cursor: not-allowed; font-size: 12px;"' : 'style="font-weight: 700; font-size: 12px;"'}>
          ${nextTabObj ? escapeHtml(nextTabObj.label) : 'Fine'} ▶
        </button>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ----------------------------------------------------------------------------
// HANDLER MASTER: SALVATAGGIO RUOLI UTENTE
// ----------------------------------------------------------------------------
window.salvaRuoliUtente = async function(email) {
  const isMensa = document.getElementById(`edit-is-mensa-${email}`)?.checked ?? true;
  const permMensa = document.getElementById(`edit-p-mensa-${email}`)?.checked || false;
  const permManut = document.getElementById(`edit-p-manut-${email}`)?.checked || false;
  const permSpazi = document.getElementById(`edit-p-spazi-${email}`)?.checked || false;
  const permAdmin = document.getElementById(`edit-p-admin-${email}`)?.checked || false;
  const notifManut = document.getElementById(`edit-notif-manut-${email}`)?.checked || false;
  const notifSpazi = document.getElementById(`edit-notif-spazi-${email}`)?.checked || false;

  try {
    const res = await callApi("aggiornaRuoliUtente", {
      emailTarget: email,
      is_utente_mensa: isMensa,
      perm_mensa: permMensa,
      perm_manutenzione: permManut,
      perm_spazi: permSpazi,
      perm_admin: permAdmin,
      notif_manutenzione: notifManut,
      notif_spazi: notifSpazi
    });

    if (res.success) {
      mostraToast(`✅ Ruoli e permessi aggiornati per ${email}!`, "success");
      // Aggiorna stato locale se stiamo modificando l'utente loggato
      if (appState.user && appState.user.email.toLowerCase() === email.toLowerCase()) {
        appState.user.is_utente_mensa = isMensa;
        appState.user.perm_mensa = permMensa;
        appState.user.perm_manutenzione = permManut;
        appState.user.perm_spazi = permSpazi;
        appState.user.perm_admin = permAdmin;
        appState.user.notif_manutenzione = notifManut;
        appState.user.notif_spazi = notifSpazi;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(appState.user));
        aggiornaUIUtente();
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

window.resetPasswordUtenteMaster = async function(email, nome) {
  if (!email) return;
  const label = nome ? `"${nome}" (${email})` : email;
  const nuovaPass = window.prompt(`Imposta una nuova password per ${label}:\n\n(L'utente potrà poi personalizzarla in ogni momento dal menu Impostazioni/Profilo)`, "newman2026");
  
  if (nuovaPass === null) return; // annullato dall'utente
  const passwordPulita = nuovaPass.trim();
  if (!passwordPulita || passwordPulita.length < 3) {
    mostraToast("La password deve contenere almeno 3 caratteri", "warning");
    return;
  }

  try {
    const res = await callApi("resetPasswordUtente", {
      emailTarget: email,
      nuovaPassword: passwordPulita
    });

    if (res && res.success) {
      mostraToast(`✅ Password per ${email} reimpostata a: ${passwordPulita}`, "success");
      await caricaDatiMaster();
      if (appState.currentTab === "master") {
        renderMasterSection();
      }
    } else {
      mostraToast("Errore: " + (res?.error || "Impossibile reimpostare la password"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete: " + err.message, "error");
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
    const password = (parts[2] || "").trim() || "newman2026";
    if (email && email.includes("@")) {
      utentiDaImportare.push({ email, nome, password });
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
// HANDLER MASTER: SALVATAGGIO CONFIGURAZIONE ORARI LIMITE E NOTIFICHE PASTI
// ----------------------------------------------------------------------------
window.handleSalvaOrariLimite = async function(e) {
  if (e) e.preventDefault();

  const limitePranzo = document.getElementById("cfg-limite-pranzo")?.value?.trim() || "09:00";
  const limiteCena = document.getElementById("cfg-limite-cena")?.value?.trim() || "14:30";
  const limiteBusta = document.getElementById("cfg-limite-busta")?.value?.trim() || "14:00";
  const emailNotifiche = document.getElementById("cfg-email-notifiche-master")?.value?.trim() || "donandreadotti@gmail.com";

  // Validazione orari formato HH:MM
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(limitePranzo)) {
    mostraToast("Orario pranzo non valido (formato richiesto: HH:MM, es. 09:00)", "warning");
    return;
  }
  if (!timeRegex.test(limiteCena)) {
    mostraToast("Orario cena non valido (formato richiesto: HH:MM, es. 14:30)", "warning");
    return;
  }
  if (!timeRegex.test(limiteBusta)) {
    mostraToast("Orario busta non valido (formato richiesto: HH:MM, es. 14:00)", "warning");
    return;
  }

  const btn = document.getElementById("btn-salva-orari-cfg");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Salvataggio in corso...";
  }

  try {
    const res = await callApi("aggiornaConfig", {
      Orario_Limite_Pranzo: limitePranzo,
      Orario_Limite_Cena: limiteCena,
      Orario_Limite_Busta: limiteBusta,
      Email_Notifiche_Master: emailNotifiche
    });

    if (res && res.success) {
      appState.cachedConfig.Orario_Limite_Pranzo = limitePranzo;
      appState.cachedConfig.Orario_Limite_Cena = limiteCena;
      appState.cachedConfig.Orario_Limite_Busta = limiteBusta;
      appState.cachedConfig.Email_Notifiche_Master = emailNotifiche;

      mostraToast("✅ Nuovi orari limite e notifiche salvati con successo!", "success");
      
      // Aggiorna sia la vista mensa che la vista master
      if (document.getElementById("mensa-container")) {
        renderMensaView();
      }
      renderMasterSection();
    } else {
      mostraToast("Errore durante il salvataggio: " + (res?.error || "Errore sconosciuto"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete: " + err.message, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "💾 Salva Orari Limite & Email Notifiche Master";
    }
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
  const notifManut = document.getElementById(`p-notif-manut-${email}`)?.checked || false;
  const notifSpazi = document.getElementById(`p-notif-spazi-${email}`)?.checked || false;

  try {
    const res = await callApi("approvaUtente", {
      emailTarget: email,
      perm_mensa: permMensa,
      perm_manutenzione: permManut,
      perm_spazi: permSpazi,
      perm_admin: permAdmin,
      notif_manutenzione: notifManut,
      notif_spazi: notifSpazi
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
    const passInp = document.getElementById("auth-input-password");
    if (passInp) passInp.value = "";
    const inp = document.getElementById("auth-input-email");
    if (inp) {
      setTimeout(() => inp.focus(), 150);
    }
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
      const password = document.getElementById("auth-input-password")?.value.trim() || "";
      if (!email) return;

      const btn = document.getElementById("btn-check-email");
      btn.disabled = true;
      btn.innerText = "Verifica in corso...";

      try {
        const res = await callApi("login", { email, password });
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
        } else if (res.requirePassword) {
          mostraToast(res.error || "Password richiesta per accedere", "warning");
          const passInp = document.getElementById("auth-input-password");
          if (passInp) {
            passInp.focus();
            passInp.select();
          }
        } else if (res.notFound) {
          // Non registrato -> Mostra form registrazione
          document.getElementById("auth-step-email").classList.add("hidden");
          document.getElementById("auth-step-register").classList.remove("hidden");
          document.getElementById("reg-input-email").value = email;
          const regPass = document.getElementById("reg-input-password");
          if (regPass && password) regPass.value = password;
        } else {
          mostraToast("Errore: " + (res.error || "Accesso non riuscito"), "error");
        }
      } catch (err) {
        mostraToast("Errore di connessione", "error");
      } finally {
        btn.disabled = false;
        btn.innerText = "Accedi";
      }
    });
  }

  const formRegister = document.getElementById("form-auth-register");
  if (formRegister) {
    formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("reg-input-email")?.value.trim().toLowerCase();
      const nome = document.getElementById("reg-input-nome")?.value.trim();
      const password = document.getElementById("reg-input-password")?.value.trim() || "newman2026";
      if (!email || !nome) return;

      const btn = document.getElementById("btn-submit-register");
      btn.disabled = true;
      btn.innerText = "Invio richiesta...";

      try {
        const res = await callApi("registraUtente", { email, nome, password });
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

  // Menu Impostazioni, Profilo e Selezione Tema
  document.getElementById("btn-open-settings")?.addEventListener("click", apriModalSettings);

  // Inizializzazione Tema (Chiaro / Scuro)
  const savedTheme = localStorage.getItem("newman_theme") || "light";
  impostaTema(savedTheme);
}

function switchTab(tabId) {
  if (appState.currentTab && appState.currentTab !== tabId) {
    appState.previousTab = appState.currentTab;
  }
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
  const views = ["info", "mensa", "spazi", "accoglienza", "residenza", "manutenzione", "master", "cucina", "calendario"];
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

  // Scroll back to top when switching tab
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Azioni specifiche per tab
  if (tabId === "info") renderBachecaView();
  if (tabId === "mensa") renderMensaView();
  if (tabId === "spazi") renderSpaziView();
  if (tabId === "accoglienza") renderAccoglienzaView();
  if (tabId === "residenza") renderResidenzaView();
  if (tabId === "manutenzione") caricaGuastiRecenti();
  if (tabId === "master") caricaDatiMaster();
  if (tabId === "cucina") renderCucinaView();
  if (tabId === "calendario") renderCalendarioGlobaleView();
}

window.switchTab = switchTab;

window.renderCalendarioGlobaleView = function() {
  const container = document.getElementById("calendario-globale-container");
  if (!container) return;

  const isMasterOrAdmin = haPermessiMaster();

  // Filtri attivi
  if (!appState.calendarioFiltroAmbiente) appState.calendarioFiltroAmbiente = "tutti";
  if (!appState.calendarioFiltroPeriodo) appState.calendarioFiltroPeriodo = "prossimi";
  if (appState.calendarioSearchText === undefined) appState.calendarioSearchText = "";

  const filtroAmbiente = appState.calendarioFiltroAmbiente;
  const filtroPeriodo = appState.calendarioFiltroPeriodo;
  const searchText = (appState.calendarioSearchText || "").toLowerCase().trim();

  // 1. Raccogliamo tutti gli appuntamenti da spazi e bacheca
  const items = [];

  const spazi = appState.prenotazioniSpazi || [];
  spazi.forEach(s => {
    const dStr = formattaDataConfronto(s.data);
    if (!dStr) return;
    const isMasterApp = String(s.email || "").startsWith("Master");
    const tit = isMasterApp ? s.email.replace(/^Master\s*\(?|\)?$/g, "") : `Prenotazione ${s.risorsa}`;
    items.push({
      id: s.id || `SP_${s.risorsa}_${dStr}_${s.slot_orario}`,
      origine: "spazio",
      tipo: s.risorsa === "Chiesa" ? "chiesa" : "salatv",
      categoria: s.risorsa,
      data: dStr,
      orario: s.slot_orario || "Orario non specificato",
      titolo: tit || `${s.risorsa} (${s.slot_orario})`,
      descrizione: s.note || (isMasterApp ? "Evento / celebrazione programmata dalla Direzione" : `Prenotato da ${s.email}`),
      autore: s.email || "Residente",
      stato: s.stato || "Approvato"
    });
  });

  const bacheca = appState.bacheca || [];
  bacheca.forEach(b => {
    const dStr = formattaDataConfronto(b.data);
    if (!dStr) return;
    items.push({
      id: b.id,
      origine: "bacheca",
      tipo: b.tipo || "avviso",
      categoria: b.tipo === "compleanno" ? "Compleanno" : (b.tipo === "anniversario" ? "Anniversario" : "Bacheca"),
      data: dStr,
      orario: b.orario || "Tutto il giorno",
      titolo: b.titolo || "Avviso Comunitario",
      descrizione: b.descrizione || "",
      autore: b.autore || "Direzione",
      priorita: b.priorita || "normale",
      data_pubblicazione: b.data_pubblicazione,
      data_scadenza: b.data_scadenza
    });
  });

  const oggiYMD = formatYMD(new Date());

  let filtered = items.filter(it => {
    if (searchText) {
      const matchText = (it.titolo + " " + it.descrizione + " " + it.categoria + " " + it.autore + " " + it.data).toLowerCase();
      if (!matchText.includes(searchText)) return false;
    }

    if (filtroAmbiente === "chiesa" && it.tipo !== "chiesa") return false;
    if (filtroAmbiente === "salatv" && it.tipo !== "salatv") return false;
    if (filtroAmbiente === "bacheca" && it.tipo !== "avviso" && it.tipo !== "evento") return false;
    if (filtroAmbiente === "compleanno" && it.tipo !== "compleanno" && it.tipo !== "anniversario") return false;

    if (filtroPeriodo === "prossimi") {
      if (it.data < oggiYMD) return false;
    } else if (filtroPeriodo === "mese") {
      const curM = oggiYMD.slice(0, 7);
      if (!it.data.startsWith(curM)) return false;
    } else if (filtroPeriodo === "passati") {
      if (it.data >= oggiYMD) return false;
    }

    return true;
  });

  filtered.sort((a, b) => {
    if (a.data !== b.data) {
      return filtroPeriodo === "passati" ? (b.data.localeCompare(a.data)) : (a.data.localeCompare(b.data));
    }
    return (a.orario || "").localeCompare(b.orario || "");
  });

  const gruppi = {};
  filtered.forEach(it => {
    if (!gruppi[it.data]) gruppi[it.data] = [];
    gruppi[it.data].push(it);
  });

  const countChiesa = items.filter(i => i.tipo === "chiesa").length;
  const countTv = items.filter(i => i.tipo === "salatv").length;
  const countBacheca = items.filter(i => i.tipo === "avviso" || i.tipo === "evento").length;
  const countCompleanni = items.filter(i => i.tipo === "compleanno" || i.tipo === "anniversario").length;

  let html = `
    <!-- HEADER CALENDARIO COMPLETO -->
    <div class="card" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; padding: 18px 20px; border-radius: 12px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.12);">
      <div class="flex-between" style="flex-wrap: wrap; gap: 12px;">
        <div>
          <button type="button" class="btn btn-sm btn-secondary" onclick="switchTab(appState.previousTab || 'info')" style="background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.25); margin-bottom: 8px; font-weight: 700;">
            ◀ Torna alla Home / Bacheca
          </button>
          <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 4px 0; color: #ffffff; display: flex; align-items: center; gap: 8px;">
            <span>📅</span> Calendario &amp; Tutti gli Appuntamenti
          </h2>
          <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.45;">
            Visione globale di tutte le celebrazioni in Chiesa, prenotazioni Sala TV, compleanni ed eventi comunitari della Residenza Newman.
          </p>
        </div>
        ${isMasterOrAdmin ? `
          <button type="button" class="btn btn-primary" onclick="apriModalMasterAppuntamento()" style="background: #9d174d; border-color: #9d174d; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px;">
            <span>👑 ➕</span> Inserisci Appuntamento
          </button>
        ` : ''}
      </div>
    </div>

    <!-- BARRA RICERCA & FILTRI CALENDARIO -->
    <div class="card" style="padding: 14px 16px; margin-bottom: 16px;">
      <!-- CAMPO DI RICERCA -->
      <div style="position: relative; margin-bottom: 12px;">
        <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 16px; color: #64748b;">🔍</span>
        <input type="text"
          id="search-calendario-input"
          class="input-text"
          placeholder="Cerca evento, santa messa, compleanno, sala TV..."
          value="${escapeHtml(appState.calendarioSearchText || '')}"
          oninput="gestisciRicercaCalendario(this.value)"
          style="padding-left: 38px; font-size: 14px; border-radius: 8px;"
        >
        ${appState.calendarioSearchText ? `
          <button type="button" onclick="gestisciRicercaCalendario('')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 16px; color: #64748b; cursor: pointer;">✕</button>
        ` : ''}
      </div>

      <!-- BOTTONI FILTRO AMBIENTE / CATEGORIA -->
      <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button type="button" class="btn btn-sm ${filtroAmbiente === 'tutti' ? 'btn-primary' : 'btn-outline'}" onclick="impostaFiltroAmbienteCalendario('tutti')" style="font-size: 12px; font-weight: 700;">
            🌟 Tutti (${items.length})
          </button>
          <button type="button" class="btn btn-sm ${filtroAmbiente === 'chiesa' ? 'btn-primary' : 'btn-outline'}" onclick="impostaFiltroAmbienteCalendario('chiesa')" style="font-size: 12px; font-weight: 700; ${filtroAmbiente === 'chiesa' ? 'background: #9d174d; border-color: #9d174d;' : ''}">
            ⛪ Chiesa (${countChiesa})
          </button>
          <button type="button" class="btn btn-sm ${filtroAmbiente === 'salatv' ? 'btn-primary' : 'btn-outline'}" onclick="impostaFiltroAmbienteCalendario('salatv')" style="font-size: 12px; font-weight: 700; ${filtroAmbiente === 'salatv' ? 'background: #2563eb; border-color: #2563eb;' : ''}">
            📺 Sala TV (${countTv})
          </button>
          <button type="button" class="btn btn-sm ${filtroAmbiente === 'bacheca' ? 'btn-primary' : 'btn-outline'}" onclick="impostaFiltroAmbienteCalendario('bacheca')" style="font-size: 12px; font-weight: 700;">
            📢 Bacheca (${countBacheca})
          </button>
          <button type="button" class="btn btn-sm ${filtroAmbiente === 'compleanno' ? 'btn-primary' : 'btn-outline'}" onclick="impostaFiltroAmbienteCalendario('compleanno')" style="font-size: 12px; font-weight: 700;">
            🎂 Compleanni (${countCompleanni})
          </button>
        </div>

        <!-- SELETTORE PERIODO -->
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">Periodo:</span>
          <select class="input-select" style="font-size: 12px; padding: 4px 8px; width: auto;" onchange="impostaFiltroPeriodoCalendario(this.value)">
            <option value="prossimi" ${filtroPeriodo === 'prossimi' ? 'selected' : ''}>📆 Prossimi Appuntamenti</option>
            <option value="mese" ${filtroPeriodo === 'mese' ? 'selected' : ''}>🗓️ Questo Mese</option>
            <option value="tutti" ${filtroPeriodo === 'tutti' ? 'selected' : ''}>🌟 Tutto l'Anno</option>
            <option value="passati" ${filtroPeriodo === 'passati' ? 'selected' : ''}>⏮️ Eventi Passati</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ELENCO CRONOLOGICO DEGLI APPUNTAMENTI -->
    <div id="calendario-elenco-appuntamenti" style="display: flex; flex-direction: column; gap: 14px;">
  `;

  const dateKeys = Object.keys(gruppi);
  if (dateKeys.length === 0) {
    html += `
      <div class="card" style="text-align: center; padding: 36px 20px; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1;">
        <div style="font-size: 40px; margin-bottom: 8px;">🕊️</div>
        <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 17px; font-weight: 700;">Nessun appuntamento trovato</h3>
        <p style="margin: 0; font-size: 13.5px;">Non ci sono impegni o celebrazioni corrispondenti ai filtri impostati.</p>
        ${isMasterOrAdmin ? `
          <div style="margin-top: 14px;">
            <button type="button" class="btn btn-primary" onclick="apriModalMasterAppuntamento()" style="background: #9d174d; border-color: #9d174d; font-weight: 700;">
              ➕ Aggiungi un Appuntamento Adesso
            </button>
          </div>
        ` : ''}
      </div>
    `;
  } else {
    dateKeys.forEach(dateStr => {
      const itemsDelGiorno = gruppi[dateStr];
      const isOggi = dateStr === oggiYMD;

      let dataIntestazione = dateStr;
      try {
        const [y, m, d] = dateStr.split("-");
        const dt = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
        const giorniSettimana = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
        const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        dataIntestazione = `${giorniSettimana[dt.getDay()]} ${dt.getDate()} ${mesi[dt.getMonth()]} ${dt.getFullYear()}`;
      } catch (e) {}

      html += `
        <div class="card" style="padding: 14px 16px; border-left: 5px solid ${isOggi ? '#16a34a' : '#0284c7'};">
          <div class="flex-between" style="margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">📅</span>
              <strong style="font-size: 15px; color: #0f172a;">${escapeHtml(dataIntestazione)}</strong>
              ${isOggi ? '<span class="badge" style="background: #dcfce7; color: #166534; font-weight: 800; font-size: 11px;">Oggi</span>' : ''}
            </div>
            <span class="text-xs text-muted" style="font-weight: 600;">${itemsDelGiorno.length} ${itemsDelGiorno.length === 1 ? 'appuntamento' : 'appuntamenti'}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${itemsDelGiorno.map(item => {
              let icon = "📌";
              let badgeColor = "#0284c7";
              let badgeBg = "#e0f2fe";
              let leftBorderColor = "#0284c7";

              if (item.tipo === "chiesa") {
                icon = "⛪";
                badgeColor = "#9d174d";
                badgeBg = "#fce7f3";
                leftBorderColor = "#9d174d";
              } else if (item.tipo === "salatv") {
                icon = "📺";
                badgeColor = "#2563eb";
                badgeBg = "#dbeafe";
                leftBorderColor = "#2563eb";
              } else if (item.tipo === "compleanno") {
                icon = "🎂";
                badgeColor = "#b45309";
                badgeBg = "#fef3c7";
                leftBorderColor = "#f59e0b";
              } else if (item.tipo === "anniversario") {
                icon = "🔔";
                badgeColor = "#6b21a8";
                badgeBg = "#f3e8ff";
                leftBorderColor = "#9333ea";
              } else if (item.tipo === "evento") {
                icon = "📆";
                badgeColor = "#15803d";
                badgeBg = "#dcfce7";
                leftBorderColor = "#16a34a";
              }

              return `
                <div class="card-inner" style="border-left: 3px solid ${leftBorderColor}; background: #ffffff; border-radius: 6px; padding: 10px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                  <div class="flex-between" style="flex-wrap: wrap; gap: 6px; margin-bottom: 4px;">
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                      <span class="badge" style="background: ${badgeBg}; color: ${badgeColor}; font-weight: 700; font-size: 11px;">
                        ${icon} ${escapeHtml(item.categoria)}
                      </span>
                      <span class="badge" style="background: #f1f5f9; color: #334155; font-weight: 700; font-size: 11px;">
                        ⏰ ${escapeHtml(item.orario)}
                      </span>
                      ${item.priorita === 'alta' ? '<span class="badge" style="background: #fee2e2; color: #991b1b; font-weight: 700; font-size: 10px;">⭐ In Evidenza</span>' : ''}
                    </div>
                    ${(isMasterOrAdmin && item.origine === 'bacheca') ? `
                      <div style="display: flex; gap: 4px;">
                        <button type="button" class="btn btn-outline btn-sm" style="padding: 2px 7px; font-size: 11px;" onclick="modificaAvvisoBacheca('${item.id}')" title="Modifica">✏️ Modifica</button>
                        <button type="button" class="btn btn-outline btn-sm" style="padding: 2px 7px; font-size: 11px; color: #dc2626;" onclick="eliminaAvvisoBacheca('${item.id}')" title="Elimina">✕</button>
                      </div>
                    ` : ''}
                  </div>

                  <h4 style="margin: 2px 0 4px 0; font-size: 14.5px; font-weight: 800; color: #0f172a;">
                    ${escapeHtml(item.titolo)}
                  </h4>

                  ${item.descrizione ? `
                    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.45;">
                      ${escapeHtml(item.descrizione)}
                    </p>
                  ` : ''}

                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 11.5px; color: #64748b;">
                    <span>Referente / Autore: <strong>${escapeHtml(item.autore)}</strong></span>
                    ${item.tipo === "chiesa" || item.tipo === "salatv" ? `
                      <button type="button" class="btn btn-outline btn-sm" onclick="switchTab('spazi')" style="font-size: 11px; padding: 2px 8px;">
                        Verifica Slot ${item.categoria}
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    });
  }

  html += `
    </div>

    <!-- PULSANTE INFERIORE DI RITORNO -->
    <div style="margin-top: 20px; text-align: center;">
      <button type="button" class="btn btn-secondary" onclick="switchTab(appState.previousTab || 'info')" style="font-weight: 700; padding: 10px 24px;">
        ◀ Torna alla Bacheca
      </button>
    </div>
  `;

  container.innerHTML = html;
};

window.impostaFiltroAmbienteCalendario = function(filtro) {
  appState.calendarioFiltroAmbiente = filtro;
  renderCalendarioGlobaleView();
};

window.impostaFiltroPeriodoCalendario = function(periodo) {
  appState.calendarioFiltroPeriodo = periodo;
  renderCalendarioGlobaleView();
};

window.gestisciRicercaCalendario = function(val) {
  appState.calendarioSearchText = val;
  renderCalendarioGlobaleView();
};

function aggiornaUIUtente() {
  const avatarText = document.getElementById("header-user-avatar");
  const userName = document.getElementById("header-user-name");
  const userRole = document.getElementById("header-user-role");
  const masterNav = document.getElementById("nav-tab-master");
  const mensaNav = document.getElementById("nav-tab-mensa");

  if (appState.user) {
    if (avatarText) {
      const parts = (appState.user.nome || "CN").trim().split(" ");
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

    if (mensaNav) {
      const isMensaEnabled = appState.user.is_utente_mensa !== false;
      mensaNav.style.display = isMensaEnabled ? "flex" : "none";
      if (!isMensaEnabled && appState.currentTab === "mensa") {
        switchTab("info");
      }
    }
  } else {
    if (avatarText) avatarText.innerText = "👤";
    if (userName) userName.innerText = "Ospite";
    if (userRole) userRole.innerText = "Accedi";
    if (masterNav) {
      masterNav.style.display = "none";
    }
    if (mensaNav) {
      mensaNav.style.display = "flex";
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
  chiudiModalSettings();
  aggiornaUIUtente();
  if (appState.currentTab === "master") {
    switchTab("info");
  } else {
    renderBachecaView();
    renderMensaView();
    renderSpaziView();
  }
  const inp = document.getElementById("auth-input-email");
  if (inp) inp.value = "";
  mostraToast("Disconnessione effettuata con successo", "info");
  mostraModalAuth(true);
};

/**
 * Gestione Tema Visivo (Chiaro / Scuro)
 */
function impostaTema(tema) {
  if (tema !== "dark" && tema !== "light") tema = "light";
  document.documentElement.setAttribute("data-theme", tema);
  localStorage.setItem("newman_theme", tema);
  aggiornaPulsantiTema(tema);
}
window.impostaTema = impostaTema;

function aggiornaPulsantiTema(tema) {
  const current = tema || document.documentElement.getAttribute("data-theme") || "light";
  const btnLight = document.getElementById("btn-theme-light");
  const btnDark = document.getElementById("btn-theme-dark");
  if (btnLight) {
    if (current === "light") btnLight.classList.add("active");
    else btnLight.classList.remove("active");
  }
  if (btnDark) {
    if (current === "dark") btnDark.classList.add("active");
    else btnDark.classList.remove("active");
  }
}
window.aggiornaPulsantiTema = aggiornaPulsantiTema;

/**
 * Apertura e Chiusura Menu Impostazioni & Profilo (⚙️)
 */
function apriModalSettings() {
  const modal = document.getElementById("modal-settings");
  if (!modal) return;

  const nameEl = document.getElementById("settings-name");
  const emailEl = document.getElementById("settings-email");
  const roleEl = document.getElementById("settings-role-badge");
  const avatarEl = document.getElementById("settings-avatar");
  const masterShortcut = document.getElementById("settings-btn-master");

  if (appState.user) {
    if (nameEl) nameEl.textContent = appState.user.nome || "Utente Newman";
    if (emailEl) emailEl.textContent = appState.user.email || "";
    if (roleEl) {
      if (appState.user.perm_admin) {
        roleEl.textContent = "Supermaster / Admin";
        roleEl.style.background = "#fef3c7";
        roleEl.style.color = "#b45309";
      } else if (appState.user.perm_mensa || appState.user.perm_manutenzione) {
        roleEl.textContent = "Staff / Servizi";
        roleEl.style.background = "#e0f2fe";
        roleEl.style.color = "#0369a1";
      } else {
        roleEl.textContent = "Residente Approvato";
        roleEl.style.background = "#dcfce7";
        roleEl.style.color = "#15803d";
      }
    }
    if (avatarEl) {
      const parts = (appState.user.nome || "CN").trim().split(" ");
      avatarEl.textContent = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
    }
    if (masterShortcut) {
      masterShortcut.style.display = haPermessiMaster() ? "flex" : "none";
    }
  } else {
    if (nameEl) nameEl.textContent = "Ospite";
    if (emailEl) emailEl.textContent = "Accesso non effettuato";
    if (roleEl) {
      roleEl.textContent = "Ospite";
      roleEl.style.background = "var(--surface-alt)";
      roleEl.style.color = "var(--text-muted)";
    }
    if (avatarEl) avatarEl.textContent = "👤";
    if (masterShortcut) masterShortcut.style.display = "none";
  }

  const logoutBtn = document.getElementById("btn-settings-logout");
  if (logoutBtn) {
    if (appState.user) {
      logoutBtn.innerHTML = `<span>🚪</span><span>Disconnetti</span>`;
      logoutBtn.className = "btn btn-danger btn-block";
      logoutBtn.onclick = () => window.logout();
    } else {
      logoutBtn.innerHTML = `<span>🔑</span><span>Accedi</span>`;
      logoutBtn.className = "btn btn-primary btn-block";
      logoutBtn.onclick = () => {
        chiudiModalSettings();
        window.mostraModalAuth(true);
      };
    }
  }

  // Gestione visibilità sezione cambio password
  const passSection = document.getElementById("settings-password-section");
  const boxPass = document.getElementById("box-cambio-password");
  if (passSection) {
    passSection.style.display = appState.user ? "block" : "none";
  }
  if (boxPass) {
    boxPass.style.display = "none";
    document.getElementById("form-cambia-password")?.reset();
  }

  aggiornaPulsantiTema();
  modal.style.display = "flex";
}
window.apriModalSettings = apriModalSettings;

function chiudiModalSettings() {
  const modal = document.getElementById("modal-settings");
  if (modal) modal.style.display = "none";
}
window.chiudiModalSettings = chiudiModalSettings;

// Toggle visibilità campo password (mostra/nascondi testo)
window.toggleVisibilitaPassword = function(inputId, btnEl) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === "password") {
    inp.type = "text";
    if (btnEl) btnEl.innerText = "🙈 Nascondi";
  } else {
    inp.type = "password";
    if (btnEl) btnEl.innerText = "👁️ Mostra";
  }
};

// Toggle box cambio password nelle impostazioni
window.toggleBoxCambioPassword = function(force) {
  const box = document.getElementById("box-cambio-password");
  if (!box) return;
  if (typeof force === "boolean") {
    box.style.display = force ? "block" : "none";
  } else {
    box.style.display = box.style.display === "none" ? "block" : "none";
  }
  if (box.style.display === "block") {
    const inp = document.getElementById("input-pass-attuale");
    if (inp) setTimeout(() => inp.focus(), 100);
  }
};

// Salvataggio cambio password utente
window.handleCambiaPasswordUtente = async function(e) {
  if (e) e.preventDefault();
  if (!appState.user) return;

  const passAttuale = document.getElementById("input-pass-attuale")?.value.trim() || "";
  const passNuova = document.getElementById("input-pass-nuova")?.value.trim() || "";
  const passConferma = document.getElementById("input-pass-conferma")?.value.trim() || "";

  if (!passAttuale) {
    mostraToast("Inserisci la tua password attuale o iniziale", "warning");
    return;
  }
  if (!passNuova || passNuova.length < 4) {
    mostraToast("La nuova password deve contenere almeno 4 caratteri", "warning");
    return;
  }
  if (passNuova !== passConferma) {
    mostraToast("La conferma della nuova password non coincide", "warning");
    return;
  }

  const btn = document.getElementById("btn-salva-nuova-pass");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Salvataggio...";
  }

  try {
    const res = await callApi("cambiaPassword", {
      email: appState.user.email,
      passwordAttuale: passAttuale,
      nuovaPassword: passNuova
    });

    if (res && res.success) {
      mostraToast("✅ Password aggiornata con successo!", "success");
      // Aggiorna stato locale dell'utente
      appState.user.password = passNuova;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(appState.user));
      
      // Se presente nel DB mock locale, aggiorna anche lì
      const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_DB) || "{}");
      if (db.utenti) {
        const u = db.utenti.find(item => item.email.toLowerCase() === appState.user.email.toLowerCase());
        if (u) {
          u.password = passNuova;
          localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        }
      }

      toggleBoxCambioPassword(false);
      document.getElementById("form-cambia-password")?.reset();
    } else {
      mostraToast("Errore: " + (res?.error || "Impossibile aggiornare la password"), "error");
    }
  } catch (err) {
    mostraToast("Errore di rete durante l'aggiornamento della password", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "💾 Salva Nuova Password";
    }
  }
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

// ============================================================================
// VISTA REGISTRO CUOCA / CUCINA (USER-FRIENDLY & DIALOGANTE)
// ============================================================================

window.cambiaDataCucina = function(nuovaDataStr) {
  if (!nuovaDataStr) return;
  appState.cucinaSelectedDate = nuovaDataStr;
  renderCucinaView();
};

window.spostaGiornoCucina = function(deltaGiorni) {
  const cur = appState.cucinaSelectedDate ? new Date(appState.cucinaSelectedDate + "T12:00:00") : new Date();
  cur.setDate(cur.getDate() + deltaGiorni);
  appState.cucinaSelectedDate = formatYMD(cur);
  renderCucinaView();
};

window.filtraCucinaPasto = function(pasto, filtro) {
  if (pasto === "pranzo") {
    appState.cucinaFilterPranzo = filtro;
  } else {
    appState.cucinaFilterCena = filtro;
  }
  renderCucinaView();
};

window.toggleCucinaSpuntato = function(key) {
  try {
    const dataKey = appState.cucinaSelectedDate || formatYMD(new Date());
    const storageKey = `newman_cucina_spuntati_${dataKey}`;
    const spuntati = JSON.parse(localStorage.getItem(storageKey) || "{}");
    spuntati[key] = !spuntati[key];
    localStorage.setItem(storageKey, JSON.stringify(spuntati));
    renderCucinaView();
  } catch (err) {
    console.error("Errore toggle spuntato:", err);
  }
};

window.renderCucinaView = function() {
  const container = document.getElementById("cucina-container");
  if (!container) return;

  const dataFiltroYMD = appState.cucinaSelectedDate || formatYMD(new Date());
  appState.cucinaSelectedDate = dataFiltroYMD;

  const filterPranzo = appState.cucinaFilterPranzo || "tutti";
  const filterCena = appState.cucinaFilterCena || "tutti";

  // Spuntati locali della cuoca per il giorno selezionato
  let spuntati = {};
  try {
    spuntati = JSON.parse(localStorage.getItem(`newman_cucina_spuntati_${dataFiltroYMD}`) || "{}");
  } catch (e) {
    spuntati = {};
  }

  const dataObj = new Date(dataFiltroYMD + "T12:00:00");
  const optionsGiorno = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  const dataEstesa = dataObj.toLocaleDateString("it-IT", optionsGiorno);
  const giornoSettimanaCapitalized = dataEstesa.charAt(0).toUpperCase() + dataEstesa.slice(1);

  const isOggi = dataFiltroYMD === formatYMD(new Date());

  // Prenotazioni della mensa per la data selezionata
  const dbMensa = appState.mensaBookings || [];
  const prenotazioniGiorno = dbMensa.filter(m => String(m.data).split("T")[0] === dataFiltroYMD);

  const listaPranzo = prenotazioniGiorno.filter(m => m.tipo_pasto === "pranzo");
  const listaCena = prenotazioniGiorno.filter(m => m.tipo_pasto === "cena");

  // Variazione attiva per oggi
  const dataVar = appState.cachedConfig.Data_Variazione_Menu;
  const testoVar = appState.cachedConfig.Testo_Variazione;
  const pastoVar = (appState.cachedConfig.Pasto_Variazione || "entrambi").toLowerCase();
  const haVariazioneOggi = (dataVar === dataFiltroYMD) && Boolean(testoVar);

  // Filtra liste
  function applicaFiltro(lista, f) {
    if (f === "in_sala") return lista.filter(x => !x.busta && !x.ritardo);
    if (f === "busta") return lista.filter(x => Boolean(x.busta));
    if (f === "ritardo") return lista.filter(x => Boolean(x.ritardo));
    if (f === "note") return lista.filter(x => Boolean(x.note && x.note.trim()));
    return lista;
  }

  const filteredPranzo = applicaFiltro(listaPranzo, filterPranzo);
  const filteredCena = applicaFiltro(listaCena, filterCena);

  const countBustePranzo = listaPranzo.filter(m => m.busta).length;
  const countRitardiPranzo = listaPranzo.filter(m => m.ritardo).length;
  const countNotePranzo = listaPranzo.filter(m => m.note && m.note.trim()).length;

  const countBusteCena = listaCena.filter(m => m.busta).length;
  const countRitardiCena = listaCena.filter(m => m.ritardo).length;
  const countNoteCena = listaCena.filter(m => m.note && m.note.trim()).length;

  // Statistiche previsionali per i prossimi 5 giorni
  const prossimiGiorni = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const ymd = formatYMD(d);
    const pGiorno = dbMensa.filter(m => String(m.data).split("T")[0] === ymd);
    prossimiGiorni.push({
      ymd,
      label: d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "numeric" }),
      pranzo: pGiorno.filter(m => m.tipo_pasto === "pranzo").length,
      cena: pGiorno.filter(m => m.tipo_pasto === "cena").length,
      buste: pGiorno.filter(m => m.busta).length,
      isSel: ymd === dataFiltroYMD
    });
  }

  let html = `
    <div class="cucina-portal-wrapper">
      
      <!-- HEADER PRINCIPALE VISTA CUOCA -->
      <div class="card" style="border-top: 5px solid #ea580c; background: linear-gradient(to bottom, #fff7ed, #ffffff); padding: 16px; margin-bottom: 14px;">
        <div class="flex-between" style="flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 26px;">👩‍🍳</span>
              <div>
                <h2 style="margin: 0; font-size: 19px; color: #9a3412; font-weight: 800;">Registro Presenze Cucina & Cuoca</h2>
                <div style="font-size: 12.5px; color: #7c2d12;">Schermata semplificata per consultare presenze, piatti da preparare e buste al sacco</div>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;" class="no-print">
            <button type="button" class="btn btn-outline btn-sm" onclick="switchTab('mensa')" style="font-weight: 700;">
              ← Torna a Mensa
            </button>
            <button type="button" class="btn btn-sm" onclick="window.print()" style="background: #0f172a; color: #fff; font-weight: 700; padding: 6px 12px;">
              🖨️ Stampa Registro
            </button>
            <button type="button" class="btn btn-sm" onclick="apriModalVariazioneCuoca('${dataFiltroYMD}', 'pranzo')" style="background: #ea580c; color: #fff; font-weight: 700; padding: 6px 12px;">
              📢 Inserisci Variazione Menu
            </button>
          </div>
        </div>

        <!-- SELETTORE DATA USER-FRIENDLY CON FRECCE GRANDI -->
        <div style="background: #ffffff; border: 1px solid #fed7aa; border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; gap: 6px; align-items: center;">
            <button type="button" class="btn btn-outline btn-sm" onclick="spostaGiornoCucina(-1)" title="Giorno precedente" style="font-weight: 800; font-size: 14px; padding: 6px 12px;">
              ◀ Giorno Prima
            </button>
            <button type="button" class="btn btn-sm ${isOggi ? 'btn-primary' : 'btn-outline'}" onclick="cambiaDataCucina('${formatYMD(new Date())}')" style="font-weight: 700; padding: 6px 12px;">
              Oggi
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="spostaGiornoCucina(1)" title="Giorno successivo" style="font-weight: 800; font-size: 14px; padding: 6px 12px;">
              Giorno Dopo ▶
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 15px; font-weight: 800; color: #1e293b;">
              📅 ${giornoSettimanaCapitalized}
            </span>
            <input type="date" id="cucina-date-picker" class="input-date" style="padding: 5px 8px; font-size: 13px; font-weight: 700; border-color: #fdba74;" value="${dataFiltroYMD}" onchange="cambiaDataCucina(this.value)">
          </div>
        </div>

        <!-- ALERT EVENTUALE VARIAZIONE MENU DEL GIORNO -->
        ${haVariazioneOggi ? `
          <div style="margin-top: 12px; background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="font-weight: 800; color: #b45309; font-size: 13px;">📢 Variazione Menu Attiva per ${pastoVar.toUpperCase()}:</span>
              <div style="font-size: 14px; font-weight: 700; color: #78350f; margin-top: 2px;">
                "${escapeHtml(testoVar)}"
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline no-print" onclick="apriModalVariazioneCuoca('${dataFiltroYMD}', '${pastoVar}')" style="font-size: 11px; padding: 4px 8px; border-color: #d97706; color: #b45309;">
              Modifica
            </button>
          </div>
        ` : ''}

        <!-- ORARI DI BLOCCO ATTUALI -->
        <div style="margin-top: 8px; font-size: 11.5px; color: #9a3412; display: flex; align-items: center; gap: 6px;">
          <span>ℹ️ Orari di chiusura prenotazioni: Pranzo ore <strong>${appState.cachedConfig.Orario_Limite_Pranzo || '09:00'}</strong> • Cena ore <strong>${appState.cachedConfig.Orario_Limite_Cena || '14:30'}</strong></span>
        </div>
      </div>

      <!-- PREVISIONE RAPIDA PROSSIMI GIORNI PER LA SPESA & PORZIONI -->
      <div class="card no-print" style="padding: 12px 14px; margin-bottom: 14px; background: #f8fafc; border: 1px solid #e2e8f0;">
        <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <span>🛒</span> <span>Previsione Coperti Prossimi Giorni (per spesa e quantità):</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
          ${prossimiGiorni.map(pg => `
            <div onclick="cambiaDataCucina('${pg.ymd}')" style="background: ${pg.isSel ? '#ffedd5' : '#ffffff'}; border: 1px solid ${pg.isSel ? '#f97316' : '#cbd5e1'}; border-radius: 6px; padding: 8px; cursor: pointer; text-align: center; transition: all 0.15s ease;">
              <div style="font-size: 11px; font-weight: 800; color: ${pg.isSel ? '#c2410c' : '#475569'}; text-transform: uppercase;">${pg.label}</div>
              <div style="display: flex; justify-content: center; gap: 8px; margin-top: 4px; font-size: 12px;">
                <span title="Pranzo: Clicca per vedere l'elenco nominativo" onclick="event.stopPropagation(); apriModalElencoPastiCucina('${pg.ymd}', 'pranzo')" style="color: #ea580c; font-weight: 700; cursor: pointer;">☀️ ${pg.pranzo}</span>
                <span title="Cena: Clicca per vedere l'elenco nominativo" onclick="event.stopPropagation(); apriModalElencoPastiCucina('${pg.ymd}', 'cena')" style="color: #2563eb; font-weight: 700; cursor: pointer;">🌙 ${pg.cena}</span>
                ${pg.buste > 0 ? `<span title="Buste al sacco" style="color: #d97706; font-weight: 700;">🥪 ${pg.buste}</span>` : ''}
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- GRIGLIA DUE COLONNE: PRANZO E CENA -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">

        <!-- ================================================================
             COLONNA 1: ☀️ PRANZO (14:30)
             ================================================================ -->
        <div class="card" style="border-top: 4px solid #f97316; padding: 14px; display: flex; flex-direction: column;">
          <div class="flex-between" style="border-bottom: 1px solid #fed7aa; padding-bottom: 10px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">☀️</span>
              <div>
                <h3 style="margin: 0; font-size: 17px; color: #c2410c; font-weight: 800;">Pranzo (ore 14:30)</h3>
                <span class="text-xs text-muted">Coperti complessivi registrati</span>
              </div>
            </div>
            <div style="background: #fff7ed; border: 2px solid #f97316; border-radius: 20px; padding: 4px 14px; text-align: center; cursor: pointer; transition: transform 0.15s ease;" onclick="apriModalElencoPastiCucina('${dataFiltroYMD}', 'pranzo')" title="Clicca per visualizzare l'elenco dei residenti prenotati a pranzo">
              <span style="font-size: 20px; font-weight: 900; color: #c2410c;">${listaPranzo.length}</span>
              <span style="font-size: 11px; font-weight: 700; color: #9a3412; display: block;">PRESENTI 🔍</span>
            </div>
          </div>

          <!-- RIEPILOGO METRICHE PRANZO -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
            <span class="badge" style="background: #fed7aa; color: #7c2d12; font-weight: 700; font-size: 12px;">
              🍽️ In Sala: ${listaPranzo.length - countBustePranzo}
            </span>
            ${countBustePranzo > 0 ? `
              <span class="badge" style="background: #fef08a; color: #854d0e; font-weight: 800; font-size: 12px; border: 1px solid #facc15;">
                🥪 Buste al sacco: ${countBustePranzo}
              </span>
            ` : ''}
            ${countRitardiPranzo > 0 ? `
              <span class="badge" style="background: #fee2e2; color: #991b1b; font-weight: 700; font-size: 12px;">
                ⏰ In Ritardo: ${countRitardiPranzo}
              </span>
            ` : ''}
            ${countNotePranzo > 0 ? `
              <span class="badge" style="background: #e0f2fe; color: #075985; font-weight: 700; font-size: 12px;">
                💬 Note particolari: ${countNotePranzo}
              </span>
            ` : ''}
          </div>

          <!-- FILTRI RAPIDI PRANZO (NO PRINT) -->
          <div class="no-print" style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px; background: #fff7ed; padding: 6px; border-radius: 6px;">
            <button type="button" class="btn btn-sm ${filterPranzo === 'tutti' ? 'btn-primary' : 'btn-outline'}" onclick="filtraCucinaPasto('pranzo', 'tutti')" style="padding: 3px 8px; font-size: 11px;">
              Tutti (${listaPranzo.length})
            </button>
            <button type="button" class="btn btn-sm ${filterPranzo === 'in_sala' ? 'btn-primary' : 'btn-outline'}" onclick="filtraCucinaPasto('pranzo', 'in_sala')" style="padding: 3px 8px; font-size: 11px;">
              In Sala (${listaPranzo.length - countBustePranzo})
            </button>
            <button type="button" class="btn btn-sm ${filterPranzo === 'busta' ? 'btn-primary' : 'btn-outline'}" onclick="filtraCucinaPasto('pranzo', 'busta')" style="padding: 3px 8px; font-size: 11px;">
              🥪 Buste (${countBustePranzo})
            </button>
            <button type="button" class="btn btn-sm ${filterPranzo === 'ritardo' ? 'btn-primary' : 'btn-outline'}" onclick="filtraCucinaPasto('pranzo', 'ritardo')" style="padding: 3px 8px; font-size: 11px;">
              ⏰ Ritardi (${countRitardiPranzo})
            </button>
            <button type="button" class="btn btn-sm ${filterPranzo === 'note' ? 'btn-primary' : 'btn-outline'}" onclick="filtraCucinaPasto('pranzo', 'note')" style="padding: 3px 8px; font-size: 11px;">
              💬 Note (${countNotePranzo})
            </button>
          </div>

          <!-- LISTA RESIDENTI PRANZO -->
          <div style="flex: 1; overflow-y: auto; max-height: 480px;">
            ${filteredPranzo.length === 0 ? `
              <div style="text-align: center; padding: 32px 16px; color: #94a3b8;">
                <span style="font-size: 32px; display: block; margin-bottom: 6px;">🍽️</span>
                Nessuna presenza registrata per questo filtro.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${filteredPranzo.map((p, idx) => {
                  const checkKey = `pranzo_${p.email}`;
                  const isChecked = Boolean(spuntati[checkKey]);
                  const nome = (p.nome || p.email.split('@')[0]).replace(/\./g, ' ');
                  const capitalizedNome = nome.charAt(0).toUpperCase() + nome.slice(1);

                  return `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: ${isChecked ? '#f1f5f9' : '#ffffff'}; border: 1px solid ${isChecked ? '#cbd5e1' : '#e2e8f0'}; border-radius: 6px; opacity: ${isChecked ? '0.6' : '1'};">
                      <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                        <span style="font-size: 11px; font-weight: 700; color: #94a3b8; width: 18px;">${idx + 1}.</span>
                        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCucinaSpuntato('${checkKey}')" style="width: 18px; height: 18px; cursor: pointer; accent-color: #ea580c;" title="Segna come servito / ritirato">
                        <div>
                          <span style="font-weight: 700; font-size: 13.5px; color: #0f172a; text-decoration: ${isChecked ? 'line-through' : 'none'};">
                            ${escapeHtml(capitalizedNome)}
                          </span>
                          <span class="text-xs text-muted" style="display: block;">${escapeHtml(p.email)}</span>
                          ${p.note ? `
                            <div style="margin-top: 3px; font-size: 12px; font-weight: 700; color: #c2410c; background: #fff7ed; padding: 2px 6px; border-radius: 4px; display: inline-block;">
                              💬 Note: ${escapeHtml(p.note)}
                            </div>
                          ` : ''}
                        </div>
                      </div>

                      <div style="display: flex; gap: 4px; align-items: center;">
                        ${p.busta ? '<span class="badge" style="background: #fef08a; color: #854d0e; font-weight: 800; font-size: 11px;">🥪 BUSTA</span>' : ''}
                        ${p.ritardo ? '<span class="badge" style="background: #fee2e2; color: #991b1b; font-weight: 800; font-size: 11px;">⏰ RITARDO</span>' : ''}
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            `}
          </div>
        </div>

        <!-- ================================================================
             COLONNA 2: 🌙 CENA (19:30)
             ================================================================ -->
        <div class="card" style="border-top: 4px solid #2563eb; padding: 14px; display: flex; flex-direction: column;">
          <div class="flex-between" style="border-bottom: 1px solid #bfdbfe; padding-bottom: 10px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">🌙</span>
              <div>
                <h3 style="margin: 0; font-size: 17px; color: #1d4ed8; font-weight: 800;">Cena (ore 19:30)</h3>
                <span class="text-xs text-muted">Coperti complessivi registrati</span>
              </div>
            </div>
            <div style="background: #eff6ff; border: 2px solid #2563eb; border-radius: 20px; padding: 4px 14px; text-align: center; cursor: pointer; transition: transform 0.15s ease;" onclick="apriModalElencoPastiCucina('${dataFiltroYMD}', 'cena')" title="Clicca per visualizzare l'elenco dei residenti prenotati a cena">
              <span style="font-size: 20px; font-weight: 900; color: #1d4ed8;">${listaCena.length}</span>
              <span style="font-size: 11px; font-weight: 700; color: #1e40af; display: block;">PRESENTI 🔍</span>
            </div>
          </div>

          <!-- RIEPILOGO METRICHE CENA -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
            <span class="badge" style="background: #dbeafe; color: #1e3a8a; font-weight: 700; font-size: 12px;">
              🍽️ In Sala: ${listaCena.length - countBusteCena}
            </span>
            ${countBusteCena > 0 ? `
              <span class="badge" style="background: #fef08a; color: #854d0e; font-weight: 800; font-size: 12px; border: 1px solid #facc15;">
                🥪 Buste al sacco: ${countBusteCena}
              </span>
            ` : ''}
            ${countRitardiCena > 0 ? `
              <span class="badge" style="background: #fee2e2; color: #991b1b; font-weight: 700; font-size: 12px;">
                ⏰ In Ritardo: ${countRitardiCena}
              </span>
            ` : ''}
            ${countNoteCena > 0 ? `
              <span class="badge" style="background: #e0f2fe; color: #075985; font-weight: 700; font-size: 12px;">
                💬 Note particolari: ${countNoteCena}
              </span>
            ` : ''}
          </div>

          <!-- FILTRI RAPIDI CENA (NO PRINT) -->
          <div class="no-print" style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px; background: #eff6ff; padding: 6px; border-radius: 6px;">
            <button type="button" class="btn btn-sm ${filterCena === 'tutti' ? 'btn-primary' : 'btn-outline'}" onclick="filtraCucinaPasto('cena', 'tutti')" style="padding: 3px 8px; font-size: 11px;">
              Tutti (${listaCena.length})
            </button>
            <button type="button" class="btn btn-sm ${filterCena === 'in_sala' ? 'btn-primary' : 'btn-outline'}" onclick="filtraCucinaPasto('cena', 'in_sala')" style="padding: 3px 8px; font-size: 11px;">
              In Sala (${listaCena.length - countBusteCena})
            </button>
            <button type="button" class="btn btn-sm ${filterCena === 'busta' ? 'btn-primary' : 'btn-outline'}" onclick="filtraCucinaPasto('cena', 'busta')" style="padding: 3px 8px; font-size: 11px;">
              🥪 Buste (${countBusteCena})
            </button>
            <button type="button" class="btn btn-sm ${filterCena === 'ritardo' ? 'btn-primary' : 'btn-outline'}" onclick="filtraCucinaPasto('cena', 'ritardo')" style="padding: 3px 8px; font-size: 11px;">
              ⏰ Ritardi (${countRitardiCena})
            </button>
            <button type="button" class="btn btn-sm ${filterCena === 'note' ? 'btn-primary' : 'btn-outline'}" onclick="filtraCucinaPasto('cena', 'note')" style="padding: 3px 8px; font-size: 11px;">
              💬 Note (${countNoteCena})
            </button>
          </div>

          <!-- LISTA RESIDENTI CENA -->
          <div style="flex: 1; overflow-y: auto; max-height: 480px;">
            ${filteredCena.length === 0 ? `
              <div style="text-align: center; padding: 32px 16px; color: #94a3b8;">
                <span style="font-size: 32px; display: block; margin-bottom: 6px;">🌙</span>
                Nessuna presenza registrata per questo filtro.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${filteredCena.map((p, idx) => {
                  const checkKey = `cena_${p.email}`;
                  const isChecked = Boolean(spuntati[checkKey]);
                  const nome = (p.nome || p.email.split('@')[0]).replace(/\./g, ' ');
                  const capitalizedNome = nome.charAt(0).toUpperCase() + nome.slice(1);

                  return `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: ${isChecked ? '#f1f5f9' : '#ffffff'}; border: 1px solid ${isChecked ? '#cbd5e1' : '#e2e8f0'}; border-radius: 6px; opacity: ${isChecked ? '0.6' : '1'};">
                      <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                        <span style="font-size: 11px; font-weight: 700; color: #94a3b8; width: 18px;">${idx + 1}.</span>
                        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCucinaSpuntato('${checkKey}')" style="width: 18px; height: 18px; cursor: pointer; accent-color: #2563eb;" title="Segna come servito / ritirato">
                        <div>
                          <span style="font-weight: 700; font-size: 13.5px; color: #0f172a; text-decoration: ${isChecked ? 'line-through' : 'none'};">
                            ${escapeHtml(capitalizedNome)}
                          </span>
                          <span class="text-xs text-muted" style="display: block;">${escapeHtml(p.email)}</span>
                          ${p.note ? `
                            <div style="margin-top: 3px; font-size: 12px; font-weight: 700; color: #1d4ed8; background: #eff6ff; padding: 2px 6px; border-radius: 4px; display: inline-block;">
                              💬 Note: ${escapeHtml(p.note)}
                            </div>
                          ` : ''}
                        </div>
                      </div>

                      <div style="display: flex; gap: 4px; align-items: center;">
                        ${p.busta ? '<span class="badge" style="background: #fef08a; color: #854d0e; font-weight: 800; font-size: 11px;">🥪 BUSTA</span>' : ''}
                        ${p.ritardo ? '<span class="badge" style="background: #fee2e2; color: #991b1b; font-weight: 800; font-size: 11px;">⏰ RITARDO</span>' : ''}
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            `}
          </div>
        </div>

      </div>

    </div>
  `;

  container.innerHTML = html;
};

// ----------------------------------------------------------------------------
// LOGICA MODAL DETTAGLIO PRENOTATI PASTO (CUCINA DRILL-DOWN)
// ----------------------------------------------------------------------------

window.apriModalElencoPastiCucina = function(dataYMD, tipoPasto) {
  const modal = document.getElementById("modal-elenco-pasti-cucina");
  if (!modal) return;

  const targetDate = dataYMD || appState.cucinaSelectedDate || formatYMD(new Date());
  const targetPasto = (tipoPasto || "pranzo").toLowerCase();

  appState.cucinaModalState = {
    isOpen: true,
    dataYMD: targetDate,
    tipoPasto: targetPasto,
    filtro: "tutti",
    search: ""
  };

  const searchInput = document.getElementById("modal-cucina-search");
  if (searchInput) searchInput.value = "";

  modal.style.display = "flex";
  renderContenutoModalCucina();
};

window.chiudiModalElencoPastiCucina = function() {
  const modal = document.getElementById("modal-elenco-pasti-cucina");
  if (modal) modal.style.display = "none";
  if (appState.cucinaModalState) {
    appState.cucinaModalState.isOpen = false;
  }
};

window.applicaFiltriModalCucina = function(filtro) {
  if (!appState.cucinaModalState) return;
  if (filtro !== undefined) {
    appState.cucinaModalState.filtro = filtro;
  }
  const searchInput = document.getElementById("modal-cucina-search");
  if (searchInput) {
    appState.cucinaModalState.search = searchInput.value.trim().toLowerCase();
  }
  renderContenutoModalCucina();
};

window.renderContenutoModalCucina = function() {
  if (!appState.cucinaModalState || !appState.cucinaModalState.isOpen) return;

  const { dataYMD, tipoPasto, filtro, search } = appState.cucinaModalState;

  const iconEl = document.getElementById("modal-cucina-icon");
  const titoloEl = document.getElementById("modal-cucina-titolo");
  const sottotitoloEl = document.getElementById("modal-cucina-sottotitolo");
  const filtriContainer = document.getElementById("modal-cucina-filtri");
  const elencoContainer = document.getElementById("modal-cucina-elenco-container");

  const isPranzo = tipoPasto === "pranzo";
  if (iconEl) iconEl.innerText = isPranzo ? "☀️" : "🌙";
  if (titoloEl) titoloEl.innerText = isPranzo ? "Residenti Prenotati Pranzo (14:30)" : "Residenti Prenotati Cena (19:30)";

  let dataEstesa = dataYMD;
  try {
    const d = new Date(dataYMD + "T12:00:00");
    dataEstesa = d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    dataEstesa = dataEstesa.charAt(0).toUpperCase() + dataEstesa.slice(1);
  } catch (e) {}

  const dbMensa = appState.mensaBookings || [];
  const tuttiUtenti = appState.tuttiUtenti || [];

  const prenotazioniPasto = dbMensa.filter(m => String(m.data).split("T")[0] === dataYMD && m.tipo_pasto === tipoPasto);

  const prenotati = prenotazioniPasto.map(p => {
    const userMatch = tuttiUtenti.find(u => u.email.toLowerCase() === p.email.toLowerCase());
    let nomeVisualizzato = "";
    if (userMatch && userMatch.nome) {
      nomeVisualizzato = userMatch.nome;
    } else {
      const emailBase = p.email.split("@")[0].replace(/\./g, " ");
      nomeVisualizzato = emailBase.charAt(0).toUpperCase() + emailBase.slice(1);
    }
    return {
      ...p,
      nomeVisualizzato
    };
  });

  const countBuste = prenotati.filter(p => p.busta).length;
  const countRitardi = prenotati.filter(p => p.ritardo).length;
  const countNote = prenotati.filter(p => p.note && p.note.trim()).length;
  const countInSala = prenotati.length - countBuste;

  if (sottotitoloEl) {
    sottotitoloEl.innerHTML = `📅 <strong>${dataEstesa}</strong> • Totale: <strong>${prenotati.length} coperti</strong> (${countInSala} in sala, ${countBuste} buste)`;
  }

  if (filtriContainer) {
    filtriContainer.innerHTML = `
      <button type="button" class="btn btn-sm ${filtro === 'tutti' ? 'btn-primary' : 'btn-outline'}" onclick="applicaFiltriModalCucina('tutti')" style="padding: 3px 8px; font-size: 11px;">
        Tutti (${prenotati.length})
      </button>
      <button type="button" class="btn btn-sm ${filtro === 'in_sala' ? 'btn-primary' : 'btn-outline'}" onclick="applicaFiltriModalCucina('in_sala')" style="padding: 3px 8px; font-size: 11px;">
        🍽️ In Sala (${countInSala})
      </button>
      <button type="button" class="btn btn-sm ${filtro === 'busta' ? 'btn-primary' : 'btn-outline'}" onclick="applicaFiltriModalCucina('busta')" style="padding: 3px 8px; font-size: 11px;">
        🥪 Buste (${countBuste})
      </button>
      <button type="button" class="btn btn-sm ${filtro === 'ritardo' ? 'btn-primary' : 'btn-outline'}" onclick="applicaFiltriModalCucina('ritardo')" style="padding: 3px 8px; font-size: 11px;">
        ⏰ Ritardi (${countRitardi})
      </button>
      ${countNote > 0 ? `
        <button type="button" class="btn btn-sm ${filtro === 'note' ? 'btn-primary' : 'btn-outline'}" onclick="applicaFiltriModalCucina('note')" style="padding: 3px 8px; font-size: 11px;">
          💬 Note (${countNote})
        </button>
      ` : ''}
    `;
  }

  let list = prenotati.slice();
  if (filtro === "in_sala") list = list.filter(p => !p.busta && !p.ritardo);
  if (filtro === "busta") list = list.filter(p => p.busta);
  if (filtro === "ritardo") list = list.filter(p => p.ritardo);
  if (filtro === "note") list = list.filter(p => p.note && p.note.trim());

  if (search) {
    list = list.filter(p =>
      p.nomeVisualizzato.toLowerCase().includes(search) ||
      p.email.toLowerCase().includes(search) ||
      (p.note && p.note.toLowerCase().includes(search))
    );
  }

  let spuntati = {};
  try {
    spuntati = JSON.parse(localStorage.getItem(`newman_cucina_spuntati_${dataYMD}`) || "{}");
  } catch (e) {
    spuntati = {};
  }

  if (elencoContainer) {
    if (list.length === 0) {
      elencoContainer.innerHTML = `
        <div style="text-align: center; padding: 36px 16px; color: #94a3b8;">
          <span style="font-size: 36px; display: block; margin-bottom: 8px;">🍽️</span>
          <div style="font-size: 14px; font-weight: 700; color: #64748b;">Nessun residente trovato</div>
          <div style="font-size: 12px; margin-top: 4px;">Non ci sono prenotazioni registrate per questa selezione.</div>
        </div>
      `;
      return;
    }

    elencoContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${list.map((p, idx) => {
          const checkKey = `${tipoPasto}_${p.email}`;
          const isChecked = Boolean(spuntati[checkKey]);

          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: ${isChecked ? '#f1f5f9' : '#ffffff'}; border: 1px solid ${isChecked ? '#cbd5e1' : '#e2e8f0'}; border-radius: 6px; opacity: ${isChecked ? '0.65' : '1'}; transition: all 0.1s ease;">
              <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                <span style="font-size: 12px; font-weight: 800; color: #94a3b8; width: 22px; flex-shrink: 0;">${idx + 1}.</span>
                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCucinaSpuntatoModal('${checkKey}')" style="width: 19px; height: 19px; cursor: pointer; accent-color: ${isPranzo ? '#ea580c' : '#2563eb'}; flex-shrink: 0;" title="Segna come servito / ritirato">
                <div style="min-width: 0;">
                  <div style="font-weight: 700; font-size: 14px; color: #0f172a; text-decoration: ${isChecked ? 'line-through' : 'none'}; word-break: break-word;">
                    ${escapeHtml(p.nomeVisualizzato)}
                  </div>
                  <div class="text-xs text-muted" style="word-break: break-all;">${escapeHtml(p.email)}</div>
                  ${p.note ? `
                    <div style="margin-top: 3px; font-size: 11.5px; font-weight: 700; color: ${isPranzo ? '#c2410c' : '#1d4ed8'}; background: ${isPranzo ? '#fff7ed' : '#eff6ff'}; padding: 2px 6px; border-radius: 4px; display: inline-block;">
                      💬 Note: ${escapeHtml(p.note)}
                    </div>
                  ` : ''}
                </div>
              </div>

              <div style="display: flex; gap: 4px; align-items: center; flex-shrink: 0;">
                ${p.busta ? '<span class="badge" style="background: #fef08a; color: #854d0e; font-weight: 800; font-size: 11px;">🥪 BUSTA</span>' : ''}
                ${p.ritardo ? '<span class="badge" style="background: #fee2e2; color: #991b1b; font-weight: 800; font-size: 11px;">⏰ RITARDO</span>' : ''}
                ${(!p.busta && !p.ritardo) ? '<span class="badge" style="background: #dcfce7; color: #166534; font-weight: 700; font-size: 11px;">🍽️ In Sala</span>' : ''}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }
};

window.toggleCucinaSpuntatoModal = function(key) {
  if (!appState.cucinaModalState) return;
  const dataYMD = appState.cucinaModalState.dataYMD;
  const storageKey = `newman_cucina_spuntati_${dataYMD}`;
  let spuntati = {};
  try {
    spuntati = JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch (e) {
    spuntati = {};
  }
  spuntati[key] = !spuntati[key];
  localStorage.setItem(storageKey, JSON.stringify(spuntati));
  renderContenutoModalCucina();
  if (typeof renderCucinaView === "function") {
    renderCucinaView();
  }
};

window.copiaTestoElencoCucinaModal = function() {
  if (!appState.cucinaModalState) return;
  const { dataYMD, tipoPasto } = appState.cucinaModalState;
  const dbMensa = appState.mensaBookings || [];
  const tuttiUtenti = appState.tuttiUtenti || [];
  const prenotazioniPasto = dbMensa.filter(m => String(m.data).split("T")[0] === dataYMD && m.tipo_pasto === tipoPasto);

  let text = `REGISTRO MENSA RESIDENZA NEWMAN\n`;
  text += `Data: ${dataYMD} - Pasto: ${tipoPasto.toUpperCase()}\n`;
  text += `Totale Coperti: ${prenotazioniPasto.length}\n`;
  text += `--------------------------------------------------\n`;

  prenotazioniPasto.forEach((p, i) => {
    const userMatch = tuttiUtenti.find(u => u.email.toLowerCase() === p.email.toLowerCase());
    const nome = userMatch?.nome || p.email.split("@")[0].replace(/\./g, " ");
    let flags = [];
    if (p.busta) flags.push("BUSTA");
    if (p.ritardo) flags.push("RITARDO");
    if (!p.busta && !p.ritardo) flags.push("IN SALA");
    if (p.note) flags.push(`Note: ${p.note}`);
    text += `${i + 1}. ${nome} (${p.email}) [${flags.join(" - ")}]\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    mostraToast("📋 Elenco residenti copiato negli appunti!", "success");
  }).catch(() => {
    mostraToast("Elenco pronto", "info");
  });
};

window.stampaElencoCucinaModal = function() {
  window.print();
};

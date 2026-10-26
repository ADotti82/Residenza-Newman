/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - CENTRAL APPLICATION STATE STORE
 * ============================================================================
 */

import { STORAGE_KEYS, INITIAL_MOCK_DB } from "./config.js";
import { formatYMD } from "./utils.js";

export const appState = {
  user: null,
  backendUrl: "",
  currentTab: "info",
  previousTab: "info",
  mensaViewMode: "giorno",
  selectedDateMensa: null,
  cachedConfig: {},
  prenotazioniSpazi: [],
  bacheca: [],
  selectedBachecaDate: null,
  selectedSpazioRisorsa: "Chiesa",
  selectedSpazioData: "",
  selectedSpazioFascia: "tutti",
  mensaBookings: [],
  accoglienzaList: [],
  guasti: [],
  manutenzioneList: [],
  tuttiUtenti: [],
  utentiInAttesa: [],
  compressedImageBase64: null,
  isOfflineMode: false,
  bypassTimeLock: false,
  masterActiveTab: "utenti",
  masterVistaSchede: true,
  masterVistaTutto: false,
  masterMensaDate: "",
  cucinaModalState: { pasto: "pranzo", dataYMD: "", filtro: "tutti", search: "" },
  cucinaSelectedDate: "",
  cucinaFilterPranzo: "tutti",
  cucinaFilterCena: "tutti",
  consultaMenuState: { settimana: "settimana1" },
  modificaMenuState: { settimana: "settimana1", giorno: "lunedi" },
  gestioneBusteMasterState: { dataYMD: "", search: "", filtro: "tutti" },
  calendarioFiltroAmbiente: "tutti",
  calendarioFiltroPeriodo: "prossimi",
  calendarioSearchText: "",
  assenze: [],
  calendarioAssenzeMese: new Date(),
  filtroAssenzeTesto: "",
  filtroAssenzeSoloMensa: false,
  dettaglioGiornoAssenzeData: ""
};

if (typeof window !== "undefined") {
  window.appState = appState;
}

export function initStorage() {
  const URL_CORRETTO = "https://script.google.com/macros/s/AKfycbys9aPfUH6PXGCmHPDWset6pgvwG1kmxUlDFv3Yaiq8uAfp_2uiswm7DNd8_tQqDHHxVg/exec";
  const storedBackendUrl = localStorage.getItem(STORAGE_KEYS.BACKEND_URL);

  if (!storedBackendUrl || !storedBackendUrl.includes("AKfycbys9aPfUH6PXGCmHPDWset6pgvwG1kmxUlDFv3Yaiq8uAfp")) {
    localStorage.setItem(STORAGE_KEYS.BACKEND_URL, URL_CORRETTO);
  }

  appState.backendUrl = localStorage.getItem(STORAGE_KEYS.BACKEND_URL) || URL_CORRETTO;
  appState.bypassTimeLock = localStorage.getItem(STORAGE_KEYS.BYPASS_TIME_LOCK) === "true";
  appState.selectedBachecaDate = new Date();
  appState.selectedSpazioData = formatYMD(new Date());
  appState.cucinaSelectedDate = formatYMD(new Date());
  appState.masterMensaDate = formatYMD(new Date());

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
      if (parsed.prenotazioni_spazi) {
        const valid = parsed.prenotazioni_spazi.filter(p => p.risorsa === "Chiesa" || p.risorsa === "Sala TV");
        const hasPendingSpazi = valid.some(p => p.stato === "In Attesa");
        if (!hasPendingSpazi) {
          INITIAL_MOCK_DB.prenotazioni_spazi.filter(p => p.stato === "In Attesa").forEach(p => valid.push(p));
          needsSave = true;
        }
        if (valid.length !== parsed.prenotazioni_spazi.length || needsSave) {
          parsed.prenotazioni_spazi = valid;
          needsSave = true;
        }
      } else {
        parsed.prenotazioni_spazi = INITIAL_MOCK_DB.prenotazioni_spazi;
        needsSave = true;
      }
      if (parsed.utenti) {
        parsed.utenti.forEach(u => {
          const isDotti = String(u.email || "").toLowerCase().includes("dotti");
          if (!isDotti && !u.perm_admin) {
            if (u.perm_spazi) { u.perm_spazi = false; needsSave = true; }
            if (u.notif_manutenzione === undefined) { u.notif_manutenzione = false; needsSave = true; }
            if (u.notif_spazi === undefined) { u.notif_spazi = false; needsSave = true; }
          } else {
            if (u.notif_manutenzione === undefined) { u.notif_manutenzione = true; needsSave = true; }
            if (u.notif_spazi === undefined) { u.notif_spazi = true; needsSave = true; }
          }
          if (u.is_utente_mensa === undefined) { u.is_utente_mensa = true; needsSave = true; }
        });
      }
      if (!parsed.accoglienza || parsed.accoglienza.length === 0) {
        parsed.accoglienza = INITIAL_MOCK_DB.accoglienza;
        needsSave = true;
      } else {
        const hasPendingAcc = parsed.accoglienza.some(a => (a.stato || "").includes("In Attesa"));
        if (!hasPendingAcc) {
          INITIAL_MOCK_DB.accoglienza.filter(a => (a.stato || "").includes("In Attesa")).forEach(a => parsed.accoglienza.push(a));
          needsSave = true;
        }
      }
      if (!parsed.assenze || parsed.assenze.length === 0) {
        parsed.assenze = INITIAL_MOCK_DB.assenze || [];
        needsSave = true;
      }
      if (!parsed.configurazione) {
        parsed.configurazione = INITIAL_MOCK_DB.configurazione;
        needsSave = true;
      }
      if (needsSave) {
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(parsed));
      }
    } catch (e) {
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(INITIAL_MOCK_DB));
    }
  }

  appState.isOfflineMode = !appState.backendUrl;
  if (typeof window.aggiornaIndicatoreConnessione === "function") {
    window.aggiornaIndicatoreConnessione();
  }
}

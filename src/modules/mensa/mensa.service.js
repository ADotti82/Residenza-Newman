/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - DOMINIO MENSA (SERVICE LAYER)
 * ============================================================================
 */

import { MENU_ANCHOR_DATE, INITIAL_MOCK_DB, STORAGE_KEYS } from "../../core/config.js";
import { appState } from "../../core/state.js";
import { formattaDataConfronto, formatYMD } from "../../core/utils.js";

export function getSettimanaMenu(dataTarget) {
  const dTarget = new Date(dataTarget.getFullYear(), dataTarget.getMonth(), dataTarget.getDate());
  const dAnchor = new Date(MENU_ANCHOR_DATE.getFullYear(), MENU_ANCHOR_DATE.getMonth(), MENU_ANCHOR_DATE.getDate());
  const diffMs = dTarget.getTime() - dAnchor.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  let isSettimana2 = Math.abs(diffWeeks) % 2 === 0;
  const isInvertito = appState.cachedConfig?.Inverti_Ciclo_Menu === "true" || localStorage.getItem("newman_inverti_menu") === "true";
  if (isInvertito) isSettimana2 = !isSettimana2;
  return isSettimana2 ? "settimana2" : "settimana1";
}

export function getNomeGiorno(data) {
  const giorni = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];
  return giorni[data.getDay()];
}

export function getListaUtentiMensa() {
  const list = (appState.tuttiUtenti && appState.tuttiUtenti.length > 0)
    ? appState.tuttiUtenti
    : (INITIAL_MOCK_DB.utenti || []);
  let result = list.filter(u => u.stato === "Approvato" && u.is_utente_mensa !== false);
  if (appState.user && appState.user.stato === "Approvato" && appState.user.is_utente_mensa !== false) {
    const userEmail = appState.user.email.toLowerCase().trim();
    if (!result.some(u => String(u.email || "").toLowerCase().trim() === userEmail)) {
      result.push(appState.user);
    }
  }
  return result;
}

export function isPastoBustaGiorno(dataVal, tipoPasto) {
  if (String(tipoPasto || "").trim().toLowerCase() !== "pranzo") return false;
  let d;
  if (dataVal instanceof Date) d = dataVal;
  else {
    const s = String(dataVal).split("T")[0];
    d = new Date(s + "T12:00:00");
  }
  const day = d.getDay();
  if (day === 2 || day === 4) return true; // martedì o giovedì

  try {
    const cicloSettimana = getSettimanaMenu(d);
    const giornoKey = getNomeGiorno(d);
    const menuStorage = localStorage.getItem(STORAGE_KEYS.MENU_14_GIORNI);
    const menuObj = menuStorage ? JSON.parse(menuStorage) : null;
    const menuGiorno = menuObj?.[cicloSettimana]?.[giornoKey]?.pranzo;
    if (menuGiorno && (menuGiorno.opzioneBustaDisponibile || menuGiorno.busta)) {
      return true;
    }
  } catch (e) {}
  return false;
}

export function calcolaContatoreMensa(dataStr, tipoPasto) {
  const isBustaMeal = isPastoBustaGiorno(dataStr, tipoPasto);
  const utentiMensa = getListaUtentiMensa();
  const dbMensa = appState.mensaBookings || [];
  const prenotazioniPasto = dbMensa.filter(m => formattaDataConfronto(m.data) === dataStr && m.tipo_pasto === tipoPasto);

  if (isBustaMeal) {
    const prenotatiBusta = prenotazioniPasto.filter(m => m.busta && m.stato_presenza !== "assente" && m.stato_presenza !== "Assente");
    const countBuste = prenotatiBusta.reduce((acc, m) => acc + 1 + (parseInt(m.ospiti, 10) || 0), 0);
    const countAssenti = prenotazioniPasto.filter(m => m.stato_presenza === "assente" || m.stato_presenza === "Assente").length;
    const countRitardi = prenotatiBusta.filter(m => m.ritardo).length;
    return {
      totale: countBuste,
      inSala: 0,
      buste: countBuste,
      assenti: countAssenti,
      ritardi: countRitardi,
      ospitiTotali: prenotatiBusta.reduce((acc, m) => acc + (parseInt(m.ospiti, 10) || 0), 0),
      isBustaGiorno: true
    };
  }

  let countAssenti = 0;
  let countBuste = 0;
  let countRitardi = 0;
  let ospitiTotali = 0;

  const prenotazioniMap = new Map();
  prenotazioniPasto.forEach(p => {
    if (p.email) prenotazioniMap.set(p.email.toLowerCase().trim(), p);
  });

  const dettagliPresenti = [];

  utentiMensa.forEach(u => {
    const emailNorm = String(u.email || "").toLowerCase().trim();
    const pren = prenotazioniMap.get(emailNorm);
    const isAssente = pren && (pren.stato_presenza === "assente" || pren.stato_presenza === "Assente");
    const haBusta = pren && Boolean(pren.busta);
    const inRitardo = pren && Boolean(pren.ritardo);
    const ospiti = pren ? Math.max(0, parseInt(pren.ospiti, 10) || 0) : 0;

    if (isAssente) {
      countAssenti++;
    } else if (haBusta) {
      countBuste += (1 + ospiti);
      ospitiTotali += ospiti;
      dettagliPresenti.push({ ...u, busta: true, ritardo: inRitardo, ospiti, note: pren?.note || "", defaultPresence: false });
    } else {
      if (inRitardo) countRitardi++;
      ospitiTotali += ospiti;
      dettagliPresenti.push({ ...u, busta: false, ritardo: inRitardo, ospiti, note: pren?.note || "", defaultPresence: !pren });
    }
  });

  prenotazioniPasto.forEach(p => {
    const emailNorm = String(p.email || "").toLowerCase().trim();
    const giaIncluso = utentiMensa.some(u => String(u.email || "").toLowerCase().trim() === emailNorm);
    if (!giaIncluso && p.stato_presenza !== "assente" && p.stato_presenza !== "Assente") {
      const ospiti = Math.max(0, parseInt(p.ospiti, 10) || 0);
      if (p.busta) countBuste += (1 + ospiti);
      if (p.ritardo) countRitardi++;
      ospitiTotali += ospiti;
      dettagliPresenti.push({ email: p.email, nome: p.nome || p.email.split("@")[0], busta: Boolean(p.busta), ritardo: Boolean(p.ritardo), ospiti, note: p.note || "", defaultPresence: false });
    }
  });

  const basePresenti = utentiMensa.length;
  const ospitiInSala = ospitiTotali - (prenotazioniPasto.filter(m => m.busta).reduce((s, m) => s + (parseInt(m.ospiti, 10) || 0), 0));
  const busteResidenti = prenotazioniPasto.filter(m => m.busta && m.stato_presenza !== "assente" && m.stato_presenza !== "Assente").length;
  const inSala = Math.max(0, basePresenti - countAssenti - busteResidenti) + Math.max(0, ospitiInSala);
  const totalePasti = inSala + countBuste;

  return {
    totale: totalePasti,
    inSala: inSala,
    buste: countBuste,
    assenti: countAssenti,
    ritardi: countRitardi,
    ospitiTotali: ospitiTotali,
    dettagliPresenti: dettagliPresenti,
    isBustaGiorno: false
  };
}

if (typeof window !== "undefined") {
  window.getSettimanaMenu = getSettimanaMenu;
  window.getNomeGiorno = getNomeGiorno;
  window.getListaUtentiMensa = getListaUtentiMensa;
  window.isPastoBustaGiorno = isPastoBustaGiorno;
  window.calcolaContatoreMensa = calcolaContatoreMensa;
}

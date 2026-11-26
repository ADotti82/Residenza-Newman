/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - DOMINIO MENSA (SERVICE LAYER)
 * ============================================================================
 */

import { appState as moduleAppState } from "../../core/state.js";
import { INITIAL_MOCK_DB } from "../../core/config.js";
import { formattaDataConfronto, isTruthyVal } from "../../core/utils.js";

function getActiveAppState() {
  if (typeof window !== "undefined" && window.appState) {
    return window.appState;
  }
  return moduleAppState;
}

/**
 * Ritorna l'elenco dei residenti con diritto di mensa (Stato Approvato e is_utente_mensa !== false)
 */
export function getListaUtentiMensa() {
  const st = getActiveAppState();
  const list = (st.tuttiUtenti && st.tuttiUtenti.length > 0)
    ? st.tuttiUtenti
    : (INITIAL_MOCK_DB.utenti || []);
  const result = list.filter(u => u.stato === "Approvato" && u.is_utente_mensa !== false);
  if (st.user && st.user.stato === "Approvato" && st.user.is_utente_mensa !== false) {
    const userEmail = String(st.user.email || "").toLowerCase().trim();
    if (userEmail && !result.some(u => String(u.email || "").toLowerCase().trim() === userEmail)) {
      result.push(st.user);
    }
  }
  return result;
}

/**
 * Controlla se il pasto è contrassegnato dalla busta (pranzo al sacco).
 * Di norma martedì e giovedì a pranzo.
 */
export function isPastoBustaGiorno(dataVal, tipoPasto) {
  if (String(tipoPasto || "").trim().toLowerCase() !== "pranzo") return false;
  let d;
  if (dataVal instanceof Date) d = dataVal;
  else {
    const s = String(dataVal).split("T")[0];
    d = new Date(s + "T12:00:00");
  }
  const day = d.getDay();
  return (day === 2 || day === 4);
}

/**
 * Trova il nome leggibile di un residente tramite email
 */
export function trovaNomeUtente(email) {
  if (!email) return "Residente";
  const st = getActiveAppState();
  const emailLow = String(email).toLowerCase().trim();
  const u = (st.tuttiUtenti || []).find(x => String(x.email || "").toLowerCase().trim() === emailLow)
    || (INITIAL_MOCK_DB.utenti || []).find(x => String(x.email || "").toLowerCase().trim() === emailLow);
  if (u && u.nome) return u.nome;
  const base = emailLow.split("@")[0].replace(/\./g, " ");
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function getAssenzaMensaAttivaLocale(dataStr, tipoPasto, userEmail) {
  if (typeof window !== "undefined" && typeof window.getAssenzaMensaAttiva === "function") {
    return window.getAssenzaMensaAttiva(dataStr, tipoPasto, userEmail);
  }
  if (!dataStr || !userEmail) return null;
  const st = getActiveAppState();
  const emailNorm = String(userEmail).toLowerCase().trim();
  const pastoNorm = String(tipoPasto || "pranzo").toLowerCase().trim();
  const list = st.assenze || [];
  let matched = null;
  for (let i = 0; i < list.length; i++) {
    const raw = list[i];
    if (!raw || typeof raw !== "object") continue;
    const assenteMensa = (raw.assente_mensa === false || String(raw.assente_mensa).toLowerCase() === "false") ? false : true;
    if (!assenteMensa) continue;
    if (String(raw.email || "").toLowerCase().trim() !== emailNorm) continue;
    const dInizio = formattaDataConfronto(raw.data_inizio);
    const dFine = formattaDataConfronto(raw.data_fine || raw.data_inizio) || dInizio;
    if (!dInizio) continue;
    let pasti = ["pranzo", "cena"];
    if (Array.isArray(raw.pasti_interessati) && raw.pasti_interessati.length > 0) {
      pasti = raw.pasti_interessati.map(p => String(p).trim().toLowerCase()).filter(Boolean);
    } else if (typeof raw.pasti_interessati === "string" && raw.pasti_interessati.trim()) {
      pasti = raw.pasti_interessati.split(",").map(p => p.trim().toLowerCase()).filter(Boolean);
    }
    if (dataStr >= dInizio && dataStr <= dFine && pasti.includes(pastoNorm)) {
      matched = raw;
    }
  }
  return matched;
}

function verificaAssenzaOverrideLocale(pren, assenzaAttiva) {
  if (!assenzaAttiva) return false;
  if (!pren) return true;
  const statoLower = String(pren.stato_presenza || "").toLowerCase();
  if (statoLower === "assente") return true;
  if (pren._manualOverrideAfterAssenza) return false;
  const tPren = pren.timestamp ? new Date(pren.timestamp).getTime() : 0;
  const tAss = assenzaAttiva.created_at ? new Date(assenzaAttiva.created_at).getTime() : 0;
  if (tPren > 0 && tAss > 0 && tPren > tAss && statoLower === "presente") {
    return false;
  }
  return true;
}

/**
 * Calcola il contatore pasti integrando le assenze prolungate e delegando al motore
 * unificato di app.js quando disponibile.
 */
export function calcolaContatoreMensa(dataStr, tipoPasto) {
  if (typeof window !== "undefined" && typeof window._appCalcolaContatoreMensa === "function") {
    return window._appCalcolaContatoreMensa(dataStr, tipoPasto);
  }

  const st = getActiveAppState();
  const isBustaMeal = isPastoBustaGiorno(dataStr, tipoPasto);
  const utentiMensa = getListaUtentiMensa();
  const dbMensa = st.mensaBookings || [];
  const tipoNorm = String(tipoPasto || "").toLowerCase().trim();
  const prenotazioniPasto = dbMensa.filter(
    m => formattaDataConfronto(m.data) === dataStr && String(m.tipo_pasto || "").toLowerCase().trim() === tipoNorm
  );

  if (isBustaMeal) {
    const prenotatiBusta = prenotazioniPasto.filter(m => {
      const haBusta = isTruthyVal(m.busta) || m.busta === true || m.stato_presenza === "busta";
      const isAssExplicit = (m.stato_presenza === "assente" || m.stato_presenza === "Assente");
      const assAttiva = getAssenzaMensaAttivaLocale(dataStr, tipoNorm, m.email);
      const isAssEff = isAssExplicit || verificaAssenzaOverrideLocale(m, assAttiva);
      return haBusta && !isAssEff;
    });
    const countBuste = prenotatiBusta.reduce((acc, m) => acc + 1 + (parseInt(m.ospiti, 10) || 0), 0);
    const assentiMap = new Map();

    prenotazioniPasto.forEach(m => {
      const emailNorm = String(m.email || "").toLowerCase().trim();
      const assAttiva = getAssenzaMensaAttivaLocale(dataStr, tipoNorm, emailNorm);
      if (m.stato_presenza === "assente" || m.stato_presenza === "Assente" || verificaAssenzaOverrideLocale(m, assAttiva)) {
        if (emailNorm) {
          assentiMap.set(emailNorm, {
            email: emailNorm,
            nome: trovaNomeUtente(emailNorm),
            motivo: assAttiva?.motivo || m.note || "Assente",
            fromAssenza: Boolean(assAttiva)
          });
        }
      }
    });

    (st.assenze || []).forEach(raw => {
      const emailNorm = String(raw?.email || "").toLowerCase().trim();
      if (!emailNorm || assentiMap.has(emailNorm)) return;
      const assAttiva = getAssenzaMensaAttivaLocale(dataStr, tipoNorm, emailNorm);
      if (!assAttiva) return;
      const pren = prenotazioniPasto.find(m => String(m.email || "").toLowerCase().trim() === emailNorm);
      if (verificaAssenzaOverrideLocale(pren, assAttiva)) {
        assentiMap.set(emailNorm, {
          email: emailNorm,
          nome: raw.nome || trovaNomeUtente(emailNorm),
          motivo: assAttiva.motivo || "Assenza prolungata",
          fromAssenza: true
        });
      }
    });

    const dettagliPresenti = prenotatiBusta.map(m => ({
      email: m.email,
      nome: m.nome || trovaNomeUtente(m.email),
      busta: true,
      ritardo: Boolean(isTruthyVal(m.ritardo)),
      ospiti: Math.max(0, parseInt(m.ospiti, 10) || 0),
      note: m.note || "",
      defaultPresence: false
    }));

    return {
      totale: countBuste,
      inSala: 0,
      buste: countBuste,
      assenti: assentiMap.size,
      ritardi: prenotatiBusta.filter(m => isTruthyVal(m.ritardo)).length,
      ospitiTotali: prenotatiBusta.reduce((acc, m) => acc + (parseInt(m.ospiti, 10) || 0), 0),
      dettagliPresenti,
      dettagliAssenti: Array.from(assentiMap.values()),
      isBustaGiorno: true
    };
  }

  let countAssenti = 0;
  let countBuste = 0;
  let countRitardi = 0;
  let ospitiTotali = 0;
  let inSalaCount = 0;

  const prenotazioniMap = new Map();
  prenotazioniPasto.forEach(p => {
    if (p.email) prenotazioniMap.set(String(p.email).toLowerCase().trim(), p);
  });

  const dettagliPresenti = [];
  const dettagliAssenti = [];

  utentiMensa.forEach(u => {
    const emailNorm = String(u.email || "").toLowerCase().trim();
    const pren = prenotazioniMap.get(emailNorm);
    const assAttiva = getAssenzaMensaAttivaLocale(dataStr, tipoNorm, emailNorm);
    const isAssExplicit = pren && (pren.stato_presenza === "assente" || pren.stato_presenza === "Assente");
    const isAssente = Boolean(isAssExplicit || verificaAssenzaOverrideLocale(pren, assAttiva));
    const haBusta = !isAssente && pren && (isTruthyVal(pren.busta) || pren.busta === true || pren.stato_presenza === "busta");
    const inRitardo = !isAssente && pren && Boolean(isTruthyVal(pren.ritardo));
    const ospiti = (!isAssente && pren) ? Math.max(0, parseInt(pren.ospiti, 10) || 0) : 0;

    if (isAssente) {
      countAssenti++;
      dettagliAssenti.push({
        email: emailNorm,
        nome: u.nome || trovaNomeUtente(emailNorm),
        motivo: assAttiva?.motivo || pren?.note || "Assente",
        fromAssenza: Boolean(assAttiva)
      });
    } else if (haBusta) {
      countBuste += (1 + ospiti);
      ospitiTotali += ospiti;
      dettagliPresenti.push({ ...u, busta: true, ritardo: inRitardo, ospiti, note: pren?.note || "", defaultPresence: false });
    } else {
      inSalaCount += (1 + ospiti);
      if (inRitardo) countRitardi++;
      ospitiTotali += ospiti;
      dettagliPresenti.push({ ...u, busta: false, ritardo: inRitardo, ospiti, note: pren?.note || "", defaultPresence: !pren });
    }
  });

  const inSala = Math.max(0, inSalaCount);
  const totalePasti = inSala + countBuste;

  return {
    totale: totalePasti,
    inSala,
    buste: countBuste,
    assenti: countAssenti,
    ritardi: countRitardi,
    ospitiTotali,
    dettagliPresenti,
    dettagliAssenti,
    isBustaGiorno: false
  };
}

if (typeof window !== "undefined") {
  window.getListaUtentiMensa = window.getListaUtentiMensa || getListaUtentiMensa;
  window.isPastoBustaGiorno = window.isPastoBustaGiorno || isPastoBustaGiorno;
  window.trovaNomeUtente = window.trovaNomeUtente || trovaNomeUtente;
  if (!window.calcolaContatoreMensa) {
    window.calcolaContatoreMensa = calcolaContatoreMensa;
  }
}

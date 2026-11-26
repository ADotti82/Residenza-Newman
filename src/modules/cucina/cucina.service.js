/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - DOMINIO CUCINA (SERVICE LAYER)
 * ============================================================================
 */

import { appState as moduleAppState } from "../../core/state.js";
import { formatYMD } from "../../core/utils.js";
import { calcolaContatoreMensa as fallbackCalcolaContatoreMensa } from "../mensa/mensa.service.js";

function getActiveAppState() {
  if (typeof window !== "undefined" && window.appState) {
    return window.appState;
  }
  return moduleAppState;
}

function getCalcolaContatoreMensa() {
  if (typeof window !== "undefined" && typeof window._appCalcolaContatoreMensa === "function") {
    return window._appCalcolaContatoreMensa;
  }
  if (typeof window !== "undefined" && typeof window.calcolaContatoreMensa === "function") {
    return window.calcolaContatoreMensa;
  }
  return fallbackCalcolaContatoreMensa;
}

/**
 * Calcola la lista dei prossimi giorni con conteggi distinti di pranzi, cene,
 * ritardi, ospiti, buste e assenti per la dashboard cucina.
 */
export function calcolaProssimiGiorniCucina(dataRiferimento = new Date(), numGiorni = 5, dataSelezionataYMD = "") {
  const result = [];
  const baseDate = dataRiferimento instanceof Date ? new Date(dataRiferimento) : new Date();
  const calcolaFn = getCalcolaContatoreMensa();

  for (let i = 0; i < numGiorni; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const ymd = formatYMD(d);
    const sP = calcolaFn(ymd, "pranzo");
    const sC = calcolaFn(ymd, "cena");

    result.push({
      ymd,
      label: d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "numeric" }),
      pranzo: sP.totale,
      cena: sC.totale,
      assentiPranzo: sP.assenti || 0,
      assentiCena: sC.assenti || 0,
      ritardiPranzo: sP.ritardi || 0,
      ospitiPranzo: sP.ospitiTotali || 0,
      bustePranzo: sP.buste || 0,
      ritardiCena: sC.ritardi || 0,
      ospitiCena: sC.ospitiTotali || 0,
      busteCena: sC.buste || 0,
      buste: (sP.buste || 0) + (sC.buste || 0),
      isSel: ymd === dataSelezionataYMD
    });
  }
  return result;
}

/**
 * Applica i filtri contestuali alla lista presenti in cucina (in sala, busta, ritardo, ospiti, note)
 */
export function filtraListaPresenzeCucina(lista, filtro) {
  if (!Array.isArray(lista)) return [];
  if (filtro === "in_sala") return lista.filter(x => !x.busta && !x.ritardo);
  if (filtro === "busta") return lista.filter(x => Boolean(x.busta));
  if (filtro === "ritardo") return lista.filter(x => Boolean(x.ritardo));
  if (filtro === "ospiti") return lista.filter(x => Boolean(x.ospiti && x.ospiti > 0));
  if (filtro === "note") return lista.filter(x => Boolean(x.note && x.note.trim()));
  return lista;
}

/**
 * Gestione spunta interattiva piatto servito o busta consegnata
 */
export function toggleCucinaSpuntato(key, dataKey = "") {
  try {
    const st = getActiveAppState();
    const targetDate = dataKey || st.cucinaSelectedDate || formatYMD(new Date());
    const storageKey = `newman_cucina_spuntati_${targetDate}`;
    const spuntati = JSON.parse(localStorage.getItem(storageKey) || "{}");
    spuntati[key] = !spuntati[key];
    localStorage.setItem(storageKey, JSON.stringify(spuntati));
    return spuntati;
  } catch (err) {
    console.error("Errore toggle spunta cucina:", err);
    return {};
  }
}

if (typeof window !== "undefined") {
  window.calcolaProssimiGiorniCucina = calcolaProssimiGiorniCucina;
  window.filtraListaPresenzeCucina = filtraListaPresenzeCucina;
}

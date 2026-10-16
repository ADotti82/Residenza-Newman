/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - DOMINIO BACHECA (SERVICE LAYER)
 * ============================================================================
 */

import { formattaDataConfronto, formatYMD } from "../../core/utils.js";

/**
 * Filtra gli avvisi di bacheca per data selezionata o attivi
 */
export function filtraAvvisiBacheca(bachecaList = [], dataTargetYMD = "") {
  if (!Array.isArray(bachecaList)) return [];
  if (!dataTargetYMD) return bachecaList;

  const targetDate = formattaDataConfronto(dataTargetYMD);
  return bachecaList.filter(b => {
    if (!b.data) return true;
    return formattaDataConfronto(b.data) === targetDate;
  });
}

/**
 * Ordina gli avvisi dando precedenza a priorità alta ed eventi odierni
 */
export function ordinaAvvisiBacheca(bachecaList = []) {
  if (!Array.isArray(bachecaList)) return [];

  const prioritaScore = { alta: 3, normale: 2, bassa: 1 };
  return [...bachecaList].sort((a, b) => {
    const scoreA = prioritaScore[String(a.priorita || "").toLowerCase()] || 2;
    const scoreB = prioritaScore[String(b.priorita || "").toLowerCase()] || 2;
    if (scoreA !== scoreB) return scoreB - scoreA;
    const tA = new Date(a.timestamp || a.data || 0).getTime();
    const tB = new Date(b.timestamp || b.data || 0).getTime();
    return tB - tA;
  });
}

/**
 * Analizza file CSV di eventi calendario per importazione massiva
 */
export function analizzaCSVEventi(csvText) {
  if (!csvText || typeof csvText !== "string") return [];
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(/[;,]/).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
  const idxTitolo = headers.findIndex(h => h.includes("titolo") || h.includes("title") || h.includes("evento") || h.includes("oggetto"));
  const idxData = headers.findIndex(h => h.includes("data") || h.includes("date") || h.includes("giorno"));
  const idxDesc = headers.findIndex(h => h.includes("desc") || h.includes("nota") || h.includes("dettagli"));
  const idxTipo = headers.findIndex(h => h.includes("tipo") || h.includes("categoria"));

  const eventi = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(/[;,]/).map(c => c.trim().replace(/^["']|["']$/g, ""));
    const titolo = cols[idxTitolo !== -1 ? idxTitolo : 0];
    if (!titolo) continue;

    const dataRaw = idxData !== -1 ? cols[idxData] : "";
    const descrizione = idxDesc !== -1 ? cols[idxDesc] : "";
    const tipo = idxTipo !== -1 ? cols[idxTipo].toLowerCase() : "evento";

    eventi.push({
      titolo,
      data: formattaDataConfronto(dataRaw) || formatYMD(new Date()),
      descrizione,
      tipo: ["evento", "avviso", "compleanno", "anniversario"].includes(tipo) ? tipo : "evento",
      priorita: "normale"
    });
  }
  return eventi;
}

if (typeof window !== "undefined") {
  window.filtraAvvisiBacheca = filtraAvvisiBacheca;
  window.ordinaAvvisiBacheca = ordinaAvvisiBacheca;
  window.analizzaCSVEventi = analizzaCSVEventi;
}

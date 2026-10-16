/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - DOMINIO SPAZI (SERVICE LAYER)
 * ============================================================================
 */

import { formattaDataConfronto } from "../../core/utils.js";

/**
 * Genera tutti gli slot orari di 30 minuti dalle 06:00 alle 23:30
 */
export function generaSlotOrari() {
  const slots = [];
  for (let hour = 6; hour <= 23; hour++) {
    const hStr = String(hour).padStart(2, "0");
    slots.push(`${hStr}:00 - ${hStr}:30`);
    if (hour < 23) {
      const nextHStr = String(hour + 1).padStart(2, "0");
      slots.push(`${hStr}:30 - ${nextHStr}:00`);
    } else {
      slots.push(`23:30 - 00:00`);
    }
  }
  return slots;
}

/**
 * Filtra gli slot per fascia oraria: mattina (06-13), pomeriggio (13-19), sera (19-24)
 */
export function filtraSlotPerFascia(slot, fascia) {
  if (fascia === "tutti") return true;
  const startPart = slot.split(" - ")[0];
  const [h, m] = startPart.split(":").map(Number);
  const timeVal = h * 60 + m;
  if (fascia === "mattina") return timeVal >= 390 && timeVal < 750;
  if (fascia === "pomeriggio") return timeVal >= 750 && timeVal < 1110;
  if (fascia === "sera") return timeVal >= 1110;
  return true;
}

/**
 * Blocchi orari riservati della Chiesa per liturgie comunitarie
 */
export function getBloccoComunitarioChiesa(slot, dataYmd) {
  if (!slot) return null;
  // Blocco Santa Messa comunitaria ogni mattina (06:30 - 07:30: due slot 06:30-07:00 e 07:00-07:30)
  if (slot === "06:30 - 07:00" || slot === "07:00 - 07:30" || slot === "06:30 - 07:30") {
    return {
      titolo: "Santa Messa Comunitaria",
      icona: "⛪",
      dettaglio: "Messa comunitaria del mattino (06:30 - 07:30)",
      badge: "⛪ S. Messa Mattutina",
      bloccato: true
    };
  }
  // Blocco Santa Messa comunitaria serale (19:00 - 19:30)
  if (slot === "19:00 - 19:30") {
    return {
      titolo: "Santa Messa Comunitaria (Sera)",
      icona: "⛪",
      dettaglio: "Messa comunitaria della sera (19:00 - 19:30)",
      badge: "⛪ S. Messa Serale",
      bloccato: true
    };
  }
  return null;
}


/**
 * Trova prenotazione corrispondente per risorsa, data e slot
 */
export function trovaPrenotazioneSlot(prenotazioniList, risorsa, dataYMD, slot) {
  if (!Array.isArray(prenotazioniList)) return null;
  const targetDate = formattaDataConfronto(dataYMD);
  return prenotazioniList.find(p =>
    p.risorsa === risorsa &&
    formattaDataConfronto(p.data) === targetDate &&
    p.slot_orario === slot
  ) || null;
}

if (typeof window !== "undefined") {
  window.generaSlotOrari = generaSlotOrari;
  window.filtraSlotPerFascia = filtraSlotPerFascia;
  window.getBloccoComunitarioChiesa = getBloccoComunitarioChiesa;
}

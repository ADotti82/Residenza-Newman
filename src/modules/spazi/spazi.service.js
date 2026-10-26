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
 * Determina se uno slot orario della Chiesa rientra nelle fasce di celebrazione consentite
 */
export function isSlotChiesaConsentito(slot, config = {}) {
  if (!slot) return true;
  const startPart = slot.split(" - ")[0];
  const [h, m] = startPart.split(":").map(Number);
  const timeVal = h * 60 + m;

  // Lettura fasce configurate (con fallback predefiniti 08:00-13:00 e 16:30-19:30)
  const mattInizioStr = config.Chiesa_Fascia_Mattina_Inizio || "08:00";
  const mattFineStr = config.Chiesa_Fascia_Mattina_Fine || "13:00";
  const pomInizioStr = config.Chiesa_Fascia_Pomeriggio_Inizio || "16:30";
  const pomFineStr = config.Chiesa_Fascia_Pomeriggio_Fine || "19:30";

  const [mh1, mm1] = mattInizioStr.split(":").map(Number);
  const [mh2, mm2] = mattFineStr.split(":").map(Number);
  const [ph1, pm1] = pomInizioStr.split(":").map(Number);
  const [ph2, pm2] = pomFineStr.split(":").map(Number);

  const mattInizio = mh1 * 60 + (mm1 || 0);
  const mattFine = mh2 * 60 + (mm2 || 0);
  const pomInizio = ph1 * 60 + (pm1 || 0);
  const pomFine = ph2 * 60 + (pm2 || 0);

  const inMattina = (timeVal >= mattInizio && timeVal < mattFine);
  const inPomeriggio = (timeVal >= pomInizio && timeVal < pomFine);

  return inMattina || inPomeriggio;
}

/**
 * Blocchi orari riservati della Chiesa per liturgie comunitarie e celebrazioni fisse
 */
export function getBloccoComunitarioChiesa(slot, dataYmd, config = {}) {
  if (!slot) return null;

  // Calcolo giorno della settimana (0 = Domenica)
  let dayOfWeek = -1;
  if (dataYmd) {
    const parts = String(dataYmd).split("-").map(Number);
    if (parts.length === 3) {
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      dayOfWeek = dt.getDay();
    }
  }

  // Blocco Santa Messa comunitaria domenicale ore 11:00 (11:00 - 12:00)
  const messaDomenicaOra = config.Chiesa_Messa_Domenica || "11:00";
  const [dh, dm] = messaDomenicaOra.split(":").map(Number);
  const dVal = (dh || 11) * 60 + (dm || 0);
  const startPart = slot.split(" - ")[0];
  const [sh, sm] = startPart.split(":").map(Number);
  const sVal = sh * 60 + sm;

  if (dayOfWeek === 0 && (sVal >= dVal && sVal < dVal + 60)) {
    return {
      titolo: "Santa Messa Comunitaria",
      icona: "⛪",
      dettaglio: `Santa Messa della Comunità (Domenica, ore ${messaDomenicaOra})`,
      badge: `⛪ S. Messa Comunitaria (${messaDomenicaOra})`,
      bloccato: true
    };
  }

  // Blocco Santa Messa comunitaria feriale del mattino (06:30 - 07:30)
  if (slot === "06:30 - 07:00" || slot === "07:00 - 07:30" || slot === "06:30 - 07:30") {
    return {
      titolo: "Preghiera del Mattino",
      icona: "⛪",
      dettaglio: "Lodi e Messa comunitaria del mattino (06:30 - 07:30)",
      badge: "⛪ Preghiera Mattutina",
      bloccato: true
    };
  }

  // Verifica se lo slot ricade fuori dalle fasce orarie autorizzate
  if (!isSlotChiesaConsentito(slot, config)) {
    return {
      titolo: "Fuori Orario Celebrazioni",
      icona: "🔒",
      dettaglio: "Slot non disponibile per celebrazioni (consentite solo 08:00-13:00 e 16:30-19:30)",
      badge: "🔒 Fuori Orario Celebrazioni",
      bloccato: true,
      fuoriOrario: true
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
  window.isSlotChiesaConsentito = isSlotChiesaConsentito;
}

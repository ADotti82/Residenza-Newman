/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - DOMINIO MASTER (SERVICE LAYER)
 * ============================================================================
 */

import { INITIAL_MOCK_DB } from "../../core/config.js";
import { appState } from "../../core/state.js";

/**
 * Risolve il nome descrittivo dell'utente a partire dall'indirizzo email
 */
export function trovaNomeUtente(email) {
  if (!email) return "-";
  const em = String(email).toLowerCase().trim();
  const list = appState.tuttiUtenti || INITIAL_MOCK_DB.utenti || [];
  const u = list.find(x => String(x.email).toLowerCase().trim() === em);
  return u ? u.nome : email.split("@")[0];
}

/**
 * Calcola il numero di richieste pendenti che necessitano di approvazione Master
 */
export function calcolaTotalePendentiMaster(state = appState) {
  const inAttesaAccoglienza = (state.accoglienzaList || []).filter(
    a => a.stato === "In Attesa 1a Autorizzazione" || a.stato === "1a Autorizzazione Concessa"
  );
  const inAttesaSpazi = (state.prenotazioniSpazi || []).filter(p => p.stato === "In Attesa");
  const tutteSegnalazioni = state.guasti || state.manutenzioneList || [];
  const guastiAperti = tutteSegnalazioni.filter(
    g => g.stato !== "Risolto" && g.stato !== "Archiviata" && g.stato !== "Terminata"
  );

  return {
    accoglienza: inAttesaAccoglienza.length,
    spazi: inAttesaSpazi.length,
    guasti: guastiAperti.length,
    totale: inAttesaAccoglienza.length + inAttesaSpazi.length + guastiAperti.length
  };
}

/**
 * Ricava la lista email dei destinatari Master per notifiche contestuali
 */
export function getDestinatariNotifiche(tipo, state = appState) {
  const destinatari = [];
  const utenti = state.tuttiUtenti || [];

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
    const raw = (state.cachedConfig && state.cachedConfig.Email_Notifiche_Master) || "donandreadotti@gmail.com";
    raw.split(",").forEach(e => {
      const em = e.trim().toLowerCase();
      if (em.includes("@") && !destinatari.includes(em)) destinatari.push(em);
    });
  }
  return destinatari;
}

if (typeof window !== "undefined") {
  window.trovaNomeUtente = trovaNomeUtente;
  window.calcolaTotalePendentiMaster = calcolaTotalePendentiMaster;
  window.getDestinatariNotifiche = getDestinatariNotifiche;
}

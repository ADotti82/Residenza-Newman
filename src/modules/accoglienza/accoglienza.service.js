/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - DOMINIO ACCOGLIENZA (SERVICE LAYER)
 * ============================================================================
 */

import { formattaDataConfronto, calcolaNottiSoggiorno, getNomeCamera } from "../../core/utils.js";

/**
 * Calcola la disponibilità e le occupazioni per ciascuna delle 3 camere dedicate
 */
export function calcolaStatoDisponibilitaCamere(accList = [], oggiYMD = "") {
  const oggi = oggiYMD || new Date().toISOString().slice(0, 10);
  const camereNomi = [getNomeCamera(1), getNomeCamera(2), getNomeCamera(3)];

  return camereNomi.map((nomeCam, idx) => {
    const prenotazioniCam = (accList || []).filter(a => {
      const cAss = a.camera_assegnata || a.camera;
      const isConfermata = a.stato === "Confermata" || a.stato === "Approvata";
      return isConfermata && (cAss === nomeCam || cAss === `Camera ${idx + 1}` || cAss === String(idx + 1));
    });

    const occupazioneOggi = prenotazioniCam.find(a => {
      const cIn = formattaDataConfronto(a.data_checkin || a.checkin);
      const cOut = formattaDataConfronto(a.data_checkout || a.checkout);
      return cIn <= oggi && oggi < cOut;
    });

    const prossimiSoggiorni = prenotazioniCam.filter(a => {
      const cOut = formattaDataConfronto(a.data_checkout || a.checkout);
      return cOut >= oggi;
    }).sort((a, b) => {
      const d1 = formattaDataConfronto(a.data_checkin || a.checkin);
      const d2 = formattaDataConfronto(b.data_checkin || b.checkin);
      return d1.localeCompare(d2);
    });

    return {
      num: idx + 1,
      nome: nomeCam,
      occupataOggi: Boolean(occupazioneOggi),
      dettagliOggi: occupazioneOggi || null,
      prossimi: prossimiSoggiorni
    };
  });
}

/**
 * Filtra le richieste di alloggio in base ai permessi dell'utente
 */
export function filtraRichiesteAccoglienza(accList = [], userEmail = "", isMaster = false) {
  if (!Array.isArray(accList)) return [];
  if (isMaster) return accList;

  const emailNorm = String(userEmail || "").toLowerCase().trim();
  return accList.filter(a => {
    const em = (a.richiedente_email || a.email_richiedente || a.email || "").toLowerCase().trim();
    return em === emailNorm;
  });
}

/**
 * Valida date soggiorno assicurando check-in < check-out
 */
export function validaDateSoggiorno(checkinStr, checkoutStr) {
  if (!checkinStr || !checkoutStr) return { valido: false, errore: "Date obbligatorie mancanti" };
  const dIn = new Date(checkinStr + "T00:00:00");
  const dOut = new Date(checkoutStr + "T00:00:00");
  if (isNaN(dIn.getTime()) || isNaN(dOut.getTime())) return { valido: false, errore: "Formato data non valido" };
  if (dOut <= dIn) return { valido: false, errore: "La data di check-out deve essere successiva al check-in" };
  const notti = calcolaNottiSoggiorno(checkinStr, checkoutStr);
  return { valido: true, notti };
}

if (typeof window !== "undefined") {
  window.calcolaStatoDisponibilitaCamere = calcolaStatoDisponibilitaCamere;
}

/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - API & NETWORK LAYER
 * ============================================================================
 */

import { DEFAULT_GAS_URL, STORAGE_KEYS, INITIAL_MOCK_DB } from './config.js';
import { appState } from './state.js';
import { formatYMD } from './utils.js';
import { mostraToast } from './toast.js';

export async function callApi(action, params = {}) {
  const payload = { action, ...params };
  const targetUrl = appState.backendUrl || DEFAULT_GAS_URL;

  if (!targetUrl || appState.isOfflineMode) {
    return new Promise(resolve => {
      setTimeout(() => resolve(mockBackendExecution(action, params)), 250);
    });
  }

  // ✅ Usa il proxy dedicato su Vercel per bypassare il rate limit di Google
  const proxyUrl = `/api/proxy?target=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn("Chiamata GAS fallita via proxy. Uso fallback locale.", err);
    mostraToast("Server non raggiungibile. Modalità locale attiva.", "warning");
    return mockBackendExecution(action, params);
  }
}


function mockBackendExecution(action, params) {
  const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_DB) || JSON.stringify(INITIAL_MOCK_DB));

  switch (action) {
    case "login": {
      const email = String(params.email || "").trim().toLowerCase();
      const password = String(params.password || "").trim();
      const utente = db.utenti.find(u => u.email.toLowerCase() === email);
      if (!utente) return { success: false, notFound: true, message: "Utente non presente" };
      if (utente.password) {
        if (!password) return { success: false, requirePassword: true, error: "Inserisci la tua password per accedere" };
        if (utente.password !== password) return { success: false, requirePassword: true, error: "Password errata. Riprova o chiedi il reset alla Direzione." };
      } else {
        if (password) { utente.password = password; localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db)); }
      }
      return { success: true, utente: { ...utente, hasPassword: Boolean(utente.password) } };
    }

    case "registraUtente": {
      const email = String(params.email || "").trim().toLowerCase();
      const nome = String(params.nome || "").trim();
      const password = String(params.password || "newman2026").trim();
      if (db.utenti.some(u => u.email.toLowerCase() === email)) return { success: false, error: "Email già registrata" };
      const nuovo = { email, nome, stato: "Approvato", perm_mensa: false, perm_manutenzione: false, perm_spazi: true, perm_admin: false, password, is_utente_mensa: true };
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
      if (utente.password && utente.password !== passwordAttuale) return { success: false, error: "La password attuale inserita non è corretta." };
      if (!nuovaPassword || nuovaPassword.length < 4) return { success: false, error: "La nuova password deve contenere almeno 4 caratteri." };
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
        id: "M_" + Date.now(), data: dataStr, email, tipo_pasto,
        busta: Boolean(busta), ritardo: Boolean(ritardo),
        ospiti: parseInt(ospiti) || 0,
        stato_presenza: stato_presenza || (ritardo ? "Ritardo" : "Presente"),
        note: note || "", timestamp: new Date().toISOString()
      };
      if (existIdx !== -1) db.mensa[existIdx] = { ...db.mensa[existIdx], ...entry };
      else db.mensa.push(entry);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, id: entry.id };
    }

    case "cancellaPrenotazioneMensa": {
      const { data, email, tipo_pasto } = params;
      const dataStr = formattaDataConfronto(data);
      db.mensa = db.mensa.filter(m => !(formattaDataConfronto(m.data) === dataStr && m.email.toLowerCase() === email.toLowerCase() && m.tipo_pasto === tipo_pasto));
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true };
    }

    case "prenotaSpazio": {
      const { risorsa, data, slot_orario, email, nome, richiesto_da, note, autoApprovaMaster } = params;
      const dataStr = formattaDataConfronto(data);
      const isMasterAction = Boolean(autoApprovaMaster) || String(email || "").startsWith("Master");

      if (risorsa === "Chiesa") {
        const isSlotBloccato = (slot_orario === "06:30 - 07:00" || slot_orario === "07:00 - 07:30" || slot_orario === "19:00 - 19:30" || slot_orario === "06:30 - 07:30");
        if (isSlotBloccato && !isMasterAction) {
          return { success: false, error: "Questo slot orario è riservato alla Santa Messa comunitaria della Residenza (06:30-07:30 e 19:00-19:30)." };
        }
      }

      const occupied = (db.prenotazioni_spazi || []).some(p => p.risorsa === risorsa && formattaDataConfronto(p.data) === dataStr && p.slot_orario === slot_orario && p.stato !== "Rifiutata");
      if (occupied && !isMasterAction) return { success: false, error: "Questo slot orario è già occupato o ha una richiesta in attesa." };
      if (occupied && isMasterAction) {
        db.prenotazioni_spazi = (db.prenotazioni_spazi || []).filter(p => !(p.risorsa === risorsa && formattaDataConfronto(p.data) === dataStr && p.slot_orario === slot_orario));
      }

      const autoApprova = isMasterAction;
      const stato = autoApprova ? "Approvata" : "In Attesa";

      const prenotazione = {
        id: "S_" + Date.now(),
        risorsa,
        data: dataStr,
        slot_orario,
        email,
        nome: (nome || "").trim() || (email ? email.split("@")[0] : ""),
        richiesto_da: (richiesto_da || "").trim(),
        note: (note || "").trim(),
        timestamp: new Date().toISOString(),
        stato: stato,
        approvato_da: (stato === "Approvata" ? (richiesto_da || appState.user?.email || email || "Master") : "")
      };
      if (!db.prenotazioni_spazi) db.prenotazioni_spazi = [];
      db.prenotazioni_spazi.push(prenotazione);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
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

    case "caricaGuasto": {
      const { email, descrizione, fotoBase64, categoria, luogo } = params;
      const guasto = {
        id: "SEG_" + Date.now().toString().slice(-6),
        timestamp: new Date().toISOString(),
        email, categoria: categoria || "manutenzione", luogo: luogo || "",
        descrizione: descrizione || "",
        link_foto: fotoBase64 ? fotoBase64 : "",
        priorita: params.priorita || "Media",
        stato: "Da fare", note_intervento: "", tecnico: "", data_chiusura: ""
      };
      db.manutenzione.unshift(guasto);
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
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
        if (params.descrizione !== undefined && String(params.descrizione).trim() !== "") g.descrizione = params.descrizione;
        if (params.stato !== undefined) g.stato = params.stato;
        if (params.priorita !== undefined) g.priorita = params.priorita;
        if (params.note_intervento !== undefined) g.note_intervento = params.note_intervento;
        if (params.tecnico !== undefined) g.tecnico = params.tecnico;
        if (params.categoria !== undefined) g.categoria = params.categoria;
        if (params.luogo !== undefined) g.luogo = params.luogo;
        if ((g.stato === "Risolto" || g.stato === "Archiviata" || g.stato === "Terminata") && !g.data_chiusura) g.data_chiusura = new Date().toISOString();
        else if (g.stato !== "Risolto" && g.stato !== "Archiviata" && g.stato !== "Terminata") g.data_chiusura = "";
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
        if (params.notif_push !== undefined) utente.notif_push = Boolean(params.notif_push);
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, message: "Ruoli aggiornati per " + emailTarget };
      }
      return { success: false, error: "Utente non trovato" };
    }

    case "salvaPreferenzaPush": {
      const emailTarget = String(params.email || appState.user?.email || "").trim().toLowerCase();
      const utente = db.utenti.find(u => u.email.toLowerCase() === emailTarget);
      if (utente) {
        utente.notif_push = Boolean(params.notif_push);
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, notif_push: utente.notif_push, message: "Preferenza salvata" };
      }
      return { success: false, error: "Utente non trovato" };
    }

    case "notificheMattinaOre7": {
      return { success: true, message: "Controllo ore 07:00 eseguito" };
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
            email, nome: nome || email.split("@")[0], stato: "Approvato",
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

    case "salvaMenuBase": {
      if (params.menu && typeof params.menu === "object") {
        db.menu_base = params.menu;
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        localStorage.setItem("newman_menu_14_giorni", JSON.stringify(params.menu));
        return { success: true, message: "Menù salvato con successo!" };
      }
      return { success: false, error: "Dati menù non validi" };
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
            if (!email || !p.email || p.email.toLowerCase() === email.toLowerCase()) return false;
          }
        }
        return true;
      });
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      const deleted = db.prenotazioni_spazi.length < initialLen;
      return { success: deleted, message: deleted ? "Prenotazione spazio cancellata" : "Nessuna prenotazione corrispondente trovata" };
    }

    case "getBacheca": return { success: true, bacheca: db.bacheca || [] };

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
      if (existIdx !== -1) db.bacheca[existIdx] = item;
      else db.bacheca.unshift(item);
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
          db.bacheca.unshift({
            id: ev.id || ("B_" + Date.now() + "_" + Math.floor(Math.random() * 1000)),
            tipo: ev.tipo || "evento",
            data: ev.data || formatYMD(new Date()),
            titolo: String(ev.titolo).trim(),
            descrizione: ev.descrizione ? String(ev.descrizione).trim() : "",
            autore: ev.autore ? String(ev.autore).trim() : "Direzione",
            priorita: ev.priorita || "normale",
            timestamp: nowStr
          });
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
        camera_assegnata: "", stato: "In Attesa 1a Autorizzazione",
        auth1_email: "", auth1_data: "", auth1_note: "",
        auth2_email: "", auth2_data: "", auth2_note: "",
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

    case "getAccoglienzaData":
      return { success: true, accoglienza: db.accoglienza || [], config: db.configurazione || {} };

    case "getAssenze":
      return { success: true, assenze: db.assenze || [] };

    case "registraAssenza": {
      if (!db.assenze) db.assenze = [];
      if (!db.mensa) db.mensa = [];
      const email = String(params.email || appState.user?.email || "").trim().toLowerCase();
      const nome = String(params.nome || trovaNomeUtente(email) || "").trim();
      const dataInizio = formattaDataConfronto(params.data_inizio);
      const dataFine = formattaDataConfronto(params.data_fine || params.data_inizio);
      const motivo = params.motivo || "Altro";
      const note = params.note || "";
      const assenteMensa = Boolean(params.assente_mensa);
      const pasti = (Array.isArray(params.pasti_interessati) && params.pasti_interessati.length > 0)
        ? params.pasti_interessati
        : (params.pasti_interessati ? [params.pasti_interessati] : ["pranzo", "cena"]);
      const entryId = params.id || ("ASS_" + Date.now());

      const assenzaObj = {
        id: entryId,
        email,
        nome,
        data_inizio: dataInizio,
        data_fine: dataFine,
        motivo,
        note,
        assente_mensa: assenteMensa,
        pasti_interessati: pasti,
        created_at: new Date().toISOString()
      };

      const existingIdx = db.assenze.findIndex(a => String(a.id) === String(entryId));
      if (existingIdx !== -1) db.assenze[existingIdx] = assenzaObj;
      else db.assenze.push(assenzaObj);

      // Sincronizzazione automatica con i pasti in Mensa
      if (assenteMensa) {
        const dStart = new Date(dataInizio + "T12:00:00");
        const dEnd = new Date(dataFine + "T12:00:00");
        for (let dt = new Date(dStart); dt <= dEnd; dt.setDate(dt.getDate() + 1)) {
          const ymd = formatYMD(dt);
          pasti.forEach(pasto => {
            const mIdx = db.mensa.findIndex(m => formattaDataConfronto(m.data) === ymd && m.email.toLowerCase() === email && m.tipo_pasto === pasto);
            const mEntry = {
              id: mIdx !== -1 ? db.mensa[mIdx].id : ("M_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4)),
              data: ymd,
              email,
              tipo_pasto: pasto,
              busta: false,
              ritardo: false,
              ospiti: 0,
              stato_presenza: "assente",
              note: "Assenza programmata: " + motivo,
              timestamp: new Date().toISOString()
            };
            if (mIdx !== -1) db.mensa[mIdx] = { ...db.mensa[mIdx], ...mEntry };
            else db.mensa.push(mEntry);
          });
        }
      }

      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, id: entryId, assenza: assenzaObj, mensa: db.mensa, message: "Assenza registrata con successo!" };
    }

    case "cancellaAssenza": {
      if (!db.assenze) db.assenze = [];
      const { id, ripristinaMensa } = params;
      const target = db.assenze.find(a => String(a.id) === String(id));
      if (target) {
        db.assenze = db.assenze.filter(a => String(a.id) !== String(id));
        if (ripristinaMensa && target.assente_mensa && db.mensa) {
          const dStart = new Date(target.data_inizio + "T12:00:00");
          const dEnd = new Date(target.data_fine + "T12:00:00");
          for (let dt = new Date(dStart); dt <= dEnd; dt.setDate(dt.getDate() + 1)) {
            const ymd = formatYMD(dt);
            (target.pasti_interessati || ["pranzo", "cena"]).forEach(pasto => {
              db.mensa = db.mensa.filter(m => !(formattaDataConfronto(m.data) === ymd && m.email.toLowerCase() === target.email.toLowerCase() && m.tipo_pasto === pasto && m.stato_presenza === "assente"));
            });
          }
        }
        localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
        return { success: true, message: "Assenza revocata con successo!" };
      }
      return { success: false, error: "Assenza non trovata" };
    }

    case "getInfoData":
      return {
        success: true,
        config: db.configurazione,
        prenotazioniSpazi: db.prenotazioni_spazi,
        prenotazioniMensa: db.mensa,
        bacheca: db.bacheca || [],
        accoglienza: db.accoglienza || [],
        assenze: db.assenze || [],
        menuBase: db.menu_base || null
      };

    case "getMasterData":
      return {
        success: true,
        utentiInAttesa: db.utenti.filter(u => u.stato === "In Attesa"),
        tuttiUtenti: db.utenti,
        mensa: db.mensa,
        guasti: db.manutenzione,
        prenotazioniSpazi: db.prenotazioni_spazi || [],
        bacheca: db.bacheca || [],
        accoglienza: db.accoglienza || [],
        assenze: db.assenze || [],
        config: db.configurazione
      };

    case "aggiornaConfig": {
      for (const k in params) {
        if (k !== "action" && params[k] !== undefined) {
          if (!db.configurazione) db.configurazione = {};
          db.configurazione[k] = params[k];
          appState.cachedConfig[k] = params[k];
        }
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
      return { success: true, message: "Configurazione salvata!" };
    }

    case "inviaEmailAmministrazione": {
      return {
        success: true,
        message: "Email inviata con successo all'amministrazione!"
      };
    }

    case "ping":
      return {
        success: true, status: "ok", timestamp: new Date().toISOString(),
        nomeSpreadsheet: "Simulatore Database Locale (LocalStorage)",
        fogliAttivi: ["Utenti", "Mensa", "Prenotazioni_Spazi", "Manutenzione", "Configurazione", "Bacheca", "Menu_Base", "Accoglienza"],
        conteggi: { utenti: db.utenti.length, spazi: db.prenotazioni_spazi.length, mensa: db.mensa.length, guasti: db.manutenzione.length, bacheca: (db.bacheca || []).length },
        app: "Residenza Card. Newman (Local Mode)"
      };

    case "inizializzaDati":
      return { success: true, message: "Dati inizializzati con successo nel database!" };

    default:
      return { success: false, error: "Azione non riconosciuta" };
  }
}


if (typeof window !== "undefined") { window.callApi = callApi; }

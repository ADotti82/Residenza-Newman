/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - AUTHENTICATION & RBAC PERMISSIONS
 * ============================================================================
 */

import { STORAGE_KEYS } from "./config.js";
import { appState } from "./state.js";
import { chiudiModalSettings } from "./modal.js";

export function isTruthyVal(val) {
  if (val === true) return true;
  if (!val) return false;
  const s = String(val).toLowerCase().trim();
  return s === "true" || s === "1" || s === "si" || s === "sì" || s === "yes" || s === "y";
}

export function haPermessiMasterSpazi() {
  if (!appState.user) return false;
  const u = appState.user;
  const em = String(u.email || "").toLowerCase().trim();
  const ruolo = String(u.ruolo || "").toLowerCase().trim();
  return Boolean(
    isTruthyVal(u.perm_admin) ||
    isTruthyVal(u.is_master_spazi) ||
    isTruthyVal(u.perm_spazi) ||
    isTruthyVal(u.notif_spazi) ||
    ruolo === "master" ||
    ruolo === "admin" ||
    em.includes("dotti")
  );
}

export function haPermessiMaster() {
  if (!appState.user) return false;
  const u = appState.user;
  const em = String(u.email || "").toLowerCase().trim();
  const ruolo = String(u.ruolo || "").toLowerCase().trim();

  // Super-admin principale, o ruolo Master/Admin nel foglio
  if (em.includes("dotti") || ruolo === "master" || ruolo === "admin" || ruolo === "direttore" || ruolo === "vicedirettore" || ruolo === "vice-direttore") {
    return true;
  }

  // Visibile a chiunque abbia almeno uno dei permessi gestionali con coercizione sicura
  return Boolean(
    isTruthyVal(u.perm_admin) ||
    isTruthyVal(u.perm_mensa) ||
    isTruthyVal(u.perm_manutenzione) ||
    isTruthyVal(u.notif_manutenzione) ||
    isTruthyVal(u.perm_spazi) ||
    isTruthyVal(u.notif_spazi) ||
    isTruthyVal(u.is_master_spazi)
  );
}

export function haPermessiMasterMensa() {
  if (!appState.user) return false;
  const em = String(appState.user.email || "").toLowerCase().trim();
  const ruolo = String(appState.user.ruolo || "").toLowerCase().trim();
  return Boolean(
    isTruthyVal(appState.user.perm_mensa) ||
    isTruthyVal(appState.user.perm_admin) ||
    ruolo === "cuoca" ||
    ruolo === "cuoco" ||
    ruolo === "master" ||
    ruolo === "admin" ||
    em.includes("cuoca") ||
    em.includes("cucina") ||
    em.includes("dotti")
  );
}

export function haPermessiMasterManutenzione() {
  if (!appState.user) return false;
  const em = String(appState.user.email || "").toLowerCase().trim();
  const ruolo = String(appState.user.ruolo || "").toLowerCase().trim();
  return Boolean(
    isTruthyVal(appState.user.perm_manutenzione) ||
    isTruthyVal(appState.user.notif_manutenzione) ||
    isTruthyVal(appState.user.perm_admin) ||
    ruolo === "master" ||
    ruolo === "admin" ||
    em.includes("dotti")
  );
}

export function aggiornaUIUtente() {
  if (typeof document === "undefined") return;
  const avatarText = document.getElementById("header-user-avatar");
  const userName = document.getElementById("header-user-name");
  const userRole = document.getElementById("header-user-role");
  const masterNav = document.getElementById("nav-tab-master");
  const mensaNav = document.getElementById("nav-tab-mensa");
  const btnMasterSettings = document.getElementById("settings-btn-master");

  if (appState.user) {
    if (avatarText) {
      const parts = (appState.user.nome || "CN").trim().split(" ");
      avatarText.innerText = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
    }
    if (userName) userName.innerText = appState.user.nome;
    if (userRole) {
      let ruoli = [];
      const rLower = String(appState.user.ruolo || "").toLowerCase().trim();
      const isMasterRuolo = rLower === "master" || rLower === "admin";
      if (isTruthyVal(appState.user.perm_admin) || isMasterRuolo) ruoli.push("Admin");
      if (isTruthyVal(appState.user.perm_mensa)) ruoli.push("Mensa");
      if (isTruthyVal(appState.user.perm_manutenzione)) ruoli.push("Tecnico");
      if (isTruthyVal(appState.user.perm_spazi) || isTruthyVal(appState.user.is_master_spazi)) ruoli.push("Spazi");
      userRole.innerText = ruoli.length > 0 ? ruoli.join(" • ") : (appState.user.ruolo || "Residente");
    }
    const isMaster = haPermessiMaster();
    if (masterNav) masterNav.style.display = isMaster ? "flex" : "none";
    if (btnMasterSettings) btnMasterSettings.style.display = isMaster ? "flex" : "none";
    const btnGuidaHead = document.getElementById("header-btn-guida");
    if (btnGuidaHead) btnGuidaHead.style.display = isMaster ? "inline-flex" : "none";
    const btnGuidaSettings = document.getElementById("settings-btn-guida");
    if (btnGuidaSettings) btnGuidaSettings.style.display = isMaster ? "flex" : "none";

    const btnLogoutHead = document.getElementById("header-btn-logout");
    if (btnLogoutHead) btnLogoutHead.style.display = "inline-flex";
    const topLogoutRow = document.getElementById("settings-top-logout-row");
    if (topLogoutRow) topLogoutRow.style.display = "flex";

    const bannerSintesi = document.getElementById("banner-master-manutenzione-sintesi");
    if (bannerSintesi) bannerSintesi.style.display = haPermessiMasterManutenzione() ? "block" : "none";

    if (mensaNav) {
      const isMensaEnabled = appState.user.is_utente_mensa !== false;
      mensaNav.style.display = isMensaEnabled ? "flex" : "none";
      if (!isMensaEnabled && appState.currentTab === "mensa" && typeof window.switchTab === "function") {
        window.switchTab("info");
      }
    }

    if (!isMaster && appState.currentTab === "master" && typeof window.switchTab === "function") {
      window.switchTab("info");
    }
  } else {
    if (avatarText) avatarText.innerText = "👤";
    if (userName) userName.innerText = "Ospite";
    if (userRole) userRole.innerText = "Accedi";
    if (masterNav) masterNav.style.display = "none";
    if (btnMasterSettings) btnMasterSettings.style.display = "none";
    const btnGuidaHead = document.getElementById("header-btn-guida");
    if (btnGuidaHead) btnGuidaHead.style.display = "none";
    const btnGuidaSettings = document.getElementById("settings-btn-guida");
    if (btnGuidaSettings) btnGuidaSettings.style.display = "none";
    const btnLogoutHead = document.getElementById("header-btn-logout");
    if (btnLogoutHead) btnLogoutHead.style.display = "none";
    const topLogoutRow = document.getElementById("settings-top-logout-row");
    if (topLogoutRow) topLogoutRow.style.display = "none";
    const bannerSintesi = document.getElementById("banner-master-manutenzione-sintesi");
    if (bannerSintesi) bannerSintesi.style.display = "none";
    if (mensaNav) mensaNav.style.display = "flex";
  }
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  appState.user = null;
  if (typeof window.chiudiModalSettings === "function") {
    window.chiudiModalSettings();
  }
  aggiornaUIUtente();
  if (appState.currentTab === "master" && typeof window.switchTab === "function") {
    window.switchTab("info");
  }
  if (typeof window.caricaDatiBackend === "function") {
    window.caricaDatiBackend();
  }
}

export function confermaLogoutRapido() {
  if (!appState.user) {
    if (typeof window.mostraModalAuth === "function") window.mostraModalAuth(true);
    return;
  }
  const nomeUtente = appState.user.nome || appState.user.email || "questo account";
  if (confirm(`Confermi di voler effettuare la disconnessione (logout) da ${nomeUtente}?`)) {
    logout();
  }
}

export function checkAuthAndLoad() {
  const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
  if (savedUser) {
    try {
      appState.user = JSON.parse(savedUser);
      if (appState.user && appState.user.email) {
        const uEmail = String(appState.user.email).toLowerCase().trim();
        let dbUsers = [];
        try {
          const dbParsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_DB) || "{}");
          dbUsers = dbParsed.utenti || [];
        } catch (e) {}
        const matched = dbUsers.find(u => String(u.email || "").toLowerCase().trim() === uEmail);
        if (matched) {
          appState.user = { ...appState.user, ...matched };
          try { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(appState.user)); } catch (e) {}
        }
      }
      aggiornaUIUtente();
      if (typeof window.caricaDatiBackend === "function") window.caricaDatiBackend();
      return;
    } catch (e) {
      console.error("Errore parse utente:", e);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }
  appState.user = null;
  aggiornaUIUtente();
  if (typeof window.caricaDatiBackend === "function") window.caricaDatiBackend();
}

if (typeof window !== "undefined") {
  window.isTruthyVal = isTruthyVal;
  window.haPermessiMasterSpazi = haPermessiMasterSpazi;
  window.haPermessiMaster = haPermessiMaster;
  window.haPermessiMasterMensa = haPermessiMasterMensa;
  window.haPermessiMasterManutenzione = haPermessiMasterManutenzione;
  window.aggiornaUIUtente = aggiornaUIUtente;
  window.logout = logout;
  window.confermaLogoutRapido = confermaLogoutRapido;
  window.checkAuthAndLoad = checkAuthAndLoad;
}

/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - AUTHENTICATION & RBAC PERMISSIONS
 * ============================================================================
 */

import { STORAGE_KEYS } from "./config.js";
import { appState } from "./state.js";
import { chiudiModalSettings } from "./modal.js";

export function haPermessiMasterSpazi() {
  if (!appState.user) return false;
  return Boolean(
    appState.user.perm_admin ||
    appState.user.is_master_spazi ||
    (appState.user.perm_spazi && (appState.user.email?.toLowerCase().includes("dotti") || appState.user.ruolo === "Master"))
  );
}

export function haPermessiMaster() {
  if (!appState.user) return false;
  return Boolean(
    appState.user.perm_admin ||
    appState.user.perm_mensa ||
    appState.user.perm_manutenzione ||
    haPermessiMasterSpazi()
  );
}

export function haPermessiMasterMensa() {
  if (!appState.user) return false;
  const em = String(appState.user.email || "").toLowerCase();
  const ruolo = String(appState.user.ruolo || "").toLowerCase();
  return Boolean(
    appState.user.perm_mensa ||
    appState.user.perm_admin ||
    ruolo === "cuoca" ||
    ruolo === "cuoco" ||
    ruolo === "master" ||
    em.includes("cuoca") ||
    em.includes("cucina") ||
    em.includes("dotti")
  );
}

export function haPermessiMasterManutenzione() {
  if (!appState.user) return false;
  return Boolean(appState.user.perm_manutenzione || appState.user.perm_admin);
}

export function aggiornaUIUtente() {
  if (typeof document === "undefined") return;
  const avatarText = document.getElementById("header-user-avatar");
  const userName = document.getElementById("header-user-name");
  const userRole = document.getElementById("header-user-role");
  const masterNav = document.getElementById("nav-tab-master");
  const mensaNav = document.getElementById("nav-tab-mensa");

  if (appState.user) {
    if (avatarText) {
      const parts = (appState.user.nome || "CN").trim().split(" ");
      avatarText.innerText = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
    }
    if (userName) userName.innerText = appState.user.nome;
    if (userRole) {
      let ruoli = [];
      if (appState.user.perm_admin) ruoli.push("Admin");
      if (appState.user.perm_mensa) ruoli.push("Mensa");
      if (appState.user.perm_manutenzione) ruoli.push("Tecnico");
      userRole.innerText = ruoli.length > 0 ? ruoli.join(" • ") : "Residente";
    }
    const isMaster = haPermessiMaster();
    if (masterNav) masterNav.style.display = isMaster ? "flex" : "none";
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
  } else {
    if (avatarText) avatarText.innerText = "👤";
    if (userName) userName.innerText = "Ospite";
    if (userRole) userRole.innerText = "Accedi";
    if (masterNav) masterNav.style.display = "none";
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
      if (appState.user && !appState.user.perm_admin && !appState.user.email?.includes("dotti") && !appState.user.is_master_spazi) {
        appState.user.perm_spazi = false;
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
  window.haPermessiMasterSpazi = haPermessiMasterSpazi;
  window.haPermessiMaster = haPermessiMaster;
  window.haPermessiMasterMensa = haPermessiMasterMensa;
  window.haPermessiMasterManutenzione = haPermessiMasterManutenzione;
  window.aggiornaUIUtente = aggiornaUIUtente;
  window.logout = logout;
  window.confermaLogoutRapido = confermaLogoutRapido;
  window.checkAuthAndLoad = checkAuthAndLoad;
}

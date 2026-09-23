/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - FRONTEND LOGIC (app.js)
 * PARTE 1: CORE, STATO GLOBALE, API E AUTENTICAZIONE
 * ============================================================================
 */

const STORAGE_KEYS = {
  USER: "newman_user_data",
  BACKEND_URL: "newman_gas_backend_url",
  LOCAL_DB: "newman_local_mock_db",
  BYPASS_TIME_LOCK: "newman_bypass_time_lock"
};

const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycbwGOPkCRL8gIHEcvv_yTmmlSWwyt2r5_jqrU7JMqzNorN6By4hccBIwB-GhvmLwoY3pTw/exec";

const appState = {
  user: null,
  backendUrl: "",
  currentTab: "info",
  mensaViewMode: "giorno",
  selectedDateMensa: new Date(),
  cachedConfig: {},
  prenotazioniSpazi: [],
  bacheca: [],
  accoglienzaList: [],
  selectedBachecaDate: new Date(),
  mensaBookings: [],
  guasti: [],
  tuttiUtenti: [],
  utentiInAttesa: [],
  isOfflineMode: false,
  bypassTimeLock: false,
  masterActiveTab: "utenti",
};

// --- UTILITY DATE (Rigorosamente gg-mm-aaaa) E TESTO ---
window.formattaDataItaliana = (val) => {
  if (!val) return "";
  let d;
  if (val instanceof Date) d = val;
  else {
    const s = String(val).trim();
    const part = s.includes("T") ? s.split("T")[0] : s.split(" ")[0];
    const m = part.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    d = new Date(s);
  }
  if (!isNaN(d.getTime())) {
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  }
  return String(val);
};

const formatYMD = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const escapeHtml = (unsafe) => String(unsafe || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

// --- STARTUP DELL'APPLICAZIONE ---
document.addEventListener("DOMContentLoaded", () => {
  let storedBackendUrl = localStorage.getItem(STORAGE_KEYS.BACKEND_URL);
  appState.backendUrl = storedBackendUrl || DEFAULT_GAS_URL || "";
  appState.isOfflineMode = !appState.backendUrl;
  
  const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
  if (savedUser) { try { appState.user = JSON.parse(savedUser); } catch(e) { appState.user = null; } }
  
  aggiornaUIUtente();
  caricaDatiBackend();

  // Listener Form Login
  document.getElementById("form-auth-email")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-check-email");
    const email = document.getElementById("auth-input-email").value.trim().toLowerCase();
    const password = document.getElementById("auth-input-password").value.trim();
    btn.disabled = true; btn.innerText = "Verifica...";
    
    try {
      const res = await callApi("login", { email, password });
      if (res.success) {
        if (res.utente.stato === "In Attesa") {
          document.getElementById("auth-step-email").classList.add("hidden");
          document.getElementById("auth-step-waiting").classList.remove("hidden");
          document.getElementById("waiting-user-email").innerText = email;
        } else {
          appState.user = res.utente;
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(appState.user));
          window.location.reload();
        }
      } else if (res.notFound) {
        document.getElementById("auth-step-email").classList.add("hidden");
        document.getElementById("auth-step-register").classList.remove("hidden");
        document.getElementById("reg-input-email").value = email;
      } else {
        mostraToast(res.error || "Errore di accesso", "error");
      }
    } catch(err) {
      mostraToast("Errore di connessione", "error");
    }
    btn.disabled = false; btn.innerText = "Accedi";
  });
});

// --- COMUNICAZIONE API BACKEND ---
async function callApi(action, params = {}) {
  const payload = { action, ...params };
  try {
    const response = await fetch(appState.backendUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (err) {
    mostraToast("Errore di rete. Riprova più tardi.", "error");
    return { success: false, error: err.message };
  }
}

async function caricaDatiBackend() {
  try {
    const data = await callApi("getInfoData");
    if (data && data.success) {
      appState.cachedConfig = data.config || {};
      appState.prenotazioniSpazi = data.prenotazioniSpazi || [];
      appState.bacheca = data.bacheca || [];
      appState.mensaBookings = data.prenotazioniMensa || [];
      appState.accoglienzaList = data.accoglienza || [];
      if (data.menuBase) applicaMenuBaseDaGoogleSheets(data.menuBase);
      
      aggiornaUIUtente();
      if(typeof renderBachecaView === 'function') renderBachecaView();
      if(typeof renderResidenzaView === 'function') renderResidenzaView();
      if(typeof renderMensaView === 'function') renderMensaView();
      if(typeof renderAccoglienzaView === 'function') renderAccoglienzaView();
      if(typeof renderSpaziView === 'function') renderSpaziView();
    }
    if (haPermessiMaster()) caricaDatiMaster();
  } catch (err) {
    console.error("Fetch iniziale fallito", err);
  }
}

async function caricaDatiMaster() {
  if (!appState.user) return;
  const res = await callApi("getMasterData", { email: appState.user.email });
  if (res.success) {
    appState.tuttiUtenti = res.tuttiUtenti || [];
    appState.utentiInAttesa = res.utentiInAttesa || [];
    appState.guasti = res.guasti || [];
    if (appState.currentTab === "master" && typeof renderMasterSection === 'function') renderMasterSection();
  }
}

function haPermessiMaster() {
  return appState.user && (appState.user.perm_admin || appState.user.perm_mensa || appState.user.perm_manutenzione || appState.user.perm_spazi);
}

// --- GESTIONE INTERFACCIA E ROUTING ---
function aggiornaUIUtente() {
  const pillName = document.getElementById("header-user-name");
  const pillRole = document.getElementById("header-user-role");
  const avatar = document.getElementById("header-user-avatar");
  
  const tabMensa = document.getElementById("nav-tab-mensa");
  if (tabMensa) {
    if (appState.user && appState.user.is_utente_mensa === false && !appState.user.perm_admin) {
      tabMensa.style.display = "none";
      if (appState.currentTab === "mensa") window.switchTab("info");
    } else {
      tabMensa.style.display = "flex";
    }
  }

  const tabMaster = document.getElementById("nav-tab-master");
  if (tabMaster) tabMaster.style.display = haPermessiMaster() ? "flex" : "none";

  if (appState.user) {
    const nomeArr = appState.user.nome.split(" ");
    avatar.innerText = nomeArr.length > 1 ? (nomeArr[0][0] + nomeArr[1][0]).toUpperCase() : nomeArr[0].substring(0, 2).toUpperCase();
    pillName.innerText = appState.user.nome;
    pillRole.innerText = haPermessiMaster() ? "Master" : "Residente";
  } else {
    avatar.innerText = "CN";
    pillName.innerText = "Ospite";
    pillRole.innerText = "Accedi";
  }
}

window.switchTab = (tabId) => {
  document.querySelectorAll(".view-container").forEach(el => el.classList.remove("active-view"));
  document.querySelectorAll(".bottom-nav-item").forEach(el => el.classList.remove("active"));
  
  const view = document.getElementById("view-" + tabId);
  const tab = document.getElementById("nav-tab-" + tabId);
  if (view) view.classList.add("active-view");
  if (tab) tab.classList.add("active");
  
  appState.currentTab = tabId;
  window.scrollTo(0, 0);

  if (tabId === "info") window.renderBachecaView();
  if (tabId === "mensa") window.renderMensaView();
  if (tabId === "accoglienza") window.renderAccoglienzaView();
  if (tabId === "spazi") window.renderSpaziView();
  if (tabId === "master" && haPermessiMaster()) window.renderMasterSection();
};

window.mostraModalAuth = (mostra) => {
  const modal = document.getElementById("modal-auth");
  if (!modal) return;
  modal.style.display = mostra ? "flex" : "none";
  if (mostra) {
    document.getElementById("auth-step-email")?.classList.remove("hidden");
    document.getElementById("auth-step-register")?.classList.add("hidden");
    document.getElementById("auth-step-waiting")?.classList.add("hidden");
  }
};

window.gestisciClickUserPill = () => appState.user ? window.apriModalSettings() : window.mostraModalAuth(true);
window.apriModalSettings = () => { document.getElementById("modal-settings").style.display = "flex"; };
window.chiudiModalSettings = () => { document.getElementById("modal-settings").style.display = "none"; };
window.logout = () => { localStorage.removeItem(STORAGE_KEYS.USER); window.location.reload(); };

window.mostraToast = (msg, tipo = "info") => {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = `<span>${msg}</span><button style="background:none;border:none;color:#fff;font-size:16px;cursor:pointer;">✕</button>`;
  container.appendChild(toast);
  toast.querySelector("button").onclick = () => toast.remove();
  setTimeout(() => { toast.classList.add("toast-fade-out"); setTimeout(() => toast.remove(), 300); }, 4000);
};

// Menu di base (fallback in memoria)
let MENU_14_GIORNI = {
  settimana1: {
    lunedi: { pranzo: { primo: "Paella", secondo: "Saltimbocca", dessert: "Frutta" }, cena: { primo: "Spaghetti vongole", secondo: "Scaloppine", dessert: "Frutta" } },
    martedi: { pranzo: { busta: true }, cena: { primo: "Riso curry", secondo: "Verdure", dessert: "Dessert" } },
    mercoledi: { pranzo: { primo: "Gnocchi", secondo: "Cotoletta", dessert: "Frutta" }, cena: { primo: "Vellutata", secondo: "Frittata", dessert: "Yogurt" } },
    giovedi: { pranzo: { busta: true }, cena: { primo: "Lasagna", secondo: "Arista", dessert: "Frutta" } },
    venerdi: { pranzo: { primo: "Pasta lenticchie", secondo: "Merluzzo", dessert: "Frutta" }, cena: { primo: "Minestrone", secondo: "Platessa", dessert: "Sorbetto" } },
    sabato: { pranzo: { primo: "Fusilli pesto", secondo: "Arrosto", dessert: "Frutta" }, cena: { primo: "Pizza", secondo: "Supplì", dessert: "Dolce" } },
    domenica: { pranzo: { primo: "Tagliatelle", secondo: "Agnello", dessert: "Dolce" }, cena: { primo: "Passato verdure", secondo: "Tagliere", dessert: "Frutta" } }
  },
  settimana2: {
    lunedi: { pranzo: { primo: "Ravioli", secondo: "Polpette", dessert: "Frutta" }, cena: { primo: "Risotto funghi", secondo: "Pollo", dessert: "Frutta" } },
    martedi: { pranzo: { busta: true }, cena: { primo: "Amatriciana", secondo: "Involtini", dessert: "Frutta" } },
    mercoledi: { pranzo: { primo: "Cannelloni", secondo: "Bistecca", dessert: "Macedonia" }, cena: { primo: "Crema piselli", secondo: "Tortino", dessert: "Budino" } },
    giovedi: { pranzo: { busta: true }, cena: { primo: "Pasta fagioli", secondo: "Salsiccia", dessert: "Frutta" } },
    venerdi: { pranzo: { primo: "Spaghetti tonno", secondo: "Salmone", dessert: "Frutta" }, cena: { primo: "Zuppa orzo", secondo: "Calamari", dessert: "Gelato" } },
    sabato: { pranzo: { primo: "Arrabbiata", secondo: "Pollo", dessert: "Frutta" }, cena: { primo: "Focaccia", secondo: "Tagliere", dessert: "Dolce" } },
    domenica: { pranzo: { primo: "Risotto", secondo: "Filetto", dessert: "Tiramisù" }, cena: { primo: "Brodo", secondo: "Carpaccio", dessert: "Frutta" } }
  }
};

function applicaMenuBaseDaGoogleSheets(menuBase) {
  if (!menuBase) return;
  ["settimana1", "settimana2"].forEach(s => {
    if (menuBase[s]) Object.keys(menuBase[s]).forEach(g => {
      if (!MENU_14_GIORNI[s]) MENU_14_GIORNI[s] = {};
      MENU_14_GIORNI[s][g] = menuBase[s][g];
    });
  });
}
function getSettimanaMenu(dataTarget) {
  const diffWeeks = Math.floor((new Date(dataTarget).getTime() - new Date(2026, 8, 21).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return Math.abs(diffWeeks) % 2 === 0 ? "settimana2" : "settimana1";
}
function getNomeGiorno(data) {
  return ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"][data.getDay()];
}

/**
 * ============================================================================
 * PARTE 2: HOME UNIFICATA (BACHECA + CALENDARIO) E LA RESIDENZA
 * ============================================================================
 */

window.renderBachecaView = function() {
  const container = document.getElementById("bacheca-container");
  if (!container) return;

  const dataSel = appState.selectedBachecaDate || new Date();
  const dataYMD = formatYMD(dataSel);
  const oggiYMD = formatYMD(new Date());
  
  // Elementi del giorno specifico selezionato
  const itemsGiorno = appState.bacheca.filter(i => String(i.data).split("T")[0] === dataYMD);
  
  // Prossimi Appuntamenti (dal giorno selezionato in poi, esclusi quelli già mostrati sopra)
  const dataSelMs = new Date(dataYMD).getTime();
  const itemsFuturi = appState.bacheca.filter(i => {
    const ms = new Date(String(i.data).split("T")[0]).getTime();
    return ms > dataSelMs;
  }).sort((a, b) => new Date(a.data) - new Date(b.data)).slice(0, 15);

  let html = `
    <!-- HEADER CALENDARIO -->
    <div class="card roman-calendar-card">
      <div class="roman-header-clean">
        <div class="roman-italian-date-large" style="font-size: 20px; font-weight: 800; color: #ffffff;">
          ${dataYMD === oggiYMD ? "Oggi, " : ""}${window.formattaDataItaliana(dataSel)}
        </div>
      </div>
      <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
        ${haPermessiMaster() ? `<button class="btn btn-sm" style="background:#9d174d;color:#fff;" onclick="apriModalBacheca('${dataYMD}')">+ Aggiungi Evento in Bacheca</button>` : ''}
      </div>
      <div class="roman-nav-bar" style="margin-top:16px;">
        <button class="btn btn-secondary btn-sm" onclick="cambiaGiornoBacheca(-1)">Ieri</button>
        <button class="btn ${dataYMD === oggiYMD ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="vaiAOggiBacheca()">${dataYMD === oggiYMD ? 'Oggi' : 'Torna a Oggi'}</button>
        <button class="btn btn-secondary btn-sm" onclick="cambiaGiornoBacheca(1)">Domani</button>
        <input type="date" class="input-date-small" style="padding:4px; border-radius:6px;" value="${dataYMD}" onchange="selezionaDataBacheca(this.value)">
      </div>
    </div>

    <!-- EVENTI DEL GIORNO -->
    <div class="card">
      <h3 class="card-title-sm" style="margin-bottom:12px; color:var(--primary);">Eventi & Avvisi per il ${window.formattaDataItaliana(dataSel)}</h3>
      ${itemsGiorno.length === 0 ? `<div class="empty-state-text">Nessun evento registrato per questa data.</div>` : itemsGiorno.map(item => `
        <div class="bacheca-card" style="border-left-color: ${item.tipo === 'compleanno' ? '#d97706' : '#2563eb'}; padding: 12px;">
          <div class="flex-between">
            <span class="badge" style="background:#e0f2fe; color:#0369a1;">${item.tipo.toUpperCase()}</span>${haPermessiMaster() ? `<button class="btn-delete-bacheca" onclick="eliminaAvvisoBacheca('${item.id}')">✕</button>` : ''}
          </div>
          <h4 class="bacheca-card-title">${escapeHtml(item.titolo)}</h4>
          <p class="bacheca-card-desc">${escapeHtml(item.descrizione)}</p>
          <div class="bacheca-card-meta"><span>Inserito da: ${escapeHtml(item.autore)}</span></div>
        </div>
      `).join("")}
    </div>

    <!-- CALENDARIO FUTURO -->
    <div class="card">
      <h3 class="card-title-sm" style="margin-bottom:12px; color:var(--text-muted);">Prossimi Appuntamenti in Calendario</h3>
      <div class="mini-list">
        ${itemsFuturi.length === 0 ? `<div class="text-xs text-muted">Nessun evento futuro in programma.</div>` : itemsFuturi.map(item => `
          <div class="mini-item flex-between" onclick="selezionaDataBacheca('${item.data}')" style="cursor:pointer; padding: 12px;">
            <div>
              <strong style="font-size:14px; color: var(--primary);">${escapeHtml(item.titolo)}</strong>
              <div class="text-xs text-muted" style="margin-top:2px; font-weight:600;">🗓️ ${window.formattaDataItaliana(item.data)}</div>
            </div>
            <span class="badge" style="background:var(--surface); border: 1px solid var(--border);">Vedi Giorno ➡️</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  container.innerHTML = html;
};

window.cambiaGiornoBacheca = (off) => { appState.selectedBachecaDate.setDate(appState.selectedBachecaDate.getDate() + off); window.renderBachecaView(); };
window.vaiAOggiBacheca = () => { appState.selectedBachecaDate = new Date(); window.renderBachecaView(); };
window.selezionaDataBacheca = (v) => { if(v) { appState.selectedBachecaDate = new Date(v); window.renderBachecaView(); } };

// Funzioni Base per Creazione Avvisi
window.apriModalBacheca = (prefillData) => {
  document.getElementById("form-nuovo-avviso-bacheca")?.reset();
  const dataInput = document.getElementById("bacheca-modal-data");
  if(dataInput) dataInput.value = prefillData || formatYMD(new Date());
  document.getElementById("modal-bacheca").style.display = "flex";
};
window.chiudiModalBacheca = () => document.getElementById("modal-bacheca").style.display = "none";

window.handleSalvaAvvisoBacheca = async (e) => {
  e.preventDefault();
  const payload = {
    tipo: document.getElementById("bacheca-modal-tipo").value,
    data: document.getElementById("bacheca-modal-data").value,
    titolo: document.getElementById("bacheca-modal-titolo").value,
    descrizione: document.getElementById("bacheca-modal-desc").value,
    autore: document.getElementById("bacheca-modal-autore").value,
  };
  const res = await callApi("salvaAvvisoBacheca", payload);
  if(res.success) {
    mostraToast("Avviso pubblicato", "success");
    chiudiModalBacheca();
    caricaDatiBackend();
  }
};

window.eliminaAvvisoBacheca = async (id) => {
  if(!confirm("Vuoi eliminare questo avviso?")) return;
  const res = await callApi("eliminaAvvisoBacheca", { id });
  if(res.success) caricaDatiBackend();
};

window.renderResidenzaView = function() {
  const container = document.getElementById("residenza-container");
  if (!container) return;
  
  const regText = appState.cachedConfig?.Info_Regolamento || "Regolamento della Residenza...";
  const contText = appState.cachedConfig?.Info_Contatti || "Contatti...";

  container.innerHTML = `
    <div class="card" style="background: var(--primary); color: #fff;">
      <h2 class="card-title" style="color:#fff;">La Residenza</h2>
      <p style="font-size:13px; color:#cbd5e1;">Norme e Contatti della struttura.</p>
    </div>
    <div class="card">
      <h3 class="card-title-sm">Regolamento Interno</h3>
      <div class="residenza-text-box">${escapeHtml(regText)}</div>
    </div>
    <div class="card">
      <h3 class="card-title-sm">Numeri Utili</h3>
      <div class="residenza-text-box">${escapeHtml(contText)}</div>
    </div>
  `;
};

/**
 * ============================================================================
 * PARTE 3: MENSA (OPT-OUT & OSPITI) E ACCOGLIENZA
 * ============================================================================
 */

// --- MENSA (Opt-Out, Ospiti, Busta) ---
window.renderMensaView = function() {
  const container = document.getElementById("mensa-container");
  if (!container) return;

  if (appState.user && appState.user.is_utente_mensa === false && !appState.user.perm_admin) {
    container.innerHTML = `<div class="card" style="text-align:center; padding: 40px 20px;"><h2>Accesso non abilitato</h2><p class="text-muted">Il tuo profilo non prevede l'utilizzo della mensa residenziale.</p></div>`;
    return;
  }

  const d = appState.selectedDateMensa || new Date();
  const dStr = formatYMD(d);
  const giornoKey = getNomeGiorno(d);
  const settimana = getSettimanaMenu(d);
  const menu = MENU_14_GIORNI[settimana]?.[giornoKey] || {};
  const isBustaDay = (giornoKey === "martedi" || giornoKey === "giovedi");
  const maxOspiti = parseInt(appState.cachedConfig.Max_Ospiti_Mensa || 5, 10);
  
  const email = appState.user ? appState.user.email.toLowerCase() : "";
  const prenPranzo = appState.mensaBookings.find(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === "pranzo" && m.email === email);
  const prenCena = appState.mensaBookings.find(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === "cena" && m.email === email);

  const isPranzoAssente = prenPranzo && prenPranzo.stato_presenza === "Assente";
  const isCenaAssente = prenCena && prenCena.stato_presenza === "Assente";
  const ospitiPranzo = prenPranzo ? prenPranzo.ospiti : 0;
  const ospitiCena = prenCena ? prenCena.ospiti : 0;

  container.innerHTML = `
    <div class="mensa-header-card card" style="padding: 14px;">
      <div class="flex-between" style="margin-bottom: 12px;">
        <button class="btn btn-outline btn-sm" onclick="appState.selectedDateMensa.setDate(appState.selectedDateMensa.getDate() - 1); window.renderMensaView();">⬅️ Ieri</button>
        <strong style="color:var(--primary); font-size: 16px;">${window.formattaDataItaliana(d)}</strong>
        <button class="btn btn-outline btn-sm" onclick="appState.selectedDateMensa.setDate(appState.selectedDateMensa.getDate() + 1); window.renderMensaView();">Domani ➡️</button>
      </div>
      <input type="date" class="input-text" value="${dStr}" onchange="appState.selectedDateMensa = new Date(this.value); window.renderMensaView();" style="text-align: center;">
    </div>

    <!-- PRANZO -->
    <div class="card meal-card ${isPranzoAssente ? 'card-disabled' : ''}">
      <div class="flex-between" style="margin-bottom: 8px;">
        <h3 class="meal-title">☀️ Pranzo (14:30)</h3>
        <span class="badge ${isPranzoAssente ? 'badge-danger' : 'badge-success'}">${isPranzoAssente ? 'Assente' : 'Presente'}</span>
      </div>
      <div class="meal-menu-body">
        ${isBustaDay ? `
          <div style="background:#fffbeb; padding:10px; border-radius:8px; border:1px solid #fde68a;">
            <strong style="color:#92400e; font-size:14px;">🎒 Pranzo al sacco: Busta da Asporto</strong>
            <p style="margin:4px 0 0 0; font-size:13px; color:#78350f; font-weight:600;">Comprende: pasto, frutta e snack/dolce, acqua e succo</p>
          </div>
        ` : `
          <div class="dish-list">
            <div><span class="dish-type">1º:</span> <strong style="color:var(--text-main);">${escapeHtml(menu.pranzo?.primo || '-')}</strong></div>
            <div><span class="dish-type">2º:</span> <strong style="color:var(--text-main);">${escapeHtml(menu.pranzo?.secondo || '-')}</strong></div>
            <div><span class="dish-type">Cont.:</span> <strong style="color:var(--text-main);">${escapeHtml(menu.pranzo?.contorno || '-')}</strong></div>
          </div>
        `}
      </div>
      <div style="background:var(--surface-alt); padding:12px; border-radius:8px; margin-top:10px;">
        <label class="custom-checkbox" style="margin-bottom: ${!isPranzoAssente ? '12px' : '0'};">
          <input type="checkbox" ${isPranzoAssente ? 'checked' : ''} onchange="togglePresenza('${dStr}', 'pranzo', !this.checked)">
          <span style="color:#dc2626; font-weight:700;">Segnala Assenza</span>
        </label>
        ${!isPranzoAssente ? `
          <div style="display:flex; align-items:center; gap:10px; border-top: 1px solid var(--border); padding-top: 10px;">
            <label style="margin:0; font-size:13px; font-weight:600;">Ospiti extra:</label>
            <select class="input-select" style="padding:4px 8px; width:70px; font-weight:700;" onchange="aggiornaOspiti('${dStr}', 'pranzo', this.value)">
              ${Array.from({length: maxOspiti + 1}, (_, i) => `<option value="${i}" ${ospitiPranzo === i ? 'selected' : ''}>${i}</option>`).join('')}
            </select>
          </div>
          <div style="margin-top:10px;">
            <label class="custom-checkbox">
              <input type="checkbox" ${prenPranzo?.ritardo ? 'checked' : ''} onchange="toggleRitardo('${dStr}', 'pranzo', this.checked)">
              <span style="font-size:13px;">Ritiro in Ritardo / Posticipato</span>
            </label>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- CENA -->
    <div class="card meal-card ${isCenaAssente ? 'card-disabled' : ''}">
      <div class="flex-between" style="margin-bottom: 8px;">
        <h3 class="meal-title">🌙 Cena (19:30)</h3>
        <span class="badge ${isCenaAssente ? 'badge-danger' : 'badge-success'}">${isCenaAssente ? 'Assente' : 'Presente'}</span>
      </div>
      <div class="meal-menu-body">
        <div class="dish-list">
          <div><span class="dish-type">1º:</span> <strong style="color:var(--text-main);">${escapeHtml(menu.cena?.primo || '-')}</strong></div>
          <div><span class="dish-type">2º:</span> <strong style="color:var(--text-main);">${escapeHtml(menu.cena?.secondo || '-')}</strong></div>
          <div><span class="dish-type">Cont.:</span> <strong style="color:var(--text-main);">${escapeHtml(menu.cena?.contorno || '-')}</strong></div>
        </div>
      </div>
      <div style="background:var(--surface-alt); padding:12px; border-radius:8px; margin-top:10px;">
        <label class="custom-checkbox" style="margin-bottom: ${!isCenaAssente ? '12px' : '0'};">
          <input type="checkbox" ${isCenaAssente ? 'checked' : ''} onchange="togglePresenza('${dStr}', 'cena', !this.checked)">
          <span style="color:#dc2626; font-weight:700;">Segnala Assenza</span>
        </label>
        ${!isCenaAssente ? `
          <div style="display:flex; align-items:center; gap:10px; border-top: 1px solid var(--border); padding-top: 10px;">
            <label style="margin:0; font-size:13px; font-weight:600;">Ospiti extra:</label>
            <select class="input-select" style="padding:4px 8px; width:70px; font-weight:700;" onchange="aggiornaOspiti('${dStr}', 'cena', this.value)">
              ${Array.from({length: maxOspiti + 1}, (_, i) => `<option value="${i}" ${ospitiCena === i ? 'selected' : ''}>${i}</option>`).join('')}
            </select>
          </div>
          <div style="margin-top:10px;">
            <label class="custom-checkbox">
              <input type="checkbox" ${prenCena?.ritardo ? 'checked' : ''} onchange="toggleRitardo('${dStr}', 'cena', this.checked)">
              <span style="font-size:13px;">Arrivo in Ritardo (Piatto coperto)</span>
            </label>
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

window.togglePresenza = async (data, pasto, isPresente) => {
  if (!appState.user) return;
  const payload = { data, email: appState.user.email, tipo_pasto: pasto, stato_presenza: isPresente ? "Presente" : "Assente", ospiti: 0 };
  window.mostraToast("Aggiornamento presenza...", "info");
  const res = await callApi("prenotaMensa", payload);
  if (res.success) await caricaDatiBackend();
  else window.mostraToast(res.error, "error");
};

window.aggiornaOspiti = async (data, pasto, num) => {
  if (!appState.user) return;
  const payload = { data, email: appState.user.email, tipo_pasto: pasto, ospiti: num, stato_presenza: "Presente" };
  const res = await callApi("prenotaMensa", payload);
  if (res.success) { window.mostraToast(`Ospiti aggiornati a ${num}`, "success"); await caricaDatiBackend(); }
};

window.toggleRitardo = async (data, pasto, ritardo) => {
  if (!appState.user) return;
  const payload = { data, email: appState.user.email, tipo_pasto: pasto, ritardo: ritardo, stato_presenza: "Presente" };
  const res = await callApi("prenotaMensa", payload);
  if (res.success) { window.mostraToast("Stato ritardo aggiornato", "success"); await caricaDatiBackend(); }
};

// --- ACCOGLIENZA (Doppia Autorizzazione Camere) ---
window.renderAccoglienzaView = function() {
  const container = document.getElementById("accoglienza-container");
  if (!container) return;

  const email = appState.user ? appState.user.email.toLowerCase() : "";
  const mieRichieste = appState.accoglienzaList.filter(a => a.richiedente_email === email);
  const daAutorizzare = haPermessiMaster() ? appState.accoglienzaList.filter(a => a.stato.includes("Attesa") || a.stato.includes("1a Autorizzazione")) : [];

  let html = `
    <div class="card" style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #fff;">
      <div class="flex-between">
        <div>
          <h2 style="margin:0; font-size:18px;">Modulo Accoglienza</h2>
          <span style="font-size:12px; color:#bfdbfe;">Richiedi ospitalità nelle camere della Residenza</span>
        </div>
        <button class="btn btn-sm" style="background:#f59e0b; color:#000; font-weight:700;" onclick="document.getElementById('modal-nuova-accoglienza').style.display='flex'">+ Nuova Richiesta</button>
      </div>
    </div>
  `;

  if (haPermessiMaster() && daAutorizzare.length > 0) {
    html += `<div class="card"><h3 class="card-title-sm" style="color:#b45309;">🚨 Da Autorizzare (Master)</h3>`;
    daAutorizzare.forEach(req => {
      const isAuth1 = req.stato.includes("1a Autorizzazione Concessa");
      html += `
        <div class="card-inner" style="border-left: 4px solid ${isAuth1 ? '#f59e0b' : '#3b82f6'};">
          <div class="flex-between">
            <strong style="font-size:15px; color:var(--primary);">👤 ${escapeHtml(req.nome_ospite)}</strong>
            <span class="badge" style="background:#fef3c7; color:#92400e;">${escapeHtml(req.stato)}</span>
          </div>
          <div class="text-xs text-muted" style="margin:6px 0; line-height: 1.4;">
            <strong>Richiedente:</strong> ${escapeHtml(req.richiedente_nome)}<br>
            <strong>Date:</strong> ${window.formattaDataItaliana(req.data_checkin)} ➡️ ${window.formattaDataItaliana(req.data_checkout)} (${req.numero_ospiti} pax)
          </div>
          <div style="display:flex; gap:6px; margin-top:10px; flex-wrap:wrap;">
            ${!isAuth1 ? `
              <button class="btn btn-sm btn-primary" onclick="apriModalAuth1Accoglienza('${req.id}')" style="flex:1;">🔑 Assegna Camera (Auth 1)</button>
            ` : `
              <div style="width:100%; font-size:13px; margin-bottom:6px; background:#e0f2fe; padding:4px 8px; border-radius:4px; color:#0369a1;">
                Camera Assegnata: <strong>${escapeHtml(req.camera_assegnata)}</strong>
              </div>
              <button class="btn btn-sm btn-success" onclick="confermaAuth2Accoglienza('${req.id}')" style="flex:1;">✅ Conferma Finale (Auth 2)</button>
            `}
            <button class="btn btn-sm btn-outline" style="color:#dc2626; border-color:#fca5a5;" onclick="rifiutaAccoglienza('${req.id}')">Rifiuta</button>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `<div class="card"><h3 class="card-title-sm">Le Mie Richieste</h3>`;
  if (mieRichieste.length === 0) {
    html += `<div class="empty-state-text" style="padding: 20px 0;">Nessuna richiesta di ospitalità inviata.</div>`;
  } else {
    mieRichieste.forEach(req => {
      let bColor = "#94a3b8";
      let icon = "⏳";
      if (req.stato === "Confermata") { bColor = "#16a34a"; icon = "✅"; }
      if (req.stato === "Rifiutata") { bColor = "#dc2626"; icon = "❌"; }
      
      html += `
        <div class="card-inner" style="border-left: 4px solid ${bColor};">
          <div class="flex-between">
            <strong style="color:var(--primary); font-size:15px;">${icon} ${escapeHtml(req.nome_ospite)}</strong>
            <span class="badge" style="background:${bColor}20; color:${bColor};">${escapeHtml(req.stato)}</span>
          </div>
          <div class="text-xs text-muted" style="margin-top:6px; line-height: 1.4;">
            <strong>In:</strong> ${window.formattaDataItaliana(req.data_checkin)} | <strong>Out:</strong> ${window.formattaDataItaliana(req.data_checkout)}
          </div>
          ${req.camera_assegnata ? `<div class="text-sm" style="margin-top:8px; font-weight:700; color:#0369a1; background:#e0f2fe; padding:4px 8px; border-radius:4px; display:inline-block;">🛏️ ${escapeHtml(req.camera_assegnata)}</div>` : ''}
        </div>
      `;
    });
  }
  html += `</div>`;
  container.innerHTML = html;
};

window.handleInviaRichiestaAccoglienza = async (e) => {
  e.preventDefault();
  const payload = {
    nome_ospite: document.getElementById("acc-ospite-nome").value,
    data_checkin: document.getElementById("acc-checkin").value,
    data_checkout: document.getElementById("acc-checkout").value,
    numero_ospiti: document.getElementById("acc-num-ospiti").value,
    camera_preferita: document.getElementById("acc-camera-preferita").value,
    note: document.getElementById("acc-note").value,
    email: appState.user.email,
    nome: appState.user.nome
  };
  document.getElementById("btn-submit-accoglienza").disabled = true;
  const res = await callApi("richiediAccoglienza", payload);
  if (res.success) {
    window.mostraToast("Richiesta inviata ai Master", "success");
    document.getElementById("modal-nuova-accoglienza").style.display = "none";
    await caricaDatiBackend();
  } else {
    window.mostraToast(res.error, "error");
  }
  document.getElementById("btn-submit-accoglienza").disabled = false;
};

window.apriModalAuth1Accoglienza = (id) => {
  document.getElementById("auth1-richiesta-id").value = id;
  document.getElementById("auth1-opt-cam-1").innerText = appState.cachedConfig.Nome_Camera_1 || "Camera 1";
  document.getElementById("auth1-opt-cam-2").innerText = appState.cachedConfig.Nome_Camera_2 || "Camera 2";
  document.getElementById("auth1-opt-cam-3").innerText = appState.cachedConfig.Nome_Camera_3 || "Camera 3";
  document.getElementById("modal-autorizza1-accoglienza").style.display = "flex";
};

window.handleConfermaAutorizza1 = async (e) => {
  e.preventDefault();
  const payload = {
    id: document.getElementById("auth1-richiesta-id").value,
    camera_assegnata: document.getElementById("auth1-camera-assegnata").value,
    note: document.getElementById("auth1-note-master").value,
    approvatoreEmail: appState.user.email
  };
  const res = await callApi("autorizza1Accoglienza", payload);
  if (res.success) {
    window.mostraToast("Camera assegnata (Auth 1 completata)", "success");
    document.getElementById("modal-autorizza1-accoglienza").style.display = "none";
    await caricaDatiBackend();
  } else window.mostraToast(res.error, "error");
};

window.confermaAuth2Accoglienza = async (id) => {
  if (!confirm("Confermi definitivamente questo soggiorno?")) return;
  const res = await callApi("autorizza2Accoglienza", { id, approvatoreEmail: appState.user.email });
  if (res.success) { window.mostraToast("Soggiorno confermato!", "success"); await caricaDatiBackend(); }
};

window.rifiutaAccoglienza = async (id) => {
  if (!confirm("Sei sicuro di voler rifiutare questa richiesta?")) return;
  const res = await callApi("rifiutaAccoglienza", { id, approvatoreEmail: appState.user.email });
  if (res.success) { window.mostraToast("Richiesta rifiutata", "info"); await caricaDatiBackend(); }
};

window.chiudiModalNuovaAccoglienza = () => document.getElementById("modal-nuova-accoglienza").style.display = "none";
window.chiudiModalAutorizza1Accoglienza = () => document.getElementById("modal-autorizza1-accoglienza").style.display = "none";

/**
 * ============================================================================
 * PARTE 4: SPAZI COMUNI, MANUTENZIONE, PANNELLO MASTER E AVVIO
 * ============================================================================
 */

// --- SPAZI COMUNI (Richiesta soggetta ad autorizzazione) ---
window.renderSpaziView = function() {
  const container = document.getElementById("spazi-container");
  if (!container) return;
  
  if (!appState.selectedSpazioData) appState.selectedSpazioData = formatYMD(new Date());

  container.innerHTML = `
    <div class="card">
      <h2 class="card-title">Richiesta Spazi Comuni</h2>
      <p class="text-xs text-muted">Seleziona la risorsa e l'orario. La prenotazione è soggetta ad autorizzazione del Master.</p>
      
      <div class="spazi-resource-selector" style="margin-top:14px;">
        <button class="spazi-resource-btn ${appState.selectedSpazioRisorsa === 'Chiesa' ? 'active' : ''}" onclick="selezionaRisorsaSpazio('Chiesa')">
          <span class="spazi-res-icon">⛪</span>
          <span class="spazi-res-title">Chiesa / Cappella</span>
        </button>
        <button class="spazi-resource-btn ${appState.selectedSpazioRisorsa === 'Sala TV' ? 'active' : ''}" onclick="selezionaRisorsaSpazio('Sala TV')">
          <span class="spazi-res-icon">📺</span>
          <span class="spazi-res-title">Sala TV</span>
        </button>
      </div>

      <div style="margin-top:14px; background:var(--surface-alt); padding:10px; border-radius:8px;">
        <label style="font-size:13px; font-weight:700; display:block; margin-bottom:4px;">Data della Richiesta:</label>
        <input type="date" class="input-text" id="spazi-date-input" value="${appState.selectedSpazioData}" onchange="cambiaDataSpazi(this.value)">
      </div>

      <div id="spazi-slots-container" style="margin-top:16px;"></div>
    </div>
  `;
  window.renderSlotSpazi();
};

window.selezionaRisorsaSpazio = (res) => { appState.selectedSpazioRisorsa = res; window.renderSpaziView(); };
window.cambiaDataSpazi = (val) => { appState.selectedSpazioData = val; window.renderSlotSpazi(); };

window.renderSlotSpazi = () => {
  const container = document.getElementById("spazi-slots-container");
  if(!container) return;
  
  const dateStr = appState.selectedSpazioData;
  const res = appState.selectedSpazioRisorsa;
  const myEmail = appState.user ? appState.user.email.toLowerCase() : "";
  
  let html = `<h3 class="card-title-sm" style="margin-bottom:10px;">Slot disponibili per il ${window.formattaDataItaliana(dateStr)}</h3>`;
  html += `<div class="slots-grid-v2">`;
  
  // Generazione slot dalle 07:00 alle 23:00
  for(let h = 7; h <= 22; h++) {
    for(let m of ["00", "30"]) {
      const slotLabel = `${String(h).padStart(2,'0')}:${m} - ${m==='00'?String(h).padStart(2,'0')+':30':String(h+1).padStart(2,'0')+':00'}`;
      const booking = appState.prenotazioniSpazi.find(p => p.risorsa === res && String(p.data).startsWith(dateStr) && p.slot_orario === slotLabel);
      
      if(booking) {
         const isMine = booking.email === myEmail;
         html += `
          <div class="slot-card-v2 ${isMine ? 'slot-mine' : 'slot-occupied'}">
            <span class="slot-time-text">${slotLabel}</span>
            <span class="slot-status-pill">${isMine ? 'La tua richiesta' : 'Occupato / In Valutazione'}</span>
            ${isMine ? `<button class="slot-cancel-btn" onclick="cancellaPrenotazioneSpazio('${booking.id}')">Annulla</button>` : ''}
          </div>`;
      } else {
         html += `
          <div class="slot-card-v2 slot-available" onclick="apriModalPrenotaSpazio('${slotLabel}')">
            <span class="slot-time-text">${slotLabel}</span>
            <span class="slot-status-pill">Libero - Richiedi</span>
          </div>`;
      }
    }
  }
  html += `</div>`;
  container.innerHTML = html;
};

let slotInPrenotazione = "";
window.apriModalPrenotaSpazio = (slot) => {
  if (!appState.user) return window.mostraModalAuth(true);
  slotInPrenotazione = slot;
  document.getElementById("modal-spazio-dettaglio-risorsa").innerText = appState.selectedSpazioRisorsa;
  document.getElementById("modal-spazio-dettaglio-data").innerText = window.formattaDataItaliana(appState.selectedSpazioData);
  document.getElementById("modal-spazio-dettaglio-slot").innerText = slot;
  document.getElementById("modal-prenota-spazio").style.display = "flex";
};

window.chiudiModalPrenotaSpazio = () => { document.getElementById("modal-prenota-spazio").style.display = "none"; };

window.eseguiPrenotazioneSpazioConfermata = async () => {
  if (!appState.user) return;
  const btn = document.getElementById("btn-conferma-spazio-azione");
  btn.disabled = true; btn.innerText = "Invio richiesta...";
  
  const payload = {
    risorsa: appState.selectedSpazioRisorsa,
    data: appState.selectedSpazioData,
    slot_orario: slotInPrenotazione,
    email: appState.user.email,
    isMaster: haPermessiMaster()
  };
  
  const res = await callApi("prenotaSpazio", payload);
  if (res.success) {
    window.mostraToast("Richiesta inviata con successo!", "success");
    window.chiudiModalPrenotaSpazio();
    await caricaDatiBackend();
  } else {
    window.mostraToast(res.error, "error");
  }
  btn.disabled = false; btn.innerText = "Invia Richiesta di Prenotazione";
};

window.cancellaPrenotazioneSpazio = async (id) => {
  if (!confirm("Vuoi annullare questa richiesta di prenotazione?")) return;
  const res = await callApi("cancellaPrenotazioneSpazio", { id, email: appState.user.email });
  if (res.success) {
    window.mostraToast("Richiesta annullata", "info");
    await caricaDatiBackend();
  }
};

// --- MANUTENZIONE ---
document.getElementById("form-segnala-guasto")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!appState.user) return window.mostraModalAuth(true);
  
  const btn = document.getElementById("btn-submit-guasto");
  btn.disabled = true; btn.innerText = "Invio in corso...";
  
  const payload = {
    email: appState.user.email,
    categoria: document.getElementById("manutenzione-categoria").value,
    luogo: document.getElementById("manutenzione-luogo").value,
    descrizione: document.getElementById("manutenzione-descrizione").value,
    priorita: "Media",
    fotoBase64: appState.compressedImageBase64 || ""
  };
  
  const res = await callApi("caricaGuasto", payload);
  if (res.success) {
    window.mostraToast("Segnalazione inviata con successo!", "success");
    document.getElementById("form-segnala-guasto").reset();
    document.getElementById("manutenzione-foto-preview-box").style.display = "none";
    appState.compressedImageBase64 = null;
    await caricaDatiBackend();
  } else {
    window.mostraToast(res.error, "error");
  }
  btn.disabled = false; btn.innerText = "Invia Segnalazione";
});

// Resizer Immagini (Canvas)
document.getElementById("manutenzione-foto-input")?.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 800; const MAX_HEIGHT = 800;
      let width = img.width; let height = img.height;
      if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
      else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      appState.compressedImageBase64 = dataUrl;
      const preview = document.getElementById("manutenzione-foto-preview");
      const box = document.getElementById("manutenzione-foto-preview-box");
      if (preview && box) {
        preview.src = dataUrl;
        box.style.display = "block";
      }
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// --- PANNELLO MASTER ---
window.renderMasterSection = function() {
  const container = document.getElementById("master-dynamic-content");
  if (!container) return;
  
  container.innerHTML = `
    <div class="card" style="background: linear-gradient(135deg, #b45309 0%, #78350f 100%); color: #fff;">
      <h2 class="card-title" style="color:#fff;">Pannello Master</h2>
      <p class="text-xs" style="color:#fde68a;">Amministrazione Residenti, Mensa, Spazi e Accoglienza.</p>
    </div>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-val">${appState.tuttiUtenti.length}</span>
        <span class="metric-lbl">Residenti Registrati</span>
      </div>
      <div class="metric-card">
        <span class="metric-val">${appState.guasti.filter(g=>g.stato!=='Risolto').length}</span>
        <span class="metric-lbl">Guasti Aperti</span>
      </div>
    </div>
    
    <div class="card">
      <h3 class="card-title-sm">Richieste di Registrazione</h3>
      ${appState.utentiInAttesa.length === 0 ? '<p class="text-xs text-muted">Nessun utente in attesa di approvazione.</p>' : appState.utentiInAttesa.map(u => `
        <div class="card-inner" style="border-left:4px solid #f59e0b;">
          <div class="flex-between">
            <strong>${escapeHtml(u.nome)}</strong>
            <span class="badge" style="background:#fef3c7; color:#92400e;">In Attesa</span>
          </div>
          <div class="text-xs text-muted" style="margin-bottom:8px;">${escapeHtml(u.email)}</div>
          <button class="btn btn-sm btn-success btn-block" onclick="approvaUtenteMaster('${u.email}')">Approva e Abilita alla Mensa</button>
        </div>
      `).join('')}
    </div>
    
    <div class="card">
      <h3 class="card-title-sm">Configurazione di Base</h3>
      <button class="btn btn-outline btn-sm btn-block" onclick="apriModalMessaggioSupermaster()">Modifica Avviso della Direzione</button>
      <button class="btn btn-outline btn-sm btn-block" style="margin-top:8px;" onclick="apriModalTestiResidenza()">Modifica Regolamento / Contatti</button>
    </div>
  `;
};

window.approvaUtenteMaster = async (email) => {
  const btn = event.target;
  btn.disabled = true; btn.innerText = "Approvazione...";
  // Di default impostiamo l'utente come abilitato a Mensa e Spazi
  const res = await callApi("approvaUtente", { emailTarget: email, is_utente_mensa: true, perm_spazi: true });
  if (res.success) {
    window.mostraToast("Utente approvato con successo", "success");
    await caricaDatiMaster();
  } else {
    window.mostraToast(res.error, "error");
    btn.disabled = false; btn.innerText = "Riprova";
  }
};

// ============================================================================
// STARTUP VISTA INIZIALE
// ============================================================================
if (appState.currentTab === 'info') {
  if(typeof window.renderBachecaView === 'function') window.renderBachecaView();
}
/**
 * ============================================================================
 * APPENDICE: MODALI CONFIGURAZIONE MASTER E IMPORT CSV
 * ============================================================================
 */

window.apriModalMessaggioSupermaster = function() {
  const currentMsg = appState.cachedConfig.Messaggio_Supermaster || "";
  let modal = document.getElementById("modal-messaggio-supermaster");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-messaggio-supermaster";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 540px;">
        <div class="modal-header">
          <h3 class="modal-title" style="margin: 0;">Comunicazione della Direzione</h3>
          <p class="modal-subtitle">Aggiorna l'avviso ufficiale visibile a tutti i residenti.</p>
        </div>
        <form onsubmit="salvaMessaggioSupermaster(event)">
          <div class="form-group" style="margin-bottom: 16px;">
            <textarea id="textarea-messaggio-supermaster" class="input-textarea" rows="5" required></textarea>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="chiudiModalMessaggioSupermaster()">Annulla</button>
            <button type="submit" class="btn btn-primary">Salva & Pubblica</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById("textarea-messaggio-supermaster").value = currentMsg;
  modal.style.display = "flex";
};

window.chiudiModalMessaggioSupermaster = () => {
  const m = document.getElementById("modal-messaggio-supermaster");
  if(m) m.style.display = "none";
};

window.salvaMessaggioSupermaster = async (e) => {
  e.preventDefault();
  const testo = document.getElementById("textarea-messaggio-supermaster").value.trim();
  const res = await callApi("aggiornaConfig", { Messaggio_Supermaster: testo });
  if (res.success) {
    appState.cachedConfig.Messaggio_Supermaster = testo;
    window.mostraToast("Comunicazione aggiornata!", "success");
    window.chiudiModalMessaggioSupermaster();
    if(typeof window.renderResidenzaView === 'function') window.renderResidenzaView();
  } else {
    window.mostraToast(res.error, "error");
  }
};

window.apriModalTestiResidenza = function() {
  const regText = appState.cachedConfig.Info_Regolamento || "";
  const contText = appState.cachedConfig.Info_Contatti || "";
  let modal = document.getElementById("modal-testi-residenza");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-testi-residenza";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 600px;">
        <div class="modal-header" style="margin-bottom: 14px;">
          <h3 class="modal-title" style="margin: 0;">Testi della Residenza</h3>
        </div>
        <form onsubmit="salvaTestiResidenza(event)">
          <div class="form-group">
            <label>Regolamento Interno:</label>
            <textarea id="textarea-regolamento-edit" class="input-textarea" rows="6" required></textarea>
          </div>
          <div class="form-group">
            <label>Contatti & Recapiti:</label>
            <textarea id="textarea-contatti-edit" class="input-textarea" rows="4" required></textarea>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="chiudiModalTestiResidenza()">Annulla</button>
            <button type="submit" class="btn btn-primary">Salva nel Foglio</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById("textarea-regolamento-edit").value = regText;
  document.getElementById("textarea-contatti-edit").value = contText;
  modal.style.display = "flex";
};

window.chiudiModalTestiResidenza = () => {
  const m = document.getElementById("modal-testi-residenza");
  if(m) m.style.display = "none";
};

window.salvaTestiResidenza = async (e) => {
  e.preventDefault();
  const reg = document.getElementById("textarea-regolamento-edit").value;
  const cont = document.getElementById("textarea-contatti-edit").value;
  const res = await callApi("aggiornaConfig", { Info_Regolamento: reg, Info_Contatti: cont });
  if (res.success) {
    appState.cachedConfig.Info_Regolamento = reg;
    appState.cachedConfig.Info_Contatti = cont;
    window.mostraToast("Testi salvati!", "success");
    window.chiudiModalTestiResidenza();
    if(typeof window.renderResidenzaView === 'function') window.renderResidenzaView();
  }
};

window.apriModalImportaCalendarioCSV = () => {
  const m = document.getElementById("modal-importa-calendario-csv");
  if(m) m.style.display = "flex";
};
window.chiudiModalImportaCalendarioCSV = () => {
  const m = document.getElementById("modal-importa-calendario-csv");
  if(m) m.style.display = "none";
};
window.toggleTextareaCSV = () => {
  const box = document.getElementById("container-textarea-csv");
  if(box) box.style.display = box.style.display === "none" ? "block" : "none";
};
window.scaricaModelloCalendarioCSV = () => {
  const csvContent = "data:text/csv;charset=utf-8,ID;Data;Tipo;Titolo;Descrizione;Autore;Priorita\nB_1;2026-10-04;evento;San Francesco;Messa solenne;Direzione;alta";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "modello_calendario.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
};
/**
 * ============================================================================
 * APPENDICE FINALE: IMPORTAZIONE CSV E GUIDA DELL'APP
 * ============================================================================
 */

// --- LOGICA IMPORTAZIONE CALENDARIO CSV ---
let eventiCSVParsed = [];

window.handleFileCSVSelezionato = (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => processaTestoCSV(ev.target.result);
  reader.readAsText(file);
};

window.handleTextareaCSVInput = (e) => processaTestoCSV(e.target.value);

function processaTestoCSV(testo) {
  if(!testo) return;
  const righe = testo.split("\n").map(r => r.trim()).filter(r => r.length > 0);
  eventiCSVParsed = [];
  let tbody = "";
  
  // Assumiamo che la riga 0 sia l'intestazione (ID;Data;Tipo;Titolo;Descrizione;Autore;Priorita)
  for(let i = 1; i < righe.length; i++) {
    const col = righe[i].split(";");
    if(col.length >= 4) {
      eventiCSVParsed.push({
        id: col[0] || "", 
        data: col[1], 
        tipo: col[2] || "evento", 
        titolo: col[3],
        descrizione: col[4] || "", 
        autore: col[5] || "Direzione", 
        priorita: col[6] || "normale"
      });
      tbody += `<tr>
        <td style="padding: 6px 8px;">${col[1]}</td>
        <td style="padding: 6px 8px;">${col[2]}</td>
        <td style="padding: 6px 8px;">${col[3]}</td>
        <td style="padding: 6px 8px;">${col[6]||''}</td>
      </tr>`;
    }
  }
  
  const containerPreview = document.getElementById("preview-csv-container");
  if (containerPreview) {
    document.getElementById("preview-csv-tbody").innerHTML = tbody;
    document.getElementById("preview-csv-count").innerText = `Trovati ${eventiCSVParsed.length} eventi`;
    containerPreview.style.display = "block";
  }
  
  const btn = document.getElementById("btn-conferma-import-csv");
  if (btn) {
    btn.disabled = eventiCSVParsed.length === 0;
    btn.innerText = `Importa ${eventiCSVParsed.length} Eventi nel Calendario`;
  }
}

window.eseguiImportazioneEventiCalendario = async () => {
  if(eventiCSVParsed.length === 0) return;
  const btn = document.getElementById("btn-conferma-import-csv");
  btn.disabled = true; btn.innerText = "Importazione in corso...";
  
  const res = await callApi("importaEventiCalendario", { eventi: eventiCSVParsed });
  if(res.success) {
    window.mostraToast(res.message, "success");
    window.chiudiModalImportaCalendarioCSV();
    await caricaDatiBackend();
  } else {
    window.mostraToast(res.error, "error");
    btn.disabled = false;
  }
};

// --- LOGICA GUIDA E ISTRUZIONI ---
window.apriModalGuida = () => { 
  const modal = document.getElementById("modal-guida-app");
  if(modal) modal.style.display = "flex"; 
};

window.chiudiModalGuida = () => { 
  const modal = document.getElementById("modal-guida-app");
  if(modal) modal.style.display = "none"; 
};

window.filtraModalGuida = (categoria) => {
  // Mostra/Nascondi le sezioni in base al tag cliccato
  document.querySelectorAll(".guida-section").forEach(el => {
    if (categoria === 'tutti' || el.id === 'guida-sec-' + categoria) {
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  });
  
  // Aggiorna lo stile dei bottoni "Pill"
  document.querySelectorAll("#guida-chips-container .badge").forEach(el => el.classList.remove("active"));
  const activeChip = document.getElementById("chip-guida-" + categoria);
  if(activeChip) activeChip.classList.add("active");
};

/**
 * ============================================================================
 * APPENDICE 2: FUNZIONI MANCANTI (MASTER APPUNTAMENTI, PASSWORD, TEMA, GAS)
 * ============================================================================
 */

// --- 1. GESTIONE APPUNTAMENTI MASTER (Calendario & Spazi) ---
window.apriModalMasterAppuntamento = (risorsaDaSelezionare, dataPreimpostata) => {
  document.getElementById("form-master-nuovo-appuntamento")?.reset();
  const ambienteSelect = document.getElementById("master-app-ambiente");
  if (ambienteSelect && risorsaDaSelezionare) ambienteSelect.value = risorsaDaSelezionare;
  
  const dataInput = document.getElementById("master-app-data");
  if (dataInput) dataInput.value = dataPreimpostata || formatYMD(new Date());
  
  window.onMasterAppAmbienteChange();
  document.getElementById("modal-master-nuovo-appuntamento").style.display = "flex";
};

window.chiudiModalMasterAppuntamento = () => {
  document.getElementById("modal-master-nuovo-appuntamento").style.display = "none";
};

window.impostaTitoloPredefinito = (titolo) => {
  const input = document.getElementById("master-app-titolo");
  if (input) input.value = titolo;
};

window.onMasterAppAmbienteChange = () => {
  const ambiente = document.getElementById("master-app-ambiente").value;
  const slotGroup = document.getElementById("master-app-slot-group");
  const orarioSelect = document.getElementById("master-app-orario");
  
  if (ambiente === "Bacheca") {
    slotGroup.style.display = "none";
  } else {
    slotGroup.style.display = "block";
    if (orarioSelect) {
      orarioSelect.innerHTML = "";
      for (let h = 7; h <= 22; h++) {
        for (let m of ["00", "30"]) {
          let slot = `${String(h).padStart(2,'0')}:${m} - ${m==='00'?String(h).padStart(2,'0')+':30':String(h+1).padStart(2,'0')+':00'}`;
          orarioSelect.innerHTML += `<option value="${slot}">${slot}</option>`;
        }
      }
    }
  }
};

window.salvaMasterAppuntamento = async (e) => {
  e.preventDefault();
  const btn = document.getElementById("btn-submit-master-app");
  btn.disabled = true; btn.innerText = "Salvataggio...";
  
  const ambiente = document.getElementById("master-app-ambiente").value;
  const titolo = document.getElementById("master-app-titolo").value;
  const dataStr = document.getElementById("master-app-data").value;
  const orario = document.getElementById("master-app-orario")?.value || "";
  const descrizione = document.getElementById("master-app-descrizione").value;
  const bloccaSlot = document.getElementById("master-app-blocca-slot")?.checked;
  const pubblicaBacheca = document.getElementById("master-app-pubblica-bacheca")?.checked;

  let successCount = 0;

  // Seleziona spazio fisico e lo blocca autorizzandolo automaticamente (Master)
  if (ambiente !== "Bacheca" && bloccaSlot) {
    const resSpazio = await callApi("prenotaSpazio", {
      risorsa: ambiente, data: dataStr, slot_orario: orario, email: appState.user.email, isMaster: true
    });
    if(resSpazio.success) successCount++;
  }

  // Pubblica in Bacheca Pubblica
  if (pubblicaBacheca || ambiente === "Bacheca") {
    const resBacheca = await callApi("salvaAvvisoBacheca", {
      tipo: "evento", data: dataStr, titolo: titolo + (ambiente !== "Bacheca" ? ` (${orario})` : ""),
      descrizione: descrizione + (ambiente !== "Bacheca" ? `\nLuogo: ${ambiente}` : ""),
      autore: appState.user.nome, priorita: "alta"
    });
    if(resBacheca.success) successCount++;
  }

  if (successCount > 0) {
    window.mostraToast("Appuntamento programmato!", "success");
    window.chiudiModalMasterAppuntamento();
    await caricaDatiBackend();
  } else {
    window.mostraToast("Errore durante il salvataggio", "error");
  }
  btn.disabled = false; btn.innerText = "Salva e Programma Appuntamento";
};

// --- 2. GESTIONE IMPOSTAZIONI: TEMA E PASSWORD ---
window.impostaTema = (tema) => {
  document.documentElement.setAttribute("data-theme", tema);
  localStorage.setItem("newman_theme", tema);
  document.querySelectorAll(".theme-choice-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("btn-theme-" + tema)?.classList.add("active");
};

window.toggleBoxCambioPassword = (mostra) => {
  const box = document.getElementById("box-cambio-password");
  if(box) box.style.display = mostra === false ? "none" : (box.style.display === "none" ? "block" : "none");
};

window.toggleVisibilitaPassword = (inputId, btn) => {
  const input = document.getElementById(inputId);
  if (input) {
    if (input.type === "password") {
      input.type = "text";
      btn.innerText = "Nascondi";
    } else {
      input.type = "password";
      btn.innerText = "👁️ Mostra";
    }
  }
};

window.handleCambiaPasswordUtente = async (e) => {
  e.preventDefault();
  const btn = document.getElementById("btn-salva-nuova-pass");
  const passAttuale = document.getElementById("input-pass-attuale").value;
  const passNuova = document.getElementById("input-pass-nuova").value;
  const passConferma = document.getElementById("input-pass-conferma").value;

  if(passNuova !== passConferma) return window.mostraToast("Le password non coincidono", "error");
  
  btn.disabled = true; btn.innerText = "Salvataggio...";
  const res = await callApi("cambiaPassword", { email: appState.user.email, passwordAttuale: passAttuale, nuovaPassword: passNuova });
  
  if(res.success) {
    window.mostraToast(res.message, "success");
    window.toggleBoxCambioPassword(false);
    document.getElementById("form-cambia-password").reset();
  } else {
    window.mostraToast(res.error, "error");
  }
  btn.disabled = false; btn.innerText = "Salva Nuova Password";
};

// --- 3. GESTIONE MODALI DI SUPPORTO ---
window.apriModalCodiceGas = () => {
  const modal = document.getElementById("modal-codice-gas");
  if(modal) modal.style.display = "flex";
};

window.chiudiModalCodiceGas = () => {
  const modal = document.getElementById("modal-codice-gas");
  if(modal) modal.style.display = "none";
};

window.copiaCodiceGasNegliAppunti = () => {
  const txt = document.getElementById("gas-source-code-textarea");
  if(txt) {
    navigator.clipboard.writeText(txt.value).then(() => {
      window.mostraToast("Codice copiato!", "success");
    });
  }
};

window.chiudiModalElencoPastiCucina = () => {
  const modal = document.getElementById("modal-elenco-pasti-cucina");
  if(modal) modal.style.display = "none";
};
/**
 * ============================================================================
 * APPENDICE 3: VISTA CUOCA, ELENCO PASTI E VARIAZIONI MENU
 * ============================================================================
 */

// --- Override del Router per supportare la Vista Cuoca ---
window.switchTab = (tabId) => {
  document.querySelectorAll(".view-container").forEach(el => el.classList.remove("active-view"));
  document.querySelectorAll(".bottom-nav-item").forEach(el => el.classList.remove("active"));
  
  const view = document.getElementById("view-" + tabId);
  const tab = document.getElementById("nav-tab-" + tabId);
  if (view) view.classList.add("active-view");
  if (tab) tab.classList.add("active");
  
  appState.currentTab = tabId;
  window.scrollTo(0, 0);

  if (tabId === "info" && typeof window.renderBachecaView === 'function') window.renderBachecaView();
  if (tabId === "mensa" && typeof window.renderMensaView === 'function') window.renderMensaView();
  if (tabId === "accoglienza" && typeof window.renderAccoglienzaView === 'function') window.renderAccoglienzaView();
  if (tabId === "spazi" && typeof window.renderSpaziView === 'function') window.renderSpaziView();
  if (tabId === "master" && haPermessiMaster() && typeof window.renderMasterSection === 'function') window.renderMasterSection();
  if (tabId === "cucina" && typeof window.renderCucinaView === 'function') window.renderCucinaView();
};

// --- Logica Vista Cuoca ---
window.renderCucinaView = function() {
  const container = document.getElementById("cucina-container");
  if (!container) return;

  const d = appState.selectedDateMensa || new Date();
  const dStr = formatYMD(d);
  
  const utentiMensa = (appState.tuttiUtenti || []).filter(u => u.is_utente_mensa !== false);
  let totPranzo = 0; let totCena = 0; let totBusta = 0;

  utentiMensa.forEach(u => {
    const email = u.email.toLowerCase();
    const prenP = appState.mensaBookings.find(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === "pranzo" && m.email === email);
    const prenC = appState.mensaBookings.find(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === "cena" && m.email === email);
    
    if (!prenP || prenP.stato_presenza !== "Assente") {
        totPranzo += 1 + (prenP ? parseInt(prenP.ospiti||0) : 0);
        if (prenP && prenP.busta) totBusta++;
    }
    if (!prenC || prenC.stato_presenza !== "Assente") {
        totCena += 1 + (prenC ? parseInt(prenC.ospiti||0) : 0);
    }
  });

  // Giorni Busta obbligatoria
  const isBustaDay = (getNomeGiorno(d) === "martedi" || getNomeGiorno(d) === "giovedi");
  if (isBustaDay) totBusta = totPranzo;

  container.innerHTML = `
    <div class="cucina-banner">
      <div class="flex-between">
        <h2 style="margin:0; font-size:18px;">👨‍🍳 Riepilogo Cucina</h2>
        <button class="btn btn-outline btn-sm" style="color:#fff; border-color:#fff;" onclick="window.switchTab('mensa')">Torna a Mensa</button>
      </div>
      <div style="margin-top:10px; font-weight:700; font-size:16px;">${window.formattaDataItaliana(d)}</div>
    </div>
    
    <div class="cucina-stat-grid">
      <div class="cucina-stat-box">
        <span class="cucina-stat-num" style="color:#ea580c;">${totPranzo}</span>
        <span class="cucina-stat-label">Tot. Pranzo</span>
      </div>
      <div class="cucina-stat-box">
        <span class="cucina-stat-num" style="color:#4f46e5;">${totCena}</span>
        <span class="cucina-stat-label">Tot. Cena</span>
      </div>
      <div class="cucina-stat-box">
        <span class="cucina-stat-num" style="color:#16a34a;">${totBusta}</span>
        <span class="cucina-stat-label">Di cui Buste</span>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title-sm">Azioni Cuoca</h3>
      <button class="btn btn-primary btn-block" onclick="window.apriModalElencoPastiCucina('pranzo')">📋 Vedi Elenco Nominativi Pranzo</button>
      <button class="btn btn-primary btn-block" style="margin-top:8px; background:#4f46e5; border-color:#4f46e5;" onclick="window.apriModalElencoPastiCucina('cena')">📋 Vedi Elenco Nominativi Cena</button>
      <button class="btn btn-outline btn-block" style="margin-top:16px;" onclick="window.apriModalVariazioneCuoca('${dStr}', 'entrambi')">✏️ Aggiungi Variazione Menu</button>
    </div>
  `;
};

// --- Logica Modale Elenco Pasti ---
window.apriModalElencoPastiCucina = (pasto) => {
  if (!appState.cucinaModalState) appState.cucinaModalState = {};
  appState.cucinaModalState.pasto = pasto;
  appState.cucinaModalState.dataYMD = formatYMD(appState.selectedDateMensa || new Date());
  window.applicaFiltriModalCucina();
  const modal = document.getElementById("modal-elenco-pasti-cucina");
  if(modal) modal.style.display = "flex";
};

window.applicaFiltriModalCucina = () => {
  const pasto = appState.cucinaModalState.pasto;
  const dStr = appState.cucinaModalState.dataYMD;
  const search = document.getElementById("modal-cucina-search")?.value.toLowerCase() || "";
  
  const container = document.getElementById("modal-cucina-elenco-container");
  if (!container) return;

  const utentiMensa = (appState.tuttiUtenti || []).filter(u => u.is_utente_mensa !== false);
  let presenti = [];

  utentiMensa.forEach(u => {
    const email = u.email.toLowerCase();
    const pren = appState.mensaBookings.find(m => String(m.data).split("T")[0] === dStr && m.tipo_pasto === pasto && m.email === email);
    if (!pren || pren.stato_presenza !== "Assente") {
      if (u.nome.toLowerCase().includes(search) || email.includes(search)) {
        presenti.push({
          nome: u.nome,
          ospiti: pren ? parseInt(pren.ospiti||0) : 0,
          busta: pren ? pren.busta : false,
          ritardo: pren ? pren.ritardo : false,
          note: pren ? pren.note : ""
        });
      }
    }
  });

  presenti.sort((a,b) => a.nome.localeCompare(b.nome));
  const isBustaDay = (pasto === "pranzo" && (getNomeGiorno(new Date(dStr)) === "martedi" || getNomeGiorno(new Date(dStr)) === "giovedi"));

  if (presenti.length === 0) {
    container.innerHTML = `<div class="empty-state-text">Nessun presente trovato.</div>`;
    return;
  }

  let html = `<table class="master-table">
    <thead><tr><th>Nome</th><th>Ospiti</th><th>Info</th></tr></thead>
    <tbody>`;
  
  presenti.forEach(p => {
    let info = [];
    if (p.busta || isBustaDay) info.push("🎒 Busta");
    if (p.ritardo) info.push("🕒 Ritardo");
    if (p.note) info.push(`📝 ${escapeHtml(p.note)}`);
    
    html += `<tr>
      <td style="font-weight:600;">${escapeHtml(p.nome)}</td>
      <td>${p.ospiti > 0 ? `+${p.ospiti}` : '-'}</td>
      <td style="font-size:11px; color:#c2410c;">${info.join(" | ")}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
  
  const tit = document.getElementById("modal-cucina-titolo");
  const sub = document.getElementById("modal-cucina-sottotitolo");
  if(tit) tit.innerText = `Prenotati ${pasto === 'pranzo' ? 'Pranzo' : 'Cena'}`;
  if(sub) sub.innerText = window.formattaDataItaliana(dStr) + ` - Totale: ${presenti.reduce((acc, p) => acc + 1 + p.ospiti, 0)}`;
};

window.copiaTestoElencoCucinaModal = () => { window.mostraToast("Funzione di copia in arrivo", "info"); };
window.stampaElencoCucinaModal = () => { window.print(); };

// --- Variazioni Cuoca ---
window.apriModalVariazioneCuoca = (dataStr, pasto) => {
  const dataInput = document.getElementById("cuoca-modal-data");
  const pastoInput = document.getElementById("cuoca-modal-pasto");
  const testoInput = document.getElementById("cuoca-modal-testo");
  
  if(dataInput) dataInput.value = dataStr || formatYMD(new Date());
  if(pastoInput) pastoInput.value = pasto || "entrambi";
  if(testoInput) testoInput.value = appState.cachedConfig.Testo_Variazione || "";
  
  const modal = document.getElementById("modal-variazione-cuoca");
  if(modal) modal.style.display = "flex";
};

window.chiudiModalVariazioneCuoca = () => {
  const modal = document.getElementById("modal-variazione-cuoca");
  if(modal) modal.style.display = "none";
};

window.handleSalvaVariazioneCuocaModal = async (e) => {
  e.preventDefault();
  const dataStr = document.getElementById("cuoca-modal-data").value;
  const pasto = document.getElementById("cuoca-modal-pasto").value;
  const testo = document.getElementById("cuoca-modal-testo").value;

  const res = await callApi("aggiornaConfig", { Data_Variazione_Menu: dataStr, Pasto_Variazione: pasto, Testo_Variazione: testo });
  if (res.success) {
    window.mostraToast("Variazione salvata!", "success");
    window.chiudiModalVariazioneCuoca();
    await caricaDatiBackend();
  }
};

window.handleCancellaVariazioneCuocaModal = async () => {
  const res = await callApi("aggiornaConfig", { Data_Variazione_Menu: "", Pasto_Variazione: "", Testo_Variazione: "" });
  if (res.success) {
    window.mostraToast("Variazione rimossa", "info");
    window.chiudiModalVariazioneCuoca();
    await caricaDatiBackend();
  }
};
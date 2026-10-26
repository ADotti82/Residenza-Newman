/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - MODAL CONTROLLER
 * ============================================================================
 */

export let modalOpenedTimestamp = 0;

export function gestisciClickBackdrop(event, chiudiFn) {
  if (!event) return;
  // Solo ed esclusivamente se il click/tap è avvenuto direttamente sul backdrop oscurato esterno
  if (event.target !== event.currentTarget) return;
  if (!event.target.classList || !event.target.classList.contains("modal-overlay")) return;

  // Protezione aumentata a 450ms: evita che il tap mobile che ha aperto la modale rimbalzi e chiuda all'istante la finestra
  const elapsed = Date.now() - (modalOpenedTimestamp || (typeof window !== "undefined" ? window._modalOpenedTimestamp : 0) || 0);
  if (elapsed < 450) {
    return;
  }
  if (typeof chiudiFn === "function") {
    try { chiudiFn(event); } catch(e) { console.error(e); }
  } else {
    const targetModal = (event.target && event.target.classList?.contains("modal-overlay")) ? event.target : event.currentTarget;
    if (targetModal) chiudiModale(targetModal);
  }
}

export function mostraModaleIstantanea(modalOrId) {
  modalOpenedTimestamp = Date.now();
  if (typeof window !== "undefined") window._modalOpenedTimestamp = modalOpenedTimestamp;

  const m = typeof modalOrId === "string" ? document.getElementById(modalOrId) : modalOrId;
  if (!m) return null;

  // Chiudi preventivamente tutte le altre modali aperte per evitare conflitti visivi o sovrapposizioni
  document.querySelectorAll(".modal-overlay").forEach(other => {
    if (other !== m && (other.classList.contains("open") || other.style.display === "flex")) {
      chiudiModale(other);
    }
  });

  // Ripristina e pulisci completamente tutti gli stili inline che bloccano visibilità o interazione
  m.classList.add("open");
  m.style.setProperty("display", "flex", "important");
  m.style.setProperty("z-index", "999999", "important");
  m.style.setProperty("visibility", "visible", "important");
  m.style.setProperty("opacity", "1", "important");
  m.style.setProperty("pointer-events", "auto", "important");
  m.style.removeProperty("transform");
  
  // Assicura che i contenitori interni e le card abbiano sempre puntamento attivo
  const card = m.querySelector(".modal-card");
  if (card) {
    card.style.setProperty("pointer-events", "auto", "important");
  }
  m.scrollTop = 0;
  if (card) card.scrollTop = 0;

  document.body.classList.add("modal-is-open");
  void m.offsetHeight;
  void document.body.offsetHeight;
  return m;
}

export function chiudiModale(modalOrId) {
  let m = null;
  if (!modalOrId) {
    m = document.querySelector(".modal-overlay.open") || document.querySelector(".modal-overlay[style*='flex']");
  } else if (typeof modalOrId === "string") {
    m = document.getElementById(modalOrId);
  } else if (modalOrId instanceof Element) {
    m = modalOrId.closest ? (modalOrId.closest(".modal-overlay") || modalOrId) : modalOrId;
  } else if (modalOrId && modalOrId.target && modalOrId.target instanceof Element) {
    m = modalOrId.target.closest ? (modalOrId.target.closest(".modal-overlay") || modalOrId.target) : null;
  }
  if (m) {
    m.classList.remove("open");
    // Sovrascrive display con !important per annullare tassativamente display: flex !important
    m.style.setProperty("display", "none", "important");
    m.style.setProperty("visibility", "hidden", "important");
    m.style.setProperty("opacity", "0", "important");
    m.style.setProperty("pointer-events", "none", "important");
    m.style.removeProperty("z-index");
    
    // Forza invalidazione e ridisegno immediato nel motore Blink
    void m.offsetHeight;
  }
  
  // Verifica e rimozione stato di blocco scroll del body se non vi sono altre modali aperte
  const aperte = document.querySelectorAll(".modal-overlay.open, .modal-overlay[style*='display: flex']");
  let haModaliAperte = false;
  aperte.forEach(el => {
    if (el !== m && el.style.display !== "none") haModaliAperte = true;
  });
  if (!haModaliAperte) {
    document.body.classList.remove("modal-is-open");
    document.body.style.removeProperty("overflow");
    void document.body.offsetHeight;
  }
  return m;
}

export function chiudiTutteLeModali() {
  document.querySelectorAll(".modal-overlay").forEach(m => {
    chiudiModale(m);
  });
  document.body.classList.remove("modal-is-open");
  document.body.style.removeProperty("overflow");
}

// Helper specifici per tutte le finestre modali
export const chiudiModalSettings = () => chiudiModale("modal-settings");
export const chiudiModalBacheca = () => chiudiModale("modal-bacheca");
export const chiudiModalEliminaBacheca = () => chiudiModale("modal-conferma-elimina-bacheca");
export const chiudiModalImportaCalendarioCSV = () => chiudiModale("modal-importa-calendario-csv");
export const chiudiModalPrenotaSpazio = () => chiudiModale("modal-prenota-spazio");
export const chiudiModalCancellaSpazio = () => chiudiModale("modal-cancella-spazio");
export const chiudiModalCodiceGas = () => chiudiModale("modal-codice-gas");
export const chiudiModalEmailAmministrazione = () => chiudiModale("modal-email-amministrazione");
export const chiudiModalGuida = () => chiudiModale("modal-guida-app");
export const chiudiModalPresentazioneCommittenti = () => chiudiModale("modal-presentazione-committenti");
export const chiudiModalNuovaAccoglienza = () => chiudiModale("modal-nuova-accoglienza");
export const chiudiModalAutorizza1Accoglienza = () => chiudiModale("modal-autorizza1-accoglienza");
export const chiudiModalMessaggioSupermaster = () => chiudiModale("modal-messaggio-supermaster");
export const chiudiModalTestiResidenza = () => chiudiModale("modal-testi-residenza");
export const chiudiModalAuth = () => chiudiModale("modal-auth");
export const chiudiModalVariazioneCuoca = () => chiudiModale("modal-variazione-cuoca");
export const chiudiModalConsultaMenu = () => chiudiModale("modal-consulta-menu");
export const chiudiModalModificaMenu = () => chiudiModale("modal-modifica-menu");
export const chiudiModalGestioneBusteMaster = () => chiudiModale("modal-gestione-buste-master");
export const chiudiModalElencoPastiCucina = () => chiudiModale("modal-elenco-pasti-cucina");
export const chiudiModalMasterAppuntamento = () => chiudiModale("modal-master-nuovo-appuntamento");
export const chiudiModalSegnalaAssenza = () => chiudiModale("modal-segnala-assenza");
export const chiudiModalDettaglioGiornoAssenze = () => chiudiModale("modal-dettaglio-giorno-assenze");

// Registrazione immediata su window di tutti i controller e handler modali
if (typeof window !== "undefined") {
  window.mostraModaleIstantanea = mostraModaleIstantanea;
  window.chiudiModale = chiudiModale;
  window.chiudiTutteLeModali = chiudiTutteLeModali;
  window.gestisciClickBackdrop = gestisciClickBackdrop;

  window.chiudiModalSettings = chiudiModalSettings;
  window.chiudiModalBacheca = chiudiModalBacheca;
  window.chiudiModalEliminaBacheca = chiudiModalEliminaBacheca;
  window.chiudiModalImportaCalendarioCSV = chiudiModalImportaCalendarioCSV;
  window.chiudiModalPrenotaSpazio = chiudiModalPrenotaSpazio;
  window.chiudiModalCancellaSpazio = chiudiModalCancellaSpazio;
  window.chiudiModalCodiceGas = chiudiModalCodiceGas;
  window.chiudiModalEmailAmministrazione = chiudiModalEmailAmministrazione;
  window.chiudiModalGuida = chiudiModalGuida;
  window.chiudiModalPresentazioneCommittenti = chiudiModalPresentazioneCommittenti;
  window.chiudiModalNuovaAccoglienza = chiudiModalNuovaAccoglienza;
  window.chiudiModalAutorizza1Accoglienza = chiudiModalAutorizza1Accoglienza;
  window.chiudiModalMessaggioSupermaster = chiudiModalMessaggioSupermaster;
  window.chiudiModalTestiResidenza = chiudiModalTestiResidenza;
  window.chiudiModalAuth = chiudiModalAuth;
  window.chiudiModalVariazioneCuoca = chiudiModalVariazioneCuoca;
  window.chiudiModalConsultaMenu = chiudiModalConsultaMenu;
  window.chiudiModalModificaMenu = chiudiModalModificaMenu;
  window.chiudiModalGestioneBusteMaster = chiudiModalGestioneBusteMaster;
  window.chiudiModalElencoPastiCucina = chiudiModalElencoPastiCucina;
  window.chiudiModalMasterAppuntamento = chiudiModalMasterAppuntamento;
  window.chiudiModalSegnalaAssenza = chiudiModalSegnalaAssenza;
  window.chiudiModalDettaglioGiornoAssenze = chiudiModalDettaglioGiornoAssenze;

  // Intercettazione delegata universale per qualsiasi pulsante di chiusura (✕, Chiudi, Annulla)
  document.addEventListener("click", function(event) {
    const closeBtn = event.target?.closest?.("button.btn-icon-head, button.btn-secondary, button.btn-outline, .btn-modal-close, [data-modal-close], button[title='Chiudi']");
    if (closeBtn) {
      const txt = (closeBtn.innerText || closeBtn.textContent || "").trim();
      const oc = (closeBtn.getAttribute("onclick") || "").toLowerCase();
      const title = (closeBtn.getAttribute("title") || "").toLowerCase();
      const isClose = txt === "✕" || txt === "Chiudi" || txt === "Annulla" || 
                      txt.includes("Chiudi") || txt.includes("Annulla") || 
                      oc.includes("chiudi") || oc.includes("annulla") || 
                      title === "chiudi" || closeBtn.classList.contains("btn-modal-close");
      
      if (isClose) {
        const modal = closeBtn.closest(".modal-overlay");
        if (modal) {
          chiudiModale(modal);
        }
      }
    }
  }, true);
}

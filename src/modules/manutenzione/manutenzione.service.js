/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - DOMINIO MANUTENZIONE (SERVICE LAYER)
 * ============================================================================
 */

/**
 * Ottimizza e ridimensiona l'immagine prima dell'upload per rispettare i limiti di payload
 */
export function processImageResize(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Il file selezionato non è un'immagine valida."));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
        resolve({
          dataUrl: compressedDataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize: Math.round((compressedDataUrl.length * 3) / 4)
        });
      };
      img.onerror = () => reject(new Error("Errore nel caricamento dell'immagine."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Impossibile leggere il file immagine selezionato."));
    reader.readAsDataURL(file);
  });
}

/**
 * Filtra la lista ticket guasti per stato (Aperta, In Lavorazione, Risolto, tutti)
 */
export function filtraTicketManutenzione(lista = [], statoFiltro = "tutti") {
  if (!Array.isArray(lista)) return [];
  if (!statoFiltro || statoFiltro === "tutti") return lista;

  return lista.filter(g => {
    const stato = String(g.stato || "").toLowerCase();
    if (statoFiltro === "aperti") return stato === "aperta" || stato === "in lavorazione";
    if (statoFiltro === "risolti") return stato === "risolto" || stato === "chiusa";
    return stato === statoFiltro.toLowerCase();
  });
}

/**
 * Calcola le metriche sintetiche per il cruscotto manutenzione
 */
export function calcolaStatisticheManutenzione(lista = []) {
  if (!Array.isArray(lista)) return { totali: 0, aperti: 0, inLavorazione: 0, risolti: 0, prioritaAlta: 0 };

  let aperti = 0;
  let inLavorazione = 0;
  let risolti = 0;
  let prioritaAlta = 0;

  lista.forEach(g => {
    const s = String(g.stato || "").toLowerCase();
    const p = String(g.priorita || "").toLowerCase();

    if (s === "aperta") aperti++;
    else if (s === "in lavorazione") inLavorazione++;
    else if (s === "risolto" || s === "chiusa") risolti++;

    if (p === "alta" && s !== "risolto" && s !== "chiusa") prioritaAlta++;
  });

  return {
    totali: lista.length,
    aperti,
    inLavorazione,
    risolti,
    prioritaAlta
  };
}

if (typeof window !== "undefined") {
  window.processImageResize = processImageResize;
  window.filtraTicketManutenzione = filtraTicketManutenzione;
  window.calcolaStatisticheManutenzione = calcolaStatisticheManutenzione;
}

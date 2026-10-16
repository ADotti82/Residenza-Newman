/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - CORE UTILITIES
 * ============================================================================
 */

export function formatYMD(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function escapeHtml(text) {
  if (!text) return "";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

export function formattaDataConfronto(val) {
  if (!val) return "";
  if (val instanceof Date) return formatYMD(val);
  const s = String(val).trim();
  if (s.includes("T")) {
    if (s.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(s)) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) return formatYMD(d);
    }
    return s.split("T")[0];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return formatYMD(d);
  return s;
}

export function formattaDataItaliana(val) {
  if (!val) return "";
  if (val instanceof Date) {
    const gg = String(val.getDate()).padStart(2, "0");
    const mm = String(val.getMonth() + 1).padStart(2, "0");
    const aaaa = val.getFullYear();
    return `${gg}-${mm}-${aaaa}`;
  }
  const s = String(val).trim();
  if (!s) return "";
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s.replace(/\//g, "-");
  const part = s.includes("T") ? s.split("T")[0] : s.split(" ")[0];
  const m = part.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const gg = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const aaaa = d.getFullYear();
    return `${gg}-${mm}-${aaaa}`;
  }
  return s;
}

export function calcolaNottiSoggiorno(checkinStr, checkoutStr) {
  if (!checkinStr || !checkoutStr) return 1;
  const d1 = new Date(checkinStr + "T00:00:00");
  const d2 = new Date(checkoutStr + "T00:00:00");
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
  const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function getNomeCamera(camNum, config = null) {
  const cfg = config || (typeof window !== "undefined" && window.appState ? window.appState.cachedConfig : null) || {};
  if (camNum === 1 || camNum === "1" || camNum === "Camera 1") return cfg.Nome_Camera_1 || "Camera Newman";
  if (camNum === 2 || camNum === "2" || camNum === "Camera 2") return cfg.Nome_Camera_2 || "Camera San Filippo Neri";
  if (camNum === 3 || camNum === "3" || camNum === "Camera 3") return cfg.Nome_Camera_3 || "Camera Santa Teresa";
  return cfg[`Nome_Camera_${camNum}`] || `Camera ${camNum}`;
}


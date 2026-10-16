/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - TOAST & NOTIFICATIONS
 * ============================================================================
 */

export function mostraToast(messaggio, tipo = "info") {
  if (typeof document === "undefined") return;
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo} animate-slide-up`;
  toast.innerText = messaggio;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-fade-out");
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

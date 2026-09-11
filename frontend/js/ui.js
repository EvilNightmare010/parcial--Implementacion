/**
 * UI.js — helpers visuales reutilizables en todas las páginas.
 */
const UI = {
  toastContainer: null,

  ensureToastContainer() {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement("div");
      this.toastContainer.className = "toast-container";
      document.body.appendChild(this.toastContainer);
    }
  },

  toast(message, type = "success") {
    this.ensureToastContainer();
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.textContent = message;
    this.toastContainer.appendChild(el);
    requestAnimationFrame(() => el.classList.add("toast--visible"));
    setTimeout(() => {
      el.classList.remove("toast--visible");
      setTimeout(() => el.remove(), 250);
    }, 3800);
  },

  success(msg) { this.toast(msg, "success"); },
  error(msg) { this.toast(msg, "error"); },

  setLoading(container, isLoading, message = "Cargando...") {
    if (isLoading) {
      container.innerHTML = `<div class="state state--loading"><div class="spinner"></div><p>${message}</p></div>`;
    }
  },

  setEmpty(container, message, actionHtml = "") {
    container.innerHTML = `<div class="state state--empty"><p>${message}</p>${actionHtml}</div>`;
  },

  setError(container, message) {
    container.innerHTML = `<div class="state state--error"><p>⚠ ${message}</p></div>`;
  },

  /** Muestra un modal de confirmación. Devuelve una Promise<boolean>. */
  confirm(title, message) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.innerHTML = `
        <div class="modal">
          <h3>${title}</h3>
          <p>${message}</p>
          <div class="modal-actions">
            <button class="btn btn--ghost" data-action="cancel">Cancelar</button>
            <button class="btn btn--danger" data-action="confirm">Confirmar</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay || e.target.dataset.action === "cancel") {
          overlay.remove();
          resolve(false);
        }
        if (e.target.dataset.action === "confirm") {
          overlay.remove();
          resolve(true);
        }
      });
    });
  },

  badge(status) {
    const map = {
      ACTIVE: "ok", APPROVED: "ok", FINISHED: "ok", COMPLETED: "ok", OPEN_FOR_REGISTRATION: "ok",
      PENDING: "warn", DRAFT: "warn", IN_PROGRESS: "warn", INJURED: "warn",
      REJECTED: "danger", CANCELLED: "danger", DISQUALIFIED: "danger", SUSPENDED: "danger", RETIRED: "danger", DID_NOT_FINISH: "danger",
    };
    const tone = map[status] || "neutral";
    return `<span class="badge badge--${tone}">${status ?? "—"}</span>`;
  },

  /** Traduce errores del API a algo legible; nunca muestra stack traces. */
  friendlyError(err) {
    if (!err) return "Ocurrió un error inesperado.";
    if (typeof err === "string") return err;
    return err.message || "Ocurrió un error inesperado.";
  },
};

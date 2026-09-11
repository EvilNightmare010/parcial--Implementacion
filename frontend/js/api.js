/**
 * API.js — único lugar del proyecto que habla con el backend.
 * Todas las vistas deben pasar por aquí, nunca hacer fetch() suelto.
 */
const API = {
  base: CONFIG.API_BASE_URL,

  async request(path, options = {}) {
    const token = Auth.getToken();
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (token) headers["Authorization"] = "Bearer " + token;

    let res;
    try {
      res = await fetch(this.base + path, { ...options, headers });
    } catch (networkErr) {
      throw {
        status: 0,
        message: "No se pudo conectar con el servidor. Verifica que el backend (docker compose) esté corriendo.",
      };
    }

    if (res.status === 204) return null;

    let body = null;
    const text = await res.text();
    if (text) {
      try { body = JSON.parse(text); } catch (e) { body = null; }
    }

    if (!res.ok) {
      if (res.status === 401) {
        Auth.logout();
        location.hash = "#/login?expired=1";
      }
      const message =
        (body && (body.message || body.error)) ||
        `Ocurrió un error inesperado (código ${res.status}).`;
      throw { status: res.status, message, body };
    }

    return body;
  },

  get(path) { return this.request(path, { method: "GET" }); },
  post(path, data) { return this.request(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }); },
  put(path, data) { return this.request(path, { method: "PUT", body: JSON.stringify(data) }); },
  patch(path, data) { return this.request(path, { method: "PATCH", body: data !== undefined ? JSON.stringify(data) : undefined }); },
  delete(path) { return this.request(path, { method: "DELETE" }); },
};

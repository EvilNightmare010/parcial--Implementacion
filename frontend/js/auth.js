/**
 * AUTH.js — sesión del usuario.
 *
 * ⚠️ IMPORTANTE: ajusta los nombres de campo (res.token, res.role, res.username)
 * para que coincidan EXACTAMENTE con el JSON que devuelve el endpoint
 * POST /api/auth/login de tu backend.
 */
const ROLES = {
  ADMIN: "ADMINISTRATOR",     // ajusta si tu backend usa otro nombre, ej. "ADMIN"
  ORGANIZER: "RACE_ORGANIZER", // ej. "ORGANIZER"
  VIEWER: "VIEWER",
};

const Auth = {
  getToken() {
    return localStorage.getItem("token");
  },
  setSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
  getUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },
  getRole() {
    const u = this.getUser();
    return u ? u.role : null;
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  async login(username, password) {
    const res = await API.post("/auth/login", { username, password });
    // 👇 AJUSTA estos nombres de campo según la respuesta real del backend
    this.setSession(res.token, {
      username: res.username || username,
      role: res.role,
    });
    return res;
  },
};

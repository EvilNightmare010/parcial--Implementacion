/**
 * AUTH.js — sesión del usuario.
 */
const ROLES = {
  ADMIN: "ADMINISTRATOR",     
  ORGANIZER: "RACE_ORGANIZER", 
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
    
    const token = res.token || res.jwt; 
    let realRole = res.role || res.userRole;

    // 1. Intentar extraer del token JWT si el backend no lo mandó suelto
    if (!realRole && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        realRole = payload.role || payload.roles || payload.authorities;
        if (Array.isArray(realRole)) realRole = realRole[0];
      } catch (e) {
        console.error("No se pudo decodificar el JWT para extraer el rol", e);
      }
    }

    // 2. Normalización de formato
    if (typeof realRole === 'string') {
      if (realRole.startsWith('ROLE_')) realRole = realRole.replace('ROLE_', '');
      realRole = realRole.toUpperCase();
    }

    // 3. Mapeo a los roles oficiales de la aplicación
    if (realRole === "ADMIN" || realRole === "ADMINISTRATOR") {
      realRole = "ADMINISTRATOR";
    } else if (realRole === "ORGANIZER" || realRole === "RACE_ORGANIZER") {
      realRole = "RACE_ORGANIZER";
    } else {
      // 4. Si el backend no envía rol, lo deducimos por el nombre de usuario
      const lowerUser = username.toLowerCase();
      if (lowerUser.includes("admin")) {
        realRole = "ADMINISTRATOR";
      } else if (lowerUser.includes("organizer") || lowerUser.includes("org")) {
        realRole = "RACE_ORGANIZER";
      } else {
        realRole = "VIEWER";
      }
    }

    this.setSession(token, {
      username: res.username || username,
      role: realRole,
    });
    
    return res;
  },
};
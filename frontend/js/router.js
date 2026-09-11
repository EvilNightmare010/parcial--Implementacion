/**
 * ROUTER.js — el corazón de la SPA. Lee location.hash, decide qué <section class="view">
 * mostrar, valida sesión/rol, y llama al init() de la vista correspondiente.
 *
 * Rutas soportadas:
 *   #/login
 *   #/dashboard
 *   #/competitors
 *   #/teams
 *   #/races
 *   #/races/:id      (detalle de una carrera)
 *   #/standings
 *   #/profile
 */

function showView(viewId) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("view--active"));
  document.getElementById(`view-${viewId}`)?.classList.add("view--active");

  const isLogin = viewId === "login";
  document.getElementById("app-shell").style.display = isLogin ? "none" : "block";
}

async function renderRoute() {
  const hash = location.hash.replace(/^#\/?/, ""); // quita "#/" del inicio
  const [rawPath, query] = hash.split("?");
  const parts = rawPath.split("/").filter(Boolean); // ej: ["races", "12"]
  const route = parts[0] || "dashboard";

  // --- Guardas de sesión ---
  if (!Auth.isLoggedIn()) {
    if (route !== "login") {
      location.hash = "#/login";
      return;
    }
    showView("login");
    if (query && query.includes("expired=1")) {
      document.getElementById("sessionExpiredMsg").style.display = "block";
    }
    Login.init();
    return;
  }

  if (route === "login") {
    location.hash = "#/dashboard";
    return;
  }

  // A partir de aquí ya hay sesión: pintamos la barra de navegación
  renderNav(route);

  const role = Auth.getRole();
  const canManage = [ROLES.ADMIN, ROLES.ORGANIZER].includes(role);

  switch (route) {
    case "dashboard":
      showView("dashboard");
      Dashboard.init();
      break;

    case "competitors":
      showView("competitors");
      Competitors.init();
      break;

    case "teams":
      showView("teams");
      Teams.init();
      break;

    case "races":
      if (parts[1]) {
        showView("race-detail");
        RaceDetail.init(parts[1]);
      } else {
        showView("races");
        Races.init();
      }
      break;

    case "standings":
      showView("standings");
      Standings.init();
      break;

    case "profile":
      showView("profile");
      Profile.init();
      break;

    case "403":
      showView("403");
      break;

    default:
      showView("404");
  }
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("DOMContentLoaded", renderRoute);

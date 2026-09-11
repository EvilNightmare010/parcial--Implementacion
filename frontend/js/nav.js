/**
 * NAV.js — renderiza la barra de navegación superior según el rol.
 */
const NAV_LINKS = [
  { href: "#/dashboard", match: "dashboard", label: "Inicio", roles: null },
  { href: "#/competitors", match: "competitors", label: "Competidores", roles: null },
  { href: "#/teams", match: "teams", label: "Equipos", roles: null },
  { href: "#/races", match: "races", label: "Carreras", roles: null },
  { href: "#/standings", match: "standings", label: "Clasificación", roles: null },
];

function renderNav(activeMatch) {
  const mount = document.getElementById("nav");
  if (!mount) return;

  const role = Auth.getRole();
  const user = Auth.getUser();

  const links = NAV_LINKS
    .filter((l) => !l.roles || l.roles.includes(role))
    .map((l) => `<a href="${l.href}" class="nav-link ${activeMatch === l.match ? "nav-link--active" : ""}">${l.label}</a>`)
    .join("");

  mount.innerHTML = `
    <div class="nav-inner">
      <a href="#/dashboard" class="brand">🐫 Camel vs. Dwarf <span>Racing League</span></a>
      <nav class="nav-links">${links}</nav>
      <div class="nav-user">
        <span class="nav-role">${role ?? ""}</span>
        <a href="#/profile" class="nav-user-name">${user?.username ?? "Perfil"}</a>
        <button id="logoutBtn" class="btn btn--ghost btn--small">Salir</button>
      </div>
    </div>`;

  document.getElementById("logoutBtn").onclick = () => {
    Auth.logout();
    location.hash = "#/login";
  };
}

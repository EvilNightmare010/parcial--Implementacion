const Dashboard = {
  async init() {
    document.getElementById("dashWelcomeName").textContent = Auth.getUser()?.username ?? "";

    const racesBox = document.getElementById("dashUpcomingRaces");
    const resultsBox = document.getElementById("dashRecentResults");
    UI.setLoading(racesBox, true);
    UI.setLoading(resultsBox, true);

    // Solo aparece si el rol es exactamente ADMINISTRATOR
    const welcomeContainer = document.getElementById("dashWelcomeName").parentElement;
    let auditBtn = document.getElementById("adminAuditBtn");
    
    if (Auth.getRole() === "ADMINISTRATOR") {
      if (!auditBtn) {
        auditBtn = document.createElement("button");
        auditBtn.id = "adminAuditBtn";
        auditBtn.className = "btn btn--primary";
        auditBtn.style.marginLeft = "15px";
        auditBtn.textContent = "📋 Ver Registro de Auditoría";
        auditBtn.onclick = () => Dashboard.openAuditModal();
        welcomeContainer.appendChild(auditBtn);
      }
      auditBtn.style.display = "inline-flex";
    } else if (auditBtn) {
      auditBtn.remove(); // Si es organizer o viewer, lo elimina por completo de la interfaz
    }

    try {
      const races = await API.get("/races?status=OPEN_FOR_REGISTRATION");
      const list = races.content || races;
      document.getElementById("dashStatRaces").textContent = list.length;

      if (!list.length) {
        UI.setEmpty(racesBox, "No hay carreras próximas registradas todavía.");
      } else {
        racesBox.innerHTML = `<ul style="list-style:none;padding:0;margin:0">${list
          .slice(0, 5)
          .map(
            (r) => `<li style="padding:10px 0;border-bottom:1px solid var(--border)">
                <a href="#/races/${r.id_race ?? r.id}">${r.name_race ?? r.nameRace ?? r.name}</a>
                <div class="muted">${new Date(r.scheduled_at ?? r.scheduledAt).toLocaleString()}</div>
              </li>`
          )
          .join("")}</ul>`;
      }
    } catch (err) {
      UI.setError(racesBox, UI.friendlyError(err));
    }

    try {
      const results = await API.get("/standings");
      const list = results.content || results;
      if (!list || !list.length) {
        UI.setEmpty(resultsBox, "Aún no hay resultados registrados.");
      } else {
        resultsBox.innerHTML = `<ul style="list-style:none;padding:0;margin:0">${list
          .slice(0, 5)
          .map((r) => `<li style="padding:10px 0;border-bottom:1px solid var(--border)">${r.name ?? r.competitorName ?? "—"} — ${r.points ?? ""} pts</li>`)
          .join("")}</ul>`;
      }
    } catch (err) {
      UI.setError(resultsBox, UI.friendlyError(err));
    }

    try {
      const competitors = await API.get("/competitors?status=ACTIVE&size=1");
      document.getElementById("dashStatCompetitors").textContent =
        competitors.totalElements ?? (competitors.content || competitors).length ?? "—";
    } catch (err) { /* silencioso */ }

    try {
      const teams = await API.get("/teams?size=1");
      document.getElementById("dashStatTeams").textContent =
        teams.totalElements ?? (teams.content || teams).length ?? "—";
    } catch (err) { /* silencioso */ }
  },

  async openAuditModal() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    overlay.innerHTML = `
      <div class="modal" style="width: 700px; max-width: 90%; max-height: 80vh; overflow-y: auto;">
        <h3>Registro de Auditoría (Audit Log)</h3>
        <p class="muted">Historial de acciones críticas del sistema.</p>
        <div id="auditTableContainer" style="margin: 15px 0;">Cargando...</div>
        <div class="modal-actions">
          <button class="btn btn--ghost" id="closeAuditBtn">Cerrar</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector("#closeAuditBtn").onclick = () => overlay.remove();

    const container = overlay.querySelector("#auditTableContainer");
    try {
      const logs = await API.get("/audit");
      const list = logs.content || logs;

      if (!list || !list.length) {
        container.innerHTML = `<p class="muted">No hay registros de auditoría todavía.</p>`;
        return;
      }

      container.innerHTML = `
        <table style="width: 100%; font-size: 13px;">
          <thead>
            <tr><th>ID</th><th>Acción</th><th>Entidad</th><th>Usuario</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            ${list.map(l => `
              <tr>
                <td>${l.id ?? l.auditId ?? "—"}</td>
                <td><strong>${l.action ?? l.message ?? "ACCIÓN"}</strong></td>
                <td>${l.entityType ?? "—"} (#${l.entityId ?? ""})</td>
                <td>${l.username ?? l.user ?? "Sistema"}</td>
                <td>${l.timestamp ? new Date(l.timestamp).toLocaleString() : "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;
    } catch (err) {
      container.innerHTML = `<p class="field-error">Error al cargar la auditoría: ${UI.friendlyError(err)}</p>`;
    }
  }
};
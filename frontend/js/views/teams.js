const Teams = (() => {
  let currentTeamId = null;

  function init() {
    const isAdmin = Auth.getRole() === ROLES.ADMIN;
    document.getElementById("teamNewBtn").style.display = isAdmin ? "inline-flex" : "none";

    document.getElementById("teamNewBtn").onclick = () => {
      document.getElementById("teamForm").reset();
      document.getElementById("teamFormError").textContent = "";
      document.getElementById("teamNameError").textContent = "";
      document.getElementById("teamFormModal").style.display = "flex";
    };
    document.getElementById("teamCancelFormBtn").onclick = () => {
      document.getElementById("teamFormModal").style.display = "none";
    };
    document.getElementById("teamForm").onsubmit = save;
    document.getElementById("teamCloseMembersBtn").onclick = () => {
      document.getElementById("teamMembersModal").style.display = "none";
    };
    document.getElementById("teamAddMemberBtn").onclick = addMember;

    load();
  }

  async function load() {
    const container = document.getElementById("teamTableContainer");
    UI.setLoading(container, true);
    try {
      const res = await API.get("/teams");
      const list = res.content || res;
      if (!list.length) { UI.setEmpty(container, "Aún no hay equipos registrados."); return; }
      container.innerHTML = `
        <table>
          <thead><tr><th>Nombre</th><th>Entrenador</th><th>Miembros</th><th>Récord</th><th>Estado</th><th></th></tr></thead>
          <tbody>${list.map((t) => {
            const id = t.id_team ?? t.id;
            return `<tr>
              <td>${t.name}</td>
              <td>${t.coach_name ?? t.coachName ?? "—"}</td>
              <td>${(t.members || []).length || "—"}</td>
              <td>${t.wins ?? 0}W / ${t.losses ?? 0}L</td>
              <td>${UI.badge(t.status)}</td>
              <td><button class="btn btn--ghost btn--small" id="team-view-${id}">Ver miembros</button></td>
            </tr>`;
          }).join("")}</tbody>
        </table>`;
      list.forEach((t) => {
        const id = t.id_team ?? t.id;
        document.getElementById(`team-view-${id}`).onclick = () => openMembers(t);
      });
    } catch (err) {
      UI.setError(container, UI.friendlyError(err));
    }
  }

  async function save(e) {
    e.preventDefault();
    const name = document.getElementById("teamName").value.trim();
    document.getElementById("teamNameError").textContent = "";
    document.getElementById("teamFormError").textContent = "";
    if (!name) { document.getElementById("teamNameError").textContent = "El nombre es obligatorio."; return; }
    const payload = {
      name,
      coachName: document.getElementById("teamCoachName").value.trim(),
      maxMembers: parseInt(document.getElementById("teamMaxMembers").value, 10),
      description: document.getElementById("teamDescription").value.trim(),
    };
    const btn = document.getElementById("teamSaveBtn");
    btn.disabled = true;
    try {
      await API.post("/teams", payload);
      UI.success("Equipo creado.");
      document.getElementById("teamFormModal").style.display = "none";
      load();
    } catch (err) {
      if (err.status === 409) document.getElementById("teamNameError").textContent = "Ese nombre ya está en uso.";
      else document.getElementById("teamFormError").textContent = UI.friendlyError(err);
    } finally {
      btn.disabled = false;
    }
  }

  async function openMembers(team) {
    currentTeamId = team.id_team ?? team.id;
    document.getElementById("teamMembersTitle").textContent = `Miembros de ${team.name}`;
    document.getElementById("teamMembersModal").style.display = "flex";
    document.getElementById("teamAddMemberField").style.display = Auth.getRole() === ROLES.ADMIN ? "block" : "none";
    await refreshMembers();
  }

  async function refreshMembers() {
    const box = document.getElementById("teamMembersList");
    box.textContent = "Cargando...";
    try {
      const team = await API.get(`/teams/${currentTeamId}`);
      const members = team.members || [];
      const isAdmin = Auth.getRole() === ROLES.ADMIN;
      box.innerHTML = members.length
        ? `<ul style="list-style:none;padding:0;margin:0">${members.map((m) => `<li style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">
              <span>${m.name} <span class="muted">(${m.nickname ?? ""})</span></span>
              ${isAdmin ? `<button class="btn btn--ghost btn--small" data-remove="${m.id_competitor ?? m.id}">Quitar</button>` : ""}
            </li>`).join("")}</ul>`
        : `<p class="muted">Este equipo todavía no tiene miembros.</p>`;

      box.querySelectorAll("[data-remove]").forEach((btn) => { btn.onclick = () => removeMember(btn.dataset.remove); });

      if (isAdmin) await loadAvailableCompetitors();
    } catch (err) {
      box.innerHTML = `<p class="field-error">${UI.friendlyError(err)}</p>`;
    }
  }

  async function loadAvailableCompetitors() {
    const select = document.getElementById("teamAddMemberSelect");
    select.innerHTML = `<option>Cargando...</option>`;
    try {
      const res = await API.get("/competitors?status=ACTIVE&size=100");
      const list = res.content || res;
      select.innerHTML = list.map((c) => `<option value="${c.id_competitor ?? c.id}">${c.name} (${c.nickname})</option>`).join("");
    } catch (err) {
      select.innerHTML = "";
    }
  }

  async function addMember() {
    const competitorId = document.getElementById("teamAddMemberSelect").value;
    if (!competitorId) return;
    try {
      await API.post(`/teams/${currentTeamId}/members/${competitorId}`);
      UI.success("Competidor agregado al equipo.");
      await refreshMembers();
      load();
    } catch (err) {
      UI.error(UI.friendlyError(err));
    }
  }

  async function removeMember(competitorId) {
    const ok = await UI.confirm("Quitar del equipo", "¿Seguro que quieres quitar a este competidor del equipo?");
    if (!ok) return;
    try {
      await API.delete(`/teams/${currentTeamId}/members/${competitorId}`);
      UI.success("Competidor removido del equipo.");
      await refreshMembers();
      load();
    } catch (err) {
      UI.error(UI.friendlyError(err));
    }
  }

  return { init };
})();

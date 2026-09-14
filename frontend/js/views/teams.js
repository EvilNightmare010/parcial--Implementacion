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

  // FUNCIÓN MAESTRA: Capaz de extraer competidores sin importar cómo Spring Boot los haya envuelto o escondido
  function extractCompetitorList(teamObj, allComps, tId) {
    // 1. Busca cualquier arreglo dentro del equipo
    let arr = teamObj.members || teamObj.teamMembers || teamObj.competitors || teamObj.participants || [];
    
    // 2. Si es un arreglo de tabla puente (TeamMember), extrae el competidor interno
    arr = arr.map(item => item.competitor ? item.competitor : item);
    
    // 3. Si Spring Boot ocultó la lista (por @JsonIgnore), hacemos join manual con igualdad flexible (==)
    if (arr.length === 0 && allComps && allComps.length > 0) {
        arr = allComps.filter(c => {
            const cTid = c.team?.id ?? c.team?.teamId ?? c.team?.idTeam ?? c.team?.id_team ?? c.teamId ?? c.team_id ?? c.idTeam ?? c.id_team ?? c.team;
            return cTid != null && cTid == tId; // == permite que "1" coincida con 1
        });
    }
    return arr;
  }

  async function load() {
    const container = document.getElementById("teamTableContainer");
    UI.setLoading(container, true);
    try {
      const res = await API.get("/teams");
      const list = res.content || res;
      if (!list.length) { UI.setEmpty(container, "Aún no hay equipos registrados."); return; }

      let allComps = [];
      try {
        const compsRes = await API.get("/competitors?size=100");
        allComps = compsRes.content || compsRes;
      } catch(e) { }

      container.innerHTML = `
        <table>
          <thead><tr><th>Nombre</th><th>Entrenador</th><th>Miembros</th><th>Récord</th><th>Estado</th><th></th></tr></thead>
          <tbody>${list.map((t, index) => {
            const tId = t.id ?? t.teamId ?? t.idTeam ?? t.id_team ?? Object.values(t)[0];
            
            const membersList = extractCompetitorList(t, allComps, tId);
            const membersCount = membersList.length > 0 ? membersList.length : "—";

            return `<tr>
              <td>${t.name}</td>
              <td>${t.coach_name ?? t.coachName ?? "—"}</td>
              <td><strong>${membersCount}</strong></td>
              <td>${t.wins ?? 0}W / ${t.losses ?? 0}L</td>
              <td>${UI.badge(t.status)}</td>
              <td><button class="btn btn--ghost btn--small" id="team-view-${index}">Ver miembros</button></td>
            </tr>`;
          }).join("")}</tbody>
        </table>`;
      
      list.forEach((t, index) => {
        document.getElementById(`team-view-${index}`).onclick = () => openMembers(t);
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
    currentTeamId = team.id ?? team.idTeam ?? team.teamId ?? team.id_team ?? Object.values(team)[0];
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
      
      let allComps = [];
      try {
        const compsRes = await API.get("/competitors?size=100");
        allComps = compsRes.content || compsRes;
      } catch(e) {}

      const membersList = extractCompetitorList(team, allComps, currentTeamId);
      const isAdmin = Auth.getRole() === ROLES.ADMIN;
      
      box.innerHTML = membersList.length
        ? `<ul style="list-style:none;padding:0;margin:0">${membersList.map((m) => {
            const cId = m.id ?? m.idCompetitor ?? m.competitorId ?? m.id_competitor ?? Object.values(m)[0];
            const mName = m.name ?? "Competidor";
            const mNick = m.nickname ?? "Sin apodo";
            return `<li style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">
              <span>${mName} <span class="muted">(${mNick})</span></span>
              ${isAdmin ? `<button class="btn btn--ghost btn--small" data-remove="${cId}">Quitar</button>` : ""}
            </li>`;
          }).join("")}</ul>`
        : `<p class="muted">Este equipo todavía no tiene miembros.</p>`;

      box.querySelectorAll("[data-remove]").forEach((btn) => { 
        btn.onclick = () => removeMember(btn.dataset.remove); 
      });

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
      
      const availableList = list.filter(c => {
          const cTeamId = c.team?.id ?? c.team?.teamId ?? c.team?.idTeam ?? c.team?.id_team ?? c.teamId ?? c.team_id ?? c.idTeam ?? c.id_team ?? c.team;
          return cTeamId == null || cTeamId === "" || cTeamId === 0;
      });

      select.innerHTML = availableList.map((c) => {
        const cId = c.id ?? c.idCompetitor ?? c.competitorId ?? c.id_competitor ?? Object.values(c)[0];
        return `<option value="${cId}">${c.name} (${c.nickname})</option>`;
      }).join("") || `<option value="">No hay competidores disponibles</option>`;
    } catch (err) {
      select.innerHTML = "";
    }
  }

  async function addMember() {
    const competitorId = document.getElementById("teamAddMemberSelect").value;
    if (!competitorId || competitorId === "undefined") {
      UI.error("Error: Selecciona un competidor válido.");
      return;
    }
    
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
    if (!competitorId || competitorId === "undefined") return;
    
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
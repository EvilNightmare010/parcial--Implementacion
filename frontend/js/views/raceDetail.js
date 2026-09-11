const RaceDetail = (() => {
  let raceId = null;

  function init(id) {
    raceId = id;
    initTabs();
    initResultModal();
    loadHeader();
    loadRegistrations();
    loadResults();
  }

  function initTabs() {
    document.querySelectorAll("#view-race-detail .tab").forEach((tab) => {
      tab.onclick = () => {
        document.querySelectorAll("#view-race-detail .tab").forEach((t) => t.classList.remove("tab--active"));
        document.querySelectorAll("#view-race-detail .tab-panel").forEach((p) => p.classList.remove("tab-panel--active"));
        tab.classList.add("tab--active");
        document.getElementById(`rd-panel-${tab.dataset.tab}`).classList.add("tab-panel--active");
      };
    });
  }

  async function loadHeader() {
    const box = document.getElementById("rdHeader");
    box.textContent = "Cargando...";
    try {
      const r = await API.get(`/races/${raceId}`);
      box.innerHTML = `
        <div class="page-header" style="margin:0">
          <div>
            <h1 style="margin-bottom:4px">${r.name_race ?? r.nameRace ?? r.name}</h1>
            <p class="muted" style="margin:0">${r.start_location ?? r.startLocation ?? "—"} → ${r.end_location ?? r.endLocation ?? "—"} · ${r.distance_meters ?? r.distanceMeters} m</p>
          </div>
          <div>${UI.badge(r.status)}</div>
        </div>`;
    } catch (err) {
      UI.setError(box, UI.friendlyError(err));
    }
  }

  async function loadRegistrations() {
    const box = document.getElementById("rdRegistrationsBox");
    UI.setLoading(box, true);
    const canManage = [ROLES.ADMIN, ROLES.ORGANIZER].includes(Auth.getRole());
    try {
      const res = await API.get(`/races/${raceId}/registrations`);
      const list = res.content || res;
      if (!list.length) { UI.setEmpty(box, "Todavía no hay inscripciones para esta carrera."); return; }
      box.innerHTML = `
        <table>
          <thead><tr><th>Participante</th><th>Fecha</th><th>Estado</th>${canManage ? "<th></th>" : ""}</tr></thead>
          <tbody>${list.map((r) => {
            const id = r.id_registration ?? r.id;
            const label = r.competitor_name ?? r.competitorName ?? r.team_name ?? r.teamName ?? "—";
            return `<tr>
              <td>${label}</td>
              <td>${new Date(r.registered_at ?? r.registeredAt).toLocaleDateString()}</td>
              <td>${UI.badge(r.status)}</td>
              ${canManage && r.status === "PENDING" ? `<td class="row-actions">
                  <button class="btn btn--secondary btn--small" id="rd-approve-${id}">Aprobar</button>
                  <button class="btn btn--danger btn--small" id="rd-reject-${id}">Rechazar</button>
                </td>` : "<td></td>"}
            </tr>`;
          }).join("")}</tbody>
        </table>`;

      list.forEach((r) => {
        const id = r.id_registration ?? r.id;
        const approveBtn = document.getElementById(`rd-approve-${id}`);
        const rejectBtn = document.getElementById(`rd-reject-${id}`);
        if (approveBtn) approveBtn.onclick = () => decide(id, "approve");
        if (rejectBtn) rejectBtn.onclick = () => decide(id, "reject");
      });
    } catch (err) {
      UI.setError(box, UI.friendlyError(err));
    }
  }

  async function decide(id, action) {
    let reason = null;
    if (action === "reject") {
      reason = prompt("Motivo del rechazo (obligatorio):");
      if (!reason) return;
    }
    try {
      await API.patch(`/registrations/${id}/${action}`, reason ? { reason } : undefined);
      UI.success(action === "approve" ? "Inscripción aprobada." : "Inscripción rechazada.");
      loadRegistrations();
    } catch (err) {
      UI.error(UI.friendlyError(err));
    }
  }

  async function loadResults() {
    const box = document.getElementById("rdResultsBox");
    UI.setLoading(box, true);
    const canManage = [ROLES.ADMIN, ROLES.ORGANIZER].includes(Auth.getRole());
    document.getElementById("rdAddResultBtn").style.display = canManage ? "inline-flex" : "none";
    try {
      const res = await API.get(`/races/${raceId}/results`);
      const list = res.content || res;
      if (!list.length) { UI.setEmpty(box, "Aún no se han registrado resultados."); return; }
      list.sort((a, b) => (a.final_position ?? a.finalPosition ?? 99) - (b.final_position ?? b.finalPosition ?? 99));
      box.innerHTML = `
        <table>
          <thead><tr><th>Posición</th><th>Participante</th><th>Tiempo</th><th>Estado</th></tr></thead>
          <tbody>${list.map((r) => `<tr>
              <td>${r.final_position ?? r.finalPosition ?? "—"}</td>
              <td>${r.competitor_name ?? r.competitorName ?? r.team_name ?? r.teamName ?? "—"}</td>
              <td>${r.completion_time_seconds ?? r.completionTimeSeconds ?? "—"}</td>
              <td>${UI.badge(r.status)}</td>
            </tr>`).join("")}</tbody>
        </table>`;
    } catch (err) {
      UI.setError(box, UI.friendlyError(err));
    }
  }

  function initResultModal() {
    document.getElementById("rdAddResultBtn").onclick = async () => {
      document.getElementById("rdResultForm").reset();
      document.getElementById("rdResultFormError").textContent = "";
      await loadApprovedIntoSelect();
      document.getElementById("rdResultModal").style.display = "flex";
    };
    document.getElementById("rdCancelResultFormBtn").onclick = () => {
      document.getElementById("rdResultModal").style.display = "none";
    };
    document.getElementById("rdResultForm").onsubmit = saveResult;
  }

  async function loadApprovedIntoSelect() {
    const select = document.getElementById("rdResultRegistration");
    select.innerHTML = `<option>Cargando...</option>`;
    try {
      const res = await API.get(`/races/${raceId}/registrations`);
      const list = (res.content || res).filter((r) => r.status === "APPROVED");
      select.innerHTML = list.map((r) => {
        const id = r.id_registration ?? r.id;
        const label = r.competitor_name ?? r.competitorName ?? r.team_name ?? r.teamName ?? `#${id}`;
        return `<option value="${id}">${label}</option>`;
      }).join("") || `<option value="">No hay inscripciones aprobadas</option>`;
    } catch (err) {
      select.innerHTML = `<option value="">Error al cargar</option>`;
    }
  }

  async function saveResult(e) {
    e.preventDefault();
    document.getElementById("rdResultFormError").textContent = "";
    const payload = {
      registrationId: document.getElementById("rdResultRegistration").value,
      finalPosition: document.getElementById("rdFinalPosition").value || null,
      completionTimeSeconds: document.getElementById("rdCompletionTime").value || null,
      status: document.getElementById("rdResultStatus").value,
      notes: document.getElementById("rdResultNotes").value.trim(),
    };
    const btn = document.getElementById("rdSaveResultBtn");
    btn.disabled = true;
    try {
      await API.post(`/races/${raceId}/results`, payload);
      UI.success("Resultado registrado.");
      document.getElementById("rdResultModal").style.display = "none";
      loadResults();
    } catch (err) {
      document.getElementById("rdResultFormError").textContent = UI.friendlyError(err);
    } finally {
      btn.disabled = false;
    }
  }

  return { init };
})();

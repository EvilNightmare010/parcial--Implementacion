const Races = (() => {
  function init() {
    const canManage = [ROLES.ADMIN, ROLES.ORGANIZER].includes(Auth.getRole());
    document.getElementById("raceNewBtn").style.display = canManage ? "inline-flex" : "none";

    document.getElementById("raceNewBtn").onclick = () => {
      document.getElementById("raceForm").reset();
      document.querySelectorAll("#raceForm .field-error").forEach((e) => (e.textContent = ""));
      document.getElementById("raceFormModal").style.display = "flex";
    };
    document.getElementById("raceCancelFormBtn").onclick = () => {
      document.getElementById("raceFormModal").style.display = "none";
    };
    document.getElementById("raceForm").onsubmit = save;

    load();
  }

  async function load() {
    const container = document.getElementById("raceTableContainer");
    UI.setLoading(container, true);
    try {
      const res = await API.get("/races");
      const list = res.content || res;
      if (!list.length) { UI.setEmpty(container, "No hay carreras creadas todavía."); return; }
      container.innerHTML = `
        <table>
          <thead><tr><th>Nombre</th><th>Tipo</th><th>Fecha</th><th>Distancia</th><th>Estado</th><th></th></tr></thead>
          <tbody>${list.map((r) => {
            const id = r.id ?? r.raceId ?? r.id_race ?? Object.values(r)[0]; 
            return `<tr>
              <td>${r.name_race ?? r.nameRace ?? r.name}</td>
              <td>${r.race_type ?? r.raceType}</td>
              <td>${new Date(r.scheduled_at ?? r.scheduledAt).toLocaleString()}</td>
              <td>${r.distance_meters ?? r.distanceMeters} m</td>
              <td>${UI.badge(r.status)}</td>
              <td><a class="btn btn--ghost btn--small" href="#/races/${id}">Ver detalle</a></td>
            </tr>`;
          }).join("")}</tbody>
        </table>`;
    } catch (err) {
      UI.setError(container, UI.friendlyError(err));
    }
  }

  async function save(e) {
    e.preventDefault();
    document.querySelectorAll("#raceForm .field-error").forEach((el) => (el.textContent = ""));

    const name = document.getElementById("raceName").value.trim();
    const distance = parseInt(document.getElementById("raceDistance").value, 10);
    let valid = true;
    if (!name) { document.getElementById("raceNameError").textContent = "El nombre es obligatorio."; valid = false; }
    if (!(distance > 0)) { document.getElementById("raceDistanceError").textContent = "La distancia debe ser mayor a cero."; valid = false; }
    if (!valid) return;

    const payload = {
      nameRace: name,
      raceType: document.getElementById("raceType").value,
      distanceMeters: distance,
      scheduledAt: document.getElementById("raceScheduledAt").value,
      registrationDeadline: document.getElementById("raceRegistrationDeadline").value,
      startLocation: document.getElementById("raceStartLocation").value.trim(),
      endLocation: document.getElementById("raceEndLocation").value.trim(),
      maxParticipants: parseInt(document.getElementById("raceMaxParticipants").value, 10),
    };

    const btn = document.getElementById("raceSaveBtn");
    btn.disabled = true;
    try {
      await API.post("/races", payload);
      UI.success("Carrera creada.");
      document.getElementById("raceFormModal").style.display = "none";
      load();
    } catch (err) {
      document.getElementById("raceFormError").textContent = UI.friendlyError(err);
    } finally {
      btn.disabled = false;
    }
  }

  return { init };
})();
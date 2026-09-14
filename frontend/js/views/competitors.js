const Competitors = (() => {
  const state = { page: 0, size: 10, search: "", type: "", status: "", totalPages: 0 };
  let debounceTimer;

  function init() {
    const isAdmin = Auth.getRole() === ROLES.ADMIN;
    document.getElementById("compNewBtn").style.display = isAdmin ? "inline-flex" : "none";

    document.getElementById("compNewBtn").onclick = () => openForm();
    document.getElementById("compCancelFormBtn").onclick = closeForm;
    document.getElementById("compForm").onsubmit = save;

    // Buscador en tiempo real
    document.getElementById("compSearchInput").oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.search = e.target.value.trim().toLowerCase();
        state.page = 0;
        load();
      }, 350);
    };
    
    // Selectores
    document.getElementById("compTypeFilter").onchange = (e) => { state.type = e.target.value; state.page = 0; load(); };
    document.getElementById("compStatusFilter").onchange = (e) => { state.status = e.target.value; state.page = 0; load(); };
    
    // Botón Limpiar
    document.getElementById("compClearFiltersBtn").onclick = () => {
      state.search = ""; state.type = ""; state.status = ""; state.page = 0;
      document.getElementById("compSearchInput").value = "";
      document.getElementById("compTypeFilter").value = "";
      document.getElementById("compStatusFilter").value = "";
      load();
    };

    // Paginación
    document.getElementById("compPrevPageBtn").onclick = () => { 
      if (state.page > 0) { state.page--; load(); } 
    };
    document.getElementById("compNextPageBtn").onclick = () => { 
      if (state.page < state.totalPages - 1) { state.page++; load(); } 
    };

    load();
  }

  async function load() {
    const container = document.getElementById("compTableContainer");
    UI.setLoading(container, true);

    try {
      const res = await API.get(`/competitors?size=1000`);
      let list = res.content || res;

      if (state.search) {
        list = list.filter(c => 
          (c.name && c.name.toLowerCase().includes(state.search)) || 
          (c.nickname && c.nickname.toLowerCase().includes(state.search))
        );
      }
      if (state.type) {
        list = list.filter(c => c.type === state.type);
      }
      if (state.status) {
        list = list.filter(c => c.status === state.status);
      }

      state.totalPages = Math.ceil(list.length / state.size);
      
      if (state.page >= state.totalPages && state.totalPages > 0) {
          state.page = state.totalPages - 1;
      }

      const startIndex = state.page * state.size;
      const paginatedList = list.slice(startIndex, startIndex + state.size);

      if (!paginatedList.length) {
        UI.setEmpty(container, "No se encontraron competidores con estos filtros.");
        document.getElementById("compPageIndicator").textContent = "";
        return;
      }

      const isAdmin = Auth.getRole() === ROLES.ADMIN;
      container.innerHTML = `
        <table>
          <thead><tr><th>Nombre</th><th>Apodo</th><th>Tipo</th><th>Estado</th><th>País</th>${isAdmin ? "<th></th>" : ""}</tr></thead>
          <tbody>${paginatedList.map((c, index) => rowHtml(c, isAdmin, index)).join("")}</tbody>
        </table>`;

      document.getElementById("compPageIndicator").textContent = `Página ${state.page + 1}${state.totalPages ? " de " + state.totalPages : ""}`;

      // Asignación de los nuevos botones
      if (isAdmin) {
        paginatedList.forEach((c, index) => {
          const editBtn = document.getElementById(`comp-edit-${index}`);
          const retireBtn = document.getElementById(`comp-retire-${index}`);
          const suspendBtn = document.getElementById(`comp-suspend-${index}`);
          const injureBtn = document.getElementById(`comp-injure-${index}`);
          const recoverBtn = document.getElementById(`comp-recover-${index}`);

          if (editBtn) editBtn.onclick = () => openForm(c);
          
          if (retireBtn) retireBtn.onclick = () => 
            updateStatus(c, "RETIRED", `¿Seguro que quieres retirar a "${c.name}"? Esta acción es permanente.`, "Competidor retirado.");
            
          if (suspendBtn) suspendBtn.onclick = () => 
            updateStatus(c, "SUSPENDED", `¿Seguro que quieres suspender a "${c.name}"? Esta acción es permanente.`, "Competidor suspendido.");
            
          if (injureBtn) injureBtn.onclick = () => 
            updateStatus(c, "INJURED", `¿Marcar a "${c.name}" como lesionado?`, "Competidor marcado como lesionado.");
            
          if (recoverBtn) recoverBtn.onclick = () => 
            updateStatus(c, "ACTIVE", `¿Marcar a "${c.name}" como recuperado (Activo)?`, "Competidor recuperado.");
        });
      }
    } catch (err) {
      UI.setError(container, UI.friendlyError(err));
    }
  }

  function rowHtml(c, isAdmin, index) {
    let actionButtons = "";
    if (isAdmin) {
      actionButtons += `<button class="btn btn--ghost btn--small" id="comp-edit-${index}">Editar</button> `;

      // Reglas de negocio para los botones de estado
      if (c.status !== "RETIRED" && c.status !== "SUSPENDED") {
        
        // Toggle de Lesión
        if (c.status === "ACTIVE") {
          actionButtons += `<button class="btn btn--ghost btn--small" id="comp-injure-${index}">Lesionar</button> `;
        } else if (c.status === "INJURED") {
          actionButtons += `<button class="btn btn--ghost btn--small" id="comp-recover-${index}">Recuperar</button> `;
        }
        
        // Acciones definitivas
        actionButtons += `<button class="btn btn--ghost btn--small" id="comp-suspend-${index}">Suspender</button> `;
        actionButtons += `<button class="btn btn--ghost btn--small" id="comp-retire-${index}">Retirar</button>`;
      }
    }

    return `<tr>
      <td>${c.name}</td><td>${c.nickname}</td><td>${c.type}</td>
      <td>${UI.badge(c.status)}</td><td>${c.origin_country ?? c.originCountry ?? "—"}</td>
      ${isAdmin ? `<td class="row-actions">${actionButtons}</td>` : ""}
    </tr>`;
  }

  function openForm(c) {
    document.getElementById("compFormTitle").textContent = c ? "Editar competidor" : "Nuevo competidor";
    
    document.getElementById("compId").value = c ? (c.id ?? c.competitorId ?? c.id_competitor ?? Object.values(c)[0]) : "";
    
    document.getElementById("compName").value = c?.name ?? "";
    document.getElementById("compNickname").value = c?.nickname ?? "";
    document.getElementById("compType").value = c?.type ?? "DWARF";
    document.getElementById("compBirthDate").value = (c?.birth_date ?? c?.birthDate ?? "").slice(0, 10);
    document.getElementById("compWeight").value = c?.weight ?? "";
    document.getElementById("compHeight").value = c?.height ?? "";
    document.getElementById("compOriginCountry").value = c?.origin_country ?? c?.originCountry ?? "";
    ["compNameError", "compNicknameError", "compWeightError", "compHeightError", "compFormError"].forEach((id) => (document.getElementById(id).textContent = ""));
    document.getElementById("compFormModal").style.display = "flex";
  }

  function closeForm() {
    document.getElementById("compFormModal").style.display = "none";
  }

  async function save(e) {
    e.preventDefault();
    const id = document.getElementById("compId").value;
    const payload = {
      name: document.getElementById("compName").value.trim(),
      nickname: document.getElementById("compNickname").value.trim(),
      type: document.getElementById("compType").value,
      birthDate: document.getElementById("compBirthDate").value || null,
      weight: parseFloat(document.getElementById("compWeight").value),
      height: parseFloat(document.getElementById("compHeight").value),
      originCountry: document.getElementById("compOriginCountry").value.trim(),
    };

    let valid = true;
    if (!payload.name) { document.getElementById("compNameError").textContent = "El nombre es obligatorio."; valid = false; }
    if (!payload.nickname) { document.getElementById("compNicknameError").textContent = "El apodo es obligatorio."; valid = false; }
    if (!(payload.weight > 0)) { document.getElementById("compWeightError").textContent = "El peso debe ser positivo."; valid = false; }
    if (!(payload.height > 0)) { document.getElementById("compHeightError").textContent = "La altura debe ser positiva."; valid = false; }
    if (!valid) return;

    const btn = document.getElementById("compSaveBtn");
    btn.disabled = true;
    btn.textContent = "Guardando...";
    try {
      if (id) { await API.put(`/competitors/${id}`, payload); UI.success("Competidor actualizado."); }
      else { await API.post("/competitors", payload); UI.success("Competidor creado."); }
      closeForm();
      load();
    } catch (err) {
      if (err.status === 409) document.getElementById("compNicknameError").textContent = "Ese apodo ya está en uso.";
      else document.getElementById("compFormError").textContent = UI.friendlyError(err);
    } finally {
      btn.disabled = false;
      btn.textContent = "Guardar";
    }
  }

  // FUNCIÓN MAESTRA DE ESTADOS
  async function updateStatus(c, newStatus, confirmMessage, successMessage) {
    const id = c.id ?? c.competitorId ?? c.id_competitor ?? Object.values(c)[0];
    const ok = await UI.confirm("Cambiar estado", confirmMessage);
    if (!ok) return;
    try {
      await API.patch(`/competitors/${id}/status`, { status: newStatus });
      UI.success(successMessage);
      load(); // Recarga la tabla para reflejar el cambio y redibujar los botones
    } catch (err) {
      UI.error(UI.friendlyError(err));
    }
  }

  return { init };
})();
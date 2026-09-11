const Competitors = (() => {
  const state = { page: 0, size: 10, search: "", type: "", status: "" };
  let debounceTimer;

  function init() {
    const isAdmin = Auth.getRole() === ROLES.ADMIN;
    document.getElementById("compNewBtn").style.display = isAdmin ? "inline-flex" : "none";

    document.getElementById("compNewBtn").onclick = () => openForm();
    document.getElementById("compCancelFormBtn").onclick = closeForm;
    document.getElementById("compForm").onsubmit = save;

    document.getElementById("compSearchInput").oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.search = e.target.value.trim();
        state.page = 0;
        load();
      }, 350);
    };
    document.getElementById("compTypeFilter").onchange = (e) => { state.type = e.target.value; state.page = 0; load(); };
    document.getElementById("compStatusFilter").onchange = (e) => { state.status = e.target.value; state.page = 0; load(); };
    document.getElementById("compClearFiltersBtn").onclick = () => {
      state.search = ""; state.type = ""; state.status = ""; state.page = 0;
      document.getElementById("compSearchInput").value = "";
      document.getElementById("compTypeFilter").value = "";
      document.getElementById("compStatusFilter").value = "";
      load();
    };
    document.getElementById("compPrevPageBtn").onclick = () => { if (state.page > 0) { state.page--; load(); } };
    document.getElementById("compNextPageBtn").onclick = () => { state.page++; load(); };

    load();
  }

  async function load() {
    const container = document.getElementById("compTableContainer");
    UI.setLoading(container, true);

    const params = new URLSearchParams({ page: state.page, size: state.size });
    if (state.search) params.set("search", state.search);
    if (state.type) params.set("type", state.type);
    if (state.status) params.set("status", state.status);

    try {
      const res = await API.get(`/competitors?${params.toString()}`);
      const list = res.content || res;

      if (!list.length) {
        UI.setEmpty(container, "No se encontraron competidores con estos filtros.");
        document.getElementById("compPageIndicator").textContent = "";
        return;
      }

      const isAdmin = Auth.getRole() === ROLES.ADMIN;
      container.innerHTML = `
        <table>
          <thead><tr><th>Nombre</th><th>Apodo</th><th>Tipo</th><th>Estado</th><th>País</th>${isAdmin ? "<th></th>" : ""}</tr></thead>
          <tbody>${list.map((c) => rowHtml(c, isAdmin)).join("")}</tbody>
        </table>`;

      document.getElementById("compPageIndicator").textContent = `Página ${state.page + 1}${res.totalPages ? " de " + res.totalPages : ""}`;

      if (isAdmin) {
        list.forEach((c) => {
          const id = c.id_competitor ?? c.id;
          const editBtn = document.getElementById(`comp-edit-${id}`);
          const retireBtn = document.getElementById(`comp-retire-${id}`);
          if (editBtn) editBtn.onclick = () => openForm(c);
          if (retireBtn) retireBtn.onclick = () => retire(c);
        });
      }
    } catch (err) {
      UI.setError(container, UI.friendlyError(err));
    }
  }

  function rowHtml(c, isAdmin) {
    const id = c.id_competitor ?? c.id;
    return `<tr>
      <td>${c.name}</td><td>${c.nickname}</td><td>${c.type}</td>
      <td>${UI.badge(c.status)}</td><td>${c.origin_country ?? c.originCountry ?? "—"}</td>
      ${isAdmin ? `<td class="row-actions">
          <button class="btn btn--ghost btn--small" id="comp-edit-${id}">Editar</button>
          ${c.status !== "RETIRED" ? `<button class="btn btn--ghost btn--small" id="comp-retire-${id}">Retirar</button>` : ""}
        </td>` : ""}
    </tr>`;
  }

  function openForm(c) {
    document.getElementById("compFormTitle").textContent = c ? "Editar competidor" : "Nuevo competidor";
    document.getElementById("compId").value = c ? (c.id_competitor ?? c.id) : "";
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

  async function retire(c) {
    const id = c.id_competitor ?? c.id;
    const ok = await UI.confirm("Retirar competidor", `¿Seguro que quieres retirar a "${c.name}"? No se elimina, solo cambia su estado.`);
    if (!ok) return;
    try {
      await API.patch(`/competitors/${id}/status`, { status: "RETIRED" });
      UI.success("Competidor retirado.");
      load();
    } catch (err) {
      UI.error(UI.friendlyError(err));
    }
  }

  return { init };
})();

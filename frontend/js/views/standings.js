const Standings = {
  init() {
    document.querySelectorAll("#view-standings .tab").forEach((tab) => {
      tab.onclick = () => {
        document.querySelectorAll("#view-standings .tab").forEach((t) => t.classList.remove("tab--active"));
        document.querySelectorAll("#view-standings .tab-panel").forEach((p) => p.classList.remove("tab-panel--active"));
        tab.classList.add("tab--active");
        document.getElementById(`panel-${tab.dataset.tab}`).classList.add("tab-panel--active");
      };
    });

    this.load("/standings/competitors", "standCompetitorBox", "Competidor");
    this.load("/standings/teams", "standTeamBox", "Equipo");
  },

  async load(path, containerId, label) {
    const box = document.getElementById(containerId);
    UI.setLoading(box, true);
    try {
      const res = await API.get(path);
      const list = res.content || res;
      if (!list.length) { UI.setEmpty(box, "Todavía no hay datos de clasificación."); return; }
      box.innerHTML = `
        <table>
          <thead><tr><th>#</th><th>${label}</th><th>Puntos</th><th>Victorias</th></tr></thead>
          <tbody>${list.map((row, i) => `<tr>
              <td>${i + 1}</td>
              <td>${row.name ?? row.competitorName ?? row.teamName ?? "—"}</td>
              <td><strong>${row.points ?? 0}</strong></td>
              <td>${row.wins ?? 0}</td>
            </tr>`).join("")}</tbody>
        </table>`;
    } catch (err) {
      UI.setError(box, UI.friendlyError(err));
    }
  },
};

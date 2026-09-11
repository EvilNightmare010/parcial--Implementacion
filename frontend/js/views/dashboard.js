const Dashboard = {
  async init() {
    document.getElementById("dashWelcomeName").textContent = Auth.getUser()?.username ?? "";

    const racesBox = document.getElementById("dashUpcomingRaces");
    const resultsBox = document.getElementById("dashRecentResults");
    UI.setLoading(racesBox, true);
    UI.setLoading(resultsBox, true);

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
    } catch (err) { /* contador secundario, silencioso */ }

    try {
      const teams = await API.get("/teams?size=1");
      document.getElementById("dashStatTeams").textContent =
        teams.totalElements ?? (teams.content || teams).length ?? "—";
    } catch (err) { /* silencioso */ }
  },
};

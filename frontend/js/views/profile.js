const Profile = {
  init() {
    const u = Auth.getUser();
    document.getElementById("profileUsername").textContent = u?.username ?? "—";
    document.getElementById("profileRole").textContent = u?.role ?? "—";
    document.getElementById("profileLogoutBtn").onclick = () => {
      Auth.logout();
      location.hash = "#/login";
    };
  },
};

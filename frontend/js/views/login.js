const Login = {
  init() {
    const form = document.getElementById("loginForm");
    const btn = document.getElementById("loginBtn");

    // onsubmit en vez de addEventListener: evita que se acumulen handlers
    // duplicados cada vez que se vuelve a entrar a esta vista.
    form.onsubmit = async (e) => {
      e.preventDefault();

      document.getElementById("loginUsernameError").textContent = "";
      document.getElementById("loginPasswordError").textContent = "";
      document.getElementById("loginFormError").textContent = "";

      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value;

      let valid = true;
      if (!username) {
        document.getElementById("loginUsernameError").textContent = "El usuario es obligatorio.";
        valid = false;
      }
      if (!password) {
        document.getElementById("loginPasswordError").textContent = "La contraseña es obligatoria.";
        valid = false;
      }
      if (!valid) return;

      btn.disabled = true;
      btn.textContent = "Ingresando...";
      try {
        await Auth.login(username, password);
        location.hash = "#/dashboard";
      } catch (err) {
        if (err.status === 401) {
          document.getElementById("loginFormError").textContent = "Usuario o contraseña incorrectos.";
        } else {
          document.getElementById("loginFormError").textContent = UI.friendlyError(err);
        }
      } finally {
        btn.disabled = false;
        btn.textContent = "Ingresar";
      }
    };
  },
};

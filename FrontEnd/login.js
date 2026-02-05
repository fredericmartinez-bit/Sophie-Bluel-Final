const form = document.querySelector("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Bloque le rechargement de la page

  const user = {
    email: emailInput.value,
    password: passwordInput.value,
  };

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      window.location.href = "index.html"; // Redirection vers l'accueil
    } else {
      alert("Erreur dans l’identifiant ou le mot de passe");
    }
  } catch (error) {
    console.error("Erreur :", error);
  }
});

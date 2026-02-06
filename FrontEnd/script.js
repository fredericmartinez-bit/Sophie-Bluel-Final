const urlApi = "http://localhost:5678/api/works";
const gallery = document.querySelector(".gallery");
let allWorks = [];

// 1. Récupérer les travaux
async function getWorks() {
  const response = await fetch(urlApi);
  allWorks = await response.json();
  displayWorks(allWorks);
}
function resetActiveBtn() {
  const allBtns = document.querySelectorAll(".filter-btn");
  allBtns.forEach((b) => b.classList.remove("active"));
}

// 2. Afficher les travaux dans la galerie
function displayWorks(works) {
  gallery.innerHTML = "";
  works.forEach((work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    img.src = work.imageUrl;
    img.alt = work.title;
    figcaption.innerText = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

// 3. Récupérer les catégories
async function getCategories() {
  const response = await fetch("http://localhost:5678/api/categories");
  const categories = await response.json();
  displayCategories(categories);
}

// 4. Afficher les boutons et gérer les clics (Filtres)
function displayCategories(categories) {
  const filtersContainer = document.querySelector(".filters");

  // Bouton "Tous"
  const btnAll = document.createElement("button");
  btnAll.innerText = "Tous";
  btnAll.classList.add("filter-btn", "active"); // On ajoute 'active' par défaut
  filtersContainer.appendChild(btnAll);

  btnAll.addEventListener("click", () => {
    resetActiveBtn(); // On retire le vert des autres boutons
    btnAll.classList.add("active"); // On met le vert sur celui-ci
    displayWorks(allWorks);
  });

  // Boutons par catégories
  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.innerText = category.name;
    btn.classList.add("filter-btn");
    filtersContainer.appendChild(btn);

    btn.addEventListener("click", () => {
      resetActiveBtn(); // On retire le vert des autres boutons
      btn.classList.add("active"); // On met le vert sur le bouton cliqué
      const filteredWorks = allWorks.filter(
        (work) => work.categoryId === category.id,
      );
      displayWorks(filteredWorks);
    });
  });
}

// On lance les fonctions au chargement
getWorks();
getCategories();

// =================================================== //
// === PARTIE ADMINISTRATEUR (Une fois connecté) === //
// =================================================== //

const token = localStorage.getItem("token");

if (token) {
  // 1. Logout
  const loginLink = document.querySelector("a[href='login.html']");
  loginLink.innerText = "logout";
  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    window.location.reload();
  });

  // 2. Cacher filtres
  const filters = document.querySelector(".filters");
  if (filters) {
    filters.style.display = "none";
  }

  // 3. Barre noire
  const body = document.querySelector("body");
  const topBar = document.createElement("div");
  topBar.className = "top-bar";
  topBar.innerHTML = `<p><i class="fa-regular fa-pen-to-square"></i> Mode édition</p>`;
  topBar.style.backgroundColor = "black";
  topBar.style.color = "white";
  topBar.style.textAlign = "center";
  topBar.style.padding = "10px";
  topBar.style.position = "absolute";
  topBar.style.top = "0";
  topBar.style.left = "0";
  topBar.style.width = "100%";
  body.prepend(topBar);

  // 4. Bouton modifier
  const titleProject = document.querySelector("#portfolio h2");
  const editBtn = document.createElement("a");
  editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier';
  editBtn.href = "#";
  editBtn.style.marginLeft = "20px";
  editBtn.style.fontSize = "14px";
  editBtn.style.color = "black";
  editBtn.style.textDecoration = "none";
  editBtn.style.fontWeight = "normal";
  titleProject.appendChild(editBtn);

  // 5. GESTION DE LA MODALE
  const modal = document.querySelector("#modal");
  const closeModalBtn = document.querySelector(".close-modal");

  // Variables pour la navigation
  const btnAddPhoto = document.querySelector(".btn-add-photo");
  const returnBtn = document.querySelector(".return-modal");
  const galleryView = document.querySelector("#modal-gallery-view");
  const addView = document.querySelector("#modal-add-view");

  // Ouvrir la modale
  editBtn.addEventListener("click", (event) => {
    event.preventDefault();
    generateModalGallery(allWorks); // On remplit la galerie
    modal.style.display = "flex";
  });

  // Navigation : Aller vers "Ajouter photo"
  btnAddPhoto.addEventListener("click", () => {
    galleryView.style.display = "none";
    addView.style.display = "block";
    returnBtn.style.display = "block";
  });

  // Navigation : Retour vers Galerie
  returnBtn.addEventListener("click", () => {
    addView.style.display = "none";
    galleryView.style.display = "block";
    returnBtn.style.display = "none";
  });

  // Fermer la modale (Croix) + Reset
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
    // Reset des vues
    galleryView.style.display = "block";
    addView.style.display = "none";
    returnBtn.style.display = "none";
  });

  // Fermer la modale (Clic dehors) + Reset
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      // Reset des vues
      galleryView.style.display = "block";
      addView.style.display = "none";
      returnBtn.style.display = "none";
    }
  }); // 7. REMPLIR LES CATÉGORIES DANS LE FORMULAIRE
  async function fillCategories() {
    const select = document.querySelector("#category");
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();

    // On ajoute chaque catégorie dans le menu déroulant
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.innerText = category.name;
      select.appendChild(option);
    });
  }
  fillCategories(); // On appelle la fonction tout de suite

  // 8. APERÇU DE LA PHOTO (PREVIEW)
  const fileInput = document.querySelector("#photo-upload");
  const imgPreview = document.querySelector("#img-preview");
  const labelUpload = document.querySelector(".btn-upload");
  const iconImage = document.querySelector(".icon-image");
  const pSize = document.querySelector(".add-photo-container p");

  // Quand on change le fichier (quand on en choisit un)
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (file) {
      // On crée un lecteur pour lire le fichier et l'afficher
      const reader = new FileReader();
      reader.onload = (e) => {
        imgPreview.src = e.target.result; // On met l'image dans la balise img
        imgPreview.style.display = "block"; // On l'affiche

        // On cache les textes derrière pour que ce soit joli
        labelUpload.style.display = "none";
        iconImage.style.display = "none";
        pSize.style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  }); // <--- ICI on ferme bien la partie 8 !

  // 9. VÉRIFIER QUE TOUT EST REMPLI (Pour activer le bouton)
  const titleInput = document.querySelector("#title");
  const categorySelect = document.querySelector("#category");
  // IMPORTANT : On sélectionne par la CLASSE .btn-validate pour correspondre au CSS
  const btnValidate = document.querySelector(".btn-validate");

  function checkForm() {
    // Condition : Si image sélectionnée + Titre rempli + Catégorie choisie
    if (
      fileInput.files[0] &&
      titleInput.value !== "" &&
      categorySelect.value !== ""
    ) {
      // ALORS : On active le bouton (devient VERT)
      btnValidate.removeAttribute("disabled");
      btnValidate.classList.add("active");
      btnValidate.style.cursor = "pointer";
    } else {
      // SINON : On désactive le bouton (reste GRIS)
      btnValidate.setAttribute("disabled", "true");
      btnValidate.classList.remove("active");
      btnValidate.style.cursor = "not-allowed";
    }
  }

  // On surveille les changements sur les 3 champs
  fileInput.addEventListener("change", checkForm);
  titleInput.addEventListener("input", checkForm);
  categorySelect.addEventListener("change", checkForm);

  // 10. ENVOYER LA PHOTO (Le Submit)
  const form = document.querySelector("#add-photo-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    formData.append("title", titleInput.value);
    formData.append("category", categorySelect.value);

    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Projet ajouté avec succès ! 🎉");
        getWorks(); // Mise à jour galerie
        modal.style.display = "none"; // Fermeture modale

        // Reset total
        form.reset();
        imgPreview.style.display = "none";
        labelUpload.style.display = "block";
        iconImage.style.display = "block";
        pSize.style.display = "block";
        checkForm(); // Remettre bouton gris

        // Retour vue galerie
        const galleryView = document.querySelector("#modal-gallery-view");
        const addView = document.querySelector("#modal-add-view");
        const returnBtn = document.querySelector(".return-modal");
        galleryView.style.display = "block";
        addView.style.display = "none";
        returnBtn.style.display = "none";
      } else {
        alert("Erreur lors de l'ajout du projet.");
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  });
} // <--- FIN DU BLOC IF (TOKEN)

// =================================================== //
// === FONCTIONS OUTILS (En dehors du if) === //
// =================================================== //

function generateModalGallery(works) {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;

    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-trash-can", "delete-icon");

    // Suppression au clic sur la poubelle
    icon.addEventListener("click", async (event) => {
      event.preventDefault();
      if (confirm("Voulez-vous vraiment supprimer ce projet ?")) {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(
            `http://localhost:5678/api/works/${work.id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (response.ok) {
            figure.remove(); // Supprime de la modale
            getWorks(); // Met à jour la page d'accueil
          } else {
            alert("Erreur : impossible de supprimer.");
          }
        } catch (error) {
          console.error("Erreur :", error);
        }
      }
    });

    figure.appendChild(img);
    figure.appendChild(icon);
    modalGallery.appendChild(figure);
  });
}

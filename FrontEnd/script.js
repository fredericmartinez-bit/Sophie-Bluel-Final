const urlApi = "http://localhost:5678/api/works";
const gallery = document.querySelector(".gallery");
let allWorks = []; // On garde les projets en mémoire pour pouvoir les filtrer

// 1. Récupérer les travaux
async function getWorks() {
  const response = await fetch(urlApi);
  allWorks = await response.json(); // On stocke les données dans notre variable
  displayWorks(allWorks); // On affiche tout au départ
}

// 2. Afficher les travaux dans la galerie
function displayWorks(works) {
  gallery.innerHTML = ""; // On vide la galerie avant d'ajouter les éléments
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
  btnAll.classList.add("filter-btn");
  filtersContainer.appendChild(btnAll);

  // Clic sur "Tous" -> On affiche tout
  btnAll.addEventListener("click", () => {
    displayWorks(allWorks);
  });

  // Autres boutons (Catégories)
  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.innerText = category.name;
    btn.classList.add("filter-btn");
    filtersContainer.appendChild(btn);

    // Clic sur une catégorie -> On filtre
    btn.addEventListener("click", () => {
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

const urlApi = "http://localhost:5678/api/works";
const gallery = document.querySelector(".gallery");
let allWorks = [];

// 1. Récupérer les travaux
async function getWorks() {
  try {
    const response = await fetch(urlApi);
    allWorks = await response.json();
    displayWorks(allWorks);
  } catch (error) {
    console.error("Erreur works :", error);
  }
}

function resetActiveBtn() {
  const allBtns = document.querySelectorAll(".filter-btn");
  allBtns.forEach((b) => b.classList.remove("active"));
}

// 2. Afficher les travaux dans la galerie
function displayWorks(works) {
  if (!gallery) return;
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
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();
    displayCategories(categories);
  } catch (error) {
    console.error("Erreur categories :", error);
  }
}

// 4. Afficher les boutons filtres
function displayCategories(categories) {
  const filtersContainer = document.querySelector(".filters");
  if (!filtersContainer) return;

  const btnAll = document.createElement("button");
  btnAll.innerText = "Tous";
  btnAll.classList.add("filter-btn", "active");
  filtersContainer.appendChild(btnAll);

  btnAll.addEventListener("click", () => {
    resetActiveBtn();
    btnAll.classList.add("active");
    displayWorks(allWorks);
  });

  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.innerText = category.name;
    btn.classList.add("filter-btn");
    filtersContainer.appendChild(btn);
    btn.addEventListener("click", () => {
      resetActiveBtn();
      btn.classList.add("active");
      const filteredWorks = allWorks.filter(
        (w) => w.categoryId === category.id,
      );
      displayWorks(filteredWorks);
    });
  });
}

getWorks();
getCategories();

// =================================================== //
// === PARTIE ADMIN === //
// =================================================== //
const token = localStorage.getItem("token");

if (token) {
  const loginLink = document.querySelector("a[href='login.html']");
  if (loginLink) {
    loginLink.innerText = "logout";
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.reload();
    });
  }

  const filters = document.querySelector(".filters");
  if (filters) filters.style.display = "none";

  const body = document.querySelector("body");
  const topBar = document.createElement("div");
  topBar.className = "top-bar";
  topBar.innerHTML = `<p><i class="fa-regular fa-pen-to-square"></i> Mode édition</p>`;
  topBar.style.cssText =
    "background-color:black;color:white;text-align:center;padding:10px;width:100%;";
  body.prepend(topBar);

  const titleProject = document.querySelector("#portfolio h2");
  const editBtn = document.createElement("a");
  editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier';
  editBtn.href = "#";
  editBtn.style.cssText =
    "margin-left:20px;font-size:14px;color:black;text-decoration:none;";
  if (titleProject) titleProject.appendChild(editBtn);

  const modal = document.querySelector("#modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const btnAddPhoto = document.querySelector(".btn-add-photo");
  const returnBtn = document.querySelector(".return-modal");
  const galleryView = document.querySelector("#modal-gallery-view");
  const addView = document.querySelector("#modal-add-view");

  const closeFunc = () => {
    modal.style.display = "none";
    galleryView.style.display = "block";
    addView.style.display = "none";
    if (returnBtn) returnBtn.style.display = "none";
  };

  if (editBtn) {
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      generateModalGallery(allWorks);
      modal.style.display = "flex";
    });
  }

  if (btnAddPhoto) {
    btnAddPhoto.addEventListener("click", () => {
      galleryView.style.display = "none";
      addView.style.display = "block";
      if (returnBtn) returnBtn.style.display = "block";
    });
  }

  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      addView.style.display = "none";
      galleryView.style.display = "block";
      returnBtn.style.display = "none";
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeFunc);
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeFunc();
  });

  // 7. REMPLIR LES CATÉGORIES
  async function fillCategories() {
    const select = document.querySelector("#category");
    if (!select) return;
    try {
      const response = await fetch("http://localhost:5678/api/categories");
      const cats = await response.json();
      select.innerHTML = '<option value=""></option>';
      cats.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.innerText = c.name;
        select.appendChild(opt);
      });
    } catch (err) {
      console.error(err);
    }
  }
  fillCategories();

  // 8. PREVIEW & FORM
  const fileInput = document.querySelector("#photo-upload");
  const imgPreview = document.querySelector("#img-preview");
  const labelUpload = document.querySelector(".btn-upload");
  const iconImage = document.querySelector(".icon-image");
  const pSize = document.querySelector(".add-photo-container p");
  const titleInput = document.querySelector("#title");
  const categorySelect = document.querySelector("#category");
  const btnValidate = document.querySelector(".btn-validate");

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imgPreview.src = e.target.result;
          imgPreview.style.display = "block";
          if (labelUpload) labelUpload.style.display = "none";
          if (iconImage) iconImage.style.display = "none";
          if (pSize) pSize.style.display = "none";
        };
        reader.readAsDataURL(file);
      }
      checkForm();
    });
  }

  function checkForm() {
    if (
      fileInput.files[0] &&
      titleInput.value !== "" &&
      categorySelect.value !== ""
    ) {
      btnValidate.removeAttribute("disabled");
      btnValidate.classList.add("active");
    } else {
      btnValidate.setAttribute("disabled", "true");
      btnValidate.classList.remove("active");
    }
  }

  if (titleInput) titleInput.addEventListener("input", checkForm);
  if (categorySelect) categorySelect.addEventListener("change", checkForm);

  const form = document.querySelector("#add-photo-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData();
      fd.append("image", fileInput.files[0]);
      fd.append("title", titleInput.value);
      fd.append("category", categorySelect.value);
      const res = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        alert("Ajouté !");
        getWorks();
        closeFunc();
        form.reset();
        imgPreview.style.display = "none";
        if (labelUpload) labelUpload.style.display = "block";
        if (iconImage) iconImage.style.display = "block";
        if (pSize) pSize.style.display = "block";
      }
    });
  }
}

function generateModalGallery(works) {
  const modalGallery = document.querySelector(".modal-gallery");
  if (!modalGallery) return;
  modalGallery.innerHTML = "";
  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-trash-can delete-icon";
    icon.onclick = async () => {
      if (confirm("Supprimer ?")) {
        const res = await fetch(`http://localhost:5678/api/works/${work.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          figure.remove();
          getWorks();
        }
      }
    };
    figure.appendChild(img);
    figure.appendChild(icon);
    modalGallery.appendChild(figure);
  });
}

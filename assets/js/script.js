let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');
// const FORM_URL = import.meta.env.VITE_FORMSPREE_URL;

menuIcon.onclick = () => {
  menuIcon.classList.toggle('bx-x');
  navbar.classList.toggle('active');
};

document.querySelectorAll('.navbar a').forEach(link => {
  link.onclick = () => {
    navbar.classList.remove('active');
    menuIcon.classList.remove('bx-x');
  };
});

document.getElementById('contact-btn').addEventListener('click', () => {
  document.querySelector('#contact').scrollIntoView({
    behavior: 'smooth'
  });
});

const form = document.querySelector('form');

const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const emailError = document.getElementById("email-error");
const phoneError = document.getElementById("phone-error");

// Handle the contact form without a full page reload.
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  let isValid = true;

  // Clear previous validation messages.
  emailError.textContent = "";
  phoneError.textContent = "";

  // Require at least one contact method.
  if (!email && !phone) {
    emailError.textContent = "Please provide at least an Email or a Phone number.";
    phoneError.textContent = "Please provide at least an Email or a Phone number.";
    isValid = false;
  }

  // Validate email format when provided.
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.textContent = "Invalid email address format.";
    isValid = false;
  }

  // Validate phone number when provided.
  if (phone && !/^[0-9]{8,15}$/.test(phone)) {
    phoneError.textContent = "Phone number must be between 8 and 15 digits.";
    isValid = false;
  }

  // Stop before submitting invalid data.
  if (!isValid) return;

  // Submit to Formspree via AJAX.
  try {
    const response = await fetch("https://formspree.io/f/mojzqaeq", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    });

    if (response.ok) {
      showToast("Message sent successfully!", "success");
      form.reset();
    } else {
      showToast("Something went wrong. Please try again later.", "error");
    }
  } catch (error) {
    showToast("Network error. Please check your connection.", "error");
  }
});

// Clear field-level errors while typing.
[emailInput, phoneInput].forEach(input => {
  input.addEventListener("input", () => {
    document.getElementById(input.id + "-error").textContent = "";
  });
});

// Lightweight toast notification.
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = `toast ${type}`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function viewProject(url) {
  if (url) {
    window.location.href = url;
  } else {
    alert("Project link is being updated!");
  }
}

const projectGalleryManifest = window.PROJECT_GALLERIES || {};
const autoProjectGalleries = document.querySelectorAll("[data-project-gallery]");

autoProjectGalleries.forEach((galleryRoot) => {
  const projectKey = galleryRoot.dataset.projectGallery;
  const galleryItems = projectGalleryManifest[projectKey];
  const galleryContainer = galleryRoot.querySelector("[data-project-gallery-items]");

  if (!galleryContainer || !Array.isArray(galleryItems) || galleryItems.length === 0) {
    return;
  }

  galleryContainer.innerHTML = "";
  galleryContainer.classList.toggle("auto-project-gallery--single", galleryItems.length === 1);

  galleryItems.forEach((item) => {
    const galleryItem = document.createElement("div");
    galleryItem.className = "auto-project-gallery-item";

    const image = document.createElement("img");
    image.className = "auto-project-gallery-thumb";
    image.src = item.src;
    image.alt = item.alt;

    galleryItem.appendChild(image);
    galleryContainer.appendChild(galleryItem);
  });
});

const thesisGalleryItems = document.querySelectorAll(".thesis-gallery-item");
const thesisLightbox = document.querySelector(".thesis-lightbox");

if (thesisGalleryItems.length && thesisLightbox) {
  const thesisLightboxImg = thesisLightbox.querySelector(".thesis-lightbox-img");
  const thesisLightboxCaption = thesisLightbox.querySelector(".thesis-lightbox-caption");
  const thesisLightboxClose = thesisLightbox.querySelector(".thesis-lightbox-close");
  let thesisLastTrigger = null;

  const closeThesisLightbox = () => {
    thesisLightbox.classList.remove("is-open");
    thesisLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("thesis-lightbox-open");
    thesisLightboxImg.removeAttribute("src");
    thesisLightboxImg.alt = "";
    thesisLightboxCaption.textContent = "";

    if (thesisLastTrigger) {
      thesisLastTrigger.focus();
      thesisLastTrigger = null;
    }
  };

  const openThesisLightbox = (trigger) => {
    thesisLastTrigger = trigger;
    thesisLightboxImg.src = trigger.dataset.thesisFull;
    thesisLightboxImg.alt = trigger.dataset.thesisAlt || "";
    thesisLightboxCaption.textContent = trigger.dataset.thesisAlt || "";
    thesisLightbox.classList.add("is-open");
    thesisLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("thesis-lightbox-open");
    thesisLightboxClose.focus();
  };

  thesisGalleryItems.forEach((item) => {
    item.addEventListener("click", () => openThesisLightbox(item));
  });

  thesisLightboxClose.addEventListener("click", closeThesisLightbox);

  thesisLightbox.addEventListener("click", (event) => {
    if (event.target === thesisLightbox) {
      closeThesisLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && thesisLightbox.classList.contains("is-open")) {
      closeThesisLightbox();
    }
  });
}

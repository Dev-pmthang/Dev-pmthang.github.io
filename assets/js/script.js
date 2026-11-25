// =============================================================
// Profile Data Source — fetched from GitHub then rendered
// =============================================================

const PROFILE_URL =
  "https://raw.githubusercontent.com/Dev-pmthang/profile-devmt/master/assets/data/profile.json";

// Fallback: local copy used when the GitHub fetch fails (e.g. offline)
const PROFILE_LOCAL_URL = "assets/data/profile.json";

// =============================================================
// Fetch profile data with fallback
// =============================================================
async function fetchProfileData() {
  try {
    const res = await fetch(PROFILE_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("GitHub fetch failed, trying local fallback…", err);
    try {
      const res = await fetch(PROFILE_LOCAL_URL);
      if (!res.ok) throw new Error(`Local ${res.status}`);
      return await res.json();
    } catch (localErr) {
      console.error("Both profile sources failed", localErr);
      return null;
    }
  }
}

// =============================================================
// Rendering helpers
// =============================================================

function renderSocialLink(link) {
  if (link.type === "image") {
    return `<a href="${link.url}" target="_blank" rel="noopener noreferrer"${link.label ? ` aria-label="${link.label}"` : ""}>
      <img src="${link.icon}" alt="" class="${link.imageClass || ""}" aria-hidden="true">
    </a>`;
  }
  return `<a href="${link.url}" target="_blank" rel="noopener noreferrer">
    <i class="${link.icon}"></i>
  </a>`;
}

function renderHeader(data) {
  const h = data.header;
  const navLinks = h.nav.map(n => `<a href="${n.href}">${n.label}</a>`).join("\n");
  document.getElementById("header-root").innerHTML = `
    <a href="#home" class="logo">
      ${h.logo.prefix} <span>${h.logo.name}</span>
    </a>
    <i class="bx bx-menu" id="menu-icon"></i>
    <nav class="navbar">
      ${navLinks}
    </nav>
    <button class="gradient-btn" id="contact-btn">${h.contactButtonText}</button>
  `;
}

function renderHero(data) {
  const hero = data.hero;
  const factsHTML = hero.facts.map(f => `
    <div class="home-fact">
      <div class="home-fact-icon">
        <i class="${f.icon}"></i>
      </div>
      <p>${f.label ? `<span class="home-fact-label">${f.label}</span> ` : ""}${f.text}</p>
    </div>
  `).join("");

  const socialHTML = hero.socialLinks.map(renderSocialLink).join("\n");

  const buttonsHTML = hero.buttons.map(b =>
    `<a href="${b.href}" class="btn"${b.target ? ` target="${b.target}"` : ""}>${b.label}</a>`
  ).join("\n");

  document.getElementById("home").innerHTML = `
    <div class="home-content">
      <div class="hero-copy">
        <div class="hero-badge">
          <i class="${hero.badge.icon}"></i>
          <span>${hero.badge.text}</span>
        </div>
        <h1>${hero.greeting} <span class="hero-name-nowrap">${hero.name.replace(" ", "&nbsp;")}</span></h1>
        <h3>${hero.rolePrefix} <strong class="hero-role-nowrap"><span>${hero.roleHighlight}</span>&nbsp;${hero.roleSuffix}</strong></h3>
      </div>
      <div class="hero-panel">
        <div class="home-facts">
          ${factsHTML}
        </div>
        <div class="hero-actions">
          <div class="social-icons">
            ${socialHTML}
          </div>
          <div class="btn-group">
            ${buttonsHTML}
          </div>
        </div>
      </div>
    </div>
    <div class="home-visual">
      <span class="home-visual-grid" aria-hidden="true"></span>
      <span class="home-visual-orbit home-visual-orbit--outer" aria-hidden="true"></span>
      <span class="home-visual-orbit home-visual-orbit--inner" aria-hidden="true"></span>
      <div class="home-img">
        <span class="home-img-frame home-img-frame--orange" aria-hidden="true"></span>
        <span class="home-img-frame home-img-frame--cyan" aria-hidden="true"></span>
        <span class="home-img-corner home-img-corner--tl" aria-hidden="true"></span>
        <span class="home-img-corner home-img-corner--tr" aria-hidden="true"></span>
        <span class="home-img-corner home-img-corner--bl" aria-hidden="true"></span>
        <span class="home-img-corner home-img-corner--br" aria-hidden="true"></span>
        <span class="home-img-accent home-img-accent--top" aria-hidden="true"></span>
        <span class="home-img-accent home-img-accent--bottom" aria-hidden="true"></span>
        <span class="home-img-tint" aria-hidden="true"></span>
        <img src="${hero.image.src}" alt="${hero.image.alt}">
      </div>
    </div>
  `;
}

function renderAbout(data) {
  const a = data.about;
  document.getElementById("about").innerHTML = `
    <div class="about-img">
      <img src="${a.image.src}" alt="${a.image.alt}">
    </div>
    <div class="about-content">
      <h2>${a.title.text} <span>${a.title.highlight}</span></h2>
      <p>${a.description}</p>
      <a href="${a.buttonHref}" class="btn">${a.buttonText}</a>
    </div>
  `;
}

function renderServices(data) {
  const s = data.services;
  const boxes = s.items.map(item => `
    <div class="service-box">
      <div class="service-info">
        <i class="${item.icon}"></i>
        <h4>${item.title}</h4>
        <p>${item.description}</p>
      </div>
    </div>
  `).join("");

  document.getElementById("services").innerHTML = `
    <h2 class="heading">${s.heading}</h2>
    <div class="services-container">
      ${boxes}
    </div>
  `;
}

function renderTechnicalStack(data) {
  const ts = data.technicalStack;
  const categories = ts.categories.map(cat => `
    <div class="tech-category">
      <h3><i class="${cat.icon}"></i> ${cat.title}</h3>
      <div class="tech-items">
        ${cat.items.map(item => `<span class="tech-item">${item}</span>`).join("\n")}
      </div>
    </div>
  `).join("");

  document.getElementById("technical-stack").innerHTML = `
    <h2 class="heading">${ts.heading.text} <span>${ts.heading.highlight}</span></h2>
    <div class="tech-grid-container">
      ${categories}
    </div>
  `;
}

function renderProjectGallery(project) {
  if (project.galleryType === "thesis") {
    const imgs = (project.galleryImages || []).map(img => `
      <button class="thesis-gallery-item thesis-gallery-item--${img.layout}" type="button"
        data-thesis-full="${img.src}"
        data-thesis-alt="${img.alt}"
        aria-label="Open image preview: ${img.alt}">
        <img src="${img.src}" alt="${img.alt}" class="thesis-gallery-thumb">
      </button>
    `).join("");
    return `<div class="project-media-gallery project-media-gallery--thesis">
      <div class="thesis-gallery">${imgs}</div>
    </div>`;
  }

  // Auto gallery (single or multi)
  const fallback = (project.fallbackImages || []).map(img => `
    <div class="auto-project-gallery-item">
      <img src="${img.src}" alt="${img.alt}" class="auto-project-gallery-thumb">
    </div>
  `).join("");

  const singleClass = project.galleryMode === "single" ? " auto-project-gallery--single" : "";
  return `<div class="project-media-gallery project-media-gallery--auto"
    data-project-gallery="${project.galleryKey}">
    <div class="auto-project-gallery${singleClass}" data-project-gallery-items>
      ${fallback}
    </div>
  </div>`;
}

function renderProjects(data) {
  const p = data.projects;
  const rows = p.items.map(project => {
    const descHTML = project.description.map(d => `<p>${d}</p>`).join("\n");
    const tagsHTML = project.techStack.map(t => `<span>${t}</span>`).join("\n");

    return `
      <div class="project-row">
        ${renderProjectGallery(project)}
        <div class="project-content">
          <div class="project-title">${project.title}</div>
          <div class="project-summary">${project.summary}</div>
          <div class="project-description">
            ${descHTML}
          </div>
          <div class="tech-stack">
            <span class="tech-label">Technology & Engineering:</span>
            <div class="tags">
              ${tagsHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("\n");

  document.getElementById("projects").innerHTML = `
    <h2 class="heading">${p.heading}</h2>
    <div class="projects-container-custom">
      ${rows}
    </div>
    <div class="thesis-lightbox" id="thesis-lightbox" aria-hidden="true" role="dialog" aria-modal="true"
      aria-label="Graduation Thesis image preview">
      <div class="thesis-lightbox-panel">
        <button class="thesis-lightbox-close" type="button" aria-label="Close image preview">&times;</button>
        <img src="" alt="" class="thesis-lightbox-img">
        <p class="thesis-lightbox-caption"></p>
      </div>
    </div>
  `;
}

function renderContact(data) {
  const c = data.contact;
  const detailsHTML = c.infoCard.details.map(d => {
    const inner = `
      <span class="contact-detail-icon"><i class="${d.icon}"></i></span>
      <span class="contact-detail-text">
        <span class="contact-detail-label">${d.label}</span>
        <span class="contact-detail-value">${d.value}</span>
      </span>
    `;
    if (d.type === "link") {
      return `<a href="${d.href}" class="contact-detail">${inner}</a>`;
    }
    return `<div class="contact-detail">${inner}</div>`;
  }).join("\n");

  document.getElementById("contact").innerHTML = `
    <h2 class="heading">${c.heading.text} <span>${c.heading.highlight}</span></h2>
    <div class="contact-layout">
      <div class="contact-info-card">
        <div class="contact-card-heading">
          <span class="contact-badge">
            <i class="${c.infoCard.badge.icon}"></i>
            ${c.infoCard.badge.text}
          </span>
          <h3>${c.infoCard.title}</h3>
        </div>
        <p class="contact-info-role">${c.infoCard.role}</p>
        <p class="contact-info-desc">${c.infoCard.description}</p>
        <div class="contact-details">
          ${detailsHTML}
        </div>
      </div>

      <div class="contact-form-card">
        <div class="contact-card-heading">
          <span class="contact-badge">
            <i class="${c.formCard.badge.icon}"></i>
            ${c.formCard.badge.text}
          </span>
          <h3>${c.formCard.title}</h3>
        </div>
        <p class="contact-form-desc">${c.formCard.description}</p>
        <form id="contact-form" data-formspree="${c.formCard.formspreeUrl}">
          <div class="form-row">
            <div class="form-field">
              <input type="text" name="name" placeholder="Full Name" required>
            </div>
            <div class="form-field">
              <input type="number" name="phone" id="phone" placeholder="Phone Number" class="input-phone">
              <small class="error-message" id="phone-error"></small>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <input type="email" name="email" id="email" placeholder="Email">
              <small class="error-message" id="email-error"></small>
            </div>
            <div class="form-field">
              <input type="text" name="subject" placeholder="Subject">
            </div>
          </div>
          <div class="form-field">
            <textarea name="message" placeholder="Your Message" required></textarea>
          </div>
          <input type="submit" value="Send Message" class="btn">
        </form>
      </div>
    </div>
  `;
}

function renderFooter(data) {
  const f = data.footer;
  const socialHTML = f.socialLinks.map(renderSocialLink).join("\n");
  const linksHTML = f.links.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join("\n");

  document.getElementById("footer-root").innerHTML = `
    <div class="social-icons">
      ${socialHTML}
    </div>
    <ul class="list">
      ${linksHTML}
    </ul>
    <p class="copyright">${f.copyright}</p>
  `;
}

// =============================================================
// Main render pipeline
// =============================================================
function renderAll(data) {
  renderHeader(data);
  renderHero(data);
  renderAbout(data);
  renderServices(data);
  renderTechnicalStack(data);
  renderProjects(data);
  renderContact(data);
  renderFooter(data);
}

// =============================================================
// Post-render: bind interactive behaviors
// =============================================================
function bindInteractions(data) {
  // ---- Mobile menu toggle ----
  const menuIcon = document.querySelector("#menu-icon");
  const navbar = document.querySelector(".navbar");
  if (menuIcon && navbar) {
    menuIcon.onclick = () => {
      menuIcon.classList.toggle("bx-x");
      navbar.classList.toggle("active");
    };
    document.querySelectorAll(".navbar a").forEach(link => {
      link.onclick = () => {
        navbar.classList.remove("active");
        menuIcon.classList.remove("bx-x");
      };
    });
  }

  // ---- Contact button smooth scroll ----
  const contactBtn = document.getElementById("contact-btn");
  if (contactBtn) {
    contactBtn.addEventListener("click", () => {
      document.querySelector("#contact").scrollIntoView({ behavior: "smooth" });
    });
  }

  // ---- Contact form submission ----
  const form = document.getElementById("contact-form");
  if (form) {
    const formspreeUrl = form.dataset.formspree || "https://formspree.io/f/mojzqaeq";
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const emailError = document.getElementById("email-error");
    const phoneError = document.getElementById("phone-error");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      let isValid = true;

      emailError.textContent = "";
      phoneError.textContent = "";

      if (!email && !phone) {
        emailError.textContent = "Please provide at least an Email or a Phone number.";
        phoneError.textContent = "Please provide at least an Email or a Phone number.";
        isValid = false;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = "Invalid email address format.";
        isValid = false;
      }
      if (phone && !/^[0-9]{8,15}$/.test(phone)) {
        phoneError.textContent = "Phone number must be between 8 and 15 digits.";
        isValid = false;
      }
      if (!isValid) return;

      try {
        const response = await fetch(formspreeUrl, {
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

    [emailInput, phoneInput].forEach(input => {
      input.addEventListener("input", () => {
        document.getElementById(input.id + "-error").textContent = "";
      });
    });
  }

  // ---- Auto project galleries ----
  renderAutoProjectGalleries();

  // ---- Thesis / project lightbox ----
  bindProjectLightboxTriggers();
}

// =============================================================
// Toast notification
// =============================================================
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

// =============================================================
// Auto project gallery renderer (uses project-galleries.js data)
// =============================================================
function renderAutoProjectGalleries() {
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
      galleryItem.tabIndex = 0;
      galleryItem.setAttribute("role", "button");
      galleryItem.setAttribute("aria-label", `Open image preview: ${item.alt || "Project image"}`);
      galleryItem.dataset.lightboxFull = item.src;
      galleryItem.dataset.lightboxAlt = item.alt || "";

      const image = document.createElement("img");
      image.className = "auto-project-gallery-thumb";
      image.src = item.src;
      image.alt = item.alt || "";
      image.loading = "lazy";

      galleryItem.appendChild(image);
      galleryContainer.appendChild(galleryItem);
    });
  });

  bindProjectLightboxTriggers();
}

// =============================================================
// Project / Thesis lightbox
// =============================================================
let projectLightboxLastTrigger = null;

function getProjectLightboxElements() {
  const lightbox = document.querySelector(".thesis-lightbox");
  if (!lightbox) return null;
  const image = lightbox.querySelector(".thesis-lightbox-img");
  const caption = lightbox.querySelector(".thesis-lightbox-caption");
  const closeButton = lightbox.querySelector(".thesis-lightbox-close");
  if (!image || !caption || !closeButton) return null;
  return { lightbox, image, caption, closeButton };
}

function getProjectLightboxPayload(trigger) {
  const source = trigger.dataset.thesisFull || trigger.dataset.lightboxFull;
  const alt = trigger.dataset.thesisAlt || trigger.dataset.lightboxAlt || trigger.querySelector("img")?.alt || "";
  if (!source) return null;
  return { source, alt };
}

const closeThesisLightbox = () => {
  const elements = getProjectLightboxElements();
  const thesisLightbox = document.querySelector(".thesis-lightbox");
  if (!elements || !thesisLightbox) return;

  thesisLightbox.classList.remove("is-open");
  thesisLightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("thesis-lightbox-open");
  elements.image.removeAttribute("src");
  elements.image.alt = "";
  elements.caption.textContent = "";

  if (projectLightboxLastTrigger) {
    projectLightboxLastTrigger.focus();
    projectLightboxLastTrigger = null;
  }
};

const openThesisLightbox = (trigger) => {
  const elements = getProjectLightboxElements();
  const payload = getProjectLightboxPayload(trigger);
  const thesisLightbox = document.querySelector(".thesis-lightbox");
  if (!elements || !payload || !thesisLightbox) return;

  projectLightboxLastTrigger = trigger;
  elements.image.src = payload.source;
  elements.image.alt = payload.alt;
  elements.caption.textContent = payload.alt;
  thesisLightbox.classList.add("is-open");
  thesisLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("thesis-lightbox-open");
  elements.closeButton.focus();
};

function bindProjectLightboxTrigger(trigger) {
  if (trigger.dataset.lightboxBound === "true") return;
  if (!getProjectLightboxPayload(trigger)) return;

  trigger.dataset.lightboxBound = "true";
  trigger.addEventListener("click", () => openThesisLightbox(trigger));

  if (trigger.tagName !== "BUTTON") {
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openThesisLightbox(trigger);
      }
    });
  }
}

function bindProjectLightboxTriggers() {
  const elements = getProjectLightboxElements();
  if (!elements) return;

  document
    .querySelectorAll(".thesis-gallery-item, .auto-project-gallery-item[data-lightbox-full]")
    .forEach(bindProjectLightboxTrigger);

  if (elements.lightbox.dataset.lightboxInitialized === "true") return;

  elements.lightbox.dataset.lightboxInitialized = "true";
  elements.closeButton.addEventListener("click", closeThesisLightbox);

  elements.lightbox.addEventListener("click", (event) => {
    if (event.target === elements.lightbox) closeThesisLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.lightbox.classList.contains("is-open")) {
      closeThesisLightbox();
    }
  });
}

// =============================================================
// Bootstrap
// =============================================================
(async function init() {
  const data = await fetchProfileData();

  const loadingEl = document.getElementById("profile-loading");
  const errorEl = document.getElementById("profile-error");

  if (!data) {
    loadingEl.style.display = "none";
    errorEl.style.display = "block";
    return;
  }

  // Render all sections from JSON data
  renderAll(data);

  // Hide loading, show content
  loadingEl.style.display = "none";

  // Bind all interactive behaviors after DOM is populated
  bindInteractions(data);
})();

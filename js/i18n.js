/**
 * Localization Manager
 * Handles language switching and DOM updates (text, HTML, and attributes)
 */
const i18n = {
  lng: localStorage.getItem("lng") || (navigator.language.startsWith("vi") ? "vi" : "en"),
  translations: {},

  async init() {
    await this.loadTranslations(this.lng);
    this.updateDOM();
    this.updateActiveBtn();
    this.bindEvents();
  },

  async loadTranslations(lng) {
    try {
      const response = await fetch(`./locales/${lng}.json`);
      this.translations = await response.json();
    } catch (error) {
      console.error("Translation error:", error);
    }
  },

  bindEvents() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.onclick = (e) => this.changeLanguage(e.target.getAttribute("data-lang"));
    });
  },

  async changeLanguage(lng) {
    if (this.lng === lng) return;
    this.lng = lng;
    localStorage.setItem("lng", lng);
    await this.loadTranslations(lng);
    this.updateDOM();
    this.updateActiveBtn();
  },

  updateDOM() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = this.translations[key];

      if (!value) return;

      // Handle lists (Experience tasks, Courses)
      if (Array.isArray(value)) {
        this.renderList(el, value);
        return;
      }

      // Handle attributes
      const attr = el.getAttribute("data-i18n-attr");
      if (attr) {
        if (attr === "href") {
          if (key.includes("phone")) el.setAttribute(attr, `tel:${value.replace(/\s/g, '')}`);
          else if (key.includes("email")) el.setAttribute(attr, `mailto:${value}`);
          else el.setAttribute(attr, value);
        } else {
          el.setAttribute(attr, value);
        }
      }

      // Update data-copy attribute if present
      if (el.hasAttribute("data-copy")) {
        el.setAttribute("data-copy", value);
      }

      // Handle content
      // Skip content update if it's a copy-click element (to preserve inner HTML icons)
      const isCopyBtn = el.classList.contains("copy-click");

      if (!attr && !isCopyBtn) {
        if (value.includes("<") || el.tagName === "DIV" || el.tagName === "P") {
          el.innerHTML = value;
        } else {
          el.textContent = value;
        }
      }
    });

    if (this.translations.page_title) document.title = this.translations.page_title;
    document.documentElement.lang = this.lng;
  },

  renderList(container, items) {
    if (container.tagName === "UL") {
      container.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
    } else if (container.classList.contains("edu-courses")) {
      const title = container.querySelector(".edu-courses-title");
      let html = title ? title.outerHTML : "";
      html += items.map((item) => `<span class="course-chip">${item}</span>`).join("");
      container.innerHTML = html;
    }
  },

  updateActiveBtn() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === this.lng);
    });
  },
};

document.addEventListener("DOMContentLoaded", () => i18n.init());

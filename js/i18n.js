/**
 * Localization Manager
 * Handles language switching and DOM updates based on translation files
 */
const i18n = {
  lng:
    localStorage.getItem("lng") ||
    (navigator.language.startsWith("vi") ? "vi" : "en"),
  translations: {},

  /**
   * Initialize localization
   */
  async init() {
    await this.loadTranslations(this.lng);
    this.updateDOM();
    this.updateActiveBtn();
    this.bindEvents();
  },

  /**
   * Fetch translation JSON
   * @param {string} lng Language code
   */
  async loadTranslations(lng) {
    try {
      const response = await fetch(`./locales/${lng}.json`);
      this.translations = await response.json();
    } catch (error) {
      console.error("Translation error:", error);
    }
  },

  /**
   * Bind language switcher buttons
   */
  bindEvents() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.onclick = (e) =>
        this.changeLanguage(e.target.getAttribute("data-lang"));
    });
  },

  /**
   * Switch language and persist preference
   * @param {string} lng Language code
   */
  async changeLanguage(lng) {
    if (this.lng === lng) return;
    this.lng = lng;
    localStorage.setItem("lng", lng);
    await this.loadTranslations(lng);
    this.updateDOM();
    this.updateActiveBtn();
  },

  /**
   * Update all elements with data-i18n attribute
   */
  updateDOM() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = this.translations[key];

      if (!value) return;

      if (Array.isArray(value)) {
        this.renderList(el, value);
      } else {
        if (value.includes("<")) {
          el.innerHTML = value;
        } else {
          el.textContent = value;
        }
      }
    });

    // Update meta information
    if (this.translations.page_title) {
      document.title = this.translations.page_title;
    }
    document.documentElement.lang = this.lng;
  },

  /**
   * Render list content for specific containers
   * @param {HTMLElement} container Container element
   * @param {Array} items List of translation strings
   */
  renderList(container, items) {
    if (container.tagName === "UL") {
      container.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
    } else if (container.classList.contains("edu-courses")) {
      const title = container.querySelector(".edu-courses-title");
      let html = title ? title.outerHTML : "";
      html += items
        .map((item) => `<span class="course-chip">${item}</span>`)
        .join("");
      container.innerHTML = html;
    }
  },

  /**
   * Update active state of language buttons
   */
  updateActiveBtn() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.getAttribute("data-lang") === this.lng,
      );
    });
  },
};

// Start localization on DOM ready
document.addEventListener("DOMContentLoaded", () => i18n.init());

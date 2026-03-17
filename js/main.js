/**
 * Scroll Animations using Intersection Observer
 */
const initAnimations = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.exp-item, .skill-block, .cert-card, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Stagger animations for blocks
  document.querySelectorAll('.skill-block').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.08) + 's';
  });

  document.querySelectorAll('.cert-card').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.1) + 's';
  });
};

/**
 * Smooth Scrolling with Lenis library
 */
const initSmoothScroll = () => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Link Lenis to anchor navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        lenis.scrollTo(targetElement);
      }
    });
  });
};

/**
 * Page Loader management
 */
const initLoader = () => {
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
      // Delay to ensure the intro animation is visible
      setTimeout(() => {
        loader.classList.add('loaded');
        document.body.classList.remove('loading');
        
        // Remove loader from DOM after transition
        setTimeout(() => {
          loader.remove();
        }, 1000);
      }, 1600);
    }
  });
};

// Initialize all features on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initSmoothScroll();
  initLoader();
});

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  const sections = document.querySelectorAll("main section[id]");
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");
  const header = document.getElementById("site-header");

  if (navLinks.length === 0 && sections.length === 0) {
    return;
  }

  /* =========================================
     SCROLL SUAVE PARA ENLACES INTERNOS
  ========================================= */
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (!targetSection) return;

      event.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition =
        targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      if (mainNav && menuToggle && window.innerWidth <= 992) {
        mainNav.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-label", "Abrir menú");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* =========================================
     ENLACE ACTIVO SEGÚN LA SECCIÓN VISIBLE
  ========================================= */
  const setActiveLink = () => {
    if (sections.length === 0 || navLinks.length === 0) return;

    const scrollPosition = window.scrollY + (header ? header.offsetHeight + 120 : 120);

    let currentSectionId = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        currentSectionId = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active-link");

      const href = link.getAttribute("href");
      if (href === `#${currentSectionId}`) {
        link.classList.add("active-link");
      }
    });
  };

  setActiveLink();
  window.addEventListener("scroll", setActiveLink, { passive: true });
});
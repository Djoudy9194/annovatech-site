document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  const sections = document.querySelectorAll("main section[id]");
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");
  const header = document.getElementById("site-header");

  if (navLinks.length === 0 && sections.length === 0) {
    return;
  }

  const setActiveLink = (currentSectionId) => {
    navLinks.forEach((link) => {
      link.classList.remove("active-link");

      const href = link.getAttribute("href");
      if (href === `#${currentSectionId}`) {
        link.classList.add("active-link");
      }
    });
  };

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
  if (sections.length === 0 || navLinks.length === 0) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    const firstSection = sections[0];
    if (firstSection) {
      setActiveLink(firstSection.getAttribute("id") || "");
    }
    return;
  }

  const activeSections = new Map();
  const headerOffset = header ? header.offsetHeight + 24 : 24;

  const syncMostVisibleSection = () => {
    if (activeSections.size === 0) {
      return;
    }

    const sortedSections = Array.from(activeSections.values()).sort((left, right) => {
      if (right.intersectionRatio !== left.intersectionRatio) {
        return right.intersectionRatio - left.intersectionRatio;
      }

      return left.boundingClientRect.top - right.boundingClientRect.top;
    });

    const currentSection = sortedSections[0]?.target;
    if (currentSection?.id) {
      setActiveLink(currentSection.id);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSections.set(entry.target.id, entry);
        } else {
          activeSections.delete(entry.target.id);
        }
      });

      syncMostVisibleSection();
    },
    {
      rootMargin: `-${headerOffset}px 0px -55% 0px`,
      threshold: [0.2, 0.4, 0.6, 0.8],
    }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });

  const initialSection = sections[0];
  if (initialSection?.id) {
    setActiveLink(initialSection.id);
  }
});
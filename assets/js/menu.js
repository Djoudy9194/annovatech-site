const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");
const header = document.getElementById("site-header");

if (header) {
  let isTicking = false;
  let lastScrolledState = null;

  const syncHeaderState = () => {
    isTicking = false;

    const nextScrolledState = window.scrollY > 30;
    if (nextScrolledState === lastScrolledState) {
      return;
    }

    lastScrolledState = nextScrolledState;
    header.classList.toggle("scrolled", nextScrolledState);
  };

  const requestHeaderSync = () => {
    if (isTicking) {
      return;
    }

    isTicking = true;
    window.requestAnimationFrame(syncHeaderState);
  };

  syncHeaderState();
  window.addEventListener("scroll", requestHeaderSync, { passive: true });
}

if (menuToggle && mainNav) {
  const navLinks = mainNav.querySelectorAll("a");
  const desktopMediaQuery = window.matchMedia("(min-width: 993px)");

  const toggleMenu = () => {
    mainNav.classList.toggle("active");
    menuToggle.classList.toggle("active");

    const isOpen = mainNav.classList.contains("active");
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  const closeMenu = () => {
    mainNav.classList.remove("active");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNav = mainNav.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideNav && !clickedToggle) {
      closeMenu();
    }
  });

  const handleDesktopChange = (event) => {
    if (event.matches) {
      closeMenu();
    }
  };

  if (typeof desktopMediaQuery.addEventListener === "function") {
    desktopMediaQuery.addEventListener("change", handleDesktopChange);
  } else {
    desktopMediaQuery.addListener(handleDesktopChange);
  }
}
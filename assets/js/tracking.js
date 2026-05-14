(function () {
  window.dataLayer = window.dataLayer || [];

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getSectionName(target) {
    const section = target.closest("section[id]");
    return section ? section.id : "global";
  }

  function getTargetLabel(target) {
    return normalizeText(
      target.dataset.trackLabel ||
        target.getAttribute("aria-label") ||
        target.textContent ||
        target.getAttribute("title") ||
        target.getAttribute("href") ||
        target.id ||
        "interaccion"
    );
  }

  function getDestination(target) {
    if (target.tagName === "A") {
      return normalizeText(target.getAttribute("href"));
    }

    return normalizeText(target.dataset.trackDestination || window.location.pathname);
  }

  function pushEvent(eventName, detail) {
    if (!eventName) return;

    window.dataLayer.push({
      event: eventName,
      page_path: window.location.pathname,
      page_title: document.title,
      ...detail,
    });
  }

  window.ANNOVA_TRACKING = {
    pushEvent,
  };

  document.addEventListener("click", (event) => {
    const target = event.target.closest("a, button");

    if (!target) return;
    if (target.tagName === "BUTTON" && target.type === "submit") return;

    const href = target.tagName === "A" ? target.getAttribute("href") || "" : "";
    let eventName = target.dataset.trackEvent || "";

    if (!eventName && href.includes("wa.me/")) {
      eventName = "whatsapp_click";
    }

    if (!eventName && target.classList.contains("btn") && href && href !== "#") {
      eventName = "cta_click";
    }

    if (!eventName) return;

    pushEvent(eventName, {
      element_label: getTargetLabel(target),
      element_destination: getDestination(target),
      element_section: getSectionName(target),
    });
  });
})();
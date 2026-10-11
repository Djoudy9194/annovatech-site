
(() => {
  "use strict";

  function initializeCustomSelect(select) {
    if (select.dataset.customSelectInitialized === "true") return;

    const group = select.closest(".form-group");
    const label = group?.querySelector(`label[for="${select.id}"]`);

    if (!group || !label || !select.id) return;

    const options = Array.from(select.options);

    if (!options.length) return;

    const wrapper = document.createElement("div");
    wrapper.className = "annova-select";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "annova-select__trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    const list = document.createElement("div");
    list.className = "annova-select__list";
    list.id = `${select.id}-options`;
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", label.textContent.trim());
    list.hidden = true;

    trigger.setAttribute("aria-controls", list.id);

    if (!label.id) {
      label.id = `${select.id}-label`;
    }

    const valueId = `${select.id}-selected-value`;
    const valueText = document.createElement("span");
    valueText.id = valueId;

    trigger.setAttribute(
      "aria-labelledby",
      `${label.id} ${valueId}`
    );

    // Abrir el selector personalizado al pulsar su etiqueta.
label.addEventListener("click", (event) => {
  event.preventDefault();
  trigger.click();
});
    const items = [];
    let activeIndex = Math.max(0, select.selectedIndex);

    function isDisabled(index) {
      return Boolean(options[index]?.disabled);
    }

    function syncSelection() {
      const selectedIndex = Math.max(0, select.selectedIndex);

      valueText.textContent =
        options[selectedIndex]?.textContent.trim() ||
        "Selecciona una opción";

      items.forEach((item, index) => {
        item.setAttribute(
          "aria-selected",
          String(index === selectedIndex)
        );
      });

      wrapper.classList.toggle("is-placeholder", !select.value);

      const hasError = select.classList.contains("input-error");
      const hasSuccess = select.classList.contains("input-success");

      wrapper.classList.toggle("input-error", hasError);
      wrapper.classList.toggle("input-success", hasSuccess);

      trigger.setAttribute("aria-invalid", String(hasError));

      const errorMessage = group.querySelector(
        ".input-message.error-message"
      );

      if (errorMessage) {
        if (!errorMessage.id) {
          errorMessage.id = `${select.id}-error`;
        }

        trigger.setAttribute(
          "aria-describedby",
          errorMessage.id
        );
      } else {
        trigger.removeAttribute("aria-describedby");
      }
    }

    function closeList(restoreFocus = false) {
      if (list.hidden) return;

      list.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      wrapper.classList.remove("is-open");

      if (restoreFocus) trigger.focus();
    }

    function focusOption(index) {
      if (!items.length) return;

      let next = index;
      const direction = index < activeIndex ? -1 : 1;

      for (let attempts = 0; attempts < items.length; attempts++) {
        next = (next + items.length) % items.length;

        if (!isDisabled(next)) {
          activeIndex = next;
          items[next].focus();
          return;
        }

        next += direction;
      }
    }

    function openList(initialIndex = select.selectedIndex) {
      document.querySelectorAll(".annova-select").forEach((other) => {
        if (other !== wrapper) {
          other.dispatchEvent(new Event("annova-close"));
        }
      });

      list.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      wrapper.classList.add("is-open");

      activeIndex = Math.max(0, initialIndex);
      focusOption(activeIndex);
    }

    function choose(index) {
      if (
        index < 0 ||
        index >= options.length ||
        isDisabled(index)
      ) {
        return;
      }

      select.selectedIndex = index;

      select.dispatchEvent(
        new Event("input", { bubbles: true })
      );

      select.dispatchEvent(
        new Event("change", { bubbles: true })
      );

      syncSelection();
      closeList(true);
    }

    options.forEach((option, index) => {
      const item = document.createElement("div");

      item.className = "annova-select__option";
      item.id = `${select.id}-option-${index}`;
      item.setAttribute("role", "option");
      item.setAttribute("tabindex", "-1");
      item.setAttribute("aria-selected", "false");
      item.textContent = option.textContent.trim();

      if (option.disabled) {
        item.setAttribute("aria-disabled", "true");
      }

      item.addEventListener("click", () => choose(index));

      item.addEventListener("keydown", (event) => {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            focusOption(activeIndex + 1);
            break;

          case "ArrowUp":
            event.preventDefault();
            focusOption(activeIndex - 1);
            break;

          case "Home":
            event.preventDefault();
            focusOption(0);
            break;

          case "End":
            event.preventDefault();
            focusOption(items.length - 1);
            break;

          case "Enter":
          case " ":
            event.preventDefault();
            choose(index);
            break;

          case "Escape":
            event.preventDefault();
            closeList(true);
            break;

          case "Tab": {
  event.preventDefault();

  closeList();

  trigger.focus();

  const focusable = Array.from(
    document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => {
    return (
      element.getClientRects().length > 0 &&
      element.getAttribute("aria-hidden") !== "true"
    );
  });

  const currentIndex = focusable.indexOf(trigger);
  const nextIndex = currentIndex + (event.shiftKey ? -1 : 1);

  if (nextIndex >= 0 && nextIndex < focusable.length) {
    focusable[nextIndex].focus();
  }

  break;
}
        }
      });

      items.push(item);
      list.appendChild(item);
    });

    trigger.appendChild(valueText);

    trigger.addEventListener("click", () => {
      if (list.hidden) {
        openList();
      } else {
        closeList();
      }
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeList();
        return;
      }

      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        if (list.hidden) {
          openList();
        }
      }
    });

    wrapper.addEventListener("annova-close", () => closeList());

    wrapper.addEventListener("focusout", (event) => {
      if (!wrapper.contains(event.relatedTarget)) {
        closeList();
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (!wrapper.contains(event.target)) {
        closeList();
      }
    });

    select.addEventListener("change", syncSelection);
    select.addEventListener("annova-validation", syncSelection);

    select.form?.addEventListener("reset", () => {
      closeList();
      requestAnimationFrame(syncSelection);
    });

    select.insertAdjacentElement("afterend", wrapper);
    wrapper.append(trigger, list);

    // El control original conserva su nombre y valor para FormData.
    select.classList.add("annova-select__native");
    select.tabIndex = -1;

    // Evitar que el lector de pantalla anuncie dos controles.
    select.setAttribute("aria-hidden", "true");

    select.dataset.customSelectInitialized = "true";

    syncSelection();
  }

  function initialize() {
    ["service", "budget"].forEach((id) => {
      const select = document.getElementById(id);

      if (select instanceof HTMLSelectElement) {
        initializeCustomSelect(select);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();

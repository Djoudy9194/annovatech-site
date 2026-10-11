function initializeLeadForms() {
  const leadForms = document.querySelectorAll("form[data-lead-form]");

  leadForms.forEach((form) => {
    if (form.dataset.leadFormInitialized === "true") {
      return;
    }

    form.dataset.leadFormInitialized = "true";
    initializeLeadForm(form);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeLeadForms, {
    once: true,
  });
} else {
  initializeLeadForms();
}

function initializeLeadForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  let isSubmitting = false;
  // La validación personalizada sustituye a la nativa
  // únicamente cuando JavaScript inicializa el formulario.
  form.noValidate = true;
  const fields = [
    { input: form.querySelector('[name="nombre"]'), validator: validateName },
    { input: form.querySelector('[name="email"]'), validator: validateEmail },
    {
      input: form.querySelector('[name="telefono"]'),
      validator: validatePhone,
    },
    {
      input: form.querySelector('[name="servicio"]'),
      validator: validateService,
    },
    {
      input: form.querySelector('[name="mensaje"]'),
      validator: validateMessage,
    },
  ].filter(({ input }) => Boolean(input));

  fields.forEach(({ input, validator }) => {
    input.addEventListener("blur", () => {
      validateField(input, validator);
    });

    input.addEventListener("input", () => {
      if (
        input.classList.contains("input-error") ||
        input.classList.contains("input-success")
      ) {
        validateField(input, validator);
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationResults = fields.map(({ input, validator }) => {
      return validateField(input, validator);
    });

    const isFormValid = validationResults.every(Boolean);

    if (!isFormValid) {
      const firstInvalidField = fields.find(({ input }) =>
        input.classList.contains("input-error"),
      )?.input;

      if (firstInvalidField) {
        const visibleControl = firstInvalidField.matches(
          "select.annova-select__native",
        )
          ? firstInvalidField.nextElementSibling?.querySelector(
              ".annova-select__trigger",
            )
          : firstInvalidField;

        visibleControl?.focus({ preventScroll: true });
        visibleControl?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      showFormStatus(
        form,
        "Revisa los campos marcados antes de enviar tu solicitud.",
        "error",
      );
      pushTrackingEvent("form_submit_error", {
        form_id: form.id || form.getAttribute("name") || "lead-form",
        error_type: "validation",
      });
      return;
    }

    const formData = new FormData(form);

    try {
      isSubmitting = true;
      setSubmittingState(submitButton, true);
      showFormStatus(form, "Enviando tu solicitud...", "loading");

      await submitToNetlify(formData, form);

      pushTrackingEvent("form_submit_success", {
        form_id: form.id || form.getAttribute("name") || "contacto",
        form_provider: "netlify",
      });

      showFormStatus(
        form,
        "Tu solicitud fue enviada correctamente. Te responderemos a la brevedad.",
        "success",
      );

      form.reset();
      form.querySelectorAll(".input-success").forEach((field) => {
        field.classList.remove("input-success");
      });

      window.location.href = createLeadSuccessRedirect(form);
      return;
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      showFormStatus(
        form,
        "No pudimos enviar tu solicitud en este momento. Intenta nuevamente o escríbenos por WhatsApp.",
        "error",
      );
      pushTrackingEvent("form_submit_error", {
        form_id: form.id || form.getAttribute("name") || "contacto",
        error_type: "netlify",
      });
    } finally {
      isSubmitting = false;

      setSubmittingState(submitButton, false);
    }
  });
}

function validateName(value) {
  return value.trim().length >= 3;
}

function validateEmail(value) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value.trim());
}

function validatePhone(value) {
  const cleaned = value.replace(/\s+/g, "").trim();
  return cleaned.length >= 8;
}

function validateService(value) {
  return value.trim() !== "";
}

function validateMessage(value) {
  return value.trim().length >= 15;
}

function getErrorMessage(inputName) {
  const messages = {
    nombre: "Por favor, escribe un nombre válido de al menos 3 caracteres.",
    email: "Por favor, ingresa un correo electrónico válido.",
    telefono: "Por favor, ingresa un teléfono o WhatsApp válido.",
    servicio: "Por favor, selecciona un servicio.",
    mensaje: "Por favor, escribe un mensaje de al menos 15 caracteres.",
  };

  return messages[inputName] || "Este campo no es válido.";
}

function clearError(input) {
  const formGroup = input.closest(".form-group");

  if (formGroup) {
    formGroup
      .querySelectorAll(".input-message.error-message")
      .forEach((message) => message.remove());
  }

  input.classList.remove("input-error");
}

function showError(input, message) {
  clearError(input);

  input.classList.add("input-error");
  input.classList.remove("input-success");

  const formGroup = input.closest(".form-group");

  if (formGroup) {
    const error = document.createElement("small");
    error.className = "input-message error-message";
    error.textContent = message;
    formGroup.appendChild(error);
  }
}

function showSuccess(input) {
  clearError(input);

  input.classList.remove("input-error");
  input.classList.add("input-success");
}

function validateField(input, validator) {
  const isValid = validator(input.value);

  if (isValid) {
    showSuccess(input);
  } else {
    showError(input, getErrorMessage(input.name));
  }

  // Sincronizar errores y estados con el selector personalizado.
  if (input.matches("select.annova-select__native")) {
    input.dispatchEvent(new Event("annova-validation", { bubbles: false }));
  }

  return isValid;
}

function setSubmittingState(submitButton, isSubmitting) {
  if (!submitButton) return;

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Enviando..." : "Enviar solicitud";
}

function showFormStatus(form, message, type) {
  const oldStatus = form.querySelector(".form-status");
  if (oldStatus) oldStatus.remove();

  const status = document.createElement("div");
  status.className = `form-status form-status-${type}`;
  status.textContent = message;
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  form.appendChild(status);
}

function getNetlifySubmitUrl(form) {
  const action = form.getAttribute("action");

  if (action && !/^https?:\/\//i.test(action)) {
    return action;
  }

  const pathname = window.location.pathname || "/";

  if (pathname === "/" || pathname.endsWith("/index.html")) {
    return "/";
  }

  return pathname;
}

async function submitToNetlify(formData, form) {
  const response = await fetch(getNetlifySubmitUrl(form), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(formData).toString(),
  });

  if (!response.ok) {
    throw new Error(`Netlify form error: ${response.status}`);
  }
}

function resolveSuccessRedirect(form) {
  const successRedirect = form.dataset.successRedirect || "/pages/gracias.html";

  return successRedirect;
}

function createLeadSuccessRedirect(form) {
  const redirect = resolveSuccessRedirect(form);

  try {
    const destination = new URL(redirect, window.location.href);
    if (
      destination.origin !== window.location.origin ||
      !["/pages/gracias", "/pages/gracias.html"].includes(
        destination.pathname,
      ) ||
      form.id !== "contact-form" ||
      form.getAttribute("name") !== "contacto"
    ) {
      return redirect;
    }

    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    const id = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    const receipt = {
      id,
      provider: "netlify",
      formId: "contact-form",
      formName: "contacto",
      destination: "/pages/gracias",
      createdAt: Date.now(),
    };

    window.sessionStorage.setItem(
      "annovatech-lead:" + id,
      JSON.stringify(receipt),
    );
    destination.searchParams.set("lead_receipt", id);
    return destination.href;
  } catch (error) {
    // Measurement must never prevent a successful form redirect.
    return redirect;
  }
}

function pushTrackingEvent(eventName, detail) {
  try {
    if (
      !window.ANNOVA_TRACKING ||
      typeof window.ANNOVA_TRACKING.pushEvent !== "function"
    ) {
      return;
    }
    window.ANNOVA_TRACKING.pushEvent(eventName, detail);
  } catch (error) {
    // Analytics failures must not change the outcome of a form submission.
  }
}

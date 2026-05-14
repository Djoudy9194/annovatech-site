document.addEventListener("DOMContentLoaded", () => {
  const leadForms = document.querySelectorAll("form[data-lead-form]");

  leadForms.forEach((form) => {
    initializeLeadForm(form);
  });
});

function initializeLeadForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const fields = [
    { input: form.querySelector('[name="nombre"]'), validator: validateName },
    { input: form.querySelector('[name="email"]'), validator: validateEmail },
    { input: form.querySelector('[name="telefono"]'), validator: validatePhone },
    { input: form.querySelector('[name="servicio"]'), validator: validateService },
    { input: form.querySelector('[name="mensaje"]'), validator: validateMessage },
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

    const isFormValid = fields.every(({ input, validator }) => {
      return validateField(input, validator);
    });

    if (!isFormValid) {
      showFormStatus(
        form,
        "Revisa los campos marcados antes de enviar tu solicitud.",
        "error"
      );
      pushTrackingEvent("form_submit_error", {
        form_id: form.id || form.getAttribute("name") || "lead-form",
        error_type: "validation",
      });
      return;
    }

    const formData = new FormData(form);

    try {
      setSubmittingState(submitButton, true);
      showFormStatus(form, "Enviando tu solicitud...", "loading");

      await submitToNetlify(formData);

      pushTrackingEvent("form_submit_success", {
        form_id: form.id || form.getAttribute("name") || "contacto",
        form_provider: "netlify",
      });

      showFormStatus(
        form,
        "Tu solicitud fue enviada correctamente. Te responderemos a la brevedad.",
        "success"
      );

      form.reset();
      form.querySelectorAll(".input-success").forEach((field) => {
        field.classList.remove("input-success");
      });

      window.setTimeout(() => {
        window.location.href = resolveSuccessRedirect(form);
      }, 900);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      showFormStatus(
        form,
        "No pudimos enviar tu solicitud en este momento. Intenta nuevamente o escríbenos por WhatsApp.",
        "error"
      );
      pushTrackingEvent("form_submit_error", {
        form_id: form.id || form.getAttribute("name") || "contacto",
        error_type: "netlify",
      });
    } finally {
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

function showError(input, message) {
  clearError(input);
  input.classList.add("input-error");
  input.classList.remove("input-success");

  const error = document.createElement("small");
  error.className = "input-message error-message";
  error.textContent = message;

  const formGroup = input.closest(".form-group");
  if (formGroup) {
    formGroup.appendChild(error);
  }
}

function showSuccess(input) {
  clearError(input);
  input.classList.remove("input-error");
  input.classList.add("input-success");
}

function clearError(input) {
  input.classList.remove("input-error");

  const formGroup = input.closest(".form-group");
  if (!formGroup) return;

  const oldMessage = formGroup.querySelector(".input-message");
  if (oldMessage) {
    oldMessage.remove();
  }
}

function validateField(input, validator) {
  const isValid = validator(input.value);

  if (!isValid) {
    showError(input, getErrorMessage(input.name));
    return false;
  }

  showSuccess(input);
  return true;
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

async function submitToNetlify(formData) {
  const response = await fetch("/", {
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

function pushTrackingEvent(eventName, detail) {
  if (!window.ANNOVA_TRACKING || typeof window.ANNOVA_TRACKING.pushEvent !== "function") {
    return;
  }

  window.ANNOVA_TRACKING.pushEvent(eventName, detail);
}
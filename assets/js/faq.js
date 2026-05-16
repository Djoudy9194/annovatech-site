function initFaq() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!question || !answer) {
      return;
    }

    // Estado inicial cerrado
    question.setAttribute("aria-expanded", "false");
    answer.hidden = true;
    answer.style.maxHeight = "0px";
    answer.style.overflow = "hidden";

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Cerrar todos
      faqItems.forEach((el) => {
        el.classList.remove("active");
        const btn = el.querySelector(".faq-question");
        const ans = el.querySelector(".faq-answer");
        btn.setAttribute("aria-expanded", "false");
        ans.hidden = true;
        ans.style.maxHeight = "0px";
      });

      // Abrir el actual
      if (!isOpen) {
        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
        answer.hidden = false;
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFaq, { once: true });
} else {
  initFaq();
}
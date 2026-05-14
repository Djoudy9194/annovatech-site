document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    // Estado inicial cerrado
    answer.style.maxHeight = "0px";
    answer.style.overflow = "hidden";

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Cerrar todos
      faqItems.forEach((el) => {
        el.classList.remove("active");
        const ans = el.querySelector(".faq-answer");
        ans.style.maxHeight = "0px";
      });

      // Abrir el actual
      if (!isOpen) {
        item.classList.add("active");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
});
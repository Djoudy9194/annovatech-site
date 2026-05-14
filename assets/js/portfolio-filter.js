document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".portfolio-filter");
  const portfolioCards = document.querySelectorAll(".portfolio-showcase-card");

  if (!filterButtons.length || !portfolioCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      portfolioCards.forEach((card) => {
        const categories = card.dataset.category || "";

        if (selectedFilter === "all" || categories.includes(selectedFilter)) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });
});
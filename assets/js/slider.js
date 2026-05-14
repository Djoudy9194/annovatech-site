const testimonialCards = document.querySelectorAll(".testimonial-card");

if (testimonialCards.length > 0) {
  let currentSlide = 0;

  const showSlide = (index) => {
    testimonialCards.forEach((card) => {
      card.classList.remove("active");
    });

    testimonialCards[index].classList.add("active");
  };

  const nextSlide = () => {
    currentSlide++;

    if (currentSlide >= testimonialCards.length) {
      currentSlide = 0;
    }

    showSlide(currentSlide);
  };

  showSlide(currentSlide);

  setInterval(nextSlide, 5000);
}
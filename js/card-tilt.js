/**
 * card-tilt.js
 * High-performance 3D perspective tilt & dynamic specular glare on cursor movement
 */
class CardTiltController {
  constructor() {
    this.tiltCards = document.querySelectorAll('.tilt-container, .tilt-card');
    this.init();
  }

  init() {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return; // Skip on touch-only devices for performance
    }

    this.tiltCards.forEach(card => {
      const maxTilt = parseFloat(card.dataset.tiltMax) || 10;
      const targetElement = card.querySelector('.profile-card-3d') || card;
      const glare = card.querySelector('.card-inner-glare');

      let bounds = null;

      const onMouseEnter = () => {
        bounds = card.getBoundingClientRect();
      };

      const onMouseMove = (e) => {
        if (!bounds) bounds = card.getBoundingClientRect();

        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const xPercent = (mouseX / bounds.width - 0.5) * 2; // -1 to 1
        const yPercent = (mouseY / bounds.height - 0.5) * 2; // -1 to 1

        const rotateX = -yPercent * maxTilt;
        const rotateY = xPercent * maxTilt;

        targetElement.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

        if (glare) {
          glare.style.background = `radial-gradient(circle at ${(mouseX / bounds.width * 100).toFixed(1)}% ${(mouseY / bounds.height * 100).toFixed(1)}%, rgba(255, 255, 255, 0.22), transparent 65%)`;
        }
      };

      const onMouseLeave = () => {
        targetElement.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        bounds = null;
        if (glare) {
          glare.style.background = 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.15), transparent 70%)';
        }
      };

      card.addEventListener('mouseenter', onMouseEnter);
      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);
    });
  }

  refresh() {
    this.tiltCards = document.querySelectorAll('.tilt-container, .tilt-card');
    this.init();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cardTilt = new CardTiltController();
});

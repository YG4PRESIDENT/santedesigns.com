/**
 * Hover/touch scale effect for product cards
 * Mouse hover on desktop, touch feedback on mobile, keyboard focus for a11y
 */

import { prefersReducedMotion } from '../gsap-init.js';

export function initHoverScale() {
  if (typeof gsap === 'undefined') return;
  if (prefersReducedMotion()) return;

  const cards = document.querySelectorAll('.c-product-card');

  cards.forEach(card => {
    const img = card.querySelector('.c-product-card__image');
    if (!img) return;

    const duration = window.innerWidth < 768 ? 0.4 : 0.6;
    const scaleUp = () => gsap.to(img, { scale: 1.05, duration, ease: 'power2.out' });
    const scaleDown = () => gsap.to(img, { scale: 1, duration, ease: 'power2.out' });

    // Desktop: mouse hover
    card.addEventListener('mouseenter', scaleUp);
    card.addEventListener('mouseleave', scaleDown);

    // Mobile: touch feedback
    card.addEventListener('touchstart', scaleUp, { passive: true });
    card.addEventListener('touchend', scaleDown, { passive: true });

    // Keyboard: focus
    card.addEventListener('focusin', scaleUp);
    card.addEventListener('focusout', scaleDown);
  });
}

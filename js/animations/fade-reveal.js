/**
 * Fade-reveal animation system
 * Any element with data-animate="fade-up" will fade in on scroll
 */

import { scrollReveal, isGSAPReady, prefersReducedMotion } from '../gsap-init.js';

export function initFadeReveals() {
  if (!isGSAPReady()) return;
  if (prefersReducedMotion()) return;

  const processedGroups = new Set();
  const elements = document.querySelectorAll('[data-animate="fade-up"]');

  elements.forEach(el => {
    const parent = el.closest('[data-animate-group]');

    if (parent && !processedGroups.has(parent)) {
      processedGroups.add(parent);
      const siblings = parent.querySelectorAll('[data-animate="fade-up"]');
      gsap.set(siblings, { opacity: 0, y: 30 });

      ScrollTrigger.create({
        trigger: parent,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(siblings, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
          });
        },
      });
    } else if (!parent) {
      scrollReveal(el);
    }
  });
}

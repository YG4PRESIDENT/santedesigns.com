/**
 * GSAP + ScrollTrigger initialization
 * Registers plugins and sets global defaults
 */

export function initGSAP() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.defaults({
    ease: 'power3.out',
    duration: 0.8,
  });
}

/** Check if user prefers reduced motion */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Check both GSAP and ScrollTrigger are available */
export function isGSAPReady() {
  return typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
}

/**
 * Helper: create a standard scroll-triggered tween
 */
export function scrollReveal(element, fromVars = {}) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 1, y: 0, clearProps: 'all' });
    return;
  }

  return gsap.from(element, {
    opacity: 0,
    y: 40,
    duration: 0.8,
    ...fromVars,
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      once: true,
      ...fromVars.scrollTrigger,
    },
  });
}

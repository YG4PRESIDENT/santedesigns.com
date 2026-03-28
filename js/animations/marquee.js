/**
 * Marquee — infinite horizontal scroll with scroll-velocity modulation
 * Replicates the reference site's horizontalLoop() behavior using GSAP
 */

import { isGSAPReady, prefersReducedMotion } from '../gsap-init.js';

export function initMarquee() {
  if (!isGSAPReady()) return;
  if (prefersReducedMotion()) return;

  const tracks = document.querySelectorAll('[data-marquee]');

  tracks.forEach(track => {
    const items = Array.from(track.children);
    if (!items.length) return;

    const isReverse = track.hasAttribute('data-marquee-reverse');
    const speed = 50; // pixels per second

    // Clone items to fill the viewport
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    const clonesNeeded = Math.ceil((viewportWidth * 2) / trackWidth) + 1;

    for (let i = 0; i < clonesNeeded; i++) {
      items.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    }

    const singleSetWidth = trackWidth;
    const direction = isReverse ? 1 : -1;

    const tween = gsap.to(track, {
      x: direction * singleSetWidth,
      duration: singleSetWidth / speed,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: x => {
          const num = parseFloat(x);
          return (num % singleSetWidth) + 'px';
        },
      },
    });

    // Modulate speed based on scroll velocity
    const marqueeContainer = track.closest('.c-marquee');
    if (!marqueeContainer) return;

    let rafId;

    ScrollTrigger.create({
      trigger: marqueeContainer,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: self => {
        const scrollVelocity = self.getVelocity();

        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            const velocityFactor = 1 + Math.abs(scrollVelocity) / 1000;
            tween.timeScale(Math.min(velocityFactor, 5));

            gsap.to(tween, {
              timeScale: 1,
              duration: 0.8,
              ease: 'power2.out',
              overwrite: true,
            });

            rafId = null;
          });
        }
      },
    });
  });
}

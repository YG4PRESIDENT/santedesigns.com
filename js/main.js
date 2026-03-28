/**
 * Main entry point — imports and initializes all modules
 */

import { initGSAP } from './gsap-init.js';
import { initNav } from './components/nav.js';
import { initCart } from './components/cart.js';
import { initDropGate } from './components/drop-gate.js';
import { initCountdown } from './components/countdown.js';
import { initFadeReveals } from './animations/fade-reveal.js';
import { initMarquee } from './animations/marquee.js';
import { initHoverScale } from './animations/hover-scale.js';

document.addEventListener('DOMContentLoaded', () => {
  const modules = [
    ['GSAP', initGSAP],
    ['Nav', initNav],
    ['Cart', initCart],
    ['DropGate', initDropGate],
    ['Countdown', initCountdown],
    ['FadeReveals', initFadeReveals],
    ['Marquee', initMarquee],
    ['HoverScale', initHoverScale],
  ];

  for (const [name, init] of modules) {
    try {
      init();
    } catch (err) {
      console.error(`[Sante] Failed to init ${name}:`, err);
    }
  }
});

/**
 * Navigation — desktop sidebar active state + mobile menu toggle
 * Handles iOS scroll lock and auto-close on link tap
 */

export function initNav() {
  // Desktop: set active nav link based on data-page
  const currentPage = document.body.dataset.page;
  if (currentPage) {
    const activeLink = document.querySelector(`.c-nav__link[data-nav="${currentPage}"]`);
    if (activeLink) {
      activeLink.classList.add('c-nav__link--active');
      activeLink.setAttribute('aria-current', 'page');
    }
  }

  // Mobile: hamburger toggle
  const hamburger = document.querySelector('[data-menu-toggle]');
  const overlay = document.querySelector('[data-menu-overlay]');
  const closeBtn = document.querySelector('[data-menu-close]');

  if (!hamburger || !overlay) return;

  const overlayLinks = overlay.querySelectorAll('a');
  let previouslyFocused = null;
  let savedScrollY = 0;

  function openMenu() {
    previouslyFocused = document.activeElement;

    // iOS scroll lock: position:fixed prevents background scrolling
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${savedScrollY}px`;

    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');

    // Focus first link
    if (overlayLinks.length) {
      overlayLinks[0].focus();
    }

    document.addEventListener('keydown', trapFocus);
  }

  function closeMenu() {
    // Restore scroll position
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);

    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');

    document.removeEventListener('keydown', trapFocus);

    if (previouslyFocused) {
      previouslyFocused.focus();
    }
  }

  function trapFocus(e) {
    if (e.key === 'Escape') {
      closeMenu();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = [closeBtn, ...overlayLinks].filter(Boolean);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = overlay.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  // Close menu when any nav link is tapped (critical for mobile UX)
  overlayLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

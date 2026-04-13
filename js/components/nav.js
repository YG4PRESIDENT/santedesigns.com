/**
 * Navigation — left sidebar menu
 * Uses GSAP for all sidebar/push/backdrop animations to eliminate
 * sync issues between sidebar slide and content push.
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

  // Mobile: sidebar toggle
  const hamburger = document.querySelector('[data-menu-toggle]');
  const sidebar = document.querySelector('[data-menu-overlay]');
  const backdrop = document.querySelector('[data-menu-backdrop]');
  const closeBtn = document.querySelector('[data-menu-close]');
  const pushWrapper = document.querySelector('.site-push-wrapper');

  if (!hamburger || !sidebar) return;

  const sidebarLinks = sidebar.querySelectorAll('a');
  let previouslyFocused = null;
  let savedScrollY = 0;
  let isOpen = false;
  let menuTl = null;

  // Match CSS: min(280px, 75vw)
  function getSidebarWidth() {
    return Math.min(280, window.innerWidth * 0.75);
  }

  // Build a GSAP timeline (paused). A fresh one is created on each open
  // so it always uses the current viewport width.
  function createTimeline() {
    const width = getSidebarWidth();

    const tl = gsap.timeline({
      paused: true,
      defaults: {
        duration: 0.4,
        ease: 'expo.out',
      },
      onReverseComplete: onCloseComplete,
    });

    // Sidebar slides in from offscreen-left to x:0
    tl.fromTo(
      sidebar,
      { x: -width },
      { x: 0 },
      0
    );

    // Push wrapper slides right by the sidebar width (in sync)
    if (pushWrapper) {
      tl.fromTo(
        pushWrapper,
        { x: 0 },
        { x: width },
        0
      );
    }

    // Backdrop fades in
    if (backdrop) {
      tl.fromTo(
        backdrop,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3 },
        0
      );
    }

    return tl;
  }

  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    previouslyFocused = document.activeElement;

    // iOS scroll lock
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${savedScrollY}px`;

    // Aria / visual state
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    sidebar.setAttribute('aria-hidden', 'false');

    if (backdrop) {
      backdrop.style.pointerEvents = 'auto';
    }

    // Create fresh timeline and play forward
    menuTl = createTimeline();
    menuTl.play();

    // Focus close button after animation starts
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 100);
    }

    document.addEventListener('keydown', handleKeydown);
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;

    // Aria / visual state
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    sidebar.setAttribute('aria-hidden', 'true');

    if (backdrop) {
      backdrop.style.pointerEvents = 'none';
    }

    document.removeEventListener('keydown', handleKeydown);

    // Reverse the timeline — everything animates back in lockstep
    if (menuTl) {
      menuTl.reverse();
    } else {
      // Safety fallback
      onCloseComplete();
    }
  }

  // Called when the reverse animation completes
  function onCloseComplete() {
    // Restore scroll position (iOS scroll lock cleanup)
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);

    // Clear all GSAP inline styles so CSS owns the elements again
    gsap.set(sidebar, { clearProps: 'all' });
    if (pushWrapper) gsap.set(pushWrapper, { clearProps: 'all' });
    if (backdrop) gsap.set(backdrop, { clearProps: 'all' });

    if (previouslyFocused) {
      previouslyFocused.focus();
    }

    menuTl = null;
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      closeMenu();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = sidebar.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
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

  // Hamburger toggle — explicit boolean, no DOM-state guessing
  hamburger.addEventListener('click', () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  // Backdrop click to close
  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  // Close on link tap
  sidebarLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

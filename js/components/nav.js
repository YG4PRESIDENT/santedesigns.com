/**
 * Navigation — left sidebar push menu
 * Slides sidebar from left and pushes page content right
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

  function openMenu() {
    previouslyFocused = document.activeElement;

    // iOS scroll lock
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${savedScrollY}px`;

    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    sidebar.setAttribute('aria-hidden', 'false');

    // Animate sidebar in
    sidebar.style.transform = 'translateX(0)';
    sidebar.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

    // Push content right
    if (pushWrapper) {
      pushWrapper.classList.add('is-pushed');
    }

    // Show backdrop
    if (backdrop) {
      backdrop.classList.add('is-open');
    }

    // Focus close button
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 100);
    }

    document.addEventListener('keydown', handleKeydown);
  }

  function closeMenu() {
    // Restore scroll position
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);

    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    sidebar.setAttribute('aria-hidden', 'true');

    // Slide sidebar back
    sidebar.style.transform = 'translateX(-100%)';

    // Pull content back
    if (pushWrapper) {
      pushWrapper.classList.remove('is-pushed');
    }

    // Hide backdrop
    if (backdrop) {
      backdrop.classList.remove('is-open');
    }

    document.removeEventListener('keydown', handleKeydown);

    if (previouslyFocused) {
      previouslyFocused.focus();
    }
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

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = !sidebar.getAttribute('aria-hidden') || sidebar.getAttribute('aria-hidden') === 'false';
    // Check by looking at the push wrapper state
    if (pushWrapper && pushWrapper.classList.contains('is-pushed')) {
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

/**
 * Cart — Snipcart integration hooks
 * Listens for Snipcart events to update UI elements
 */

export function initCart() {
  // Wait for Snipcart to be ready
  if (typeof window.Snipcart === 'undefined') {
    document.addEventListener('snipcart.ready', onSnipcartReady);
    return;
  }
  onSnipcartReady();
}

function onSnipcartReady() {
  const snipcart = window.Snipcart;
  if (!snipcart) return;

  // Update cart count badges when items change
  snipcart.store.subscribe(() => {
    const state = snipcart.store.getState();
    const count = state.cart.items.count || 0;

    document.querySelectorAll('.snipcart-items-count').forEach(el => {
      el.textContent = count;

      // Pulse animation on change
      el.classList.remove('pulse');
      void el.offsetWidth; // reflow
      if (count > 0) {
        el.classList.add('pulse');
      }
    });
  });
}

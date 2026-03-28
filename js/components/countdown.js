/**
 * Countdown timer for drop pages
 * Uses Date.now() for accuracy — survives iOS background tab throttling
 */

export function initCountdown() {
  const el = document.querySelector('[data-countdown-target]');
  if (!el) return;

  const target = new Date(el.dataset.countdownTarget).getTime();
  let timeoutId;

  const days = el.querySelector('[data-countdown-days]');
  const hours = el.querySelector('[data-countdown-hours]');
  const mins = el.querySelector('[data-countdown-mins]');
  const secs = el.querySelector('[data-countdown-secs]');

  function update() {
    // Always recalculate from wall clock, not timer accuracy
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2, '0');

    if (days) days.textContent = pad(d);
    if (hours) hours.textContent = pad(h);
    if (mins) mins.textContent = pad(m);
    if (secs) secs.textContent = pad(s);

    if (diff > 0) {
      // Align to next second boundary for consistent ticking
      const msUntilNextSecond = 1000 - (now % 1000);
      timeoutId = setTimeout(update, msUntilNextSecond);
    }
  }

  update();

  // Re-sync when page becomes visible again (iOS tab switch)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      clearTimeout(timeoutId);
      update();
    }
  });
}

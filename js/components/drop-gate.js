/**
 * Drop gate — client-side password protection for drop pages
 * Uses SHA-256 hash comparison (not truly secure, but adequate for fashion drops)
 */

export function initDropGate() {
  const gate = document.querySelector('[data-drop-gate]');
  if (!gate) return;

  const input = gate.querySelector('.c-drop-gate__input');
  const error = gate.querySelector('.c-drop-gate__error');
  const expectedHash = gate.dataset.dropGate;

  // Check if already unlocked this session
  if (sessionStorage.getItem('drop-unlocked') === expectedHash) {
    gate.classList.add('is-unlocked');
    return;
  }

  async function handleKeydown(e) {
    if (e.key !== 'Enter') return;

    const value = input.value.trim();
    if (!value) return;

    const hash = await sha256(value);

    if (hash === expectedHash) {
      sessionStorage.setItem('drop-unlocked', expectedHash);
      gate.classList.add('is-unlocked');
      input.removeEventListener('keydown', handleKeydown);
    } else {
      error.classList.add('is-visible');
      input.value = '';
      input.focus();

      setTimeout(() => {
        error.classList.remove('is-visible');
      }, 2000);
    }
  }

  input.addEventListener('keydown', handleKeydown);
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

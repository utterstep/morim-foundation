// Ported from PR #3 website/app/floating-header.tsx.
// The floating header shrinks once the page is scrolled; a little hysteresis
// keeps it steady near the top.

/**
 * @param {boolean} previous  whether the header is currently compact
 * @param {number} scrollY
 * @returns {boolean}
 */
export function nextHeaderCompact(previous, scrollY) {
  return previous ? scrollY > 12 : scrollY > 48;
}

/**
 * @param {HTMLElement} shell  the `.header-shell` element
 * @returns {() => void} stop
 */
export function startFloatingHeader(shell) {
  let compact = false;
  const update = () => {
    compact = nextHeaderCompact(compact, window.scrollY);
    shell.dataset.compact = String(compact);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  return () => window.removeEventListener('scroll', update);
}

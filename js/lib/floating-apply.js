// The floating Apply: one pill fixed at the bottom of the screen while no
// Apply button is in view. The rail's data-anchor (the hero) is the anchor:
// nothing floats until it has scrolled off the top.

/** @typedef {{ top: number, bottom: number }} VerticalBounds */

/**
 * @param {VerticalBounds | null | undefined} anchor the hero
 * @param {VerticalBounds[]} buttons every Apply on the page
 * @param {number} viewportHeight
 * @returns {boolean}
 */
export function shouldShowFloatingApply(anchor, buttons, viewportHeight) {
  if (!anchor || viewportHeight <= 0) return false;
  if (anchor.bottom > 0) return false;
  return !buttons.some((b) => b.bottom > 0 && b.top < viewportHeight);
}

/**
 * @param {HTMLElement} rail the `.floating-apply-rail`
 * @param {ParentNode} [root] where the [data-apply] buttons are looked up
 * @returns {() => void} cleanup
 */
export function watchApplyButtons(rail, root = document) {
  rail.inert = true;
  delete rail.dataset.applyVisible;
  const buttons = Array.from(root.querySelectorAll('[data-apply]'));
  const anchor = root.querySelector(rail.dataset.anchor || '[data-apply]');
  if (!anchor || buttons.length === 0) return () => {};

  let frame;
  const update = () => {
    frame = undefined;
    const visible = shouldShowFloatingApply(
      anchor.getBoundingClientRect(),
      buttons.map((b) => b.getBoundingClientRect()),
      window.innerHeight,
    );
    const value = String(visible);
    if (rail.dataset.applyVisible !== value) {
      rail.dataset.applyVisible = value;
      // Disable focus/clicks immediately, while the visual fade finishes.
      rail.inert = !visible;
    }
  };
  const schedule = () => {
    if (frame === undefined) frame = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
  return () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    rail.inert = true;
    delete rail.dataset.applyVisible;
  };
}

// Ported from PR #3 website/lib/floating-apply.ts (plain ES module, no build step).
/** @typedef {{ top: number, bottom: number }} VerticalBounds */

/**
 * @param {VerticalBounds} card
 * @param {VerticalBounds} programs
 * @param {number} viewportHeight
 * @param {boolean} available whether an apply button exists to float
 * @param {number} [coveringTop] top edge of the next card overlapping this one
 * @returns {boolean}
 */
export function shouldShowFloatingApply(
  card,
  programs,
  viewportHeight,
  available,
  coveringTop = viewportHeight,
) {
  if (!available || viewportHeight <= 0) return false;
  const visibleHeight = Math.max(
    0,
    Math.min(card.bottom, viewportHeight, coveringTop) - Math.max(card.top, 0),
  );
  const programsVisible = programs.bottom > 0 && programs.top < viewportHeight;
  return visibleHeight >= viewportHeight * 0.7 && !programsVisible;
}

/**
 * @param {HTMLElement} rail the floating apply rail inside a `.panel`
 * @returns {() => void} cleanup
 */
export function watchProgramsViewport(rail) {
  rail.inert = true;
  delete rail.dataset.applyVisible;
  const card = rail.closest('.panel');
  const programs = card?.querySelector('.programs');
  if (!card || !programs) return () => {};

  const laterCards = [];
  for (
    let next = card.nextElementSibling;
    next;
    next = next.nextElementSibling
  ) {
    if (next.matches('.panel')) laterCards.push(next);
  }
  let frame;
  const update = () => {
    frame = undefined;
    const viewportHeight = window.innerHeight;
    const coveringTop = laterCards.reduce((edge, next) => {
      const bounds = next.getBoundingClientRect();
      return bounds.bottom > 0 ? Math.min(edge, bounds.top) : edge;
    }, viewportHeight);
    const visible = shouldShowFloatingApply(
      card.getBoundingClientRect(),
      programs.getBoundingClientRect(),
      viewportHeight,
      !!programs.querySelector('.program-list .apply-button'),
      coveringTop,
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
  const resize = new ResizeObserver(schedule);
  [card, programs, ...laterCards].forEach((element) => resize.observe(element));
  const changes = new MutationObserver(schedule);
  changes.observe(programs, { childList: true, subtree: true });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  card.parentElement?.addEventListener('focusin', schedule);
  card.parentElement?.addEventListener('focusout', schedule);
  update();
  return () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    resize.disconnect();
    changes.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    card.parentElement?.removeEventListener('focusin', schedule);
    card.parentElement?.removeEventListener('focusout', schedule);
    rail.inert = true;
    delete rail.dataset.applyVisible;
  };
}

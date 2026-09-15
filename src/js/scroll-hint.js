// The "scroll" hint under the hero. It disappears after the second scroll
// gesture (a gesture is a run of scroll events with no gap longer than
// GESTURE_GAP_MS), once the page has moved HIDE_AFTER_VIEWPORTS of the
// viewport height in a single continuous scroll, when it is clicked, or at
// once if the page did not open at the top (a restored position, a hash link).

export const GESTURE_GAP_MS = 500;
export const HIDE_AFTER_VIEWPORTS = 0.6;

/**
 * Decides when the hint is done, from a stream of scroll events.
 * @param {number} threshold  gestures after which the hint is done
 * @param {number} gap  milliseconds of quiet that separate two gestures
 * @param {number} distance  pixels scrolled after which it is done regardless
 */
export function createGestureCounter(threshold = 2, gap = GESTURE_GAP_MS, distance = Infinity) {
  let count = 0;
  let last = -Infinity;
  return {
    /**
     * @param {number} now  a timestamp in milliseconds
     * @param {number} [scrolled]  the page's current scroll offset in pixels
     */
    scroll(now, scrolled = 0) {
      if (now - last > gap) count += 1;
      last = now;
      return count >= threshold || scrolled >= distance;
    },
    get count() {
      return count;
    },
  };
}

/**
 * @param {HTMLElement} hint  the `.scroll-hint` link
 * @returns {() => void} stop
 */
export function startScrollHint(hint) {
  const hide = () => {
    hint.setAttribute('data-hidden', '');
    stop();
  };
  const counter = createGestureCounter(2, GESTURE_GAP_MS, window.innerHeight * HIDE_AFTER_VIEWPORTS);
  const onScroll = () => {
    // Browsers may fire one scroll event at load without moving; not a gesture.
    if (window.scrollY === 0) return;
    if (counter.scroll(performance.now(), window.scrollY)) hide();
  };
  const onClick = () => hint.setAttribute('data-hidden', '');
  const stop = () => {
    window.removeEventListener('scroll', onScroll);
    hint.removeEventListener('click', onClick);
  };
  if (window.scrollY > 0) {
    hint.setAttribute('data-hidden', '');
    return () => {};
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  hint.addEventListener('click', onClick);
  return stop;
}

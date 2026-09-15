// The "scroll" hint under the hero. It disappears after the second scroll
// gesture (a gesture is a run of scroll events with no gap longer than
// GESTURE_GAP_MS), when it is clicked, or at once if the page did not open
// at the top (a restored position, a hash link).

export const GESTURE_GAP_MS = 500;

/**
 * Counts scroll gestures from a stream of event timestamps.
 * @param {number} threshold  gestures after which `done` becomes true
 * @param {number} gap  milliseconds of quiet that separate two gestures
 */
export function createGestureCounter(threshold = 2, gap = GESTURE_GAP_MS) {
  let count = 0;
  let last = -Infinity;
  return {
    /** @param {number} now  a timestamp in milliseconds */
    scroll(now) {
      if (now - last > gap) count += 1;
      last = now;
      return count >= threshold;
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
  const counter = createGestureCounter(2);
  const onScroll = () => {
    if (counter.scroll(performance.now())) hide();
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

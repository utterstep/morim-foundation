// Ported from PR #3 website/app/page-motion.tsx (`useProgramMotion`).
// Keeps the program list's geometry stable while a filter changes: capture
// row positions before the DOM update, then animate from the old layout to
// the new one (a FLIP transition, 240ms ease-out).

let active = [];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function cancelProgramMotion() {
  active.forEach((animation) => animation.cancel());
  active = [];
}

/**
 * Call right before rows are added or removed.
 * @param {HTMLElement} list  the `.program-list`
 * @returns {{height: number, tops: Map<string, number>} | null}
 */
export function captureProgramLayout(list) {
  cancelProgramMotion();
  if (reducedMotion()) return null;
  return {
    height: list.getBoundingClientRect().height,
    tops: new Map(
      Array.from(list.querySelectorAll('[data-program]'), (row) => [row.dataset.program, row.offsetTop]),
    ),
  };
}

/**
 * Call right after the DOM update with the snapshot from captureProgramLayout.
 * @param {HTMLElement} list
 * @param {{height: number, tops: Map<string, number>} | null} previous
 */
export function animateProgramLayout(list, previous) {
  if (!previous || reducedMotion()) return;
  const duration = 240;
  const height = list.getBoundingClientRect().height;
  if (Math.abs(previous.height - height) > 1) {
    active.push(
      list.animate([{ height: `${previous.height}px` }, { height: `${height}px` }], {
        duration,
        easing: 'ease-out',
      }),
    );
  }
  list.querySelectorAll('[data-program]').forEach((row) => {
    const oldTop = previous.tops.get(row.dataset.program);
    active.push(
      row.animate(
        [
          {
            opacity: oldTop === undefined ? 0 : 1,
            translate: `0 ${oldTop === undefined ? 8 : oldTop - row.offsetTop}px`,
          },
          { opacity: 1, translate: '0 0' },
        ],
        { duration, easing: 'ease-out' },
      ),
    );
  });
}

/**
 * Cancel running animations if the visitor turns reduced motion on.
 * @returns {() => void} stop
 */
export function watchProgramMotionPreference() {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stop = () => {
    if (preference.matches) cancelProgramMotion();
  };
  preference.addEventListener('change', stop);
  return () => {
    cancelProgramMotion();
    preference.removeEventListener('change', stop);
  };
}

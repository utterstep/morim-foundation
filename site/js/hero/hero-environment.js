// Viewport and preference tracking for the hero, ported from the observer
// effect in PR #3 website/app/hero.tsx (lines 175-204).

/**
 * @param {HTMLElement} section
 * @param {(flags: {visible: boolean, reduced: boolean, compact: boolean}) => void} onChange
 *   called once synchronously (with visible = false until the observer reports), then on every change
 * @returns {() => void} stop
 */
export function watchHeroEnvironment(section, onChange) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const screen = window.matchMedia('(max-width: 700px)');
  let inView = !('IntersectionObserver' in window);
  const update = () => {
    onChange({
      reduced: motion.matches,
      compact: screen.matches,
      visible: inView && !document.hidden,
    });
  };
  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          update();
        })
      : null;
  observer?.observe(section);
  update();
  motion.addEventListener('change', update);
  screen.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  return () => {
    observer?.disconnect();
    motion.removeEventListener('change', update);
    screen.removeEventListener('change', update);
    document.removeEventListener('visibilitychange', update);
  };
}

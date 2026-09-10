// Ported from PR #3 website/lib/card-depth.ts (plain ES module, no build step).
/**
 * @param {number} top card's viewport-relative top
 * @param {number} viewportHeight
 * @param {boolean} [compact]
 * @returns {{ scale: number, tilt: number, shadow: number }}
 */
export function cardEntryPose(
  top,
  viewportHeight,
  compact = false,
) {
  if (viewportHeight <= 0) return { scale: 1, tilt: 0, shadow: 0 };
  // Unroll from the top edge and settle before the main reading area.
  const progress = Math.max(
    0,
    Math.min(1, (viewportHeight - top) / (viewportHeight * 0.7)),
  );
  const eased = progress * progress * (3 - 2 * progress);
  const remaining = 1 - eased;
  return {
    scale: 1 + (compact ? 0.04 : 0.08) * remaining,
    tilt: remaining === 0 ? 0 : (compact ? -4 : -8) * remaining,
    shadow: 0.18 * remaining,
  };
}

/**
 * @param {number} top
 * @param {number} viewportHeight
 * @returns {number}
 */
export function cardEntryScale(top, viewportHeight) {
  return cardEntryPose(top, viewportHeight).scale;
}

/**
 * @param {HTMLElement} root
 * @returns {() => void} cleanup
 */
export function startCardDepth(root) {
  const cards = Array.from(
    root.querySelectorAll('.story-stack > .panel'),
  );
  const enabled = window.matchMedia('(prefers-reduced-motion: no-preference)');
  let frame;
  const update = () => {
    frame = undefined;
    // Read all geometry before writing styles. A top-center origin keeps these
    // top measurements independent of the scale, avoiding feedback/jitter.
    const poses = cards.map((card) =>
      enabled.matches
        ? cardEntryPose(
            card.getBoundingClientRect().top,
            window.innerHeight,
            window.innerWidth <= 700,
          )
        : { scale: 1, tilt: 0, shadow: 0 },
    );
    cards.forEach((card, index) => {
      const pose = poses[index];
      const properties = {
        '--card-entry-scale': pose.scale.toFixed(5),
        '--card-entry-tilt': `${pose.tilt.toFixed(3)}deg`,
        '--card-entry-shadow': pose.shadow.toFixed(4),
      };
      for (const [name, value] of Object.entries(properties)) {
        if (card.style.getPropertyValue(name) !== value)
          card.style.setProperty(name, value);
      }
    });
  };
  const schedule = () => {
    if (frame === undefined) frame = requestAnimationFrame(update);
  };
  const onScroll = () => {
    if (enabled.matches) schedule();
  };
  const resize = new ResizeObserver(schedule);
  resize.observe(root);
  cards.forEach((card) => resize.observe(card));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', schedule);
  enabled.addEventListener('change', schedule);
  update();
  return () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    resize.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', schedule);
    enabled.removeEventListener('change', schedule);
    cards.forEach((card) => {
      for (const name of [
        '--card-entry-scale',
        '--card-entry-tilt',
        '--card-entry-shadow',
      ])
        card.style.removeProperty(name);
    });
  };
}

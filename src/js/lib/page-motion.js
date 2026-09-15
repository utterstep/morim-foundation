// Ported from PR #3 website/lib/page-motion.ts (plain ES module, no build step).
// Individual transform properties preserve the artwork's existing CSS tilts.
/** @type {Record<'text' | 'photo' | 'note' | 'glyph' | 'mark', Keyframe[]>} */
export const motionFrames = {
  text: [
    { opacity: 0, translate: '0 12px', scale: '0.995' },
    { opacity: 1, translate: '0 0', scale: '1' },
  ],
  photo: [
    { opacity: 0, translate: '0 0.875rem', rotate: '-1deg', scale: '0.985' },
    { opacity: 1, translate: '0 0', rotate: '0deg', scale: '1' },
  ],
  note: [
    { opacity: 0, translate: '0 10px', rotate: '-3deg', scale: '0.97' },
    { opacity: 1, translate: '0 0', rotate: '0deg', scale: '1' },
  ],
  glyph: [
    { rotate: '0deg' },
    { rotate: '-7deg', offset: 0.3 },
    { rotate: '2deg', offset: 0.65 },
    { rotate: '0deg' },
  ],
  mark: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
};

/**
 * @param {number} top trigger's viewport-relative top
 * @param {number} viewportHeight
 * @param {boolean} [sequence] longer range for multi-phase groups
 * @returns {number} 0..1
 */
export function scrollRevealProgress(
  top,
  viewportHeight,
  sequence = false,
) {
  const start = viewportHeight * 0.86;
  const end = viewportHeight * (sequence ? 0.34 : 0.58);
  return Math.max(0, Math.min(1, (start - top) / Math.max(1, start - end)));
}

/**
 * @param {HTMLElement} root
 * @returns {() => void} cleanup
 */
export function startPageMotion(root) {
  if (!('animate' in Element.prototype)) return () => {};
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches) return () => {};

  // Track: { animation, end }
  // Group: { tracks, duration, sequence, anchor, offset }
  const animations = new Map();
  const triggers = new Map();
  let frame = 0;
  let stopped = false;
  let needsMeasurement = true;

  const register = (
    selector,
    kind,
    duration,
    delay = () => 0,
    triggerSelector,
  ) => {
    root.querySelectorAll(selector).forEach((element, index) => {
      // Card copy stays fully readable throughout scrolling, including notes.
      if ((kind === 'text' || kind === 'note') && element.closest('.panel'))
        return;
      const animation = element.animate(motionFrames[kind], {
        duration,
        delay: delay(index),
        easing:
          kind === 'photo'
            ? 'cubic-bezier(0.25, 0.1, 0.25, 1)'
            : 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both',
      });
      animation.pause();
      const end = duration + delay(index);
      // Measure the authored positions before applying scroll transforms.
      animation.currentTime = end;
      const track = { animation, end };
      animations.set(element, track);
      const trigger =
        (triggerSelector && element.closest(triggerSelector)) ||
        element;
      const group = triggers.get(trigger) ?? {
        tracks: [],
        duration: 0,
        sequence: false,
        anchor: trigger.parentElement ?? root,
        offset: 0,
      };
      group.tracks.push(track);
      group.duration = Math.max(group.duration, end);
      group.sequence ||= Boolean(triggerSelector);
      triggers.set(trigger, group);
    });
  };

  register(
    '.prose > p, .eyebrow, .team-title, .faq > h2, .benefit > h3, .benefit > p, .wwd-beat > h3, .wwd-beat > p, .wwd-routes, .partners-proof, .partners-action, .program-heading, .footer-message',
    'text',
    620,
  );
  // The pilot photo beside the lead follows its figure over a longer scroll
  // range, its caption a little later.
  register('.wwd-photo-img', 'photo', 1000, () => 0, '.wwd-photo');
  register('.wwd-photo figcaption', 'text', 550, () => 240);
  // The offset is a phase of the lead's scroll timeline, not elapsed time.
  register('.mentor-highlight img', 'mark', 500, () => 350, '.mission-intro');
  // The handwritten stipend aside under the funding beat.
  register('.beat-note', 'note', 600, () => 200);
  register('.teacher-a img, .school-oo img', 'glyph', 700, () => 200);
  register(
    '.questions span',
    'note',
    600,
    (index) => [60, 210, 340][index % 3],
  );
  register('.person', 'text', 600, (index) => (index % 2) * 90);

  const update = () => {
    frame = 0;
    if (stopped) return;
    if (needsMeasurement) {
      animations.forEach(({ animation, end }) => {
        animation.currentTime = end;
      });
      for (const [trigger, group] of triggers) {
        let anchor = trigger.parentElement ?? root;
        while (animations.has(anchor) && anchor.parentElement)
          anchor = anchor.parentElement;
        group.anchor = anchor;
        group.offset =
          trigger.getBoundingClientRect().top -
          anchor.getBoundingClientRect().top;
      }
      needsMeasurement = false;
    }
    // Read stable parents first so animated text never feeds back into its own progress.
    const positions = new Map();
    triggers.forEach(({ anchor }) => {
      if (!positions.has(anchor))
        positions.set(anchor, anchor.getBoundingClientRect().top);
    });
    triggers.forEach((group) => {
      const progress = scrollRevealProgress(
        positions.get(group.anchor) + group.offset,
        window.innerHeight,
        group.sequence,
      );
      group.tracks.forEach(({ animation, end }) => {
        animation.currentTime = Math.min(end, progress * group.duration);
      });
    });
  };
  const schedule = () => {
    if (!stopped && !frame) frame = requestAnimationFrame(update);
  };
  const remeasure = () => {
    needsMeasurement = true;
    schedule();
  };
  const resizeObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(remeasure)
      : null;
  resizeObserver?.observe(root);
  update();
  triggers.forEach(({ anchor }) => resizeObserver?.observe(anchor));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', remeasure);
  root.addEventListener('load', remeasure, true);

  // Keyboard navigation must never land on content waiting for a reveal.
  const revealFocused = (event) => {
    if (!(event.target instanceof Element)) return;
    for (const [element, track] of animations) {
      if (element.contains(event.target)) {
        track.animation.cancel();
        animations.delete(element);
        triggers.forEach((group) => {
          group.tracks = group.tracks.filter((item) => item !== track);
        });
      }
    }
  };
  const cancelAll = () => {
    stopped = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', remeasure);
    root.removeEventListener('load', remeasure, true);
    animations.forEach(({ animation }) => animation.cancel());
    animations.clear();
    triggers.clear();
  };
  const respectPreference = () => {
    if (preference.matches) cancelAll();
  };
  preference.addEventListener('change', respectPreference);
  root.addEventListener('focusin', revealFocused);
  return () => {
    cancelAll();
    preference.removeEventListener('change', respectPreference);
    root.removeEventListener('focusin', revealFocused);
  };
}

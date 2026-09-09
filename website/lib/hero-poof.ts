type PlayPoof = (x: number, y: number) => number;

type HeroStoryOptions = {
  intro: HTMLElement | null;
  onProgress: (progress: number) => void;
};

// Viewport-relative cues from the two reference screenshots: the intro is
// near the bottom during the reveal, then just below center at the poof.
const storyCues = { revealStart: 0.96, revealEnd: 0.82, poof: 0.55 };

export function heroStoryStage(
  scrollY: number,
  introTop: number,
  viewportHeight: number,
  dismissed: boolean,
) {
  if (
    scrollY > 12 &&
    introTop <= viewportHeight * storyCues.poof + (dismissed ? 12 : 0)
  )
    return 'dismissed';
  return heroStoryProgress(scrollY, introTop, viewportHeight) > 0
    ? 'burst'
    : 'peek';
}

export function heroStoryProgress(
  scrollY: number,
  introTop: number,
  viewportHeight: number,
) {
  if (scrollY <= 12 || viewportHeight <= 0) return 0;
  const distance =
    viewportHeight * (storyCues.revealStart - storyCues.revealEnd);
  return Math.max(
    0,
    Math.min(1, (viewportHeight * storyCues.revealStart - introTop) / distance),
  );
}

export function heroStoryItemProgress(progress: number, slot: number) {
  const start = slot < 2 ? 0 : (slot - 2) * 0.07;
  return Math.max(0, Math.min(1, (progress - start) / (1 - start)));
}

// A little hysteresis prevents repeated puffs from tiny trackpad movements.
export function heroPoofActive(
  wordCenterY: number,
  viewportHeight: number,
  dismissed: boolean,
  scrollY: number,
) {
  if (scrollY <= 0) return false;
  return wordCenterY <= viewportHeight / 2 + (dismissed ? 12 : 0);
}

export function startHeroPoof(
  hero: HTMLElement,
  onDismissed: (active: boolean) => void,
  play: PlayPoof,
  clear: () => void,
  story?: HeroStoryOptions,
) {
  const accents = hero.querySelector<HTMLElement>('.hero-accents');
  const anchor = hero.querySelector<HTMLElement>('.hero-line');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame: number | undefined;
  let dismissed = false;
  let hidden = false;
  let initialized = false;

  const update = () => {
    frame = undefined;
    const rect = anchor?.getBoundingClientRect();
    const stage = story
      ? heroStoryStage(
          window.scrollY,
          story.intro?.getBoundingClientRect().top ?? Infinity,
          window.innerHeight,
          dismissed,
        )
      : null;
    if (story)
      story.onProgress(
        heroStoryProgress(
          window.scrollY,
          story.intro?.getBoundingClientRect().top ?? Infinity,
          window.innerHeight,
        ),
      );
    const active = story
      ? stage === 'dismissed'
      : rect
        ? heroPoofActive(
            rect.top + rect.height / 2,
            window.innerHeight,
            dismissed,
            window.scrollY,
          )
        : false;
    const focused = Boolean(hero.querySelector('.hero-app-item:focus-visible'));
    const shouldHide = active && (Boolean(story) || !focused);
    if (
      shouldHide &&
      !hidden &&
      initialized &&
      !preference.matches &&
      !document.hidden
    ) {
      // Measure the animated faces, not their stationary button wrappers.
      // Skip a slot if it is between appearances or outside the screen.
      hero.querySelectorAll<HTMLElement>('.hero-app-item').forEach((item) => {
        const bob = item.querySelector<HTMLElement>('.hero-app-bob');
        const face = item.querySelector<HTMLElement>('.hero-app-face') || item;
        const rect = face.getBoundingClientRect();
        const opacity =
          Number(getComputedStyle(face).opacity) *
          (bob ? Number(getComputedStyle(bob).opacity) : 1);
        if (
          opacity > 0.05 &&
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom > 0 &&
          rect.top < window.innerHeight &&
          rect.right > 0 &&
          rect.left < window.innerWidth
        ) {
          play(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      });
    }
    if (!active || preference.matches || document.hidden) clear();
    hidden = shouldHide;
    hero.dataset.poofed = String(hidden);
    if (accents) accents.inert = hidden;
    if (dismissed !== active || (!initialized && active)) {
      dismissed = active;
      onDismissed(active);
    }
    initialized = true;
  };
  const schedule = () => {
    if (frame === undefined) frame = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  hero.addEventListener('focusin', schedule);
  hero.addEventListener('focusout', schedule);
  preference.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  update();
  return () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    hero.removeEventListener('focusin', schedule);
    hero.removeEventListener('focusout', schedule);
    preference.removeEventListener('change', schedule);
    document.removeEventListener('visibilitychange', schedule);
    if (accents) accents.inert = false;
    delete hero.dataset.poofed;
    clear();
  };
}

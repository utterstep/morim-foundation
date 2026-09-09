type VerticalBounds = { top: number; bottom: number };

export function shouldShowFloatingApply(
  card: VerticalBounds,
  programs: VerticalBounds,
  viewportHeight: number,
  available: boolean,
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

export function watchProgramsViewport(rail: HTMLElement) {
  rail.inert = true;
  delete rail.dataset.applyVisible;
  const card = rail.closest<HTMLElement>('.panel');
  const programs = card?.querySelector<HTMLElement>('.programs');
  if (!card || !programs) return () => {};

  const laterCards: Element[] = [];
  for (
    let next = card.nextElementSibling;
    next;
    next = next.nextElementSibling
  ) {
    if (next.matches('.panel')) laterCards.push(next);
  }
  let frame: number | undefined;
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

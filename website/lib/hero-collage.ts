const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

// Reveal in place as the intro enters, then clear it before the copy is central.
export function heroCollageProgress(
  introTop: number,
  viewportHeight: number,
  scrollY: number,
) {
  if (viewportHeight <= 0 || scrollY <= 12) return 0;
  const position = introTop / viewportHeight;
  const entrance = smooth((0.96 - position) / 0.14);
  const exit = smooth((position - 0.55) / 0.15);
  return entrance * exit;
}

// The third variation reveals only forward and never runs an exit phase.
export function heroCollageStayProgress(
  previous: number,
  collageTop: number,
  viewportHeight: number,
  scrollY: number,
) {
  if (viewportHeight <= 0 || scrollY <= 12) return previous;
  return Math.max(
    previous,
    smooth((0.96 - collageTop / viewportHeight) / 0.14),
  );
}

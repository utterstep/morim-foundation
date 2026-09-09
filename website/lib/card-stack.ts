// Tall cards scroll through completely before their bottom edge is pinned.
export function stackTop(height: number, viewportHeight: number, inset = 32) {
  return Math.min(inset, viewportHeight - height - inset);
}

export function startCardStack(root: HTMLElement) {
  if (!('ResizeObserver' in window)) return () => {};
  const stack = root.querySelector<HTMLElement>('.story-stack');
  if (!stack) return () => {};
  const layers = Array.from(
    stack.querySelectorAll<HTMLElement>(':scope > .panel.stack-layer'),
  );
  const update = () => {
    for (const layer of layers) {
      layer.style.setProperty(
        '--stack-top',
        `${stackTop(layer.offsetHeight, window.innerHeight)}px`,
      );
    }
    stack.dataset.stackReady = 'true';
  };
  const observer = new ResizeObserver(update);
  layers.forEach((layer) => observer.observe(layer));
  window.addEventListener('resize', update);
  update();
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', update);
    delete stack.dataset.stackReady;
    layers.forEach((layer) => layer.style.removeProperty('--stack-top'));
  };
}

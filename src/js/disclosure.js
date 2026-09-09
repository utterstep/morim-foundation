// Animated disclosures replacing Base UI's Accordion and Collapsible (PR #3
// website/components/ui/accordion.tsx, collapsible.tsx, and the transitions
// in motion.css / sections.css).
//
// Two shapes share one height animation:
//   <details class="faq-item" data-state><summary>…</summary><div class="faq-answer">…</div></details>
//   <button aria-expanded aria-controls="id" data-label-open data-label-closed> + <div id="id" hidden>
//
// The content wrapper has overflow:hidden and no padding of its own; its
// height is animated with the Web Animations API from 0 to its natural
// height, so nothing here depends on `interpolate-size` or ::details-content.

const running = new WeakMap();

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Animate `content` open or closed. Resolves when the animation finishes;
 * never resolves if it is interrupted by a newer one.
 * @param {HTMLElement} content
 * @param {boolean} open
 * @param {{duration: number, easing: string, fade: number}} motion
 * @returns {Promise<void>}
 */
function animateHeight(content, open, motion) {
  const previous = running.get(content);
  const from = previous
    ? getComputedStyle(content).height
    : open
      ? '0px'
      : `${content.getBoundingClientRect().height}px`;
  previous?.cancel();
  if (reducedMotion() || typeof content.animate !== 'function') return Promise.resolve();
  const to = open ? `${content.scrollHeight}px` : '0px';
  const animation = content.animate(
    [
      { height: from, opacity: open ? 0 : 1 },
      { height: to, opacity: open ? 1 : 0 },
    ],
    { duration: motion.duration, easing: motion.easing, fill: 'forwards' },
  );
  // Opacity uses its own, shorter timing in the PR; run it as a second
  // animation on the same element so both can be cancelled together.
  const fade = content.animate([{ opacity: open ? 0 : 1 }, { opacity: open ? 1 : 0 }], {
    duration: motion.fade,
    easing: 'ease',
    fill: 'forwards',
  });
  running.set(content, animation);
  return new Promise((resolve) => {
    animation.onfinish = () => {
      fade.cancel();
      animation.cancel();
      running.delete(content);
      resolve();
    };
    animation.oncancel = () => fade.cancel();
  });
}

/**
 * FAQ item: <details> whose summary toggles with animation.
 * @param {HTMLDetailsElement} details
 * @param {{duration: number, easing: string, fade: number}} motion
 * @returns {() => void} stop
 */
export function initDetails(details, motion) {
  const summary = details.querySelector('summary');
  const content = details.querySelector('summary ~ *');
  if (!(summary && content instanceof HTMLElement)) return () => {};

  const toggle = async () => {
    const open = details.dataset.state !== 'open';
    details.dataset.state = open ? 'open' : 'closed';
    if (open) {
      details.open = true;
      await animateHeight(content, true, motion);
    } else {
      await animateHeight(content, false, motion);
      details.open = false;
    }
  };
  const onClick = (event) => {
    event.preventDefault();
    toggle();
  };
  // The browser may open a <details> itself (find-in-page); keep state in sync.
  const onToggle = () => {
    if (!running.has(content)) details.dataset.state = details.open ? 'open' : 'closed';
  };
  summary.addEventListener('click', onClick);
  details.addEventListener('toggle', onToggle);
  return () => {
    summary.removeEventListener('click', onClick);
    details.removeEventListener('toggle', onToggle);
  };
}

/**
 * Button + region disclosure (the Tbilisi "See results" card).
 * @param {HTMLButtonElement} button
 * @param {{duration: number, easing: string, fade: number}} motion
 * @returns {() => void} stop
 */
export function initDisclosureButton(button, motion) {
  const content = document.getElementById(button.getAttribute('aria-controls') ?? '');
  const card = button.closest('[data-state]');
  if (!content) return () => {};

  const setLabel = (open) => {
    const label = open ? button.dataset.labelOpen : button.dataset.labelClosed;
    if (label) button.textContent = label;
  };
  const toggle = async () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    if (card) card.dataset.state = open ? 'open' : 'closed';
    setLabel(open);
    if (open) {
      content.hidden = false;
      await animateHeight(content, true, motion);
    } else {
      await animateHeight(content, false, motion);
      content.hidden = true;
    }
  };
  button.addEventListener('click', toggle);
  return () => button.removeEventListener('click', toggle);
}

/**
 * Close a disclosure instantly and without animation (used when a program
 * row leaves the list, matching the React remount that reset its state).
 * @param {Element} root  a `.faq-item` or a card containing a `[aria-controls]` button
 */
export function resetDisclosure(root) {
  const button = root.querySelector('button[aria-controls]');
  if (root instanceof HTMLDetailsElement) {
    const content = root.querySelector('summary ~ *');
    running.get(content)?.cancel();
    running.delete(content);
    root.open = false;
    root.dataset.state = 'closed';
    return;
  }
  if (!(button instanceof HTMLButtonElement)) return;
  const content = document.getElementById(button.getAttribute('aria-controls') ?? '');
  if (!content) return;
  running.get(content)?.cancel();
  running.delete(content);
  content.hidden = true;
  button.setAttribute('aria-expanded', 'false');
  if (button.dataset.labelClosed) button.textContent = button.dataset.labelClosed;
  const card = button.closest('[data-state]');
  if (card) card.dataset.state = 'closed';
}

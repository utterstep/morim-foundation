// Notification badge on app icons, ported from `NotificationBadge` in PR #3
// website/app/hero.tsx (lines 774-815). The Messages icon counts up to 99+
// while the hero is playing; other icons show a fixed number.

import { notificationDuration, notificationLabel } from '../lib/hero-notification.js';

/**
 * @param {number | '99+'} target
 * @param {{playing: boolean, reduced: boolean}} flags
 * @returns {{el: HTMLElement, sync: (flags: {playing: boolean, reduced: boolean}) => void, destroy: () => void}}
 */
export function createBadge(target, flags) {
  const el = document.createElement('span');
  el.className = 'hero-notification';
  el.setAttribute('aria-hidden', 'true');
  let elapsed = 0;
  let frame = 0;
  let previous = 0;

  const show = (text) => {
    el.textContent = text;
    el.dataset.complete = String(text === '99+');
  };
  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const tick = (now) => {
    elapsed += now - previous;
    previous = now;
    show(notificationLabel(elapsed));
    frame = elapsed < notificationDuration ? requestAnimationFrame(tick) : 0;
  };
  const sync = ({ playing, reduced }) => {
    if (target !== '99+' || reduced) {
      stop();
      show(String(target));
      return;
    }
    if (!playing || elapsed >= notificationDuration) {
      stop();
      show(notificationLabel(elapsed));
      return;
    }
    if (!frame) {
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };
  show(target === '99+' ? '0' : String(target));
  sync(flags);
  return { el, sync, destroy: stop };
}

// Ported from PR #3 website/lib/hero-notification.ts (plain ES module, no build step).
// Let the card land before its notification badge starts filling up.
export const notificationDuration = 2250;
/**
 * @param {number} elapsed milliseconds since the card mounted
 * @returns {string} badge text, ending at '99+'
 */
export function notificationLabel(elapsed) {
  const progress = Math.min(1, Math.max(0, (elapsed - 450) / 1800));
  if (progress === 1) return '99+';
  return String(Math.floor(99 * (1 - Math.pow(1 - progress, 2))));
}

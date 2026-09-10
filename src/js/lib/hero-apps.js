// Ported from PR #3 website/lib/hero-interaction.ts (plain ES module, no build step).

/**
 * @typedef {object} HeroApp
 * @property {string} name
 * @property {string} src absolute URL, resolved relative to this module
 * @property {number | string} notifications
 */

/** @type {readonly HeroApp[]} */
export const heroApps = [
  {
    name: 'ChatGPT',
    src: new URL('../../assets/hero-app-chatgpt.webp', import.meta.url).href,
    notifications: 2,
  },
  {
    name: 'Messages',
    src: new URL('../../assets/hero-app-messages.webp', import.meta.url).href,
    notifications: '99+',
  },
  {
    name: 'Instagram',
    src: new URL('../../assets/hero-app-instagram.webp', import.meta.url).href,
    notifications: 12,
  },
  {
    name: 'TikTok',
    src: new URL('../../assets/hero-app-tiktok.webp', import.meta.url).href,
    notifications: 8,
  },
  {
    name: 'Twitch',
    src: new URL('../../assets/hero-app-twitch.webp', import.meta.url).href,
    notifications: 3,
  },
  {
    name: 'Fortnite',
    src: new URL('../../assets/hero-app-fortnite.webp', import.meta.url).href,
    notifications: 1,
  },
  {
    name: 'YouTube',
    src: new URL('../../assets/hero-app-youtube.webp', import.meta.url).href,
    notifications: 5,
  },
];

/**
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export const isDragGesture = (x, y) => Math.hypot(x, y) > 6;

/**
 * @param {{ x: number, y: number }} start
 * @param {{ x: number, y: number }} delta
 * @param {{ minX: number, maxX: number, minY: number, maxY: number }} limits
 * @returns {{ x: number, y: number }}
 */
export function dragOffset(
  start,
  delta,
  limits,
) {
  return {
    x: Math.max(limits.minX, Math.min(limits.maxX, start.x + delta.x)),
    y: Math.max(limits.minY, Math.min(limits.maxY, start.y + delta.y)),
  };
}

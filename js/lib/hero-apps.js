// Ported from PR #3 website/lib/hero-interaction.ts (plain ES module, no build step).

// Each icon ships as a ladder of WebP candidates rather than one file. The hero
// scales with the viewport (base.css sets html{font-size:calc(100vw/90)}), so an
// icon is ~50 CSS px on a phone and ~250 on a 4K desktop, doubled again on a 2x
// screen; `sizes` plus width descriptors let the browser weigh both. `widths` is
// capped at the resolution the artwork actually has, so nothing is upscaled.
export const heroAppSizes = '(max-width: 700px) 14vw, 7vw';

const asset = (file) => new URL(`../../assets/${file}`, import.meta.url).href;

/** @param {string} slug @param {number[]} widths */
function icon(slug, widths) {
  return {
    src: asset(`hero-app-${slug}-${widths[widths.length - 1]}.webp`),
    srcset: widths.map((w) => `${asset(`hero-app-${slug}-${w}.webp`)} ${w}w`).join(', '),
  };
}

/**
 * @typedef {object} HeroApp
 * @property {string} name
 * @property {string} src largest candidate, used when srcset is unsupported
 * @property {string} srcset width-descriptor candidate list
 * @property {number | string} notifications
 */

/** @type {readonly HeroApp[]} */
export const heroApps = [
  {
    name: 'ChatGPT',
    ...icon('chatgpt', [128, 256, 512]),
    notifications: 2,
  },
  {
    name: 'Messages',
    ...icon('messages', [128, 250]),
    notifications: '99+',
  },
  {
    name: 'Instagram',
    ...icon('instagram', [128, 256, 512]),
    notifications: 12,
  },
  {
    name: 'TikTok',
    ...icon('tiktok', [128, 256, 512]),
    notifications: 8,
  },
  {
    name: 'Twitch',
    ...icon('twitch', [128, 256, 512]),
    notifications: 3,
  },
  {
    name: 'Fortnite',
    ...icon('fortnite', [128, 258]),
    notifications: 1,
  },
  {
    name: 'YouTube',
    ...icon('youtube', [128, 256, 512]),
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

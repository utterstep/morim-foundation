// Pure hero logic, ported from PR #3 website/app/hero.tsx. Nothing in this
// file touches the DOM, so it is covered by `node --test`.

import { heroApps } from '../lib/hero-apps.js';
import { heroVideos } from '../lib/hero-videos.js';
import { heroCompositionSlots, replaceHeroFloater } from '../lib/hero-floating.js';

export const LAST_VIDEOS_KEY = 'morim-hero-last-videos';

/**
 * @typedef {import('../lib/hero-floating.js').HeroFloater} HeroFloater
 */

/**
 * The section-level flags CSS reads (hero.tsx:77-78, 360).
 * @param {{visible: boolean, reduced: boolean, focused: boolean, dragging: boolean}} state
 * @returns {{playing: boolean, looping: boolean}}
 */
export function deriveHeroFlags({ visible, reduced, focused, dragging }) {
  const playing = visible && !reduced;
  return { playing, looping: playing && !focused && !dragging };
}

/**
 * Stagger for the very first appearance of each slot (hero.tsx:652-655).
 * Story floaters start at appearance 8, so this is 0ms unless the CSS is
 * ever changed to use it again.
 * @param {number} appearance
 * @param {number} slot
 */
export function entryDelay(appearance, slot) {
  return appearance < 8 ? `${[0, 160, 460, 610, 920, 1050, 300, 780][slot]}ms` : '0ms';
}

/**
 * Custom properties the CSS reads from each `.hero-app-item` (hero.tsx:621-657).
 * @param {HeroFloater} item
 * @param {number} slot
 * @returns {Record<string, string | number>}
 */
export function floaterStyle(item, slot) {
  const composition =
    item.compositionSlot === undefined ? undefined : heroCompositionSlots[item.compositionSlot];
  return {
    '--float-x': item.x,
    '--float-y': item.y,
    '--app-tilt': `${item.tilt}deg`,
    ...(composition
      ? {
          '--float-mobile-x': item.mobileX ?? composition.mobileX,
          '--float-mobile-y': item.mobileY ?? composition.mobileY,
          '--composition-layer': composition.layer,
        }
      : {}),
    '--entry-delay': entryDelay(item.appearance, slot),
  };
}

/**
 * What a floater renders as (hero.tsx:486-493, 587, 602-607).
 * @param {HeroFloater} item
 */
export function describeFloater(item) {
  const app = heroApps[item.app];
  const video = item.kind === 'media' ? heroVideos[item.preview % heroVideos.length] : null;
  return {
    app,
    video,
    kind: item.kind,
    hasNotification: item.kind === 'icon' && item.appearance % 3 !== 0,
    format: video ? (video.height > video.width ? 'portrait' : 'landscape') : undefined,
  };
}

/**
 * Replace `{name}` placeholders in a translated string.
 * @param {string} template
 * @param {Record<string, string>} values
 */
export function formatTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}

/**
 * Accessible name of the item (hero.tsx:613-619).
 * @param {HeroFloater} item
 * @param {{labelIcon: string}} strings
 */
export function floaterLabel(item, strings) {
  const { app, video } = describeFloater(item);
  return video ? video.title : formatTemplate(strings.labelIcon, { app: app.name });
}

/**
 * The floater list after a dismissed slot is replaced (hero.tsx:249-252).
 * @param {HeroFloater[]} floaters
 * @param {number} slot
 * @param {() => number} [random]
 * @returns {HeroFloater[]}
 */
export function finishDismiss(floaters, slot, random = Math.random) {
  return replaceHeroFloater(floaters, slot, random).map((item, index) =>
    index === slot ? { ...item, duration: 700, delay: 0 } : item,
  );
}

/**
 * Tolerant parse of the session-storage value (hero.tsx:83-91).
 * @param {string | null | undefined} json
 * @returns {string[]}
 */
export function parseLastVideoIds(json) {
  try {
    const stored = JSON.parse(json ?? '[]');
    return Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Video ids currently on screen, in slot order (hero.tsx:103-108).
 * @param {HeroFloater[]} floaters
 * @returns {string[]}
 */
export function lastVideoIds(floaters) {
  return floaters.filter((item) => item.kind === 'media').map((item) => heroVideos[item.preview].id);
}

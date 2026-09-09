// Ported from PR #3 website/lib/hero-floating.ts (plain ES module, no build step).
import { heroVideos, heroVideoPools } from './hero-videos.js';

const HERO_VIDEO_COUNT = heroVideos.length;
export const HERO_DISMISS_MS = 450;
export const heroFloatMotions = [
  { motion: 'bob', driftX: 0, driftY: -4, rock: 0 },
  { motion: 'drift', driftX: 4, driftY: -2, rock: 0 },
  { motion: 'tilt', driftX: 0, driftY: -1, rock: 1.2 },
];

/**
 * @typedef {object} HeroFloater
 * @property {number} app
 * @property {number} appearance
 * @property {'icon' | 'media'} kind
 * @property {number} preview
 * @property {number} x
 * @property {number} y
 * @property {number} tilt
 * @property {number} driftX
 * @property {number} driftY
 * @property {'bob' | 'drift' | 'tilt'} motion
 * @property {number} rock
 * @property {number} duration
 * @property {number} delay
 * @property {number} [compositionSlot]
 * @property {number} [mobileX]
 * @property {number} [mobileY]
 * @property {number[]} [seenPreviews]
 */

// Portrait left, landscape upper-right, stream lower-center; icons frame the edges.
// Desktop and mobile share roles and layering, not arbitrary collision-prone points.
export const heroCompositionSlots = [
  { x: 0.08, y: 0.83, mobileX: 0.03, mobileY: 0.87, tilt: -6, layer: 6 },
  { x: 0.91, y: 0.92, mobileX: 0.95, mobileY: 0.96, tilt: 5, layer: 7 },
  {
    x: 0.04,
    y: 0.24,
    mobileX: 0.02,
    mobileY: 0.23,
    tilt: -4,
    layer: 2,
    previews: [...heroVideoPools.shorts, ...heroVideoPools.tiktok],
  },
  {
    x: 0.88,
    y: 0.06,
    mobileX: 0.98,
    mobileY: 0.07,
    tilt: 3,
    layer: 1,
    previews: heroVideoPools.youtube,
  },
  {
    x: 0.56,
    y: 0.76,
    mobileX: 0.55,
    mobileY: 0.84,
    tilt: -3,
    layer: 3,
    previews: heroVideoPools.twitch,
  },
  { x: 0.4, y: 0.06, mobileX: 0.4, mobileY: 0.03, tilt: 5, layer: 5 },
  { x: 0.96, y: 0.47, mobileX: 0.98, mobileY: 0.47, tilt: 4, layer: 5 },
  { x: 0.02, y: 0.03, mobileX: 0.03, mobileY: 0.02, tilt: -5, layer: 4 },
];

function compositionPosition(slot, random) {
  const anchor = heroCompositionSlots[slot];
  const clamp = (value) => Math.max(0.01, Math.min(0.99, value));
  const dx = (random() - 0.5) * 0.07;
  const dy = (random() - 0.5) * 0.07;
  return {
    x: clamp(anchor.x + dx),
    y: clamp(anchor.y + dy),
    mobileX: clamp(anchor.mobileX + dx * 0.6),
    mobileY: clamp(anchor.mobileY + dy * 0.6),
    tilt: slot === 4 ? 0 : anchor.tilt + (random() - 0.5) * 3,
  };
}

function spawn(
  others,
  previous,
  appearance,
  random,
) {
  const contentId = (item) =>
    item.kind === 'media' ? 7 + item.preview : item.app;
  const occupied = new Set(
    [...others, ...(previous ? [previous] : [])].map(contentId),
  );
  const choices = Array.from(
    { length: 7 + HERO_VIDEO_COUNT },
    (_, id) => id,
  ).filter((id) => !occupied.has(id));
  const content = choices[Math.floor(random() * choices.length)];
  // Choose separated positions within the field anchored to “but...”.
  let position = { x: 0.5, y: 0.5 };
  let bestDistance = -1;
  for (let attempt = 0; attempt < 32; attempt++) {
    const candidate = { x: random(), y: random() };
    const distance = Math.min(
      ...[...others, ...(previous ? [previous] : [])].map((item) =>
        Math.hypot(item.x - candidate.x, item.y - candidate.y),
      ),
    );
    if (distance > bestDistance) {
      position = candidate;
      bestDistance = distance;
    }
    if (distance >= 0.36) break;
  }
  return {
    app: content < 7 ? content : 0,
    kind: content < 7 ? 'icon' : 'media',
    preview: content < 7 ? 0 : content - 7,
    appearance,
    ...position,
    tilt: -5 + random() * 10,
    ...heroFloatMotions[Math.floor(random() * heroFloatMotions.length)],
    duration:
      content < 7
        ? 7000 + Math.round(random() * 2500)
        : 18000 + Math.round(random() * 6000),
    delay: 250 + Math.round(random() * 950),
  };
}

// Stable eight-slot composition, with only three video players.
/**
 * @param {() => number} [random]
 * @param {string[]} [lastVideoIds] clip ids shown on the previous page load
 * @returns {HeroFloater[]}
 */
export function createHeroStoryFloaters(
  random = Math.random,
  lastVideoIds = [],
) {
  const apps = [1, 2, 0, 5, 6];
  return heroCompositionSlots.map((placement, slot) => {
    const choices =
      'previews' in placement
        ? placement.previews.filter(
            (index) => !lastVideoIds.includes(heroVideos[index].id),
          )
        : [];
    const pool = choices.length
      ? choices
      : 'previews' in placement
        ? placement.previews
        : [0];
    const preview = pool[Math.floor(random() * pool.length)];
    return {
      app: slot < 2 ? apps[slot] : slot > 4 ? apps[slot - 3] : 0,
      appearance: 8 + slot,
      kind: slot >= 2 && slot <= 4 ? 'media' : 'icon',
      preview,
      seenPreviews: [preview],
      ...compositionPosition(slot, random),
      compositionSlot: slot,
      ...heroFloatMotions[0],
      duration: 700,
      delay: slot < 2 ? slot * 180 : (slot - 2) * 80,
    };
  });
}

/**
 * @param {HeroFloater[]} items
 * @param {number} slot
 * @param {() => number} [random]
 * @returns {HeroFloater[]} a new array, or `items` itself when nothing changed
 */
export function replaceHeroFloater(
  items,
  slot,
  random = Math.random,
) {
  if (!items[slot]) return items;
  const previous = items[slot];
  if (previous.compositionSlot !== undefined) {
    const placement = heroCompositionSlots[previous.compositionSlot];
    const occupiedApps = new Set(
      items.filter((item) => item.kind === 'icon').map((item) => item.app),
    );
    const candidates =
      previous.kind === 'media' && 'previews' in placement
        ? placement.previews.filter((preview) => preview !== previous.preview)
        : Array.from({ length: 7 }, (_, app) => app).filter(
            (app) => !occupiedApps.has(app),
          );
    const unseen = candidates.filter(
      (preview) => !previous.seenPreviews?.includes(preview),
    );
    const choices =
      previous.kind === 'media' && unseen.length ? unseen : candidates;
    const choice = choices[Math.floor(random() * choices.length)];
    if (choice === undefined) return items;
    const next = {
      ...previous,
      ...compositionPosition(previous.compositionSlot, random),
      ...(previous.kind === 'media' ? { preview: choice } : { app: choice }),
      seenPreviews:
        previous.kind === 'media'
          ? unseen.length
            ? [...(previous.seenPreviews ?? [previous.preview]), choice]
            : [choice]
          : undefined,
      appearance: previous.appearance + 1,
    };
    return items.map((item, index) => (index === slot ? next : item));
  }
  const next = spawn(
    items.filter((_, index) => index !== slot),
    items[slot],
    items[slot].appearance + 1,
    random,
  );
  // Replace in place: even while an old item exits, a fourth can't mount.
  return items.map((item, index) => (index === slot ? next : item));
}

// DOM builders for the hero collage, ported from the JSX in PR #3
// website/app/hero.tsx (`AppItem`, lines 588-770). No state lives here.

import { describeFloater, floaterLabel, floaterStyle, formatTemplate } from './hero-state.js';

/**
 * @typedef {{labelIcon: string, labelMediaDismiss: string, videoUnavailable: string}} HeroStrings
 */

/**
 * Apply a map of custom properties to an element's inline style.
 * @param {HTMLElement} el
 * @param {Record<string, string | number>} vars
 */
export function applyStyle(el, vars) {
  for (const [name, value] of Object.entries(vars)) el.style.setProperty(name, String(value));
}

/**
 * The outer element of a slot, built once. Icons are buttons; video cards
 * are groups whose inner dismiss button is the click target.
 * @param {import('../lib/hero-floating.js').HeroFloater} item
 * @param {number} slot
 * @param {HeroStrings} strings
 * @returns {HTMLElement}
 */
export function buildItem(item, slot, strings) {
  const { video } = describeFloater(item);
  const el = document.createElement(video ? 'div' : 'button');
  if (video) el.setAttribute('role', 'group');
  else el.type = 'button';
  el.className = 'hero-app-item';
  el.dataset.slot = String(slot);
  el.dataset.storyVisible = 'true';
  el.dataset.dragging = 'false';
  el.dataset.dismissing = 'false';
  el.setAttribute('aria-describedby', 'hero-app-help');
  el.style.setProperty('--drag-x', '0px');
  el.style.setProperty('--drag-y', '0px');
  updateItem(el, item, slot, strings);
  return el;
}

/**
 * Attributes and custom properties that follow the floater's content.
 * @param {HTMLElement} el
 * @param {import('../lib/hero-floating.js').HeroFloater} item
 * @param {number} slot
 * @param {HeroStrings} strings
 */
export function updateItem(el, item, slot, strings) {
  const { video, kind, format } = describeFloater(item);
  el.dataset.kind = kind;
  if (video) {
    el.dataset.provider = video.provider;
    el.dataset.format = format;
  } else {
    delete el.dataset.provider;
    delete el.dataset.format;
  }
  el.dataset.motion = item.motion;
  el.setAttribute('aria-label', floaterLabel(item, strings));
  applyStyle(el, floaterStyle(item, slot));
}

/**
 * The `.hero-app-bob > .hero-app-face` subtree. Rebuilt whenever the slot's
 * `appearance` changes, which is what React's `key={appearance}` did.
 * @param {import('../lib/hero-floating.js').HeroFloater} item
 * @param {HeroStrings} strings
 * @returns {{bob: HTMLElement, face: HTMLElement, playerShell: HTMLElement | null}}
 */
export function buildFace(item, strings) {
  const { app, video, kind } = describeFloater(item);
  const initial = String(item.appearance < 8);
  const bob = document.createElement('span');
  bob.className = 'hero-app-bob';
  bob.dataset.initial = initial;
  const face = document.createElement('span');
  face.className = 'hero-app-face';
  face.dataset.initial = initial;
  bob.append(face);

  let playerShell = null;
  if (video) {
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = video.provider === 'twitch' ? 'hero-twitch-dismiss' : 'hero-video-poof-target';
    dismiss.setAttribute('aria-label', formatTemplate(strings.labelMediaDismiss, { label: video.label }));
    if (video.provider === 'twitch') dismiss.textContent = '×';
    const live = document.createElement('span');
    live.className = 'hero-live-media';
    playerShell = document.createElement('span');
    playerShell.className = 'hero-video-player';
    playerShell.style.aspectRatio = `${video.width} / ${video.height}`;
    const status = document.createElement('span');
    status.className = 'hero-video-status';
    playerShell.append(status);
    live.append(playerShell);
    face.append(dismiss, live);
  } else if (kind === 'icon') {
    const mask = document.createElement('span');
    mask.className = 'hero-app-icon-mask';
    const img = document.createElement('img');
    img.src = app.src;
    img.alt = '';
    img.width = 73;
    img.height = 73;
    img.draggable = false;
    mask.append(img);
    face.append(mask);
  }
  return { bob, face, playerShell };
}

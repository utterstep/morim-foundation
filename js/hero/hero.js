// The hero collage: eight app icons and video cards scattered around
// "but...". Ported from the `Hero` component in PR #3 website/app/hero.tsx
// (the `original` variant in `static` mode). React state became the `hero`
// object below; two passes replace re-rendering:
//   renderSlot(slot)  content: rebuilds a slot's face when its appearance changed
//   update()          derived flags: data-* attributes, players, badges (idempotent)

import { createHeroStoryFloaters } from '../lib/hero-floating.js';
import { poofElement, clearPoofs, POOF_DURATION_MS } from '../lib/poof.js';
import {
  LAST_VIDEOS_KEY,
  deriveHeroFlags,
  describeFloater,
  finishDismiss,
  lastVideoIds,
  parseLastVideoIds,
} from './hero-state.js';
import { buildItem, buildFace, updateItem } from './hero-dom.js';
import { createBadge } from './hero-badge.js';
import { createPlayer } from './hero-player.js';
import { attachDrag } from './hero-drag.js';
import { watchHeroEnvironment } from './hero-environment.js';

/**
 * @param {HTMLElement} section  the `.hero` element
 * @returns {() => void} stop
 */
export function startHero(section) {
  const accents = section.querySelector('.hero-accents');
  const help = section.querySelector('#hero-app-help');
  if (!(accents && help)) return () => {};
  const strings = {
    labelIcon: section.dataset.labelIcon ?? 'Dismiss {app} and show the next app',
    labelMediaDismiss: section.dataset.labelMediaDismiss ?? 'Dismiss {label} and show the next element',
    videoUnavailable: section.dataset.videoUnavailable ?? 'Video unavailable',
    helpDesktop: section.dataset.helpDesktop ?? help.textContent ?? '',
    helpCompact: section.dataset.helpCompact ?? help.textContent ?? '',
  };

  const hero = {
    floaters: [],
    visible: false,
    reduced: false,
    compact: false,
    focused: false,
    dragging: false,
    dismissing: null,
    dismissTimer: 0,
    slots: [],
  };

  // ---- state ------------------------------------------------------------

  const setFloaters = (next) => {
    hero.floaters = next;
    try {
      sessionStorage.setItem(LAST_VIDEOS_KEY, JSON.stringify(lastVideoIds(next)));
    } catch {
      /* Browsers may disable session storage. */
    }
  };

  const update = () => {
    const { playing, looping } = deriveHeroFlags(hero);
    section.dataset.playing = String(playing);
    section.dataset.looping = String(looping);
    help.textContent = hero.compact ? strings.helpCompact : strings.helpDesktop;
    for (const slot of hero.slots) {
      const dismissing = hero.dismissing === slot.index;
      slot.el.dataset.dismissing = String(dismissing);
      slot.player?.sync({ active: hero.visible && !dismissing, autoplay: playing });
      slot.badge?.sync({ playing, reduced: hero.reduced });
    }
  };

  // ---- rendering ----------------------------------------------------------

  const replaceFace = (slot, item) => {
    slot.player?.destroy();
    slot.badge?.destroy();
    slot.bob?.remove();
    slot.player = null;
    slot.badge = null;
    slot.drag.resetOffset();
    const { bob, face, playerShell } = buildFace(item, strings);
    slot.bob = bob;
    slot.face = face;
    slot.el.append(bob);
    const { app, video, hasNotification } = describeFloater(item);
    if (video && playerShell) {
      slot.player = createPlayer(playerShell, video, {
        interactive: video.provider === 'twitch',
        unavailableText: strings.videoUnavailable,
      });
    } else if (hasNotification) {
      slot.badge = createBadge(app.notifications, deriveHeroFlags(hero));
      face.append(slot.badge.el);
    }
    slot.appearance = item.appearance;
  };

  const renderSlot = (index) => {
    const item = hero.floaters[index];
    let slot = hero.slots[index];
    if (!slot) {
      const el = buildItem(item, index, strings);
      slot = { index, el, appearance: -1, bob: null, face: null, player: null, badge: null, drag: null };
      slot.drag = attachDrag(el, {
        boundary: () => section,
        isCompact: () => hero.compact,
        isDismissing: () => hero.dismissing === index,
        onDragChange: (dragging) => {
          hero.dragging = dragging;
          update();
        },
        onActivate: () => requestDismiss(index),
      });
      hero.slots[index] = slot;
      accents.append(el);
    }
    updateItem(slot.el, item, index, strings);
    if (slot.appearance !== item.appearance) replaceFace(slot, item);
  };

  // ---- dismissal ----------------------------------------------------------

  const requestDismiss = (index) => {
    if (hero.dismissing !== null) return;
    const slot = hero.slots[index];
    if (!hero.reduced && slot.face) poofElement(slot.face, { hide: false });
    hero.dismissing = index;
    update();
    hero.dismissTimer = setTimeout(() => completeDismiss(index), hero.reduced ? 0 : POOF_DURATION_MS);
  };

  const completeDismiss = (index) => {
    if (hero.dismissing !== index) return;
    hero.dismissTimer = 0;
    setFloaters(finishDismiss(hero.floaters, index));
    hero.dismissing = null;
    renderSlot(index);
    update();
  };

  // ---- wiring -------------------------------------------------------------

  let lastIds = [];
  try {
    lastIds = parseLastVideoIds(sessionStorage.getItem(LAST_VIDEOS_KEY));
  } catch {
    /* Storage is optional; fresh random selection still works. */
  }
  setFloaters(createHeroStoryFloaters(Math.random, lastIds));
  hero.floaters.forEach((_, index) => renderSlot(index));
  update();

  const stopEnvironment = watchHeroEnvironment(section, (flags) => {
    Object.assign(hero, flags);
    update();
  });
  const onFocusIn = (event) => {
    hero.focused = event.target instanceof Element && event.target.matches(':focus-visible');
    update();
  };
  const onFocusOut = (event) => {
    if (!accents.contains(event.relatedTarget)) {
      hero.focused = false;
      update();
    }
  };
  // Clamp a moved icon back inside the hero if its container is resized.
  const onResize = () => {
    for (const slot of hero.slots) if (!slot.drag.inGesture()) slot.drag.resetOffset();
  };
  accents.addEventListener('focusin', onFocusIn);
  accents.addEventListener('focusout', onFocusOut);
  window.addEventListener('resize', onResize);
  window.addEventListener('pagehide', clearPoofs);

  return () => {
    clearTimeout(hero.dismissTimer);
    stopEnvironment();
    accents.removeEventListener('focusin', onFocusIn);
    accents.removeEventListener('focusout', onFocusOut);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pagehide', clearPoofs);
    for (const slot of hero.slots) {
      slot.player?.destroy();
      slot.badge?.destroy();
      slot.drag.destroy();
      slot.el.remove();
    }
    hero.slots = [];
    clearPoofs();
  };
}

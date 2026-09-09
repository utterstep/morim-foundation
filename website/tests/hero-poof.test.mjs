import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  heroPoofActive,
  heroStoryStage,
  heroStoryProgress,
  heroStoryItemProgress,
  startHeroPoof,
} from '../lib/hero-poof.ts';

test('story dismissal reverses on scroll-back, with a small hysteresis at the intro', () => {
  assert.equal(heroStoryStage(0, 950, 900, false), 'peek');
  assert.equal(heroStoryStage(40, 910, 900, false), 'peek');
  assert.equal(heroStoryStage(140, 810, 900, false), 'burst');
  assert.equal(heroStoryStage(460, 490, 900, false), 'dismissed');
  assert.equal(heroStoryStage(0, 950, 900, true), 'peek');
  assert.equal(heroStoryStage(445, 505, 900, true), 'dismissed');
  assert.equal(heroStoryStage(435, 515, 900, true), 'burst');
  assert.equal(heroStoryStage(0, 450, 900, false), 'peek');
});

test('appearance progress scrubs deterministically in both directions, with staggered items', () => {
  const at = (y) => heroStoryProgress(y, 1200 - y, 900);
  assert.equal(at(0), 0);
  assert.equal(at(470), 1);
  assert(at(400) > at(350));
  assert(at(400) < 1);
  assert.equal(at(400), at(400));
  assert.equal(heroStoryItemProgress(0, 7), 0);
  assert.equal(heroStoryItemProgress(1, 7), 1);
  assert(heroStoryItemProgress(0.5, 2) > heroStoryItemProgress(0.5, 7));
  assert.equal(heroStoryProgress(100, Infinity, 900), 0);
});

test('reference screenshot one shows the elements; screenshot two triggers the poof', () => {
  // Screenshots share a content viewport from y=107 to y=1146.
  const height = 1039;
  assert.equal(heroStoryProgress(250, 851, height), 1);
  assert.equal(heroStoryStage(250, 851, height, false), 'burst');
  assert.equal(heroStoryStage(535, 565, height, false), 'dismissed');
  for (const viewport of [600, 800, 1200]) {
    assert.equal(heroStoryProgress(200, viewport * 0.81, viewport), 1);
    assert.equal(
      heroStoryStage(200, viewport * 0.81, viewport, false),
      'burst',
    );
    assert.equal(
      heroStoryStage(400, viewport * 0.54, viewport, false),
      'dismissed',
    );
  }
});

test('poof waits for the word to reach viewport center and rearms below it', () => {
  assert.equal(heroPoofActive(451, 900, false, 300), false);
  assert.equal(heroPoofActive(450, 900, false, 300), true);
  assert.equal(heroPoofActive(455, 900, true, 295), true);
  assert.equal(heroPoofActive(463, 900, true, 287), false);
  assert.equal(heroPoofActive(300, 900, true, 0), false);
  assert.equal(heroPoofActive(401, 800, false, 200), false);
  assert.equal(heroPoofActive(400, 800, false, 200), true);
});

test('scroll puffs once at each visible face, restores on return and cleans up', () => {
  const listeners = new Map(),
    heroListeners = new Map(),
    preferenceListeners = new Map(),
    documentListeners = new Map(),
    frames = new Map();
  let id = 0,
    focused = false,
    cleared = 0;
  const preference = {
    matches: false,
    addEventListener: (n, cb) => preferenceListeners.set(n, cb),
    removeEventListener: (n) => preferenceListeners.delete(n),
  };
  const items = [1, 0].map((opacity) => {
    const face = {
      opacity: 1,
      getBoundingClientRect: () => ({
        left: 100,
        top: 300,
        width: 80,
        height: 80,
        bottom: 380,
        right: 180,
      }),
    };
    return {
      querySelector: (selector) =>
        selector === '.hero-app-bob' ? { opacity } : face,
    };
  });
  const accents = { inert: false };
  const anchor = {
    getBoundingClientRect: () => ({ top: 725 - window.scrollY, height: 50 }),
  };
  const hero = {
    dataset: {},
    querySelectorAll: () => items,
    querySelector: (selector) =>
      selector === '.hero-accents'
        ? accents
        : selector === '.hero-line'
          ? anchor
          : focused,
    addEventListener: (n, cb) => heroListeners.set(n, cb),
    removeEventListener: (n) => heroListeners.delete(n),
  };
  globalThis.window = {
    scrollY: 0,
    innerHeight: 900,
    innerWidth: 1440,
    matchMedia: () => preference,
    addEventListener: (n, cb) => listeners.set(n, cb),
    removeEventListener: (n) => listeners.delete(n),
  };
  globalThis.document = {
    hidden: false,
    addEventListener: (n, cb) => documentListeners.set(n, cb),
    removeEventListener: (n) => documentListeners.delete(n),
  };
  globalThis.getComputedStyle = (el) => ({ opacity: String(el.opacity) });
  globalThis.requestAnimationFrame = (cb) => {
    frames.set(++id, cb);
    return id;
  };
  globalThis.cancelAnimationFrame = (key) => frames.delete(key);
  const flush = () => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb());
  };
  const scroll = (y) => {
    window.scrollY = y;
    listeners.get('scroll')();
    flush();
  };
  const puffs = [],
    activity = [];
  const cleanup = startHeroPoof(
    hero,
    (active) => activity.push(active),
    (x, y) => {
      puffs.push([x, y]);
      return 480;
    },
    () => cleared++,
  );
  scroll(25);
  assert.equal(puffs.length, 0);
  assert.equal(hero.dataset.poofed, 'false');
  scroll(299);
  assert.equal(puffs.length, 0);
  scroll(300);
  assert.deepEqual(puffs, [[140, 340]]);
  assert.equal(hero.dataset.poofed, 'true');
  assert.equal(accents.inert, true);
  scroll(500);
  scroll(295);
  assert.equal(puffs.length, 1);
  scroll(0);
  assert.equal(hero.dataset.poofed, 'false');
  assert.equal(accents.inert, false);
  scroll(300);
  assert.equal(puffs.length, 2);
  scroll(0);
  preference.matches = true;
  scroll(300);
  assert.equal(puffs.length, 2);
  assert.equal(hero.dataset.poofed, 'true');
  scroll(0);
  preference.matches = false;
  focused = true;
  scroll(300);
  assert.equal(hero.dataset.poofed, 'false');
  assert.equal(accents.inert, false);
  focused = false;
  heroListeners.get('focusout')();
  flush();
  assert.equal(puffs.length, 3);
  listeners.get('scroll')();
  listeners.get('scroll')();
  assert.equal(frames.size, 1);
  cleanup();
  assert.equal(frames.size, 0);
  assert.equal(
    listeners.size +
      heroListeners.size +
      preferenceListeners.size +
      documentListeners.size,
    0,
  );
  assert.equal(hero.dataset.poofed, undefined);
  assert.equal(accents.inert, false);
  assert(cleared > 0);
  // Loading an existing deep link hides the deck silently, without ghost puffs.
  const cleanupDeepLink = startHeroPoof(
    hero,
    () => {},
    () => {
      throw Error('Unexpected puff');
    },
    () => {},
  );
  assert.equal(hero.dataset.poofed, 'true');
  cleanupDeepLink();

  // Scroll-back restores the same deck after the intro poof.
  window.scrollY = 0;
  const progress = [];
  const cleanupStory = startHeroPoof(
    hero,
    () => {},
    (x, y) => {
      puffs.push([x, y]);
      return 480;
    },
    () => {},
    {
      intro: { getBoundingClientRect: () => ({ top: 1200 - window.scrollY }) },
      onProgress: (value) => progress.push(value),
    },
  );
  const before = puffs.length;
  scroll(400);
  assert.equal(hero.dataset.poofed, 'false');
  assert(progress.at(-1) > 0);
  scroll(705);
  assert.equal(hero.dataset.poofed, 'true');
  assert.equal(puffs.length, before + 1);
  scroll(0);
  assert.equal(hero.dataset.poofed, 'false');
  assert.equal(accents.inert, false);
  assert.equal(progress.at(-1), 0);
  scroll(710);
  assert.equal(hero.dataset.poofed, 'true');
  assert.equal(puffs.length, before + 2);
  cleanupStory();
  const cleanupRestoredStory = startHeroPoof(
    hero,
    () => {},
    () => {
      throw Error('A completed story must not puff again');
    },
    () => {},
    {
      intro: { getBoundingClientRect: () => ({ top: 1200 - window.scrollY }) },
      onProgress: () => {},
    },
  );
  scroll(0);
  assert.equal(hero.dataset.poofed, 'false');
  cleanupRestoredStory();
});

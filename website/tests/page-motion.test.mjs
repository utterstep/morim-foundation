import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  startPageMotion,
  motionFrames,
  scrollRevealProgress,
} from '../lib/page-motion.ts';

function setup(reduced = false, initialTop = 1000, insideCard = false) {
  const listeners = new Map(),
    windowListeners = new Map(),
    rootListeners = new Map(),
    pending = new Map();
  let nextFrame = 0;
  const preference = {
    matches: reduced,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  const created = [];
  class FakeElement {
    parentElement = null;
    top = 0;
    closest(selector) {
      if (selector === '.panel') return insideCard ? anchor : null;
      if (selector === '.photo-stack') return photos;
      return selector === '.mission-intro' ? intro : null;
    }
    getBoundingClientRect() {
      return {
        top: this.top + (this.parentElement?.getBoundingClientRect().top ?? 0),
      };
    }
    animate(frames, options) {
      const animation = {
        frames,
        options,
        paused: false,
        plays: 0,
        cancelled: false,
        currentTime: 0,
        pause() {
          this.paused = true;
        },
        play() {
          this.plays++;
        },
        cancel() {
          this.cancelled = true;
        },
      };
      created.push(animation);
      return animation;
    }
    contains(target) {
      return target === this;
    }
  }
  const anchor = new FakeElement();
  anchor.top = initialTop;
  const intro = new FakeElement();
  intro.parentElement = anchor;
  const photos = new FakeElement();
  photos.parentElement = anchor;
  let observer;
  class FakeResizeObserver {
    targets = new Set();
    constructor(callback) {
      this.callback = callback;
      observer = this;
    }
    observe(target) {
      this.targets.add(target);
    }
    disconnect() {
      this.targets.clear();
    }
  }
  const nodes = [];
  const root = {
    querySelectorAll(selector) {
      const node = selector.startsWith('.prose') ? intro : new FakeElement();
      node.parentElement = anchor;
      nodes.push(node);
      if (selector === '.photo-stack img') {
        const secondPhoto = new FakeElement();
        secondPhoto.parentElement = anchor;
        secondPhoto.top = 40;
        nodes.push(secondPhoto);
        return [node, secondPhoto];
      }
      return [node];
    },
    addEventListener: (name, fn) => rootListeners.set(name, fn),
    removeEventListener: (name) => rootListeners.delete(name),
  };
  globalThis.Element = FakeElement;
  globalThis.ResizeObserver = FakeResizeObserver;
  globalThis.requestAnimationFrame = (fn) => {
    pending.set(++nextFrame, fn);
    return nextFrame;
  };
  globalThis.cancelAnimationFrame = (id) => pending.delete(id);
  globalThis.window = {
    innerHeight: 1000,
    matchMedia: () => preference,
    addEventListener: (name, fn) => windowListeners.set(name, fn),
    removeEventListener: (name) => windowListeners.delete(name),
  };
  const flush = () => {
    const callbacks = [...pending.values()];
    pending.clear();
    callbacks.forEach((fn) => fn());
  };
  const cleanup = startPageMotion(root);
  const scrollTo = (top) => {
    anchor.top = top;
    windowListeners.get('scroll')?.();
    flush();
  };
  return {
    nodes,
    created,
    listeners,
    preference,
    observer,
    cleanup,
    rootListeners,
    windowListeners,
    pending,
    anchor,
    intro,
    scrollTo,
    flush,
  };
}

test('scroll progress clamps at both ends and works on a small viewport', () => {
  assert.equal(scrollRevealProgress(1000, 1000), 0);
  assert.equal(scrollRevealProgress(900, 1000), 0);
  assert.equal(scrollRevealProgress(860, 1000), 0);
  assert.equal(scrollRevealProgress(720, 1000), 0.5);
  assert.equal(scrollRevealProgress(520, 1000), 1);
  assert.equal(scrollRevealProgress(-200, 1000), 1);
  assert.equal(scrollRevealProgress(360, 500), 0.5);
});

test('reduced motion leaves content visible without scheduling work', () => {
  const state = setup(true);
  assert.equal(state.created.length, 0);
  assert.equal(state.observer, undefined);
  assert.equal(state.windowListeners.size, 0);
  state.cleanup();
});

test('card text and handwritten notes do not receive reveal animations', () => {
  const state = setup(false, 1000, true);
  assert(state.created.length > 0);
  assert(
    state.created.every(
      ({ frames }) =>
        frames !== motionFrames.text && frames !== motionFrames.note,
    ),
  );
  state.cleanup();
});

test('all reveals scrub forward, hold still, and reverse without playing a timer', () => {
  const state = setup();
  assert(
    state.created.every(
      (animation) => animation.paused && animation.currentTime === 0,
    ),
  );
  state.scrollTo(780);
  const midway = state.created.map((animation) => animation.currentTime);
  state.scrollTo(780);
  assert.deepEqual(
    state.created.map((animation) => animation.currentTime),
    midway,
  );
  state.scrollTo(300);
  assert(
    state.created.every(
      (animation) =>
        animation.currentTime ===
        animation.options.duration + animation.options.delay,
    ),
  );
  state.scrollTo(780);
  assert.deepEqual(
    state.created.map((animation) => animation.currentTime),
    midway,
  );
  state.scrollTo(1000);
  assert(
    state.created.every(
      (animation) => animation.currentTime === 0 && animation.plays === 0,
    ),
  );
  state.cleanup();
});

test('highlight, underline and stipend use ordered phases of the same scroll position', () => {
  const state = setup();
  const sequence = state.created.filter((animation) =>
    [350, 950, 1550].includes(animation.options.delay),
  );
  assert.equal(sequence.length, 3);
  state.scrollTo(650);
  assert(sequence[0].currentTime >= 850);
  assert(sequence[1].currentTime < 950);
  assert(sequence[2].currentTime < 1550);
  state.scrollTo(510);
  assert.equal(sequence[1].currentTime, 1400);
  assert(sequence[2].currentTime < 1550);
  state.scrollTo(340);
  assert.equal(sequence[2].currentTime, 2150);
  state.scrollTo(1000);
  assert(sequence.every((animation) => animation.currentTime === 0));
  state.cleanup();
});

test('restored scroll positions initialize correctly and resize recalculates', () => {
  const state = setup(false, 300);
  assert(state.created.every((animation) => animation.currentTime > 0));
  window.innerHeight = 300;
  state.windowListeners.get('resize')();
  state.flush();
  assert(state.created.every((animation) => animation.currentTime === 0));
  state.cleanup();
});

test('scroll events coalesce and layout changes remeasure offsets', () => {
  const state = setup();
  state.windowListeners.get('scroll')();
  state.windowListeners.get('scroll')();
  assert.equal(state.pending.size, 1);
  state.intro.top = -500;
  state.observer.callback();
  state.flush();
  assert(state.created[0].currentTime > 0);
  state.cleanup();
});

test('keyboard focus reveals its content without scroll hiding it again', () => {
  const state = setup();
  state.rootListeners.get('focusin')({ target: state.nodes[0] });
  assert(state.created[0].cancelled);
  state.scrollTo(600);
  assert.equal(state.created[0].currentTime, 0);
  state.cleanup();
});

test('switching to reduced motion cancels animations and all scheduled work', () => {
  const state = setup();
  state.windowListeners.get('scroll')();
  state.preference.matches = true;
  state.listeners.get('change')();
  assert(state.created.every((animation) => animation.cancelled));
  assert.equal(state.observer.targets.size, 0);
  assert.equal(state.pending.size, 0);
  assert.equal(state.windowListeners.size, 0);
  state.cleanup();
  assert.equal(state.listeners.size, 0);
  assert.equal(state.rootListeners.size, 0);
});

test('cleanup releases styles, observers, and listeners', () => {
  const state = setup();
  state.cleanup();
  assert(state.created.every((animation) => animation.cancelled));
  assert.equal(state.observer.targets.size, 0);
  assert.equal(state.rootListeners.size, 0);
  assert.equal(state.windowListeners.size, 0);
  assert.equal(state.listeners.size, 0);
});

test('motion preserves authored transforms and ends at neutral offsets', () => {
  for (const frames of Object.values(motionFrames)) {
    assert(frames.every((frame) => !('transform' in frame)));
    const end = frames.at(-1);
    if ('rotate' in end) assert.equal(end.rotate, '0deg');
    if ('translate' in end) assert.equal(end.translate, '0 0');
    if ('scale' in end) assert.equal(end.scale, '1');
  }
});

test('photos share a gradual scroll timeline without bounce or overshoot', () => {
  const state = setup();
  const photos = state.created.filter(
    ({ frames }) => frames === motionFrames.photo,
  );
  assert.equal(photos.length, 2);
  assert.equal(motionFrames.photo.length, 2);
  assert.deepEqual(
    photos.map(({ options }) => options.delay),
    [0, 90],
  );
  state.scrollTo(600);
  assert.equal(photos[0].currentTime, photos[1].currentTime);
  assert(photos[0].currentTime > 0 && photos[0].currentTime < 1000);
  const midway = photos[0].currentTime;
  state.scrollTo(300);
  assert.equal(photos[0].currentTime, 1000);
  assert.equal(photos[1].currentTime, 1090);
  state.scrollTo(600);
  assert.equal(photos[0].currentTime, midway);
  state.cleanup();
});

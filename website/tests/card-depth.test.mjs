import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  cardEntryPose,
  cardEntryScale,
  startCardDepth,
} from '../lib/card-depth.ts';

test('cards scale down prominently and unroll flat before the reading area', () => {
  assert.equal(cardEntryScale(1000, 1000), 1.08);
  assert.equal(cardEntryScale(650, 1000), 1.04);
  assert.equal(cardEntryScale(300, 1000), 1);
  assert.equal(cardEntryScale(-3000, 1000), 1);
  assert.equal(cardEntryScale(3000, 1000), 1.08);
  assert.equal(cardEntryScale(100, 0), 1);
  let previous = 1.08;
  for (let top = 1000; top >= 0; top -= 10) {
    const current = cardEntryScale(top, 1000);
    assert(current <= previous && current >= 1);
    previous = current;
  }
  assert.deepEqual(cardEntryPose(1000, 1000), {
    scale: 1.08,
    tilt: -8,
    shadow: 0.18,
  });
  assert.deepEqual(cardEntryPose(1000, 1000, true), {
    scale: 1.04,
    tilt: -4,
    shadow: 0.18,
  });
  assert.equal(cardEntryPose(300, 1000).tilt, 0);
  assert.equal(cardEntryPose(300, 1000).shadow, 0);
});

test('depth follows scroll, resets for reduced motion and cleans up', () => {
  let top = 1000;
  let pending;
  let observer;
  const properties = new Map();
  const events = new Map();
  const preferenceEvents = new Map();
  const preference = {
    matches: true,
    addEventListener: (name, fn) => preferenceEvents.set(name, fn),
    removeEventListener: (name) => preferenceEvents.delete(name),
  };
  const card = {
    getBoundingClientRect: () => ({ top }),
    style: {
      getPropertyValue: (name) => properties.get(name),
      setProperty: (name, value) => properties.set(name, value),
      removeProperty: (name) => properties.delete(name),
    },
  };
  globalThis.window = {
    innerHeight: 1000,
    matchMedia: () => preference,
    addEventListener: (name, fn) => events.set(name, fn),
    removeEventListener: (name) => events.delete(name),
  };
  globalThis.requestAnimationFrame = (fn) => {
    pending = fn;
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {
    pending = undefined;
  };
  globalThis.ResizeObserver = class {
    constructor() {
      observer = this;
    }
    observe() {}
    disconnect() {
      this.disconnected = true;
    }
  };
  const stop = startCardDepth({ querySelectorAll: () => [card] });
  assert.equal(properties.get('--card-entry-scale'), '1.08000');
  assert.equal(properties.get('--card-entry-tilt'), '-8.000deg');
  top = 200;
  events.get('scroll')();
  pending();
  assert.equal(properties.get('--card-entry-scale'), '1.00000');
  top = 1000;
  preference.matches = false;
  preferenceEvents.get('change')();
  pending();
  assert.equal(properties.get('--card-entry-scale'), '1.00000');
  assert.equal(properties.get('--card-entry-tilt'), '0.000deg');
  assert.equal(properties.get('--card-entry-shadow'), '0.0000');
  events.get('resize')();
  stop();
  assert.equal(properties.size, 0);
  assert.equal(events.size, 0);
  assert.equal(preferenceEvents.size, 0);
  assert.equal(pending, undefined);
  assert(observer.disconnected);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  shouldShowFloatingApply,
  watchProgramsViewport,
} from '../lib/floating-apply.ts';

const offscreen = { top: 2000, bottom: 2400 };

test('requires at least 70% of the viewport, including the exact boundary', () => {
  assert.equal(
    shouldShowFloatingApply({ top: 301, bottom: 3000 }, offscreen, 1000, true),
    false,
  );
  assert.equal(
    shouldShowFloatingApply({ top: 300, bottom: 3000 }, offscreen, 1000, true),
    true,
  );
  assert.equal(
    shouldShowFloatingApply({ top: -2000, bottom: 699 }, offscreen, 1000, true),
    false,
  );
  assert.equal(
    shouldShowFloatingApply({ top: -2000, bottom: 700 }, offscreen, 1000, true),
    true,
  );
});

test('uses viewport coverage, not the fraction of a tall card that is visible', () => {
  assert.equal(
    shouldShowFloatingApply({ top: -500, bottom: 5000 }, offscreen, 1000, true),
    true,
  );
});

test('program visibility and availability override coverage', () => {
  const card = { top: 0, bottom: 3000 };
  assert.equal(
    shouldShowFloatingApply(card, { top: 999, bottom: 1400 }, 1000, true),
    false,
  );
  assert.equal(
    shouldShowFloatingApply(card, { top: -400, bottom: 1 }, 1000, true),
    false,
  );
  assert.equal(shouldShowFloatingApply(card, offscreen, 1000, false), false);
  assert.equal(shouldShowFloatingApply(card, offscreen, 0, true), false);
});

test('excludes areas covered by the next card', () => {
  const card = { top: -400, bottom: 950 };
  assert.equal(
    shouldShowFloatingApply(card, offscreen, 1000, true, 699),
    false,
  );
  assert.equal(shouldShowFloatingApply(card, offscreen, 1000, true, 700), true);
  assert.equal(
    shouldShowFloatingApply(card, offscreen, 1000, true, -100),
    false,
  );
});

test('scroll, filters and resize update visibility; fading-out controls become inert', () => {
  const listeners = new Map();
  const observers = [];
  let scheduled;
  const cardBounds = { top: 400, bottom: 3000 };
  const programBounds = { ...offscreen };
  let available = true;
  const programs = {
    getBoundingClientRect: () => programBounds,
    querySelector: () => (available ? {} : null),
  };
  const card = {
    getBoundingClientRect: () => cardBounds,
    querySelector: () => programs,
    nextElementSibling: null,
  };
  const rail = { dataset: {}, inert: true, closest: () => card };
  class FakeObserver {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe() {}
    disconnect() {
      this.disconnected = true;
    }
  }
  globalThis.ResizeObserver = FakeObserver;
  globalThis.MutationObserver = FakeObserver;
  globalThis.requestAnimationFrame = (callback) => {
    scheduled = callback;
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {
    scheduled = undefined;
  };
  globalThis.window = {
    innerHeight: 1000,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  const cleanup = watchProgramsViewport(rail);
  assert.equal(rail.dataset.applyVisible, 'false');
  cardBounds.top = 300;
  listeners.get('scroll')();
  const pending = scheduled;
  listeners.get('scroll')();
  assert.equal(scheduled, pending);
  scheduled();
  assert.equal(rail.dataset.applyVisible, 'true');
  assert.equal(rail.inert, false);
  programBounds.top = 999;
  listeners.get('scroll')();
  scheduled();
  assert.equal(rail.dataset.applyVisible, 'false');
  assert.equal(rail.inert, true);
  programBounds.top = 2000;
  available = false;
  observers[1].callback();
  scheduled();
  assert.equal(rail.dataset.applyVisible, 'false');
  available = true;
  observers[1].callback();
  scheduled();
  assert.equal(rail.dataset.applyVisible, 'true');
  window.innerHeight = 800;
  listeners.get('resize')();
  scheduled();
  assert.equal(rail.dataset.applyVisible, 'false');
  listeners.get('scroll')();
  cleanup();
  assert.equal(scheduled, undefined);
  assert.equal(listeners.size, 0);
  assert(observers.every((observer) => observer.disconnected));
  assert.equal(rail.dataset.applyVisible, undefined);
  assert.equal(rail.inert, true);
});

test('cards without programs remain hidden', () => {
  const rail = { dataset: {}, closest: () => null };
  watchProgramsViewport(rail)();
  assert.equal(rail.dataset.applyVisible, undefined);
  assert.equal(rail.inert, true);
});

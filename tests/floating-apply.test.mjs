import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  shouldShowFloatingApply,
  watchApplyButtons,
} from '../src/js/lib/floating-apply.js';

const above = { top: -400, bottom: -344 };
const below = { top: 2000, bottom: 2056 };

test('nothing floats until the anchor (the hero) has scrolled off the top', () => {
  assert.equal(shouldShowFloatingApply({ top: 300, bottom: 356 }, [], 1000), false);
  assert.equal(shouldShowFloatingApply({ top: -50, bottom: 1 }, [], 1000), false);
  assert.equal(shouldShowFloatingApply({ top: -56, bottom: 0 }, [], 1000), true);
  assert.equal(shouldShowFloatingApply(null, [], 1000), false);
  assert.equal(shouldShowFloatingApply(above, [], 0), false);
});

test('any Apply in view, including the exact edges, hides the floating one', () => {
  assert.equal(shouldShowFloatingApply(above, [above, below], 1000), true);
  assert.equal(shouldShowFloatingApply(above, [above, { top: 999, bottom: 1055 }], 1000), false);
  assert.equal(shouldShowFloatingApply(above, [above, { top: 1000, bottom: 1056 }], 1000), true);
  assert.equal(shouldShowFloatingApply(above, [above, { top: -55, bottom: 1 }], 1000), false);
  assert.equal(shouldShowFloatingApply(above, [above, { top: -56, bottom: 0 }], 1000), true);
});

test('scroll and resize update visibility; the fading rail becomes inert', () => {
  const listeners = new Map();
  let scheduled;
  const hero = { top: -600, bottom: 356 };
  const footer = { ...below };
  const button = (bounds) => ({ getBoundingClientRect: () => bounds });
  const root = {
    querySelector: (s) => (s === '.hero' ? button(hero) : null),
    querySelectorAll: () => [button(footer)],
  };
  const rail = { dataset: { anchor: '.hero' }, inert: true };
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
  const cleanup = watchApplyButtons(rail, root);
  assert.equal(rail.dataset.applyVisible, 'false');
  assert.equal(rail.inert, true);
  hero.top = -1000;
  hero.bottom = -44;
  listeners.get('scroll')();
  const pending = scheduled;
  listeners.get('scroll')();
  assert.equal(scheduled, pending);
  scheduled();
  assert.equal(rail.dataset.applyVisible, 'true');
  assert.equal(rail.inert, false);
  footer.top = 900;
  footer.bottom = 956;
  listeners.get('scroll')();
  scheduled();
  assert.equal(rail.dataset.applyVisible, 'false');
  assert.equal(rail.inert, true);
  window.innerHeight = 800;
  listeners.get('resize')();
  scheduled();
  assert.equal(rail.dataset.applyVisible, 'true');
  listeners.get('scroll')();
  cleanup();
  assert.equal(scheduled, undefined);
  assert.equal(listeners.size, 0);
  assert.equal(rail.dataset.applyVisible, undefined);
  assert.equal(rail.inert, true);
});

test('a page without Apply buttons or anchor keeps the rail hidden', () => {
  const rail = { dataset: {} };
  watchApplyButtons(rail, { querySelector: () => null, querySelectorAll: () => [] })();
  assert.equal(rail.dataset.applyVisible, undefined);
  watchApplyButtons(rail, { querySelector: () => ({}), querySelectorAll: () => [] })();
  assert.equal(rail.dataset.applyVisible, undefined);
  assert.equal(rail.inert, true);
});

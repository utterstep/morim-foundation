import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stackTop, startCardStack } from '../lib/card-stack.ts';

test('short cards settle below the top of the viewport', () => {
  assert.equal(stackTop(600, 900), 32);
});

test('long cards remain readable before they pin at the bottom', () => {
  for (const height of [900, 1500, 2800]) {
    assert.equal(stackTop(height, 900) + height, 868);
  }
});

test('resize and changing program content update the stacking position', () => {
  const properties = new Map();
  const listeners = new Map();
  const layer = {
    offsetHeight: 1600,
    style: {
      setProperty: (name, value) => properties.set(name, value),
      removeProperty: (name) => properties.delete(name),
    },
  };
  const stack = { dataset: {}, querySelectorAll: () => [layer] };
  let observer;
  class FakeObserver {
    constructor(update) {
      this.update = update;
      observer = this;
    }
    observe() {}
    disconnect() {
      this.disconnected = true;
    }
  }
  globalThis.ResizeObserver = FakeObserver;
  globalThis.window = {
    ResizeObserver: FakeObserver,
    innerHeight: 900,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  const stop = startCardStack({ querySelector: () => stack });
  assert.equal(properties.get('--stack-top'), '-732px');
  assert.equal(stack.dataset.stackReady, 'true');
  layer.offsetHeight = 1400;
  observer.update();
  assert.equal(properties.get('--stack-top'), '-532px');
  window.innerHeight = 700;
  listeners.get('resize')();
  assert.equal(properties.get('--stack-top'), '-732px');
  stop();
  assert.equal(properties.size, 0);
  assert.equal(stack.dataset.stackReady, undefined);
  assert.equal(listeners.size, 0);
  assert(observer.disconnected);
});

test('unsupported browsers retain the normal reading flow', () => {
  globalThis.window = {};
  const stop = startCardStack({
    querySelector() {
      throw new Error('must not modify layout');
    },
  });
  stop();
});

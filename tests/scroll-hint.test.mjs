import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGestureCounter, GESTURE_GAP_MS } from '../src/js/scroll-hint.js';

test('a run of scroll events with short gaps is one gesture', () => {
  const counter = createGestureCounter(2);
  for (const t of [0, 16, 32, 48, 200]) assert.equal(counter.scroll(t), false);
  assert.equal(counter.count, 1);
});

test('the second gesture, after a quiet gap, completes the count', () => {
  const counter = createGestureCounter(2);
  counter.scroll(0);
  counter.scroll(100);
  assert.equal(counter.scroll(100 + GESTURE_GAP_MS), false, 'a gap of exactly the threshold continues the gesture');
  assert.equal(counter.scroll(100 + GESTURE_GAP_MS + 1 + GESTURE_GAP_MS), true);
  assert.equal(counter.count, 2);
});

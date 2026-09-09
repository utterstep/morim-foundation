import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { heroApps, dragOffset, isDragGesture } from '../src/js/lib/hero-apps.js';

test('all seven Figma apps have local assets', () => {
  assert.equal(heroApps.length, 7);
  for (const app of heroApps) {
    assert(app.src.startsWith('file:'), app.name);
    const path = fileURLToPath(app.src);
    assert(existsSync(path), app.name);
    assert(statSync(path).size > 1000, app.name);
  }
});

test('tap jitter is not mistaken for a drag', () => {
  assert.equal(isDragGesture(0, 0), false);
  assert.equal(isDragGesture(3, 4), false);
  assert.equal(isDragGesture(6, 0), false);
  assert.equal(isDragGesture(5, 5), true);
  assert.equal(isDragGesture(-7, 0), true);
});

test('dragging supports repeated moves and stays inside the hero boundary', () => {
  const limits = { minX: -40, maxX: 100, minY: -100, maxY: 30 };
  assert.deepEqual(dragOffset({ x: 10, y: 5 }, { x: 20, y: -10 }, limits), {
    x: 30,
    y: -5,
  });
  assert.deepEqual(dragOffset({ x: 30, y: -5 }, { x: 1000, y: 1000 }, limits), {
    x: 100,
    y: 30,
  });
  assert.deepEqual(
    dragOffset({ x: 30, y: -5 }, { x: -1000, y: -1000 }, limits),
    { x: -40, y: -100 },
  );
});

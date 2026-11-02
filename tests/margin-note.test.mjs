import assert from 'node:assert/strict';
import { test } from 'node:test';
import { arrowEnds, arrowPath } from '../src/js/margin-note.js';

const rect = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height });

test('the arrow runs from the note to just past the claim, in the paragraph’s coordinates', () => {
  const box = rect(385, 1000, 670, 90);
  const last = rect(570, 1060, 300, 30); // "never designed to handle that."
  const note = rect(1127, 1058, 240, 170);
  const { from, to } = arrowEnds(box, note, last, 34, 10);
  assert.deepEqual(to, { x: 870 + 10 - 385, y: 75 });
  assert.deepEqual(from, { x: 1127 - 10 - 385, y: 1058 + 17 - 1000 });
  // It never reaches back into the line: the tip is after the text's end.
  assert.ok(to.x > last.right - box.left);
  assert.ok(from.x > to.x);
});

test('right to left: the note in the left margin, the tip before the line’s start', () => {
  const box = rect(385, 1000, 670, 90);
  const last = rect(570, 1060, 300, 30);
  const note = rect(70, 1058, 240, 170);
  const { from, to } = arrowEnds(box, note, last, 34, 10);
  assert.equal(to.x, 570 - 10 - 385);
  assert.equal(from.x, 310 + 10 - 385);
});

test('the path is one stroke and an open head ending at the tip', () => {
  const d = arrowPath({ x: 300, y: 40 }, { x: 100, y: 40 }, 6, 10);
  assert.match(d, /^M300 40Q200 46 100 40M[\d.]+ [\d.]+L100 40L[\d.]+ [\d.]+$/);
  // Both arms sit behind the tip, on the stroke's side.
  const arms = [...d.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].slice(1).map((m) => Number(m[1]));
  assert.ok(arms[0] > 100 && arms[2] > 100);
});

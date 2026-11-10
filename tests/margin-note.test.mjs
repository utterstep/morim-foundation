import assert from 'node:assert/strict';
import { test } from 'node:test';
import { arrowEnds, arrowPath } from '../src/js/margin-note.js';

const rect = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height });

// The first stance row at 1440: the row's top rule at y = 1000, "Curious"
// on the title's first line, the note hanging over the rule on the end side.
const row = rect(96, 1000, 1248, 230);
const word = rect(308, 1040, 150, 52);

test('the arrow leaves the note’s near edge and lands just above the marked word, in the row’s coordinates', () => {
  const note = rect(880, 860, 260, 126);
  const { from, to } = arrowEnds(row, note, word, 7);
  // From the edge facing the word, below the note's middle.
  assert.deepEqual(from, { x: 880 - 7 - 96, y: 860 + 126 * 0.62 - 1000 });
  // To a little above the word, on the half of it nearer the note.
  assert.deepEqual(to, { x: 308 + 150 * 0.65 - 96, y: 1040 - 7 - 1000 });
  // It starts above the row's rule and ends below it, short of the word.
  assert.ok(from.y < 0 && to.y > 0 && to.y < word.top - row.top);
  assert.ok(from.x > to.x);
});

test('right to left: the note on the left, the tip over the word’s near half', () => {
  const note = rect(300, 860, 260, 126);
  const mirrored = rect(982, 1040, 150, 52);
  const { from, to } = arrowEnds(row, note, mirrored, 7);
  assert.equal(from.x, 560 + 7 - 96);
  assert.equal(to.x, 982 + 150 * 0.35 - 96);
  assert.ok(from.x < to.x);
});

test('the path is one stroke and an open head ending at the tip', () => {
  const d = arrowPath({ x: 300, y: 40 }, { x: 100, y: 40 }, 6, 10);
  assert.match(d, /^M300 40Q200 46 100 40M[\d.]+ [\d.]+L100 40L[\d.]+ [\d.]+$/);
  // Both arms sit behind the tip, on the stroke's side.
  const arms = [...d.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].slice(1).map((m) => Number(m[1]));
  assert.ok(arms[0] > 100 && arms[2] > 100);
});

test('a stroke that rises in the middle bows over a straight line between its ends', () => {
  const d = arrowPath({ x: 780, y: -60 }, { x: 310, y: 33 }, -14, 9);
  const [, cx, cy] = d.match(/Q([\d.-]+) ([\d.-]+)/).map(Number);
  assert.equal(cx, 545);
  assert.equal(cy, (-60 + 33) / 2 - 14);
});

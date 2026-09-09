import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createHeroStoryFloaters,
  replaceHeroFloater,
  heroCompositionSlots,
} from '../src/js/lib/hero-floating.js';
import { heroVideos } from '../src/js/lib/hero-videos.js';

test('every video in each pool appears before the pool repeats', () => {
  for (const slot of [2, 3, 4]) {
    let items = createHeroStoryFloaters(() => 0.5);
    const pool = heroCompositionSlots[slot].previews;
    for (let cycle = 0; cycle < 3; cycle++) {
      const seen = new Set();
      for (let count = 0; count < pool.length; count++) {
        assert(!seen.has(items[slot].preview));
        seen.add(items[slot].preview);
        const previous = items[slot].preview;
        items = replaceHeroFloater(items, slot, () => 0.5);
        assert.notEqual(items[slot].preview, previous);
      }
      assert.equal(seen.size, pool.length);
    }
  }
});

test('a new page load avoids the last displayed clips even with the same random seed', () => {
  const previous = createHeroStoryFloaters(() => 0.25);
  const lastIds = previous
    .filter((item) => item.kind === 'media')
    .map((item) => heroVideos[item.preview].id);
  const next = createHeroStoryFloaters(() => 0.25, lastIds);
  for (const item of next.filter((item) => item.kind === 'media')) {
    assert(!lastIds.includes(heroVideos[item.preview].id));
  }
});

test('placement changes stay inside their composition zones without moving other cards', () => {
  const previous = createHeroStoryFloaters(() => 0.1);
  const next = replaceHeroFloater(previous, 2, () => 0.9);
  assert.notEqual(next[2].x, previous[2].x);
  assert.notEqual(next[2].mobileX, previous[2].mobileX);
  previous.forEach((item, slot) => {
    if (slot !== 2) assert.equal(next[slot], item);
  });
});

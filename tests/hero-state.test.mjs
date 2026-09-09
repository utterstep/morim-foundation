import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  deriveHeroFlags,
  describeFloater,
  entryDelay,
  finishDismiss,
  floaterLabel,
  floaterStyle,
  formatTemplate,
  lastVideoIds,
  parseLastVideoIds,
} from '../src/js/hero/hero-state.js';
import { createHeroStoryFloaters, heroCompositionSlots } from '../src/js/lib/hero-floating.js';
import { heroVideos } from '../src/js/lib/hero-videos.js';

const seeded = (seed) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

test('playing needs visibility and motion; looping also needs no focus or drag', () => {
  assert.deepEqual(deriveHeroFlags({ visible: true, reduced: false, focused: false, dragging: false }), {
    playing: true,
    looping: true,
  });
  assert.deepEqual(deriveHeroFlags({ visible: true, reduced: false, focused: true, dragging: false }), {
    playing: true,
    looping: false,
  });
  assert.deepEqual(deriveHeroFlags({ visible: false, reduced: false, focused: false, dragging: false }), {
    playing: false,
    looping: false,
  });
  assert.equal(deriveHeroFlags({ visible: true, reduced: true, focused: false, dragging: false }).playing, false);
});

test('entry delay only applies to the first eight appearances', () => {
  assert.equal(entryDelay(3, 3), '610ms');
  assert.equal(entryDelay(8, 3), '0ms');
  assert.equal(entryDelay(11, 3), '0ms');
});

test('floater style carries every property the CSS reads', () => {
  const floaters = createHeroStoryFloaters(seeded(1));
  floaters.forEach((item, slot) => {
    const style = floaterStyle(item, slot);
    const composition = heroCompositionSlots[item.compositionSlot];
    assert.equal(style['--float-x'], item.x);
    assert.equal(style['--float-y'], item.y);
    assert.equal(style['--app-tilt'], `${item.tilt}deg`);
    assert.equal(style['--float-mobile-x'], item.mobileX ?? composition.mobileX);
    assert.equal(style['--float-mobile-y'], item.mobileY ?? composition.mobileY);
    assert.equal(style['--composition-layer'], composition.layer);
    assert.equal(style['--entry-delay'], '0ms');
  });
});

test('story floaters are icons in five slots and videos in three', () => {
  const floaters = createHeroStoryFloaters(seeded(7));
  const kinds = floaters.map((item) => describeFloater(item).kind);
  assert.deepEqual(kinds, ['icon', 'icon', 'media', 'media', 'media', 'icon', 'icon', 'icon']);
  assert.equal(describeFloater(floaters[4]).video.provider, 'twitch');
  assert.equal(describeFloater(floaters[3]).format, 'landscape');
  assert.equal(describeFloater(floaters[2]).format, 'portrait');
});

test('labels come from translated templates', () => {
  assert.equal(formatTemplate('Dismiss {app} now', { app: 'TikTok' }), 'Dismiss TikTok now');
  assert.equal(formatTemplate('{missing}', {}), '{missing}');
  const floaters = createHeroStoryFloaters(seeded(3));
  const icon = floaters[0];
  const label = floaterLabel(icon, { labelIcon: 'Убрать {app}' });
  assert.match(label, /^Убрать /);
  assert.equal(floaterLabel(floaters[2], { labelIcon: 'x' }), describeFloater(floaters[2]).video.title);
});

test('finishing a dismissal replaces only that slot and resets its timing', () => {
  const before = createHeroStoryFloaters(seeded(5));
  const after = finishDismiss(before, 1, seeded(9));
  assert.equal(after.length, 8);
  assert.equal(after[1].appearance, before[1].appearance + 1);
  assert.equal(after[1].duration, 700);
  assert.equal(after[1].delay, 0);
  after.forEach((item, index) => {
    if (index !== 1) assert.deepEqual(item, before[index]);
  });
});

test('last video ids round-trip through storage and survive garbage', () => {
  const floaters = createHeroStoryFloaters(seeded(11));
  const ids = lastVideoIds(floaters);
  assert.equal(ids.length, 3);
  ids.forEach((id) => assert.ok(heroVideos.some((video) => video.id === id)));
  assert.deepEqual(parseLastVideoIds(JSON.stringify(ids)), ids);
  assert.deepEqual(parseLastVideoIds('not json'), []);
  assert.deepEqual(parseLastVideoIds('{"a":1}'), []);
  assert.deepEqual(parseLastVideoIds(JSON.stringify(['x', 2, null])), ['x']);
  assert.deepEqual(parseLastVideoIds(null), []);
});

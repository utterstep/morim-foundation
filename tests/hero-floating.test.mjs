import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import {
  replaceHeroFloater,
  heroFloatMotions,
  createHeroStoryFloaters,
  heroCompositionSlots,
} from '../src/js/lib/hero-floating.js';

// PR #3's hero.tsx became several modules under src/js/hero/; read them as one source.
function heroSource() {
  const dir = new URL('../src/js/hero/', import.meta.url);
  return readdirSync(dir)
    .filter((name) => name.endsWith('.js'))
    .sort()
    .map((name) => readFileSync(new URL(name, dir), 'utf8'))
    .join('\n');
}

function randomSource() {
  let seed = 345;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test('inline collage has no automatic entrance animation or clipping mask', () => {
  assert.deepEqual(
    heroFloatMotions.map((item) => item.motion),
    ['bob', 'drift', 'tilt'],
  );
  const css = readFileSync(
    new URL('../src/css/hero.css', import.meta.url),
    'utf8',
  );
  const appearance = css
    .split('.hero-editorial .hero-app-bob {')[1]
    .split('}')[0];
  assert(appearance.includes('animation: none'));
  assert(appearance.includes('transform: none'));
  assert(!css.includes('@keyframes hero-story-arrive'));
  assert(!css.includes('clip-path:'));
});

test('story begins with two icons and expands to eight distinct items with three videos', () => {
  const items = createHeroStoryFloaters(randomSource());
  assert.equal(items.length, 8);
  assert(items.slice(0, 2).every((item) => item.kind === 'icon'));
  assert.equal(items.filter((item) => item.kind === 'media').length, 3);
  assert.equal(
    new Set(
      items.map(
        (item) =>
          `${item.kind}:${item.kind === 'icon' ? item.app : item.preview}`,
      ),
    ).size,
    8,
  );
  assert(items.every((item) => item.duration === 700 && item.delay <= 400));
  assert(
    items.every(
      (item) => item.x >= 0 && item.x <= 1 && item.y >= 0 && item.y <= 1,
    ),
  );
});

test('click replacement preserves the collage count and changes only the clicked content', () => {
  const random = randomSource();
  let items = createHeroStoryFloaters(random);
  const content = (item) =>
    `${item.kind}:${item.kind === 'media' ? item.preview : item.app}`;
  for (let index = 0; index < 100; index++) {
    const slot = index % 8;
    const previous = items;
    items = replaceHeroFloater(previous, slot, random);
    assert.equal(items.length, 8);
    assert.notEqual(content(items[slot]), content(previous[slot]));
    assert.equal(new Set(items.map(content)).size, 8);
    previous.forEach((item, other) => {
      if (other !== slot) assert.equal(items[other], item);
    });
  }
});

test('manual dismissal plays smoke, hides immediately, and replaces after the poof', () => {
  const hero = heroSource();
  const css = readFileSync(
    new URL('../src/css/hero.css', import.meta.url),
    'utf8',
  );
  // The face fades itself under the cloud, so the poof must not hide it.
  assert(/poofElement\([^)]*hide: false/.test(hero));
  assert(hero.includes('POOF_DURATION_MS'));
  assert(hero.includes('replaceHeroFloater('));
  // A click that ends a drag must not count as a dismissal.
  assert(hero.includes('event.detail !== 0'));
  const dismissal = css
    .split(
      ".hero-editorial .hero-app-item[data-dismissing='true'] .hero-app-face {",
    )[1]
    .split('}')[0];
  assert(dismissal.includes('animation: none'));
  assert(dismissal.includes('opacity: 0'));
  assert(!css.includes('@keyframes hero-sink-dismiss'));
});

test('video cards have a full-face keyboard-accessible poof target', () => {
  const css = readFileSync(
    new URL('../src/css/hero.css', import.meta.url),
    'utf8',
  );
  const target = css.split('.hero-video-poof-target {')[1].split('}')[0];
  assert(target.includes('inset: 0'));
  assert(target.includes('z-index: 2'));
  const hero = heroSource();
  // Only the Twitch iframe stays interactive; other players are covered by the poof target.
  assert(hero.includes("interactive: video.provider === 'twitch'"));
  assert(hero.includes("'hero-video-poof-target'"));
  const video = readFileSync(
    new URL('../src/js/hero/hero-player.js', import.meta.url),
    'utf8',
  );
  // Non-interactive players are removed from the tab order.
  assert(/tab[Ii]ndex[^;\n]*-1/.test(video));
});

test('repeated replacements retain composition roles, geometry, layering, and video count', () => {
  const random = randomSource();
  let items = createHeroStoryFloaters(random);
  const original = items;
  for (let turn = 0; turn < 1000; turn++) {
    const slot = turn % items.length;
    items = replaceHeroFloater(items, slot, random);
    assert.equal(items.filter((item) => item.kind === 'media').length, 3);
    items.forEach((item, index) => {
      const placement = heroCompositionSlots[index];
      assert.equal(item.compositionSlot, index);
      assert.equal(item.kind, original[index].kind);
      assert(Math.abs(item.x - placement.x) <= 0.035001);
      assert(Math.abs(item.y - placement.y) <= 0.035001);
      assert(Math.abs(item.mobileX - placement.mobileX) <= 0.021001);
      assert(Math.abs(item.mobileY - placement.mobileY) <= 0.021001);
      if (index === 4) assert.equal(item.tilt, 0);
      else assert(Math.abs(item.tilt - placement.tilt) <= 1.50001);
      assert(placement.mobileX >= 0 && placement.mobileX <= 1);
      assert(placement.mobileY >= 0 && placement.mobileY <= 1);
      if ('previews' in placement) {
        assert(placement.previews.includes(item.preview));
        assert(placement.layer <= 3);
      } else assert(placement.layer >= 4);
    });
  }
});

test('icon artwork is masked independently from badges and mobile uses composition anchors', () => {
  const css = readFileSync(
    new URL('../src/css/hero.css', import.meta.url),
    'utf8',
  );
  const mask = css.split('.hero-app-icon-mask {')[1].split('}')[0];
  assert(mask.includes('border-radius: 26%'));
  assert(mask.includes('overflow: hidden'));
  assert(css.includes('var(--composition-layer, 2)'));
  assert(css.includes('--float-mobile-x') && css.includes('--float-mobile-y'));
  const hero = heroSource();
  // The badge is a sibling of the mask inside the face, so the mask's
  // overflow clipping never crops it.
  assert(hero.includes("mask.className = 'hero-app-icon-mask'"));
  assert(hero.includes('mask.append(img)'));
  assert(hero.includes('face.append(slot.badge.el)'));
  assert(!hero.includes('mask.append(slot.badge'));
});

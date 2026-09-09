import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  createHeroFloaters,
  replaceHeroFloater,
  MAX_HERO_FLOATERS,
  HERO_VIDEO_COUNT,
  heroFloatMotions,
  createHeroStoryFloaters,
  heroCompositionSlots,
} from '../lib/hero-floating.ts';

function randomSource() {
  let seed = 345;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test('random arrivals keep a strict three-element cap with unique content and bounded positions', () => {
  const random = randomSource();
  let items = createHeroFloaters(random);
  const seen = new Set(),
    positions = new Set(),
    durations = new Set();
  const content = (item) =>
    `${item.kind}:${item.kind === 'icon' ? item.app : item.preview}`;
  for (let i = 0; i < 600; i++) {
    assert.equal(items.length, MAX_HERO_FLOATERS);
    assert.equal(new Set(items.map(content)).size, 3);
    for (const item of items) {
      assert(item.x >= 0 && item.x <= 1 && item.y >= 0 && item.y <= 1);
      assert(
        item.kind === 'media'
          ? item.duration >= 18000 && item.duration <= 24000
          : item.duration >= 7000 && item.duration <= 9500,
      );
      assert(item.delay >= 0 && item.delay <= 1750);
      assert(Math.abs(item.driftX) <= 4 && Math.abs(item.driftY) <= 4);
      assert(Math.abs(item.rock) <= 1.2 && Math.abs(item.tilt) <= 5);
      seen.add(content(item));
      positions.add(`${item.x}:${item.y}`);
      durations.add(item.duration);
    }
    const slot = i % 3,
      previous = items;
    items = replaceHeroFloater(items, slot, random);
    assert.notEqual(content(items[slot]), content(previous[slot]));
    assert.equal(items[slot].appearance, previous[slot].appearance + 1);
    assert.equal(items[(slot + 1) % 3], previous[(slot + 1) % 3]);
  }
  assert.equal(seen.size, 7 + HERO_VIDEO_COUNT);
  assert(positions.size > 500);
  assert(durations.size > 100);
  assert.equal(replaceHeroFloater(items, 9, random), items);
});

test('inline collage has no automatic entrance animation or clipping mask', () => {
  assert.deepEqual(
    heroFloatMotions.map((item) => item.motion),
    ['bob', 'drift', 'tilt'],
  );
  const css = readFileSync(
    new URL('../app/hero-floating.css', import.meta.url),
    'utf8',
  );
  const appearance = css
    .split('.hero-editorial .hero-app-bob {')[1]
    .split('}')[0];
  assert(appearance.includes('animation: none'));
  assert(appearance.includes('--story-blur'));
  assert(appearance.includes('transform: none'));
  assert(appearance.includes('--story-opacity'));
  assert(!css.includes('@keyframes hero-story-arrive'));
  assert(!css.includes('clip-path:'));
});

test('static collage is larger, overlaps but, and still reserves space above the copy', () => {
  const css = readFileSync(
    new URL('../app/hero-floating.css', import.meta.url),
    'utf8',
  );
  const field = css
    .split(".hero-editorial[data-media-layout='static'] > .hero-accents {")[1]
    .split('}')[0];
  assert(field.includes('display: block'));
  assert(field.includes('position: relative'));
  assert(field.includes('inset: auto'));
  assert(field.includes('transform: none'));
  assert(field.includes('width: min(56rem, calc(100vw - 3.5rem))'));
  assert(field.includes('height: 28rem'));
  assert(field.includes('margin: -6rem auto 0'));
  assert(!field.includes('--title-top') && !field.includes('--title-height'));
  const hero = readFileSync(
    new URL('../app/hero.tsx', import.meta.url),
    'utf8',
  );
  const poofEffect = hero
    .split('return startHeroPoof(')[0]
    .split('useEffect(() => {')
    .at(-1);
  assert(poofEffect.includes("if (variant === 'original') return"));
  assert(
    hero.includes('scrollReveal={scrollCollage ? collageProgress : undefined}'),
  );
  assert(
    hero.indexOf("{variant === 'original' && accents}") >
      hero.lastIndexOf('</h1>'),
  );
});

test('scroll variation overlays the headline without being fixed or floating', () => {
  const css = readFileSync(
    new URL('../app/hero-floating.css', import.meta.url),
    'utf8',
  );
  const field = css
    .split(".hero-editorial[data-media-layout='scroll'] > .hero-accents {")[1]
    .split('}')[0];
  assert(field.includes('position: absolute'));
  assert(field.includes('--but-center-y'));
  assert(!field.includes('position: fixed') && !field.includes('animation:'));
  const hero = readFileSync(
    new URL('../app/hero.tsx', import.meta.url),
    'utf8',
  );
  assert(hero.includes('aria-pressed={mediaMode === mode}'));
  assert(hero.includes('setMediaMode(mode)'));
  assert(hero.includes("window.scrollTo({ top: 0, behavior: 'instant' })"));
  assert(hero.includes('inert={reveal !== undefined && reveal === 0}'));
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

test('initial elements are staggered; positions are spread rather than piled up', () => {
  const random = randomSource();
  for (let i = 0; i < 100; i++) {
    const items = createHeroFloaters(random);
    assert(items[0].delay < items[1].delay);
    assert(items[1].delay < items[2].delay);
    for (let a = 0; a < items.length; a++) {
      for (let b = a + 1; b < items.length; b++) {
        assert(
          Math.hypot(items[a].x - items[b].x, items[a].y - items[b].y) >= 0.3,
        );
      }
    }
  }
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
  const hero = readFileSync(
    new URL('../app/hero.tsx', import.meta.url),
    'utf8',
  );
  const css = readFileSync(
    new URL('../app/hero-floating.css', import.meta.url),
    'utf8',
  );
  assert(hero.includes('if (face) poofElement(face, { hide: false })'));
  assert(hero.includes("variant === 'original' ? POOF_DURATION_MS : 180"));
  assert(hero.includes('replaceHeroFloater(current, dismissing)'));
  assert(hero.includes('if (suppressClick.current && event.detail !== 0)'));
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
    new URL('../app/hero-floating.css', import.meta.url),
    'utf8',
  );
  const target = css.split('.hero-video-poof-target {')[1].split('}')[0];
  assert(target.includes('inset: 0'));
  assert(target.includes('z-index: 2'));
  const hero = readFileSync(
    new URL('../app/hero.tsx', import.meta.url),
    'utf8',
  );
  assert(hero.includes('if (video && !floating) return'));
  assert(
    hero.includes("interactive={!floating || video.provider === 'twitch'}"),
  );
  const video = readFileSync(
    new URL('../app/hero-video.tsx', import.meta.url),
    'utf8',
  );
  assert(video.includes('tabIndex={interactive ? undefined : -1}'));
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
    new URL('../app/hero-floating.css', import.meta.url),
    'utf8',
  );
  const mask = css.split('.hero-app-icon-mask {')[1].split('}')[0];
  assert(mask.includes('border-radius: 26%'));
  assert(mask.includes('overflow: hidden'));
  assert(css.includes('var(--composition-layer, 2)'));
  assert(css.includes('--float-mobile-x') && css.includes('--float-mobile-y'));
  const hero = readFileSync(
    new URL('../app/hero.tsx', import.meta.url),
    'utf8',
  );
  assert(hero.includes('<span className="hero-app-icon-mask">'));
  assert(
    hero.indexOf('<NotificationBadge') >
      hero.indexOf('<span className="hero-app-icon-mask">'),
  );
});

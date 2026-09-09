import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  heroCollageProgress,
  heroCollageStayProgress,
} from '../lib/hero-collage.ts';
import { readFileSync } from 'node:fs';

test('scroll collage appears, holds, and disappears solely with scroll position', () => {
  for (const height of [600, 800, 1039, 1200]) {
    const progress = (position) =>
      heroCollageProgress(position * height, height, 200);
    assert.equal(progress(1), 0);
    assert(Math.abs(progress(0.89) - 0.5) < 0.0001);
    assert.equal(progress(0.8), 1);
    assert.equal(progress(0.75), 1);
    assert(Math.abs(progress(0.625) - 0.5) < 0.0001);
    assert.equal(progress(0.55), 0);
    assert.equal(progress(0.2), 0);
    // Reverse scrolling restores exactly the same visual state.
    assert.equal(progress(0.75), 1);
    assert.equal(progress(1), 0);
  }
});

test('reveal-and-stay retains progress and stays visible after scrolling past or back', () => {
  for (const height of [600, 800, 1039]) {
    let value = heroCollageStayProgress(0, height, height, 0);
    assert.equal(value, 0);
    value = heroCollageStayProgress(value, height * 0.89, height, 100);
    assert(Math.abs(value - 0.5) < 0.0001);
    assert.equal(heroCollageStayProgress(value, height, height, 0), value);
    value = heroCollageStayProgress(value, height * 0.8, height, 200);
    assert.equal(value, 1);
    assert.equal(heroCollageStayProgress(value, -height, height, 1500), 1);
    assert.equal(heroCollageStayProgress(value, height, height, 0), 1);
    assert.equal(heroCollageStayProgress(value, 0, 0, 300), 1);
  }
});

test('third mode reserves collage space before the copy and is available in the switch', () => {
  const css = readFileSync(
    new URL('../app/hero-floating.css', import.meta.url),
    'utf8',
  );
  const field = css
    .split(".hero-editorial[data-media-layout='stay'] > .hero-accents,")[1]
    .split('}')[0];
  assert(field.includes('position: relative'));
  assert(field.includes('height: 28rem'));
  assert(field.includes('transform: none'));
  const hero = readFileSync(
    new URL('../app/hero.tsx', import.meta.url),
    'utf8',
  );
  assert(hero.includes("['static', 'scroll', 'stay']"));
  assert(hero.includes('Reveal & stay'));
  assert(hero.includes('setCollageProgress(0)'));
});

test('scroll collage remains hidden at the top and handles invalid viewport height', () => {
  assert.equal(heroCollageProgress(600, 800, 0), 0);
  assert.equal(heroCollageProgress(600, 800, 12), 0);
  assert.equal(heroCollageProgress(0, 0, 100), 0);
  assert.equal(heroCollageProgress(0, -1, 100), 0);
});

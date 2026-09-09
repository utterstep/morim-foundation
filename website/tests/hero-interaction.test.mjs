import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, statSync } from 'node:fs';
import {
  advanceHeroApps,
  heroApps,
  initialHeroDeck,
  dragOffset,
  isDragGesture,
  heroVisibleSlots,
} from '../lib/hero-interaction.ts';

test('all seven Figma apps have local assets', () => {
  assert.equal(heroApps.length, 7);
  for (const app of heroApps) {
    const path = new URL(`../public${app.src}`, import.meta.url);
    assert(existsSync(path), app.name);
    assert(statSync(path).size > 1000, app.name);
  }
});

test('dismissal only replaces the selected app, never showing duplicates', () => {
  const next = advanceHeroApps(initialHeroDeck, 0);
  assert.equal(next.items[1], initialHeroDeck.items[1]);
  assert.notEqual(next.items[0].app, initialHeroDeck.items[0].app);
  assert.notEqual(next.items[0].app, next.items[1].app);
  assert.equal(initialHeroDeck.next, 8);
  assert.equal(advanceHeroApps(initialHeroDeck, 10), initialHeroDeck);
});

test('repeated clicks cycle through every app and both notification states', () => {
  let deck = initialHeroDeck;
  const seen = new Set();
  for (let i = 0; i < 100; i++) {
    deck = advanceHeroApps(deck, i % 6);
    assert.equal(
      new Set(deck.items.slice(0, 6).map((item) => item.app)).size,
      6,
    );
    for (const item of deck.items.slice(0, 6))
      seen.add(`${item.app}:${item.appearance % 3 !== 0}`);
  }
  assert.equal(seen.size, heroApps.length * 2);
});

test('desktop pile has six icons and two previews; mobile shows only three distractions', () => {
  assert.equal(initialHeroDeck.items.length, 8);
  assert.deepEqual(heroVisibleSlots(false), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(heroVisibleSlots(true), [0, 1, 6]);
  assert(
    existsSync(new URL('../public/assets/hero-video.png', import.meta.url)),
  );
});

test('dismissing a preview changes its content while preserving every other item', () => {
  for (const slot of [6, 7]) {
    let deck = initialHeroDeck;
    for (let i = 0; i < 20; i++) {
      const previous = deck;
      deck = advanceHeroApps(deck, slot);
      assert.notEqual(
        deck.items[slot].appearance % 2,
        previous.items[slot].appearance % 2,
      );
      assert(deck.items[slot].appearance >= 8);
      previous.items.forEach((item, index) => {
        if (index !== slot) assert.equal(deck.items[index], item);
      });
    }
  }
});

test('repeated dismissal of one slot leaves the other slot untouched', () => {
  let deck = initialHeroDeck;
  for (let i = 0; i < 30; i++) {
    const previous = deck.items[0].app;
    deck = advanceHeroApps(deck, 0);
    assert.notEqual(deck.items[0].app, previous);
    assert.equal(deck.items[1], initialHeroDeck.items[1]);
  }
});

test('tap jitter is not mistaken for a drag', () => {
  assert.equal(isDragGesture(0, 0), false);
  assert.equal(isDragGesture(3, 4), false);
  assert.equal(isDragGesture(6, 0), false);
  assert.equal(isDragGesture(5, 5), true);
  assert.equal(isDragGesture(-7, 0), true);
});

test('mobile rotation includes every app without duplicating desktop slots', () => {
  let deck = initialHeroDeck;
  const seen = new Set();
  for (let index = 0; index < 70; index++) {
    deck = advanceHeroApps(deck, index % 2, true);
    seen.add(deck.items[0].app);
    seen.add(deck.items[1].app);
    assert.equal(new Set(deck.items.slice(0, 6).map(item => item.app)).size, 6);
    assert.notEqual(deck.items[0].app, deck.items[1].app);
  }
  assert.equal(seen.size, heroApps.length);
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

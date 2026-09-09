import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  notificationLabel,
  notificationDuration,
} from '../lib/hero-notification.ts';

test('notification count waits for the card, counts upward and finishes at 99+', () => {
  assert.equal(notificationLabel(0), '0');
  assert.equal(notificationLabel(450), '0');
  let previous = 0;
  for (let elapsed = 450; elapsed < notificationDuration; elapsed += 16) {
    const count = Number(notificationLabel(elapsed));
    assert(count >= previous && count < 99);
    previous = count;
  }
  assert.equal(notificationLabel(notificationDuration), '99+');
  assert.equal(notificationLabel(10000), '99+');
  assert.equal(notificationLabel(-1), '0');
});

test('notification badge hugs its label with a circular minimum, not a fixed wide pill', () => {
  const css = readFileSync(
    new URL('../app/globals.css', import.meta.url),
    'utf8',
  );
  const badge = css.split('.hero-notification {')[1].split('}')[0];
  assert(badge.includes('width: max-content'));
  assert(badge.includes('min-width: 1.75em'));
  assert(badge.includes('height: 1.75em'));
  assert(badge.includes('padding: 0 0.42em'));
  assert(badge.includes('white-space: nowrap'));
  assert(!badge.includes('min-width: 3em'));
});

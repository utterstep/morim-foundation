import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startHeroVideoAutoplay } from '../src/js/lib/hero-video-autoplay.js';

test('muted startup retries are bounded, source-checked, stop once playing, and clean up', (t) => {
  const timers = new Map(),
    events = new Map(),
    loads = new Map(),
    sent = [];
  let id = 0;
  t.mock.method(globalThis, 'setTimeout', (callback) => {
    timers.set(++id, callback);
    return id;
  });
  t.mock.method(globalThis, 'clearTimeout', (key) => timers.delete(key));
  const priorWindow = globalThis.window;
  globalThis.window = {
    addEventListener: (n, cb) => events.set(n, cb),
    removeEventListener: (n) => events.delete(n),
  };
  t.after(() => {
    if (priorWindow === undefined) delete globalThis.window;
    else globalThis.window = priorWindow;
  });
  const frame = {
    contentWindow: {
      postMessage: (message, origin) => sent.push([message, origin]),
    },
    addEventListener: (n, cb) => loads.set(n, cb),
    removeEventListener: (n) => loads.delete(n),
  };
  const cleanup = startHeroVideoAutoplay(frame, 'tiktok', true, () =>
    assert.fail('unexpected error'),
  );
  assert.deepEqual(
    sent.map(([data]) => data.type),
    ['mute', 'play'],
  );
  assert.equal(timers.size, 4);
  const playing = {
    source: frame.contentWindow,
    origin: 'https://www.tiktok.com',
    data: { 'x-tiktok-player': true, type: 'onStateChange', value: 1 },
  };
  events.get('message')({ ...playing, origin: 'https://untrusted.example' });
  assert.equal(timers.size, 4);
  events.get('message')(playing);
  assert.equal(timers.size, 0);
  events.get('message')({
    ...playing,
    data: { 'x-tiktok-player': true, type: 'onPlayerReady' },
  });
  assert.equal(sent.length, 2);
  cleanup();
  assert.equal(events.size + loads.size + timers.size, 0);
  for (const provider of ['youtube', 'tiktok', 'twitch']) {
    const before = sent.length;
    const stop = startHeroVideoAutoplay(frame, provider, false, () => {});
    assert.equal(sent.length, before);
    assert.equal(timers.size, 0);
    stop();
  }
});

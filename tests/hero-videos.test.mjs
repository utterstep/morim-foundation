import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import {
  heroVideos,
  heroVideoPools,
  heroVideoEmbed,
} from '../src/js/lib/hero-videos.js';

// PR #3's hero.tsx became several modules under src/js/hero/; read them as one source.
function heroSource() {
  const dir = new URL('../src/js/hero/', import.meta.url);
  return readdirSync(dir)
    .filter((name) => name.endsWith('.js'))
    .sort()
    .map((name) => readFileSync(new URL(name, dir), 'utf8'))
    .join('\n');
}

test('catalog contains real TikTok, Twitch and CNN video sources, not image stand-ins', () => {
  assert.equal(
    heroVideos.length,
    Object.values(heroVideoPools).reduce((sum, pool) => sum + pool.length, 0),
  );
  assert.equal(heroVideoPools.youtube.length, 4);
  assert.equal(heroVideoPools.shorts.length, 4);
  assert.equal(heroVideoPools.twitch.length, 4);
  assert.equal(heroVideoPools.tiktok.length, 2);
  assert.equal(
    new Set(heroVideos.map((video) => video.id)).size,
    heroVideos.length,
  );
  for (const video of heroVideos) {
    const url = new URL(heroVideoEmbed(video, 'http://localhost:3000', true));
    assert.equal(url.protocol, 'https:');
    assert(!url.pathname.endsWith('.png'));
    assert(video.url.includes(video.id));
    if (video.provider === 'twitch') {
      assert.equal(url.searchParams.get('parent'), 'localhost');
      assert.equal(url.searchParams.get('muted'), 'true');
      assert(video.width >= 400 && video.height >= 300);
    }
    if (video.provider === 'youtube') {
      assert.equal(url.searchParams.get('mute'), '1');
      assert.equal(url.searchParams.get('origin'), 'http://localhost:3000');
      if (video.width > video.height) assert(video.title.startsWith('CNN:'));
      else assert(video.url.includes('/shorts/'));
    }
    assert(['1', 'true'].includes(url.searchParams.get('autoplay')));
    if (video.provider === 'tiktok') {
      assert.equal(url.searchParams.get('muted'), '1');
      assert(video.width >= 325 && video.height >= 578);
    }
    if (video.provider === 'twitch') assert(video.title.startsWith('CaseOh:'));
  }
});

test('reduced-motion players do not request autoplay', () => {
  for (const video of heroVideos) {
    const url = new URL(heroVideoEmbed(video, 'http://localhost:3000', false));
    assert(['0', 'false'].includes(url.searchParams.get('autoplay')));
  }
});

test('Twitch starts in view, scaled from native size, with unobstructed manual controls', () => {
  const player = readFileSync(
    new URL('../src/js/hero/hero-player.js', import.meta.url),
    'utf8',
  );
  const hero = heroSource();
  const css = readFileSync(
    new URL('../src/css/hero.css', import.meta.url),
    'utf8',
  );
  // Twitch only mounts once most of its card is in view.
  assert(player.includes('entry.intersectionRatio >= 0.85'));
  assert(/video\.provider !== 'twitch' \|\| (state\.)?twitchVisible/.test(player));
  // Only the Twitch iframe is interactive; it gets its own dismiss control.
  assert(hero.includes("interactive: video.provider === 'twitch'"));
  assert(hero.includes("'hero-twitch-dismiss'"));
  // The iframe keeps its 400x300 native box and is scaled by transform like
  // every other provider; the px floor keeps the clip readable at small rem.
  assert(/if \(state\.iframe\) state\.iframe\.style\.transform = `scale/.test(player));
  assert(!player.includes("video.provider === 'twitch') {\n      Object.assign(iframe.style"));
  assert(css.includes('--float-width: max(250px, 14.5rem)'));
  assert(css.includes('--float-width: max(250px, 16.5rem)'));
});

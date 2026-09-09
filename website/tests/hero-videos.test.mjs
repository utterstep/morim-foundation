import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  heroVideos,
  heroVideoPools,
  heroVideoEmbed,
} from '../lib/hero-videos.ts';
import { HERO_VIDEO_COUNT } from '../lib/hero-floating.ts';

test('catalog contains real TikTok, Twitch and CNN video sources, not image stand-ins', () => {
  assert.equal(heroVideos.length, HERO_VIDEO_COUNT);
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

test('Twitch starts in view at native size with unobstructed manual controls', () => {
  const player = readFileSync(
    new URL('../app/hero-video.tsx', import.meta.url),
    'utf8',
  );
  const hero = readFileSync(
    new URL('../app/hero.tsx', import.meta.url),
    'utf8',
  );
  const css = readFileSync(
    new URL('../app/hero-floating.css', import.meta.url),
    'utf8',
  );
  assert(player.includes('entry.intersectionRatio >= 0.85'));
  assert(player.includes("video.provider !== 'twitch' || twitchVisible"));
  assert(
    hero.includes("interactive={!floating || video.provider === 'twitch'}"),
  );
  assert(hero.includes("'hero-twitch-dismiss'"));
  assert(css.includes('--float-width: max(404px, 20.25rem)'));
  assert(css.includes('--float-width: max(404px, 23.5rem)'));
});

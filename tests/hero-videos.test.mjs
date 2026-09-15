import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  heroVideos,
  heroVideoPools,
  heroVideoEmbed,
  heroVideoFile,
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

test('catalog contains real TikTok and CNN sources plus self-hosted stream footage, not image stand-ins', () => {
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
    assert(video.url.includes(video.id));
    if (video.provider === 'twitch') {
      // Stock footage under the Pexels licence, at the card's 16:9.
      assert(video.url.startsWith('https://www.pexels.com/video/'));
      assert(video.label.startsWith('Twitch'));
      assert(video.title.startsWith('Live stream:'));
      assert.equal(video.width / video.height, 16 / 9);
      continue;
    }
    const url = new URL(heroVideoEmbed(video, 'http://localhost:3000', true));
    assert.equal(url.protocol, 'https:');
    assert(!url.pathname.endsWith('.png'));
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
  }
});

test('reduced-motion players do not request autoplay', () => {
  for (const video of heroVideos) {
    if (heroVideoFile(video)) continue;
    const url = new URL(heroVideoEmbed(video, 'http://localhost:3000', false));
    assert(['0', 'false'].includes(url.searchParams.get('autoplay')));
  }
});

test('Twitch clips are self-hosted files with a poster, played by a muted native video', () => {
  const twitch = heroVideoPools.twitch.map((index) => heroVideos[index]);
  for (const video of twitch) {
    const file = heroVideoFile(video);
    assert(file, `${video.id} has no local file`);
    for (const href of [file.src, file.poster]) {
      assert(href.includes('/assets/video/'));
      assert(existsSync(fileURLToPath(href)), `${href} is missing`);
    }
    assert(file.src.endsWith('.mp4'));
    assert(file.poster.endsWith('.webp'));
  }
  for (const video of heroVideos) {
    if (video.provider !== 'twitch') assert.equal(heroVideoFile(video), null);
  }
  const player = readFileSync(
    new URL('../src/js/hero/hero-player.js', import.meta.url),
    'utf8',
  );
  const hero = heroSource();
  const css = readFileSync(
    new URL('../src/css/hero.css', import.meta.url),
    'utf8',
  );
  // A clip is only fetched once most of its card is in view.
  assert(player.includes('entry.intersectionRatio >= 0.85'));
  assert(/!file \|\| (state\.)?inView/.test(player));
  // Muted, looping, inline, never in the tab order; autoplay toggles play/pause
  // instead of reloading the source.
  for (const line of ['clip.muted = true', 'clip.loop = true', 'clip.playsInline = true', 'clip.tabIndex = -1', 'clip.poster = file.poster', 'state.iframe.pause()'])
    assert(player.includes(line), line);
  // Every video card, Twitch included, is covered by the same poof target.
  assert(!hero.includes('hero-twitch-dismiss'));
  assert(!hero.includes('interactive'));
  assert(!css.includes('hero-twitch-dismiss'));
  // Iframes are still scaled from their native box; the video just fills the card.
  assert(/if \(state\.iframe && !file\) state\.iframe\.style\.transform = `scale/.test(player));
  assert(css.includes('--float-width: max(250px, 14.5rem)'));
  assert(css.includes('--float-width: max(250px, 16.5rem)'));
  assert.equal(css.match(/\* 360 \/ 640 \+ 4px/g)?.length, 3);
  assert(!css.includes('* 0.75 + 4px'));
});

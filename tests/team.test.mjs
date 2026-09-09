import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const page = readFileSync(
  new URL('../site/index.html', import.meta.url),
  'utf8',
);
const team = page
  .split('<section class="team"')[1]
  .split('</section>')[0];
const mobile = readFileSync(
  new URL('../src/css/mobile.css', import.meta.url),
  'utf8',
);

test('team names use plain letters without decorative blobs', () => {
  // Names sit directly in the heading (optionally wrapped in a link), never in glyph art.
  assert(/<h3>(<a [^>]*>)?Elena Bunina(<\/a>)?<\/h3>/.test(team));
  assert(/<h3>(<a [^>]*>)?Vlad Stepanov(<\/a>)?<\/h3>/.test(team));
  assert(!team.includes('glyph'));
});

test('mobile team remains a horizontal, non-wrapping snap carousel', () => {
  const track = mobile.split('.team-track {')[1].split('}')[0];
  const person = mobile.split('.person {')[1].split('}')[0];
  assert(track.includes('display: flex'));
  assert(track.includes('flex-wrap: nowrap'));
  assert(track.includes('overflow-x: auto'));
  assert(track.includes('scroll-snap-type: x mandatory'));
  assert(person.includes('flex: 0 0 78vw'));
  assert(!mobile.includes('.carousel-controls'));
});

test('team hides scrollbar and arrows while retaining keyboard scrolling', () => {
  const css = readFileSync(
    new URL('../src/css/sections.css', import.meta.url),
    'utf8',
  );
  const track = css.split('.team-track {')[1].split('}')[0];
  assert(track.includes('overflow-x: auto'));
  assert(track.includes('scrollbar-width: none'));
  assert(
    css
      .split('.team-track::-webkit-scrollbar {')[1]
      .split('}')[0]
      .includes('display: none'),
  );
  assert(!team.includes('carousel-controls'));
  assert(/<div class="team-track"[^>]*tabindex="0"/.test(team));
  assert(team.includes('aria-label="Foundation team"'));
});

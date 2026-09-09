import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(
  new URL('../app/sections.tsx', import.meta.url),
  'utf8',
);
const team = source
  .split('export function Team()')[1]
  .split('const questions')[0];
const mobile = readFileSync(
  new URL('../app/mobile.css', import.meta.url),
  'utf8',
);

test('team names use plain letters without decorative blobs', () => {
  assert(team.includes('<h3>Elena Bunina</h3>'));
  assert(team.includes('<h3>Vlad Stepanov</h3>'));
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
    new URL('../app/sections.css', import.meta.url),
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
  assert(!team.includes('function move'));
  assert(team.includes('tabIndex={0}'));
  assert(team.includes('aria-label="Foundation team"'));
});

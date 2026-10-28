import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const page = readFileSync(
  new URL('../index.html', import.meta.url),
  'utf8',
);
const team = page
  .split('<section class="team"')[1]
  .split('</section>')[0];
const mobile = readFileSync(
  new URL('../src/css/mobile.css', import.meta.url),
  'utf8',
);

test('team names sit in a heading before the muted role, above the bio', () => {
  // name (h3, optionally a link) -> role (p.person-role) -> bio (p), in that order.
  assert(
    /<h3>(<a [^>]*>)?Elena Bunina(<\/a>)?<\/h3>\s*<p class="person-role">/.test(team),
  );
  assert(
    /<h3>(<a [^>]*>)?Vlad Stepanov(<\/a>)?<\/h3>\s*<p class="person-role">/.test(team),
  );
  assert(!team.includes('glyph'));
});

test('each person has a small portrait-aspect crop, matching minimal', () => {
  const css = readFileSync(
    new URL('../src/css/sections.css', import.meta.url),
    'utf8',
  );
  const mobileCss = readFileSync(
    new URL('../src/css/mobile.css', import.meta.url),
    'utf8',
  );
  const portrait = css.split('.portrait {')[1].split('}')[0];
  const box = css.split('.portrait,\n.portrait-placeholder {')[1].split('}')[0];
  assert(box.includes('aspect-ratio: 420 / 510'));
  assert(box.includes('width: min(100%,'));
  assert(portrait.includes('object-fit: cover'));
  const mobileBox = mobileCss
    .split('.portrait,\n  .portrait-placeholder {')[1]
    .split('}')[0];
  assert(mobileBox.includes('aspect-ratio: 420 / 510'));
});

test('mobile team is a single column: photo, name, role, bio', () => {
  const columns = mobile.split('.team-columns {')[1].split('}')[0];
  assert(columns.includes('grid-template-columns: 1fr'));
  assert(!mobile.includes('.team-track'));
  assert(!team.includes('team-track'));
  assert(!team.includes('tabindex="0"'));
});

test('the team note sits below the three columns, outside the grid', () => {
  assert(team.includes('class="team-note"'));
  assert(team.indexOf('class="team-columns"') < team.indexOf('class="team-note"'));
});

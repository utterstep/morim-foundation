import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const load = (lang) =>
  JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));

// Every translatable key exists in every language, with the same shape.
// Keys starting with "_" are editor notes and may differ.
function shape(value, path = '') {
  if (Array.isArray(value)) {
    return value.length ? [`${path}[]`, ...shape(value[0], `${path}[]`)] : [`${path}[]`];
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .filter((key) => !key.startsWith('_'))
      .sort()
      .flatMap((key) => shape(value[key], `${path}.${key}`));
  }
  return [path];
}

test('ru and he carry the same keys as en', () => {
  const en = shape(load('en'));
  for (const lang of ['ru', 'he']) {
    assert.deepEqual(shape(load(lang)), en, `${lang}.json differs from en.json`);
  }
});

test('translated fragments keep the notes the page motion depends on', () => {
  for (const lang of ['en', 'ru', 'he']) {
    const t = load(lang);
    assert.ok(t.what_we_do.practice_note?.length, `${lang} pen line under the steps`);
  }
});

test('the frame is three lines over three rows, and the first row carries the three markers', () => {
  for (const lang of ['en', 'ru', 'he']) {
    const t = load(lang);
    assert.equal(t.what_we_do.title_html.split('<br>').length, 3, `${lang} three lines`);
    assert.equal(t.what_we_do.stance.length, 3, `${lang} three rows`);
    // js/margin-note.js points the featured article's note at the first mark.
    const marks = t.what_we_do.stance[0].title_html.match(/<mark[^>]*>/g) ?? [];
    assert.deepEqual(marks, ['<mark>', '<mark class="blue">', '<mark class="peach">'], `${lang} markers`);
  }
});

test('the hero years name a tint the stylesheet knows', () => {
  const css = readFileSync(new URL('../src/css/hero.css', import.meta.url), 'utf8');
  for (const lang of ['en', 'ru', 'he']) {
    const { years } = load(lang).hero;
    assert.equal(years.length, load('en').hero.years.length, `${lang} years`);
    for (const { tint } of years) {
      // Paper is the default pill, with no rule of its own.
      assert.ok(tint === 'paper' || css.includes(`[data-tint='${tint}']`), `${lang}: ${tint}`);
    }
  }
});

test('placeholders used by JavaScript survive translation', () => {
  for (const lang of ['en', 'ru', 'he']) {
    const t = load(lang);
    assert.match(t.team.portrait_pending, /\{name\}/, `${lang} team.portrait_pending`);
    assert.match(t.links.survey, new RegExp(`lang=${lang}$`), `${lang} survey link language`);
  }
});

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

test('translated fragments keep the markup the page motion depends on', () => {
  // Display-heading glyphs are a per-language editorial choice, but the
  // mission intro's highlight spans drive scroll animations and must survive.
  for (const lang of ['en', 'ru', 'he']) {
    const html = load(lang).approach.mission_intro_html;
    assert.match(html, /<span class="mentor-highlight">[^<]+<img /, `${lang} mentor highlight`);
    assert.match(html, /<span class="funding">[^<]+<span class="funding-underline"/, `${lang} funding underline`);
    assert.match(html, /<span class="stipend-note">/, `${lang} stipend note`);
  }
});

test('placeholders used by JavaScript survive translation', () => {
  for (const lang of ['en', 'ru', 'he']) {
    const t = load(lang);
    assert.match(t.hero.label_icon, /\{app\}/, `${lang} hero.label_icon`);
    assert.match(t.hero.label_media_dismiss, /\{label\}/, `${lang} hero.label_media_dismiss`);
    assert.match(t.team.portrait_pending, /\{name\}/, `${lang} team.portrait_pending`);
    assert.match(t.links.survey, new RegExp(`lang=${lang}$`), `${lang} survey link language`);
  }
});

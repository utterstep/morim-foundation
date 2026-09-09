import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// Checks on the generated site/ (run `uv run build.py` first).
const site = fileURLToPath(new URL('../site/', import.meta.url));
const pages = { en: 'index.html', ru: 'ru/index.html', he: 'he/index.html' };
const read = (page) => readFileSync(join(site, page), 'utf8');

test('all three pages exist with the right lang and dir', () => {
  assert.match(read(pages.en), /<html lang="en" dir="ltr">/);
  assert.match(read(pages.ru), /<html lang="ru" dir="ltr">/);
  assert.match(read(pages.he), /<html lang="he" dir="rtl">/);
});

test('no template syntax leaks into the output', () => {
  for (const page of Object.values(pages)) {
    const html = read(page);
    assert.doesNotMatch(html, /\{\{|\{%|\{root\}/, `${page} has unrendered template syntax`);
  }
});

test('every page links to every language', () => {
  for (const [lang, page] of Object.entries(pages)) {
    const html = read(page);
    for (const code of ['en', 'ru', 'he']) {
      assert.match(html, new RegExp(`<link rel="alternate" hreflang="${code}"`), `${page} lacks hreflang ${code}`);
    }
    assert.match(html, new RegExp(`hreflang="${lang}" lang="${lang}" aria-current="page"`), `${page} switcher current`);
  }
});

test('every local href/src in the pages resolves to a file', () => {
  for (const page of Object.values(pages)) {
    const html = read(page);
    const dir = dirname(join(site, page));
    for (const [, url] of html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
      if (/^(https?:|mailto:|data:)/.test(url)) continue;
      const target = resolve(dir, url);
      const path = url.endsWith('/') ? join(target, 'index.html') : target;
      assert.ok(existsSync(path), `${page}: ${url} does not resolve`);
    }
  }
});

test('every module import under site/js resolves', () => {
  const walk = (dir) =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : path.endsWith('.js') ? [path] : [];
    });
  for (const file of walk(join(site, 'js'))) {
    const source = readFileSync(file, 'utf8');
    for (const [, spec] of source.matchAll(/from '(\.[^']+)'/g)) {
      assert.ok(existsSync(resolve(dirname(file), spec)), `${file}: import ${spec} does not resolve`);
      assert.match(spec, /\.js$/, `${file}: import ${spec} needs a .js extension for the browser`);
    }
  }
});

test('native widgets are in the markup', () => {
  const html = read(pages.en);
  assert.equal((html.match(/<details class="faq-item"/g) ?? []).length, 5);
  assert.match(html, /<dialog class="morim-dialog" id="dialog-social"/);
  assert.match(html, /<dialog class="mobile-menu-panel" id="mobile-menu"/);
  assert.match(html, /role="listbox"/);
  assert.match(html, /class="button results-button"\s+aria-expanded="false"/);
  assert.match(html, /<script type="module" src="js\/main.js">/);
});

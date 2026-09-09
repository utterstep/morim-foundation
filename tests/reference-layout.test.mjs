import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const files = ['base', 'sections', 'motion'];
const styles = files.map((name) =>
  readFileSync(new URL(`../src/css/${name}.css`, import.meta.url), 'utf8'),
);

// Innermost `selector { declarations }` blocks; at-rule headers never match
// because their bodies contain braces, so `@media (max-width: 700px)` is not
// mistaken for a declaration.
function declarations(source) {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(([, , body]) =>
    body
      .split(';')
      .map((line) => line.trim())
      .filter((line) => line.includes(':'))
      .map((line) => {
        const colon = line.indexOf(':');
        return { prop: line.slice(0, colon).trim(), value: line.slice(colon + 1).trim() };
      }),
  );
}

// Body of the first `@media <params> { ... }` block, with nested braces balanced.
function mediaBody(source, params) {
  const start = source.indexOf(`@media ${params} {`);
  assert(start >= 0, `missing @media ${params}`);
  let depth = 0;
  for (let i = source.indexOf('{', start); i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) {
      return source.slice(source.indexOf('{', start) + 1, i);
    }
  }
  assert.fail(`unbalanced @media ${params}`);
}

test('desktop geometry shares the 1440px rem reference', () => {
  const reference = styles[0].match(/--page-width:\s*([^;]+);/)?.[1];
  const desktop = mediaBody(styles[0], '(min-width: 701px)');
  const desktopSize = desktop
    .split(/\bhtml\s*\{/)[1]
    ?.split('}')[0]
    .match(/font-size:\s*([^;]+);/)?.[1];
  assert.equal(reference, '90rem');
  assert.equal(desktopSize, 'calc(100vw / 90)');
  for (const style of styles) {
    for (const { prop, value } of declarations(style)) {
      for (const match of value.matchAll(/(-?\d*\.?\d+)px\b/g)) {
        assert(
          Math.abs(Number(match[1])) < 4,
          `${prop} must scale with the reference`,
        );
      }
    }
  }
});

test('intermediate desktop widths retain the reference composition; mobile still reflows', () => {
  let mobileRules = 0;
  for (const style of styles) {
    for (const [params] of style.matchAll(/@media[^{]*/g)) {
      const maximum = params.match(/max-width:\s*(\d+)px/);
      if (maximum) {
        assert.equal(Number(maximum[1]), 700);
        mobileRules++;
      }
    }
  }
  assert(mobileRules > 0);
});

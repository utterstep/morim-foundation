import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import postcss from 'postcss';

const files = ['globals', 'sections', 'motion', 'hero-context'];
const styles = files.map((name) =>
  postcss.parse(
    readFileSync(new URL(`../app/${name}.css`, import.meta.url), 'utf8'),
  ),
);

test('desktop geometry shares the 1440px rem reference', () => {
  let reference, desktopSize;
  styles[0].walkDecls('--page-width', (declaration) => {
    reference = declaration.value;
  });
  styles[0].walkRules('html', (rule) => {
    if (rule.parent.params === '(min-width: 701px)') {
      rule.walkDecls('font-size', (declaration) => {
        desktopSize = declaration.value;
      });
    }
  });
  assert.equal(reference, '90rem');
  assert.equal(desktopSize, 'calc(100vw / 90)');
  for (const style of styles) {
    style.walkDecls((declaration) => {
      for (const match of declaration.value.matchAll(/(-?\d*\.?\d+)px\b/g)) {
        assert(
          Math.abs(Number(match[1])) < 4,
          `${declaration.prop} must scale with the reference`,
        );
      }
    });
  }
});

test('intermediate desktop widths retain the reference composition; mobile still reflows', () => {
  let mobileRules = 0;
  for (const style of styles) {
    style.walkAtRules('media', (rule) => {
      const maximum = rule.params.match(/max-width:\s*(\d+)px/);
      if (maximum) {
        assert.equal(Number(maximum[1]), 700);
        mobileRules++;
      }
    });
  }
  assert(mobileRules > 0);
});

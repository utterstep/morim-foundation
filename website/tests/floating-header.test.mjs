import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import postcss from 'postcss';

const css = readFileSync(
  new URL('../app/floating-header.css', import.meta.url),
  'utf8',
);

test('header retains its horizontal geometry in the floating state', () => {
  postcss.parse(css).walkRules((rule) => {
    if (!rule.selector.includes("[data-compact='true']")) return;
    rule.walkDecls((decl) => {
      assert(
        ![
          'width',
          'max-width',
          'margin-inline',
          'padding',
          'gap',
          'justify-content',
        ].includes(decl.prop),
        `${decl.prop} must not jump on scroll`,
      );
    });
  });
  assert(!css.includes('width: max-content'));
});

test('floating surface fades in while height and position ease smoothly', () => {
  assert(css.includes('height 420ms cubic-bezier'));
  assert(css.includes('translate 420ms cubic-bezier'));
  assert(css.includes('transition: opacity 420ms ease'));
  assert(css.includes('.site-header::before'));
  assert(css.includes('prefers-reduced-motion: reduce'));
});

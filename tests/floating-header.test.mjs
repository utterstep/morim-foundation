import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync(
  new URL('../src/css/header.css', import.meta.url),
  'utf8',
);

// Innermost `selector { declarations }` blocks; at-rule headers never match
// because their bodies contain braces.
function rules(source) {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selector: selector.trim(),
    declarations: body
      .split(';')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(':')[0].trim()),
  }));
}

test('header retains its horizontal geometry in the floating state', () => {
  for (const rule of rules(css)) {
    if (!rule.selector.includes("[data-compact='true']")) continue;
    for (const prop of rule.declarations) {
      assert(
        ![
          'width',
          'max-width',
          'margin-inline',
          'padding',
          'gap',
          'justify-content',
        ].includes(prop),
        `${prop} must not jump on scroll`,
      );
    }
  }
  assert(!css.includes('width: max-content'));
});

test('floating surface fades in while height and position ease smoothly', () => {
  assert(css.includes('height 420ms cubic-bezier'));
  assert(css.includes('translate 420ms cubic-bezier'));
  assert(css.includes('transition: opacity 420ms ease'));
  assert(css.includes('.site-header::before'));
  assert(css.includes('prefers-reduced-motion: reduce'));
});

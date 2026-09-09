import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

// The stylesheets must stay direction-agnostic so the Hebrew page mirrors
// correctly: no physical inline-axis properties.
const dir = new URL('../src/css/', import.meta.url);
const physical =
  /^\s*(left|right|margin-left|margin-right|padding-left|padding-right|border-left|border-right|border-(top|bottom)-(left|right)-radius|float|clear)\s*:/;

test('no physical inline-axis properties in src/css', () => {
  for (const name of readdirSync(dir).filter((file) => file.endsWith('.css'))) {
    const lines = readFileSync(new URL(name, dir), 'utf8').split('\n');
    lines.forEach((line, index) => {
      assert.doesNotMatch(line, physical, `${name}:${index + 1}: ${line.trim()}`);
      assert.doesNotMatch(line, /text-align:\s*(left|right)\b/, `${name}:${index + 1}: ${line.trim()}`);
    });
  }
});

test('no shadcn or Tailwind residue in src/css', () => {
  for (const name of readdirSync(dir).filter((file) => file.endsWith('.css'))) {
    const css = readFileSync(new URL(name, dir), 'utf8');
    assert.doesNotMatch(css, /@import|@theme|@apply|data-starting-style|data-ending-style/, name);
    // data-slot is legitimate only on hero items (slot index 0-7).
    for (const [match] of css.matchAll(/\[data-slot[^\]]*\]/g)) {
      assert.match(match, /^\[data-slot(='[0-7]')?\]$/, `${name}: ${match}`);
    }
  }
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextHeaderCompact } from '../src/js/header.js';
import { legacyLanguageRedirect } from '../src/js/lang.js';

test('header compacts past 48px and expands again only above 12px', () => {
  assert.equal(nextHeaderCompact(false, 0), false);
  assert.equal(nextHeaderCompact(false, 48), false);
  assert.equal(nextHeaderCompact(false, 49), true);
  assert.equal(nextHeaderCompact(true, 20), true);
  assert.equal(nextHeaderCompact(true, 12), false);
});

test('old ?lang= links redirect to the language folders', () => {
  assert.equal(legacyLanguageRedirect('?lang=ru', ['ru', 'he']), 'ru');
  assert.equal(legacyLanguageRedirect('?src=x&lang=he', ['ru', 'he']), 'he');
  assert.equal(legacyLanguageRedirect('?lang=en', ['ru', 'he']), null);
  assert.equal(legacyLanguageRedirect('?lang=fr', ['ru', 'he']), null);
  assert.equal(legacyLanguageRedirect('', ['ru', 'he']), null);
});

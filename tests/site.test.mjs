import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// Checks on the generated pages at the repository root (run `uv run build.py` first).
const site = fileURLToPath(new URL('../', import.meta.url));
const pages = { en: 'index.html', ru: 'ru/index.html', he: 'he/index.html' };
const schoolPages = { en: 'schools/index.html', ru: 'ru/schools/index.html', he: 'he/schools/index.html' };
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

// Search engines resolve these against the indexed origin, so a relative value
// is silently dropped and the translations never get linked to each other.
test('canonical and hreflang URLs are absolute', () => {
  const paths = { en: '', ru: 'ru/', he: 'he/' };
  for (const [lang, page] of Object.entries(pages)) {
    const html = read(page);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://morim\\.foundation/${paths[lang]}">`), `${page} canonical`);
    for (const [code, path] of Object.entries(paths)) {
      const tag = `<link rel="alternate" hreflang="${code}" href="https://morim.foundation/${path}">`;
      assert.ok(html.includes(tag), `${page} lacks ${tag}`);
    }
    assert.ok(html.includes('<link rel="alternate" hreflang="x-default" href="https://morim.foundation/">'), `${page} x-default`);
  }
});

test('every local href/src/srcset in the pages resolves to a file', () => {
  for (const page of [...Object.values(pages), ...Object.values(schoolPages)]) {
    const html = read(page);
    const dir = dirname(join(site, page));
    const urls = [...html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)].map(([, url]) => url);
    for (const [, list] of html.matchAll(/srcset="([^"]*)"/g)) {
      urls.push(...list.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]));
    }
    for (const url of urls) {
      if (/^(https?:|mailto:|data:)/.test(url)) continue;
      const file = url.split(/[?#]/)[0];
      const target = resolve(dir, file);
      const path = file.endsWith('/') ? join(target, 'index.html') : target;
      assert.ok(existsSync(path), `${page}: ${url} does not resolve`);
    }
  }
});

test('every module import under js/ resolves', () => {
  const walk = (dir) =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : path.endsWith('.js') ? [path] : [];
    });
  for (const file of walk(join(site, 'js'))) {
    const source = readFileSync(file, 'utf8');
    for (const [, spec] of source.matchAll(/from '(\.[^']+)'/g)) {
      // The copies carry the asset version, so a redeploy never pairs a new
      // main.js with cached old modules.
      assert.match(spec, /\?v=[0-9a-f]{8}$/, `${file}: import ${spec} is not versioned`);
      const path = spec.replace(/\?v=.*$/, '');
      assert.ok(existsSync(resolve(dirname(file), path)), `${file}: import ${spec} does not resolve`);
      assert.match(path, /\.js$/, `${file}: import ${spec} needs a .js extension for the browser`);
    }
  }
});

// v4-bar: no menu at all. The header pill holds only the logo; the languages
// float on a pill of their own; there is no mobile menu. Section ids stay so
// deep links keep working.
test('the header nav has only the language drop-down, no section anchors', () => {
  for (const page of Object.values(pages)) {
    const html = read(page);
    const header = /<header class="site-header">([\s\S]*?)<\/header>/.exec(html)?.[1] ?? '';
    assert.match(header, /^\s*<a class="logo"[^>]*>[^<]+<\/a>\s*$/, `${page} header should hold only the logo`);
    const nav = /<\/header>\s*<\/div>\s*<nav class="lang-float" aria-label="[^"]+">([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';
    assert.match(nav, /^\s*<div class="nav-menu lang-menu">/, `${page} language pill should hold the dropdown`);
    assert.doesNotMatch(html, /id="programs-menu-list"|class="mobile-menu/, `${page} still has a menu`);
    for (const id of ['what-we-do', 'fellowship', 'leaders', 'team', 'faq', 'contact']) {
      assert.match(html, new RegExp(`id="${id}"`), `${page} lost the #${id} section id`);
    }
    const list = /id="lang-menu-list"[\s\S]*?<\/ul>/.exec(html)?.[0] ?? '';
    assert.match(list, /class="nav-menu-list" hidden>/, `${page} dropdown list is not hidden at rest`);
    assert.equal((list.match(/<a /g) ?? []).length, 2, `${page} dropdown should list only the other two languages`);
    assert.doesNotMatch(list, /aria-current/);
    assert.doesNotMatch(html, /lang-switcher-header/);
  }
});

test('native widgets are in the markup', () => {
  const html = read(pages.en);
  assert.equal((html.match(/<details class="faq-item"/g) ?? []).length, 5);
  assert.match(html, /<dialog class="morim-dialog" id="dialog-social"/);
  // The programs location filter reuses the audience tabs; partner shapes are cards.
  // With the current program pinned under the fellowship heading, the list
  // keeps one location, so no location filter renders.
  assert.equal((html.match(/class="audience-tabs[^"]*" role="tablist"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /class="audience-tabs program-tabs"/);
  const fellowship = html.slice(html.indexOf('id="fellowship-title"'));
  assert.ok(fellowship.indexOf('class="program-offer"') < fellowship.indexOf('fellowship-intro'));
  assert.doesNotMatch(html, /partner-tabs|partner-panel/);
  assert.doesNotMatch(html, /results-button|results-chevron|results-collapse|program-results-card/);
  assert.match(html, /<script type="module" src="js\/main.js\?v=[0-9a-f]{8}">/);
});

// An offer's terms: the scholarship word alone above a card of Cost,
// How often, Next and Where; no title, no Apply inside.
function assertOfferTerms(terms, row, t) {
  const tags = [...terms.matchAll(/<(?:span|a)[^>]* class="offer-tag[^"]*"[^>]*>([^<]+)<\/(?:span|a)>/g)].map((m) => m[1]);
  assert.deepEqual(tags, [row.scholarship]);
  // The scholarship word links down to the scholarship band; no popover.
  assert.ok(terms.includes(`<a class="offer-tag offer-scholarship" href="#scholarship">${row.scholarship}</a></p>`));
  assert.doesNotMatch(terms, /popover/);
  const meta = terms.slice(terms.indexOf('offer-meta'));
  const fields = [...meta.matchAll(/<p><span>([^<]+)<\/span>(?:<em class="[^"]+">)?([^<]+)/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(fields, [
    [t.programs.cost, row.cost],
    // A program may name the frequency row itself (Vlad, 26.10: "Cohorts start" / "New training cohorts").
    [row.frequency_label ?? t.programs.frequency, row.frequency],
    [t.programs.next, row.next],
    [t.programs.where, row.where],
  ]);
  assert.ok(meta.includes(`<em class="offer-meta-cost">${row.cost}</em>`) && meta.includes(`<em class="offer-meta-frequency">${row.frequency}</em>`));
  assert.ok(!('when' in row));
  assert.doesNotMatch(terms, /program-cost|program-row|<h4>|apply-button/);
  const order = ['offer-tags', 'offer-meta'].map((k) => terms.indexOf(k));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
}

test('the fellowship pane is the offer of the open program', () => {
  for (const [lang, page] of Object.entries(pages)) {
    const html = read(page);
    const t = JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
    const current = t.programs.teachers[0];
    assert.ok(html.includes(`<h2 class="display" id="fellowship-title">${current.title_html}</h2>`), `${page}: heading`);
    assert.match(html, /<div class="prose fellowship-intro">\s*<p>[^<]+, /);
    const row = new RegExp(`<article class="offer-terms" id="program-${current.id}"[^>]*aria-labelledby="fellowship-title">([\\s\\S]*?)</article>`).exec(html);
    assert.ok(row, `${page}: offer terms`);
    assertOfferTerms(row[1], current, t);
    // Apply stands outside the terms, centred under them.
    assert.ok(html.includes(`<a class="button apply-button offer-apply" href="${t.links.survey}" data-apply>${t.programs.apply_now}</a>`), `${page}: apply now`);
    assert.match(html, /<\/article>\s*<a class="button apply-button offer-apply" href="[^"]+" data-apply>/);
    const order = ['fellowship-title', 'offer-terms', 'offer-apply', 'fellowship-intro', 'fellowship-practice'].map((k) => html.indexOf(k));
    assert.deepEqual([...order].sort((a, b) => a - b), order);
  }
});

test('the leaders pane is the offer of the open coordinators program', () => {
  for (const [lang, page] of Object.entries(pages)) {
    const html = read(page);
    const t = JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
    const open = t.programs.leaders.find((row) => !row.closed);
    const pane = html.slice(html.indexOf('id="leaders"'), html.indexOf('id="partners"'));
    assert.ok(pane.includes(`<h2 class="display" id="leaders-title">${open.title_html}</h2>`), `${page}: heading`);
    const row = new RegExp(`<article class="offer-terms" id="program-${open.id}"[^>]*aria-labelledby="leaders-title">([\\s\\S]*?)</article>`).exec(pane);
    assert.ok(row, `${page}: offer terms`);
    assertOfferTerms(row[1], open, t);
    assert.ok(pane.includes(`<a class="button apply-button offer-apply" href="${t.links.survey}" data-apply>${t.programs.apply_now}</a>`), `${page}: apply now`);
    assert.match(pane, /<div class="prose leaders-intro">\s*<p>[^<]+, /);
    // The open row appears once, as the offer; the list keeps the closed rows.
    assert.equal(html.split(`id="program-${open.id}"`).length, 2);
    // The closed cohort sits under the Apply as a card headed "Pilot currently running".
    assert.match(pane, new RegExp(`<article class="running-card"[^>]*>\\s*<h3>${t.programs.pilot_title}</h3>`));
    assert.ok(!pane.includes('leaders-programs'), `${page}: no separate list`);
    const order = ['leaders-title', 'offer-terms', 'offer-apply', 'running-card', 'leaders-intro', 'leader-benefits feature-cards'].map((k) => pane.indexOf(k));
    assert.deepEqual([...order].sort((a, b) => a - b), order);
  }
});

test('the scholarship is its own blue band right after the audiences', () => {
  for (const [lang, page] of Object.entries(pages)) {
    const html = read(page);
    const t = JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
    const grant = t.fellowship.benefits.find((b) => b.class === 'scholarship');
    const band = /<section class="scholarship-band" id="scholarship" aria-labelledby="scholarship-title">([\s\S]*?)<\/section>/.exec(html);
    assert.ok(band, `${page}: band`);
    // One heading: the pen word, large; the feature's title is gone.
    assert.ok(band[1].includes(`<h2 class="scholarship-word" id="scholarship-title">${t.scholarship.title}</h2>`), `${page}: heading`);
    assert.equal(band[1].match(/<h2/g).length, 1, `${page}: one heading`);
    const paras = [...band[1].matchAll(/<p>([^<]+)<\/p>/g)].map((m) => m[1]);
    assert.deepEqual(paras, grant.body.split('<br>'), `${page}: text`);
    const terms = [...band[1].matchAll(/<dt>([^<]+)<\/dt><dd>([^<]+)<\/dd>/g)].map((m) => ({ label: m[1], value: m[2] }));
    assert.deepEqual(terms, t.scholarship.terms, `${page}: terms`);
    // After the audiences panel, before the camp; every offer tag lands here.
    assert.ok(html.indexOf('id="scholarship"') > html.lastIndexOf('id="leaders"'), `${page}: after the panes`);
    assert.ok(html.indexOf('id="scholarship"') < html.indexOf('id="tbilisi-camp"'), `${page}: before the camp`);
    assert.equal(html.match(/href="#scholarship"/g).length, 3, `${page}: both offers and the What-we-do note link`);
    assert.doesNotMatch(html, /offer-popover|popovertarget/, `${page}: no popover`);
  }
});

test('the Tbilisi camp is its own section after the audiences, expanding its results in place', () => {
  const en = JSON.parse(readFileSync(new URL('../src/i18n/en.json', import.meta.url), 'utf8'));
  const figures = en.programs.tbilisi.stats.length;
  for (const page of Object.values(pages)) {
    const html = read(page);
    const camp = /<section class="camp" id="tbilisi-camp" aria-labelledby="tbilisi-promo-title"[^>]*>([\s\S]*?)<\/section>/.exec(html);
    assert.ok(camp, `${page} has no camp section`);
    assert.match(camp[1], /<h2 id="tbilisi-promo-title">/);
    // Where, then the same dates as the pilot card's badge.
    const meta = /<p class="promo-meta"><span>[^<]+<\/span><span><bdi dir="ltr">([^<]+)<\/bdi><\/span><\/p>/.exec(camp[1]);
    assert.ok(meta, `${page} camp meta should be the place and the dates`);
    assert.equal(meta[1], /<p class="running-badge"><bdi dir="ltr">([^<]+)<\/bdi>/.exec(html)?.[1], `${page}: camp and badge dates differ`);
    assert.doesNotMatch(camp[1], /promo-meta">[^\n]*(Free|Бесплатно|חינם)/);
    assert.match(camp[1], /<img class="camp-photo" src="[^"]*assets\/camp-square-720\.webp"/);
    assert.doesNotMatch(html, /class="program-row[^"]*"[^>]*data-program="tbilisi"|promo-banner/);
    // Key figures from the survey, each a number with its label.
    const list = /<ul class="camp-figures" role="list">([\s\S]*?)<\/ul>/.exec(camp[1]);
    assert.ok(list, `${page} has no camp figures`);
    assert.equal(list[1].match(/<span class="stat-value">[^<]*\d/g)?.length, figures);
    assert.equal(list[1].match(/<span class="stat-label">[^<]+/g)?.length, figures);
    // A disclosure control, not a dialog trigger; it names the story block.
    assert.match(camp[1], /<button type="button" class="camp-more text-link" aria-expanded="false" aria-controls="tbilisi-details" data-expand hidden>/);
    assert.match(camp[1], /<div class="camp-details" id="tbilisi-details">[\s\S]*class="results-quote"/);
    assert.doesNotMatch(camp[1], /<dialog|data-dialog/);
    assert.doesNotMatch(html, /id="tbilisi-results"|side-panel-promo/);
    // Outside the tab panes: after the audiences section, before the team.
    assert.ok(html.indexOf('id="tbilisi-camp"') > html.lastIndexOf('id="audiences"'));
    assert.ok(html.indexOf('id="tbilisi-camp"') > html.indexOf('id="partners"'));
    assert.ok(html.indexOf('id="tbilisi-camp"') < html.indexOf('id="team"'));
  }
});

test('schools and partners have a page of their own, linked after the tabs', () => {
  for (const page of Object.values(pages)) {
    const html = read(page);
    const tablist = /<div class="audience-tabs" role="tablist"[^>]*>([\s\S]*?)<\/div>/.exec(html);
    assert.equal((tablist[1].match(/role="tab"/g) ?? []).length, 2);
    assert.doesNotMatch(tablist[1], /partners|schools/);
    assert.match(html, /<\/div>\s*<a class="audience-trigger text-link" href="schools\/">/);
    assert.doesNotMatch(html, /id="partners"|data-dialog="partners"/, `${page} still has the partners panel`);
  }
  for (const [lang, page] of Object.entries(schoolPages)) {
    const html = read(page);
    assert.match(html, /<h1 class="display" id="partners-title">/, `${page} heading`);
    assert.equal((html.match(/<article class="wwd-beat">/g) ?? []).length, 3, `${page} partner shapes`);
    assert.match(html, /class="partners-action"/);
    assert.doesNotMatch(html, /class="hero|class="program-banner"|id="faq"/, `${page} carries the landing`);
    assert.match(html, /<a class="logo" href="\.\.\/#top"/, `${page} logo should lead home`);
    assert.match(html, /<\/header>\s*<a class="back-float" href="\.\.\/#audiences">/, `${page} Back pill beside the logo`);
    assert.doesNotMatch(html, /audience-bar|mobile-menu-audiences/, `${page} audiences are back in the menu`);
    const path = lang === 'en' ? 'schools/' : `${lang}/schools/`;
    assert.ok(html.includes(`<link rel="canonical" href="https://morim.foundation/${path}">`), `${page} canonical`);
    assert.ok(html.includes('<link rel="alternate" hreflang="x-default" href="https://morim.foundation/schools/">'), `${page} x-default`);
  }
});

test('the landing has no floating program bar', () => {
  for (const page of Object.values(pages)) assert.doesNotMatch(read(page), /program-banner/);
});

test('the landing preloads what the hero collage needs first', () => {
  const html = read('index.html');
  const [, version] = /<link rel="modulepreload" href="js\/main\.js\?v=([0-9a-f]{8})">/.exec(html);
  assert.ok(html.includes(`<link rel="modulepreload" href="js/hero/hero.js?v=${version}">`));
  // The preloaded URLs are the ones the stamped imports request.
  assert.ok(read('js/main.js').includes(`from './hero/hero.js?v=${version}'`));
  for (const slug of ['discord', 'tiktok', 'chatgpt', 'fortnite', 'youtube']) {
    assert.ok(html.includes(`imagesrcset="assets/hero-app-${slug}-128.webp 128w`), `${slug} icon preload`);
  }
  assert.ok(html.includes('<link rel="preload" as="image" href="assets/video/stream-headset-neon.webp">'));
  assert.ok(read('ru/index.html').includes(`<link rel="modulepreload" href="../js/hero/hero.js?v=${version}">`));
  assert.ok(!read('schools/index.html').includes('modulepreload'), 'no collage on schools');
});

// The CTA system: Apply (to the form) in the offers and the footer plus the
// floating pill; Write to us beside it in the footer; partners write to the
// mailbox with a subject, not the teachers' form.
test('one primary action: Apply in the offers and the footer, floating once the hero has gone', () => {
  for (const [lang, page] of Object.entries(pages)) {
    const html = read(page);
    const t = JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
    const applies = html.match(/<a class="button[^"]*" href="[^"]+" data-apply>/g) ?? [];
    assert.equal(applies.length, 3, `${page}: two offers, footer`);
    assert.ok(applies.every((a) => a.includes(`href="${t.links.survey}"`)), `${page}: every Apply leads to the form`);
    assert.doesNotMatch(html, /hero-cta|hero-apply/, `${page}: no button in the hero`);
    assert.match(html, /<div class="floating-apply-rail" data-anchor="\.hero" inert>\s*<a class="button floating-apply-button" href="[^"]+">[^<]+<\/a>\s*<\/div>/);
    assert.doesNotMatch(html, /floating-apply-button" href="[^"]+" data-apply/);
    assert.match(html, /<p class="footer-actions"><a class="button footer-apply" href="[^"]+" data-apply>[^<]+<\/a><\/p>\s*<a class="footer-email" href="mailto:[^"]+">[^<]+<\/a>/);
    assert.equal((html.match(/class="button[^"]*"/g) ?? []).length, 4, `${page}: three Apply and the floating one`);
    assert.equal((html.match(/href="mailto:/g) ?? []).length, 1, `${page}: the address is the one mailto`);
    for (const link of ['audience-trigger', 'pilot-button', 'camp-more']) assert.match(html, new RegExp(`class="[^"]*${link} text-link"`), `${page}: ${link}`);
  }
  for (const [lang, page] of Object.entries(schoolPages)) {
    const html = read(page);
    const t = JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
    assert.match(t.links.partners, /^mailto:contact@morim\.foundation\?subject=/);
    assert.ok(html.includes(`<a class="button" href="${t.links.partners}">${t.partners.cta}</a>`), `${page}: partners write in`);
    assert.doesNotMatch(html, /data-apply|floating-apply|partners-email/, `${page}: no Apply for partners`);
    assert.equal((html.match(/class="button[^"]*"/g) ?? []).length, 1, `${page}: Partner with us is the one button`);
    assert.equal((html.match(/href="mailto:/g) ?? []).length, 2, `${page}: the button and the footer address`);
  }
});

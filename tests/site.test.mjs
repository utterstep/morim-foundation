import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// Checks on the generated pages at the repository root (run `uv run build.py` first).
const site = fileURLToPath(new URL('../', import.meta.url));
const pages = { en: 'index.html', ru: 'ru/index.html', he: 'he/index.html' };
const schoolPages = { en: 'schools/index.html', ru: 'ru/schools/index.html', he: 'he/schools/index.html' };
// Articles are built only in the languages they are written in (build.py, PAGES).
const articlePages = { 'pisa-2025': { en: 'pisa-2025/index.html' } };
const articleList = Object.values(articlePages).flatMap((byLang) => Object.values(byLang));
const read = (page) => readFileSync(join(site, page), 'utf8');

test('all three pages exist with the right lang and dir', () => {
  assert.match(read(pages.en), /<html lang="en" dir="ltr">/);
  assert.match(read(pages.ru), /<html lang="ru" dir="ltr">/);
  assert.match(read(pages.he), /<html lang="he" dir="rtl">/);
});

test('no template syntax leaks into the output', () => {
  for (const page of [...Object.values(pages), ...Object.values(schoolPages), ...articleList]) {
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
  for (const page of [...Object.values(pages), ...Object.values(schoolPages), ...articleList]) {
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

// build.py can list a language without linking to it (LANGS, "linked"): the
// switchers keep it in place as a disabled link, and its pages are still built.
test('every switcher entry is a link or a disabled placeholder; English always links', () => {
  const all = { ...pages };
  for (const [lang, page] of Object.entries(schoolPages)) all[`${lang}-schools`] = page;
  for (const [name, byLang] of Object.entries(articlePages)) {
    for (const [lang, page] of Object.entries(byLang)) all[`${lang}-${name}`] = page;
  }
  for (const [key, page] of Object.entries(all)) {
    const lang = key.slice(0, 2);
    const html = read(page);
    const footer = /<nav class="lang-switcher lang-switcher-footer"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';
    const menu = /id="lang-menu-list"[\s\S]*?<\/ul>/.exec(html)?.[0] ?? '';
    const entries = [...`${footer}${menu}`.matchAll(/<a ([^>]*)>/g)].map(([, attrs]) => attrs);
    assert.equal(entries.length, 5, `${page}: three in the footer, the other two in the menu`);
    for (const attrs of entries) {
      const code = /\blang="([a-z]{2})"/.exec(attrs)?.[1];
      if (/\bhref="/.test(attrs)) {
        assert.match(attrs, new RegExp(`^href="[^"]*" hreflang="${code}" lang="${code}"`), `${page}: ${code} link`);
        continue;
      }
      assert.match(attrs, new RegExp(`^role="link" aria-disabled="true" lang="${code}"`), `${page}: ${code} placeholder`);
      assert.notEqual(code, lang, `${page}: its own language must stay a link`);
      assert.notEqual(code, 'en', `${page}: English must stay a link`);
      assert.ok(existsSync(join(site, pages[code])), `${page}: ${code} is unlinked but its page should still be built`);
    }
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
    // The fellowship's name and the edition sit inside the heading, over the year's title.
    assert.ok(html.includes(`<h2 class="display" id="fellowship-title"><span class="offer-kicker">${current.kicker}</span> ${current.title_html}</h2>`), `${page}: heading`);
    assert.match(html, /<div class="prose fellowship-intro">\s*<p>[^<]+, /);
    // The pane closes on this year's questions, under their own small heading.
    const practice = /<div class="prose fellowship-practice">([\s\S]*?)<\/div>\s*<\/div>/.exec(html)?.[1] ?? '';
    assert.ok(practice.includes(`<p class="questions-title">${t.fellowship.questions_title}</p>`), `${page}: questions heading`);
    assert.deepEqual([...practice.matchAll(/<span>([^<]+)<\/span>/g)].map((m) => m[1]), t.fellowship.questions, `${page}: questions`);
    assert.doesNotMatch(html, /pilot-link|pilot-camp/, `${page}: the pilot card left the pane; the camp section comes first`);
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
    const band = /<section class="scholarship-band" id="scholarship" aria-labelledby="scholarship-title">([\s\S]*?)<\/section>/.exec(html);
    assert.ok(band, `${page}: band`);
    // One heading: the pen word, large; the feature's title is gone.
    assert.ok(band[1].includes(`<h2 class="scholarship-word" id="scholarship-title">${t.scholarship.title}</h2>`), `${page}: heading`);
    assert.equal(band[1].match(/<h2/g).length, 1, `${page}: one heading`);
    const paras = [...band[1].matchAll(/<p>([^<]+)<\/p>/g)].map((m) => m[1]);
    assert.deepEqual(paras, t.scholarship.body, `${page}: text`);
    const terms = [...band[1].matchAll(/<dt>([^<]+)<\/dt><dd>([^<]+)<\/dd>/g)].map((m) => ({ label: m[1], value: m[2] }));
    assert.deepEqual(terms, t.scholarship.terms, `${page}: terms`);
    // After the audiences panel, before the team; every offer tag lands here.
    assert.ok(html.indexOf('id="scholarship"') > html.lastIndexOf('id="leaders"'), `${page}: after the panes`);
    assert.ok(html.indexOf('id="scholarship"') < html.indexOf('id="team"'), `${page}: before the team`);
    assert.equal(html.match(/href="#scholarship"/g).length, 3, `${page}: both offers and the hero's terms link`);
    assert.doesNotMatch(html, /offer-popover|popovertarget/, `${page}: no popover`);
  }
});

test('the Tbilisi camp is its own section before the offers, expanding its story in place', () => {
  for (const [lang, page] of Object.entries(pages)) {
    const html = read(page);
    const t = JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
    const tb = t.programs.tbilisi;
    const camp = /<section class="camp" id="tbilisi-camp" aria-labelledby="tbilisi-promo-title"[^>]*>([\s\S]*?)<\/section>/.exec(html);
    assert.ok(camp, `${page} has no camp section`);
    assert.match(camp[1], /<h2 id="tbilisi-promo-title">/);
    // Where, the dates, and how many finished; then what the pilot was.
    const meta = /<p class="promo-meta"><span>([^<]+)<\/span><span><bdi dir="ltr">([^<]+)<\/bdi><\/span><span>([^<]+)<\/span><\/p>/.exec(camp[1]);
    assert.deepEqual(meta?.slice(1), [tb.where, tb.dates, tb.finished], `${page} camp meta`);
    assert.doesNotMatch(camp[1], /promo-meta">[^\n]*(Free|Бесплатно|חינם)/);
    assert.ok(camp[1].includes(`<p class="camp-intro">${tb.intro}</p>`), `${page} camp intro`);
    assert.match(camp[1], /<img class="camp-photo" src="[^"]*assets\/camp-square-720\.webp"/);
    assert.doesNotMatch(html, /class="program-row[^"]*"[^>]*data-program="tbilisi"|promo-banner/);
    // Key figures from the survey, each a number with its label; the one
    // about adapting when a lesson goes off plan leads.
    const list = /<ul class="camp-figures" role="list">([\s\S]*?)<\/ul>/.exec(camp[1]);
    assert.ok(list, `${page} has no camp figures`);
    assert.equal(list[1].match(/<span class="stat-value">[^<]*\d/g)?.length, tb.stats.length);
    assert.deepEqual([...list[1].matchAll(/<span class="stat-label">([^<]+)/g)].map((m) => m[1]), tb.stats.map((stat) => stat.label));
    assert.match(tb.stats[0].value_html, /^60<small>%<\/small>.*25<small>%<\/small>$/, `${page}: the adapting figure leads`);
    // "Learn more": a disclosure control after the figures, not a dialog
    // trigger; it names the story block, which ships open and is collapsed
    // by the script that unhides the button.
    assert.match(camp[1], /<\/ul>\s*<button type="button" class="camp-more text-link" aria-expanded="false" aria-controls="tbilisi-details" data-expand hidden>\s*<span>[^<]+<\/span>/);
    assert.ok(camp[1].includes(`<span>${t.programs.learn_more}</span>`), `${page}: Learn more`);
    const details = /<div class="camp-details" id="tbilisi-details">([\s\S]*?)<\/div>\s*<\/div>/.exec(camp[1])?.[1] ?? '';
    assert.ok(details.includes(`<h3 class="program-results-title">${tb.results_title}</h3>`), `${page}: story heading`);
    assert.deepEqual([...details.matchAll(/<p>([^<]+)<\/p>/g)].map((m) => m[1]), tb.results, `${page}: story`);
    assert.match(read('js/main.js'), /button\[data-expand\]/);
    // The teacher's line and the caveat are in the page, not behind the control.
    assert.doesNotMatch(details, /results-quote|results-caveat/, `${page}: the quote stays outside the story`);
    const voice = /<div class="camp-story">([\s\S]*)$/.exec(camp[1])?.[1] ?? '';
    assert.ok(voice.includes(`<blockquote class="results-quote">${tb.quote}</blockquote>`), `${page}: quote`);
    assert.ok(voice.includes(`<p class="results-caveat">${tb.caveat}</p>`), `${page}: caveat`);
    assert.ok(camp[1].indexOf('id="tbilisi-details"') < camp[1].indexOf('class="camp-story"'), `${page}: story, then the quote`);
    assert.doesNotMatch(camp[1], /<dialog|data-dialog/);
    assert.doesNotMatch(html, /id="tbilisi-results"|side-panel-promo/);
    // The proof comes ahead of the ask: after the steps, before the audiences.
    const order = ['id="how-it-works"', 'id="tbilisi-camp"', 'id="audiences"', 'id="team"'].map((k) => html.indexOf(k));
    assert.ok(order.every((at) => at > 0), `${page}: sections`);
    assert.deepEqual([...order].sort((a, b) => a - b), order, `${page}: order`);
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

test('the landing preloads its module graph, and nothing of the old collage', () => {
  const html = read('index.html');
  const [, version] = /<link rel="modulepreload" href="js\/main\.js\?v=([0-9a-f]{8})">/.exec(html);
  // Every preloaded URL is one a stamped import requests, and the other way round.
  const preloaded = [...html.matchAll(/<link rel="modulepreload" href="js\/([^"?]+)\?v=([0-9a-f]{8})">/g)];
  assert.ok(preloaded.every((m) => m[2] === version));
  const names = preloaded.map((m) => m[1]);
  const graph = new Set();
  const walk = (name) => {
    if (graph.has(name)) return;
    graph.add(name);
    for (const [, spec] of read(`js/${name}`).matchAll(/(?:from|import)\s*'(\.[^'?]+)\?v=[0-9a-f]{8}'/g)) {
      walk(join(dirname(name), spec).replaceAll('\\', '/'));
    }
  };
  walk('main.js');
  assert.deepEqual([...names].sort(), [...graph].sort());
  assert.ok(names.includes('margin-note.js') && names.includes('lib/page-motion.js'));
  // The hero is markup and CSS now: no script, no image or video hints.
  assert.ok(!names.some((name) => name.includes('hero')), 'no hero script');
  assert.doesNotMatch(html, /rel="preload" as="image"|assets\/video\//);
  assert.ok(read('ru/index.html').includes(`<link rel="modulepreload" href="../js/main.js?v=${version}">`));
  assert.ok(!read('schools/index.html').includes('modulepreload'), 'no preloads on schools');
});

// The hero says the claim and shows the years: a headline with the marker,
// a lead, the one Apply above the fold with the next cohort beside it, and
// the years as an ordered list ending on an open slot.
test('the hero is the claim, one Apply, and the years as a list', () => {
  for (const [lang, page] of Object.entries(pages)) {
    const html = read(page);
    const t = JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
    const hero = /<section class="hero hero-years-layout" aria-labelledby="hero-title">([\s\S]*?)<\/section>/.exec(html)?.[1] ?? '';
    assert.ok(hero.includes(`<h1 id="hero-title">${t.hero.title_html}</h1>`), `${page}: headline`);
    assert.match(t.hero.title_html, /<mark>[^<]+<\/mark>$/, `${page}: the half that stays carries the marker`);
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, `${page}: one h1`);
    assert.ok(hero.includes(`<p class="hero-lead">${t.hero.lead}</p>`), `${page}: lead`);
    assert.ok(hero.includes(`<a class="button hero-apply" href="${t.links.survey}" data-apply>${t.programs.apply}</a>`), `${page}: Apply`);
    assert.ok(hero.includes(`${t.hero.next_label} ${t.programs.teachers[0].next} · <a href="#scholarship">${t.hero.next_terms}</a>`), `${page}: next cohort`);
    const list = new RegExp(`<ol class="hero-years" aria-label="${t.hero.years_aria}">([\\s\\S]*?)</ol>`).exec(hero)?.[1] ?? '';
    const years = [...list.matchAll(/<li class="hero-year" data-tint="([a-z]+)"><span class="hero-year-when"><bdi>([^<]+)<\/bdi><\/span><span class="hero-year-text">([^<]+)<\/span><\/li>/g)];
    assert.deepEqual(years.map((m) => ({ tint: m[1], when: m[2], text: m[3] })), t.hero.years.map(({ when, text, tint }) => ({ tint, when, text })), `${page}: years`);
    assert.ok(list.trimEnd().endsWith(`<li class="hero-year hero-year-next"><span class="hero-year-when">${t.hero.next_year}</span><span class="hero-year-text">${t.hero.next_year_text}</span></li>`), `${page}: the open slot closes the list`);
    // Nothing of the collage: no script-built accents, no variant switch.
    assert.doesNotMatch(html, /hero-accents|class="hero-app|data-hero-variant|hero-editorial/, `${page}: collage`);
  }
});

// The frame, the year, the steps: three sections between the hero and the proof.
test('the frame, this year’s themes and the steps follow the hero in order', () => {
  for (const [lang, page] of Object.entries(pages)) {
    const html = read(page);
    const t = JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
    const w = t.what_we_do;
    const order = ['class="hero ', 'id="what-we-do"', 'id="this-year"', 'id="how-it-works"', 'id="tbilisi-camp"'].map((k) => html.indexOf(k));
    assert.ok(order.every((at) => at > 0), `${page}: sections`);
    assert.deepEqual([...order].sort((a, b) => a - b), order, `${page}: order`);
    const stance = /<section class="stance" id="what-we-do" aria-labelledby="what-we-do-title">([\s\S]*?)<\/section>/.exec(html)?.[1] ?? '';
    assert.ok(stance.includes(`<h2 class="display" id="what-we-do-title">${w.title_html}</h2>`), `${page}: frame heading`);
    const rows = [...stance.matchAll(/<p class="stance-label">([^<]+)<\/p>\s*<h3 class="stance-title">([\s\S]*?)<\/h3>\s*<p class="stance-body">([^<]+)<\/p>/g)];
    assert.deepEqual(rows.map((m) => ({ label: m[1], title_html: m[2], body: m[3] })), w.stance, `${page}: rows`);
    const year = /<section class="year" id="this-year" aria-labelledby="year-title">([\s\S]*?)<\/section>/.exec(html)?.[1] ?? '';
    assert.ok(year.includes(`<p class="year-kicker">${w.year.kicker}</p>`) && year.includes(`<h2 class="year-title" id="year-title">${w.year.title}</h2>`), `${page}: year heading`);
    assert.deepEqual([...year.matchAll(/<h3>([^<]+)<\/h3>/g)].map((m) => m[1]), [...w.year.themes.map((theme) => theme.title), w.year.next_title], `${page}: two themes and the open card`);
    // The theme icons are decoration.
    for (const [img] of year.matchAll(/<img [^>]*>/g)) assert.match(img, / alt="" /, `${page}: ${img}`);
    const how = /<section class="how" id="how-it-works" aria-labelledby="how-title">([\s\S]*?)<\/section>/.exec(html)?.[1] ?? '';
    assert.ok(how.includes(`<h2 class="how-title" id="how-title">${w.how_it_works.heading}</h2>`), `${page}: steps heading`);
    assert.deepEqual([...how.matchAll(/<h4>([^<]+)<\/h4>/g)].map((m) => m[1]), w.how_it_works.steps.map((step) => step.title), `${page}: steps`);
    assert.ok(how.includes(`<p class="beat-note wwd-note">${w.practice_note}</p>`), `${page}: pen line`);
  }
});

// The CTA system: Apply (to the form) in the hero, the offers and the footer
// plus the floating pill; Write to us beside it in the footer; partners
// write to the mailbox with a subject, not the teachers' form.
test('one primary action: Apply in the hero, the offers and the footer, floating once the hero has gone', () => {
  for (const [lang, page] of Object.entries(pages)) {
    const html = read(page);
    const t = JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
    const applies = html.match(/<a class="button[^"]*" href="[^"]+" data-apply>/g) ?? [];
    assert.equal(applies.length, 4, `${page}: hero, two offers, footer`);
    assert.ok(applies.every((a) => a.includes(`href="${t.links.survey}"`)), `${page}: every Apply leads to the form`);
    assert.equal((html.match(/class="button hero-apply"/g) ?? []).length, 1, `${page}: one button in the hero`);
    assert.match(html, /<div class="floating-apply-rail" data-anchor="\.hero" inert>\s*<a class="button floating-apply-button" href="[^"]+">[^<]+<\/a>\s*<\/div>/);
    assert.doesNotMatch(html, /floating-apply-button" href="[^"]+" data-apply/);
    assert.match(html, /<p class="footer-actions"><a class="button footer-apply" href="[^"]+" data-apply>[^<]+<\/a><\/p>\s*<a class="footer-email" href="mailto:[^"]+">[^<]+<\/a>/);
    assert.equal((html.match(/class="button[^"]*"/g) ?? []).length, 5, `${page}: four Apply and the floating one`);
    assert.equal((html.match(/href="mailto:/g) ?? []).length, 1, `${page}: the address is the one mailto`);
    for (const link of ['audience-trigger', 'camp-more']) assert.match(html, new RegExp(`class="[^"]*${link} text-link"`), `${page}: ${link}`);
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

// An article: a page of its own, in its own languages only. Its head names
// only the translations that exist; the switchers keep the others in place
// as disabled entries; a shared link shows its headline chart.
test('the PISA 2025 article is built in English only, and its head says so', () => {
  const page = articlePages['pisa-2025'].en;
  const html = read(page);
  assert.match(html, /<html lang="en" dir="ltr">/);
  for (const lang of ['ru', 'he']) {
    assert.ok(!existsSync(join(site, lang, 'pisa-2025')), `no ${lang} build of the article`);
  }
  const url = 'https://morim.foundation/pisa-2025/';
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => m.slice(1));
  assert.deepEqual(alternates, [['en', url], ['x-default', url]]);
  const menu = /id="lang-menu-list"[\s\S]*?<\/ul>/.exec(html)?.[0] ?? '';
  assert.equal((menu.match(/role="link" aria-disabled="true"/g) ?? []).length, 2, 'ru and he greyed out');
  assert.match(html, /<meta property="og:type" content="article">/);
  assert.match(html, /<meta name="author" content="Vlad Stepanov, Julia Khaleeva">/);
  const image = /<meta property="og:image" content="https:\/\/morim\.foundation\/([^"]+)">/.exec(html);
  assert.ok(image && existsSync(join(site, image[1])), 'share image is published');
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/css\/article\.css\?v=[0-9a-f]{8}">/);
  for (const landing of Object.values(pages)) assert.doesNotMatch(read(landing), /article\.css/, `${landing} loads article.css`);
});

test('the PISA 2025 article: one headline, a section list that matches its headings, six charts, sources', () => {
  const html = read(articlePages['pisa-2025'].en);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
  assert.match(html, /<h1 class="article-title" id="article-title">[^<]+<mark>[^<]+<\/mark><\/h1>/);
  assert.doesNotMatch(html, /class="hero|id="faq"|floating-apply|data-scroll-hint/, 'carries the landing');
  assert.match(html, /<a class="logo" href="\.\.\/#top"/);
  // The authors under the standfirst, each with a portrait or initials.
  const authors = /<header class="article-head">[\s\S]*?<ul class="article-authors" aria-label="Authors">([\s\S]*?)<\/ul>\s*<\/header>/.exec(html)?.[1] ?? '';
  const names = [...authors.matchAll(/<span class="article-author-name">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(names, ['Vlad Stepanov', 'Julia Khaleeva']);
  assert.match(authors, /\.\.\/assets\/author-vlad-288\.webp 288w/);
  assert.match(authors, /<span class="article-avatar is-initials" aria-hidden="true">JK<\/span>/);
  // Featured on the English landing, so Back returns to its desk.
  assert.match(html, /<\/header>\s*<a class="back-float" href="\.\.\/#research">/);
  // The list in the rail leads to the h2s of the body, in order.
  const nav = /<nav class="article-contents"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? '';
  const listed = [...nav.matchAll(/<a href="#([^"]+)">([^<]+)<\/a>/g)].map((m) => [m[1], m[2]]);
  const body = /<div class="article-body">([\s\S]*?)<\/div>\s*<footer class="article-notes"/.exec(html)?.[1] ?? '';
  const headings = [...body.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map((m) => [m[1], m[2]]);
  assert.equal(listed.length, 4);
  assert.deepEqual(listed, headings);
  // Every chart: the full ladder, its box, alt text that carries the numbers,
  // and a link to the full-size file.
  const figures = [...body.matchAll(/<figure class="article-figure">([\s\S]*?)<\/figure>/g)].map((m) => m[1]);
  assert.equal(figures.length, 6);
  for (const figure of figures) {
    const stem = /href="\.\.\/assets\/articles\/(pisa-2025\/[a-z-]+)-1920\.webp"/.exec(figure)?.[1];
    assert.ok(stem, 'figure links to the full-size chart');
    for (const w of [480, 720, 1080, 1440, 1920]) assert.ok(figure.includes(`${stem}-${w}.webp ${w}w`), `${stem} ${w}w`);
    assert.match(figure, /width="1920" height="1080" loading="lazy"/);
    const alt = /alt="([^"]*)"/.exec(figure)?.[1] ?? '';
    assert.ok(alt.length > 60 && /\d/.test(alt), `${stem}: alt text should describe the chart`);
  }
  // The note mark and the sources lead to each other.
  assert.match(body, /<sup class="article-ref"><a href="#sources" id="ref-1"/);
  assert.match(html, /<footer class="article-notes" id="sources"[\s\S]*href="#ref-1"/);
  assert.match(body, /<a class="button" href="mailto:contact@morim\.foundation\?subject=PISA%202025">Write to us<\/a>/);
  assert.doesNotMatch(body, /https:\/\/morim\.foundation/, 'links to the site stay relative');
});

// The landing features the article twice, without a section of its own
// between the story and the programs: a pen note over the first stance row,
// pointing at the word it is about, and the article as a page on a desk
// before the team. Only where the article exists in the landing's language.
test('the English landing notes the PISA article over the first stance row', () => {
  const html = read(pages.en);
  const rows = [...html.matchAll(/<div class="stance-row">([\s\S]*?)<\/div>/g)].map((m) => m[1]);
  assert.equal(rows.length, 3);
  // The word the note answers, then the note, then the arrow the script draws.
  assert.match(rows[0], /<h3 class="stance-title"><mark>Curious<\/mark> /);
  assert.match(rows[0], /<\/p>\s*<a class="margin-note" href="pisa-2025\/" data-claim="\.stance-title mark" data-arrow="down">[^<]+<span class="margin-note-link">[^<]+<\/span><\/a><svg class="margin-note-arrow" aria-hidden="true" focusable="false"><path d=""\/><\/svg>\s*$/);
  for (const row of rows.slice(1)) assert.doesNotMatch(row, /margin-note/);
  // Hopeful, not a verdict on anyone.
  assert.match(rows[0], /curiosity counts as much as family background/);
  assert.doesNotMatch(rows[0], /give up|gave up/);
  assert.match(read('js/main.js'), /from '\.\/margin-note\.js\?v=[0-9a-f]{8}'/);
  assert.doesNotMatch(html, /id="evidence"|class="evidence|intro-claim|class="prose introduction"/, 'the band and the intro are gone');
  for (const lang of ['ru', 'he']) {
    assert.doesNotMatch(read(pages[lang]), /class="margin-note"/, `${lang}: the article is English only`);
  }
});

test('the English landing sets the PISA article on a desk between the scholarship and the team', () => {
  const html = read(pages.en);
  const desk = /<section class="desk" id="research" aria-labelledby="research-title">([\s\S]*?)<\/section>/.exec(html);
  assert.ok(desk, 'desk');
  const order = ['id="tbilisi-camp"', 'id="scholarship"', 'id="research"', 'id="team"'].map((k) => html.indexOf(k));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.match(desk[1], /<h2 class="desk-title" id="research-title">Why <mark>curiosity<\/mark>, and why before&nbsp;15<\/h2>/);
  assert.match(desk[1], /<a class="text-link desk-link" href="pisa-2025\/">/);
  // The scene is decoration: hidden from assistive tech, its page out of the tab order.
  assert.match(desk[1], /<div class="desk-scene" aria-hidden="true">/);
  assert.match(desk[1], /<a class="desk-sheet desk-sheet-front" href="pisa-2025\/" tabindex="-1">/);
  // The printed page carries the article's own headline and figures.
  const article = read(articlePages['pisa-2025'].en);
  const headline = /<h1 class="article-title" id="article-title">([\s\S]*?)<\/h1>/.exec(article)[1];
  assert.ok(desk[1].includes(`<span class="sheet-title">${headline}</span>`));
  for (const figure of ['14%', '(OECD: 7%)', '34%', '19.7%']) assert.ok(desk[1].includes(figure) && article.includes(figure), figure);
  assert.doesNotMatch(desk[1], /class="button|data-apply/, 'no second call to action');
  for (const lang of ['ru', 'he']) assert.doesNotMatch(read(pages[lang]), /class="desk"/, `${lang}: no desk`);
});

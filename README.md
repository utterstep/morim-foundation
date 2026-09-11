# morim.foundation

Landing page of the Morim Foundation, served from GitHub Pages at `morim.foundation`.
The previous site lives in git history before the release commit.

## How it is built

No bundler, no framework, no npm packages. Three languages at separate URLs:
`/` (English), `/ru/`, `/he/` (right-to-left).

```
build.py               renders src/ into the repository root (Python, one dependency: Jinja2, via uv)
src/template.html.j2   the page: plain HTML with Jinja loops over repeated blocks
src/i18n/{en,ru,he}.json   every string on the page; values may contain inline HTML
src/css/               stylesheets (logical properties, direction-agnostic)
src/js/                ES modules loaded straight by the browser
src/js/lib/            behaviour ported verbatim from PR #3 (hero maths, page motion, video autoplay, poof)
src/js/hero/           the hero collage, rewritten from the React component
src/assets/            images and fonts
index.html, ru/, he/   generated pages, committed
css/ js/ assets/       copied from src/ by the build, committed
site/                  redirects from the old /site/ preview URLs to the root
tests/                 node --test, zero dependencies
docs/plans/static-redesign.md   the decisions behind this port
```

### Build and preview

```sh
uv run build.py            # render all three languages into the root
uv run build.py --serve    # render, then serve the root on http://127.0.0.1:8000
uv run build.py --check    # exit 1 if the generated files are stale (useful before committing)
```

ES modules do not load from `file://`, so use `--serve` or any static server.

### Editing content

- Copy lives in `src/i18n/<lang>.json`. Keys starting with `_` are notes for editors.
  The three files must have the same keys; `tests/i18n.test.mjs` checks that.
- Asset paths inside JSON HTML fragments are written as `{root}assets/…` so the same
  string works at `/` and at `/ru/`.
- Display headings carry their own inline HTML per language, so the artwork glyphs
  (the "a" in *teachers*, the "oo" in *school*) can sit on a different letter, or be
  left out, in each language.
- Structure and markup live in `src/template.html.j2`. Change it once for all languages.
- After editing, run `uv run build.py` and commit the generated files along with `src/`.
  The build only ever touches `index.html`, `ru/`, `he/`, `css/`, `js/` and `assets/`.

### Typography

English uses Alpina with Stefan for handwritten accents. Russian uses Spectral
with Caveat; Hebrew uses Frank Ruhl Libre with Gveret Levin. The Latin wordmark
uses Alpina in every language. Font preloads follow the page language, and fonts
are served locally from `src/assets/fonts/` (copied to `assets/fonts/`).

### Photographs

`assets/photo-landscape-*.webp` and `assets/photo-portrait-*.webp` are the two
workshop scans, used in both the Tbilisi results and the pilot photo stack. Each
ships as a ladder of widths; the `photo()` macro emits them as a `srcset` of width
descriptors with a `sizes` value per placement, and the hero app icons do the same
through `icon()` in `src/js/lib/hero-apps.js`.

Width descriptors rather than `1x`/`2x` because above 701px the desktop layout is
pure `vw` — `base.css` sets `html { font-size: calc(100vw / 90) }`, so every rem
dimension grows with the viewport and the boxes never settle at a fixed size. A
photo that is 700 CSS px wide at 1920 is 1400 at 3840, which a density descriptor
cannot express: it would send the 1x file to a 4K panel and the 2x file to a phone.
Measured in Chromium across 360–3840px, the boxes settle at:

| | phone (<=700px) | desktop |
|---|---|---|
| pilot landscape / portrait | 58vw / 38vw | 37vw / 26vw |
| results landscape / portrait | 50vw / 36vw | 26vw / 19vw |
| hero app icon | ~14vw | ~6.4vw |

If those percentages change, re-measure and update the `sizes` strings — they are
promises to the browser, and a wrong one is worse than none.

The ladders stop at the resolution the artwork actually has, so nothing is upscaled.
Two of the app icons are small at source (Messages 250px, Fortnite 258px) and will
be soft on a 2x display above about 2200px wide; they need new artwork, not a new
export. The full-resolution scans are in git history, before the commit that
converted them — `src/assets/` is copied verbatim into the published site, so
nothing larger than what a browser paints belongs there.

Spectral and Frank Ruhl Libre come from the [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl).
Caveat comes from [googlefonts/caveat](https://github.com/googlefonts/caveat), and
Gveret Levin from [AlefAlefAlef/gveret-levin](https://github.com/AlefAlefAlef/gveret-levin).
Their SIL Open Font Licenses are included beside the font files.

### Tests

```sh
node --test tests/*.test.mjs     # or: npm test
```

The tests need only Node 22 or newer. They cover the ported hero and motion logic, the
generated pages (three outputs, `hreflang`, every link resolves, every module import
resolves), key parity across languages, and that no physical inline-axis CSS crept back in.

### How the widgets work

The PR used shadcn/Base UI components; here they are native elements plus small modules:

| Widget | Element | Module |
|---|---|---|
| FAQ accordion | `<details>` with animated height | `src/js/disclosure.js` |
| Tbilisi results | button + `aria-expanded` region | `src/js/disclosure.js` |
| Contact / social dialogs, mobile menu | `<dialog>` | `src/js/dialog.js`, `src/js/mobile-menu.js` |
| Location filter | button + `role="listbox"` | `src/js/listbox.js`, `src/js/programs.js` |
| Hero collage | built by JS into `.hero-accents` | `src/js/hero/` |

Timings and easings match the PR; `src/css/widgets.css` holds the structural styles.

## Deploying to GitHub Pages

Repo → Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
`CNAME` sets the custom domain; `.nojekyll` makes Pages serve files as-is.

## Open items before the redesign goes live

- Russian and Hebrew copy are first-pass drafts and need a native review (see the
  `_comment` and `_todo` keys in the JSON files).
- The school-leader cards were assembled from the previous site's coordinator copy;
  confirm with the team. Two team members are placeholders.
- Webfont licences: GT Alpina and the ABC Stefan *trial* font are shipped as in the PR.
- The hero embeds TikTok, Twitch and YouTube players with muted autoplay; review the
  chosen clips and any consent requirements.
- Footer social links open a "coming soon" dialog until the profiles exist.

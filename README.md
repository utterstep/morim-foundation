# morim.foundation — landing page

Static single-page landing for **Untitled Foundation**, designed to be served from
GitHub Pages at the custom domain `morim.foundation`.

## Structure

```
index.html              # markup + no-JS English fallback content
static/css/style.css     # layout, typography (Inter), scattered doodles, responsive rules
static/js/i18n.js        # EN / RU / HE (RTL) language switcher
static/img/*.png         # hand-drawn doodle assets
CNAME                    # custom domain for GitHub Pages -> morim.foundation
.nojekyll                # serve files as-is (skip Jekyll processing)
```

No build step. Open `index.html` directly, or serve the folder with any static server.

## Deploying to GitHub Pages

1. Push this folder to a repo (root of the published branch, e.g. `main`).
2. Repo → Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. The `CNAME` file sets the custom domain to `morim.foundation`. In your DNS, point the
   apex domain at GitHub Pages (A/AAAA records for `185.199.108–111.153` / the IPv6 set,
   or an `ALIAS`/`ANAME` to `<user>.github.io`), then enable **Enforce HTTPS**.

## Content to review before going live

These were filled with sensible defaults to match the design and **should be verified**:

- **Confirmed links** — pilot CTA → `https://summer-pilot-2026.utterstep.app/`,
  Elena Bunina → her LinkedIn, Vlad Stepanov → his LinkedIn, contact →
  `contact@morim.foundation`.
- **Placeholder links to verify** — `Nebius Academy` → `https://academy.nebius.com`,
  `Gradarius` → `https://gradarius.com`. Update hrefs in `static/js/i18n.js` (and the
  no-JS fallback in `index.html`).
- **"How does it work?"** answer is placeholder copy.
- **RU / HE translations** are a first pass — have a native speaker review, especially the
  Hebrew.

Every translatable string lives in `static/js/i18n.js` (EN/RU/HE) with a matching no-JS
fallback in `index.html`; edit both when changing copy.

## Validated with

`rodney` (headless Chrome): images load, Inter webfont applies, language switcher updates
text + `dir` (LTR/RTL), accordions toggle, on desktop (1440px) and mobile (390px).

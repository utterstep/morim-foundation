# Morim Foundation — redesign preview

Work-in-progress desktop and mobile website implemented from the supplied Figma designs.
For local review only: **do not merge or deploy yet**.

This source is intentionally separate from the existing static site at the repository
root. Nothing in this directory changes the live GitHub Pages website. The local
hosting configuration contains no registered project or credentials.

## Local development

Requires Node 22.13 or newer.

```sh
npm ci
npm run dev
```

## Validation

```sh
node --experimental-strip-types --test tests/*.test.mjs
npx tsc --noEmit
npm run build
```

The build produces a Vinext/Cloudflare application, not a static GitHub Pages
replacement. A future hosting decision is required before launch. No deployment
workflow is supplied in this PR.

## Current experience

- Centered Alpina headline and layout scaled from a 1440px reference; responsive mobile layouts.
- Rounded floating navigation maintains its width and smoothly transitions on scroll.
- A bottom-left “Hero test” switch compares three versions using the same eight items
  (five icons and three real video embeds). Static is the default: a larger collage
  overlaps “but…” and reserves space before the explanatory copy. On scroll reveals
  the collage over the headline, then fades it away as the intro moves upward.
  Reveal & stay keeps the revealed collage visible and reserves space before the copy.
  Items remain stationary, with small random offsets inside composition zones. Click an
  item (or Twitch's dismiss button) to poof it and replace it. App icons use rounded masks
  and content-sized notification badges. Switching versions returns to the top.
- Pools of four CNN videos, four YouTube Shorts, four Twitch clips, and two TikToks
  cycle without repeating until a pool is exhausted. Reloads avoid the last selection.
  Videos request muted autoplay, with native controls.
  Browser/provider restrictions, consent screens, unavailable clips, and ad blockers may
  prevent playback; autoplay is not guaranteed. Twitch autoplay remains blocked in the
  tested in-app browser, even in an isolated embed; manual playback was verified.
- Teacher and school-leader program sections, aligned program rows, location filtering,
  expandable Tbilisi pilot results, contextual floating Apply buttons, team, and FAQs.
- Reduced-motion handling, keyboard controls, and scroll-linked editorial annotations.
- Teacher and leader cards have stronger scale-down/unrolling entrances; team names
  use plain text and the team retains horizontal swipe scrolling without visible arrows
  or scrollbars on mobile.
- `/approach-v2` and `/hero-options` retain exploratory hero alternatives for review.

## Editing

- `app/home-content.tsx`: main page content and section order.
- `app/hero.tsx`, `app/hero-floating.css`, `lib/hero-collage.ts`: main hero variations.
- `lib/hero-poof.ts`, `lib/hero-floating.ts`: dismiss effects, composition, and rotation.
- `app/hero-video.tsx`, `lib/hero-videos.ts`: external video players and source catalog.
- `app/sections.tsx`, `app/sections.css`: programs, results, team, and FAQ.
- `app/globals.css`, `app/mobile.css`: shared typography and responsive layout.
- `lib/page-motion.ts`, `app/motion.css`: editorial reveals and annotations.
- `tests/`: motion, interaction, video, and program behavior tests.

## Pending before launch

- Contact, application, and social destinations remain placeholders by request; no form is submitted.
- Confirm all program dates, result claims, team details, and final FAQ copy.
- Confirm appropriate webfont licenses; a supplied handwritten font is a trial font.
- Review third-party video content, embedding permissions, and privacy/consent requirements.
- Perform browser/device QA, including autoplay, touch interactions, and accessibility.

Keep the preview on localhost. Publishing or deploying requires separate approval.

// Embedded video player for a hero card, ported from PR #3
// website/app/hero-video.tsx. One player per video face; `sync` is
// idempotent and only touches the iframe when the desired state changes,
// so repeated updates never reload the embed.

import { heroVideoEmbed } from '../lib/hero-videos.js';
import { startHeroVideoAutoplay } from '../lib/hero-video-autoplay.js';

// The embeds are the heaviest thing on the page by a wide margin: a couple of
// megabytes of provider script plus their own webfonts, none of which the hero
// needs in order to paint. Hold every iframe until the page has loaded and the
// main thread goes idle, so the collage renders from its own assets first and
// the players arrive behind it. The shells keep their aspect ratio either way,
// so nothing moves when they do.
//
// EMBED_DEADLINE_MS bounds the wait: on a slow connection `load` can be many
// seconds out, and a hero of empty video cards is worse than a late webfont.
const EMBED_DEADLINE_MS = 2500;
const waiting = new Set();
let embedsReady = false;

function releaseEmbeds() {
  if (embedsReady) return;
  embedsReady = true;
  for (const render of waiting) render();
  waiting.clear();
}

if (typeof window !== 'undefined') {
  const idle = window.requestIdleCallback?.bind(window) ?? ((fn) => setTimeout(fn, 200));
  const afterLoad = () => idle(releaseEmbeds, { timeout: 1000 });
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, { once: true });
  setTimeout(releaseEmbeds, EMBED_DEADLINE_MS);
}

/**
 * @param {HTMLElement} shell  the `.hero-video-player` span, already in the DOM
 * @param {import('../lib/hero-videos.js').HeroVideo} video
 * @param {{interactive: boolean, unavailableText: string}} options
 * @returns {{sync: (desired: {active: boolean, autoplay: boolean}) => void, destroy: () => void}}
 */
export function createPlayer(shell, video, { interactive, unavailableText }) {
  const origin = window.location.origin;
  const status = shell.querySelector('.hero-video-status') ?? document.createElement('span');
  status.className = 'hero-video-status';
  const state = {
    iframe: null,
    stopAutoplay: null,
    failed: false,
    scale: 1,
    twitchVisible: false,
    desired: null,
    key: '',
  };

  const applyScale = () => {
    if (state.iframe) state.iframe.style.transform = `scale(${state.scale})`;
  };
  const resize = new ResizeObserver(() => {
    state.scale = shell.clientWidth / video.width;
    applyScale();
  });
  resize.observe(shell);
  // Clips only honor autoplay when loaded in view, not beneath the fold.
  const visibility =
    video.provider === 'twitch'
      ? new IntersectionObserver(
          ([entry]) => {
            if (entry.intersectionRatio >= 0.85) state.twitchVisible = true;
            else if (!entry.isIntersecting) state.twitchVisible = false;
            render();
          },
          { threshold: [0, 0.85] },
        )
      : null;
  visibility?.observe(shell);

  const fail = () => {
    state.failed = true;
    render();
  };
  const mount = (autoplay) => {
    const iframe = document.createElement('iframe');
    iframe.title = video.title;
    if (!interactive) iframe.tabIndex = -1;
    iframe.src = heroVideoEmbed(video, origin, autoplay);
    iframe.dataset.autoplay = String(autoplay);
    iframe.width = String(video.width);
    iframe.height = String(video.height);
    iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.addEventListener('error', fail);
    state.iframe = iframe;
    shell.replaceChildren(iframe);
    applyScale();
    state.stopAutoplay = startHeroVideoAutoplay(iframe, video.provider, autoplay, fail);
  };
  const unmount = () => {
    state.stopAutoplay?.();
    state.stopAutoplay = null;
    state.iframe?.remove();
    state.iframe = null;
    shell.replaceChildren(status);
  };
  const reload = (autoplay) => {
    state.stopAutoplay?.();
    state.iframe.src = heroVideoEmbed(video, origin, autoplay);
    state.iframe.dataset.autoplay = String(autoplay);
    state.stopAutoplay = startHeroVideoAutoplay(state.iframe, video.provider, autoplay, fail);
  };

  function render() {
    const desired = state.desired;
    if (!desired) return;
    // Unmount remote players as soon as the page is hidden or scrolled away.
    const mounted = desired.active && embedsReady && (video.provider !== 'twitch' || state.twitchVisible);
    const key = `${mounted}:${desired.autoplay}`;
    if (key !== state.key) {
      state.key = key;
      state.failed = false;
    }
    const wantIframe = mounted && !state.failed;
    if (wantIframe && !state.iframe) mount(desired.autoplay);
    else if (!wantIframe && state.iframe) unmount();
    else if (state.iframe && state.iframe.dataset.autoplay !== String(desired.autoplay)) reload(desired.autoplay);
    status.textContent = state.failed ? unavailableText : '';
  }

  return {
    sync(desired) {
      state.desired = desired;
      if (!embedsReady) waiting.add(render);
      render();
    },
    destroy() {
      waiting.delete(render);
      resize.disconnect();
      visibility?.disconnect();
      unmount();
    },
  };
}

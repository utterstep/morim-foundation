// Embedded video player for a hero card, ported from PR #3
// website/app/hero-video.tsx. One player per video face; `sync` is
// idempotent and only touches the iframe when the desired state changes,
// so repeated updates never reload the embed. Self-hosted clips (see
// `heroVideoFile`) use a native <video> instead of an iframe.

import { heroVideoEmbed, heroVideoFile } from '../lib/hero-videos.js';
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
 * @param {{unavailableText: string}} options
 * @returns {{sync: (desired: {active: boolean, autoplay: boolean}) => void, destroy: () => void}}
 */
export function createPlayer(shell, video, { unavailableText }) {
  const origin = window.location.origin;
  const file = heroVideoFile(video);
  const status = shell.querySelector('.hero-video-status') ?? document.createElement('span');
  status.className = 'hero-video-status';
  const state = {
    iframe: null,
    stopAutoplay: null,
    failed: false,
    scale: 1,
    inView: false,
    desired: null,
    key: '',
  };

  // Iframes render at the provider's native size and are scaled to the card;
  // a native video just fills it.
  const applyScale = () => {
    if (state.iframe && !file) state.iframe.style.transform = `scale(${state.scale})`;
  };
  const resize = new ResizeObserver(() => {
    state.scale = shell.clientWidth / video.width;
    applyScale();
  });
  resize.observe(shell);
  // A self-hosted clip is only fetched once most of its card is in view, so
  // a hero scrolled past never downloads it. (The Twitch embed this replaced
  // needed the same gate to honour autoplay at all.)
  const visibility = file
    ? new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio >= 0.85) state.inView = true;
          else if (!entry.isIntersecting) state.inView = false;
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
  // The poof target above the player owns clicks and keyboard focus, so the
  // media itself stays out of the tab order.
  const mountFile = (autoplay) => {
    const clip = document.createElement('video');
    clip.title = video.title;
    clip.tabIndex = -1;
    clip.muted = true;
    clip.defaultMuted = true;
    clip.loop = true;
    clip.playsInline = true;
    clip.disablePictureInPicture = true;
    clip.disableRemotePlayback = true;
    clip.preload = 'auto';
    clip.poster = file.poster;
    clip.width = video.width;
    clip.height = video.height;
    clip.src = file.src;
    clip.dataset.autoplay = String(autoplay);
    clip.addEventListener('error', fail);
    state.iframe = clip;
    shell.replaceChildren(clip);
    if (autoplay) clip.play().catch(() => {});
  };
  const mount = (autoplay) => {
    if (file) return mountFile(autoplay);
    const iframe = document.createElement('iframe');
    iframe.title = video.title;
    iframe.tabIndex = -1;
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
    if (file) {
      // Pausing keeps the frame; the poster only shows before the first play.
      state.iframe.dataset.autoplay = String(autoplay);
      if (autoplay) state.iframe.play().catch(() => {});
      else state.iframe.pause();
      return;
    }
    state.stopAutoplay?.();
    state.iframe.src = heroVideoEmbed(video, origin, autoplay);
    state.iframe.dataset.autoplay = String(autoplay);
    state.stopAutoplay = startHeroVideoAutoplay(state.iframe, video.provider, autoplay, fail);
  };

  function render() {
    const desired = state.desired;
    if (!desired) return;
    // Unmount players as soon as the page is hidden or scrolled away.
    const mounted = desired.active && embedsReady && (!file || state.inView);
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

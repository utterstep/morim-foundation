// Ported from PR #3 website/lib/hero-video-autoplay.ts (plain ES module, no build step).
// Retry startup only. Stop after confirmed playback so user pause/unmute wins.
/**
 * @param {HTMLIFrameElement} frame
 * @param {'tiktok' | 'youtube' | 'twitch'} provider
 * @param {boolean} autoplay
 * @param {() => void} onError
 * @returns {() => void} cleanup
 */
export function startHeroVideoAutoplay(
  frame,
  provider,
  autoplay,
  onError,
) {
  const origin =
    provider === 'tiktok'
      ? 'https://www.tiktok.com'
      : 'https://www.youtube.com';
  const timers = [];
  let started = false;
  const stop = () => timers.splice(0).forEach(clearTimeout);
  const request = () => {
    if (started || !autoplay || provider === 'twitch') return;
    if (provider === 'tiktok') {
      for (const type of ['mute', 'play'])
        frame.contentWindow?.postMessage(
          { type, 'x-tiktok-player': true },
          origin,
        );
    } else {
      frame.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: 'hero-video' }),
        origin,
      );
      for (const func of ['mute', 'playVideo'])
        frame.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func, args: [] }),
          origin,
        );
    }
  };
  const load = () => {
    stop();
    if (!autoplay || provider === 'twitch') return;
    request();
    for (const delay of [500, 1500, 3000, 6000])
      timers.push(setTimeout(request, delay));
  };
  const receive = (event) => {
    if (event.source !== frame.contentWindow || event.origin !== origin) return;
    let data = event.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return;
      }
    }
    if (!data || typeof data !== 'object') return;
    if (provider === 'tiktok') {
      if (data['x-tiktok-player'] !== true) return;
      if (data.type === 'onPlayerReady') request();
      if (data.type === 'onStateChange' && data.value === 1) {
        started = true;
        stop();
      }
      if (
        data.type === 'onPlayerError' &&
        (data.value?.errorCode ?? data.value) !== 3002
      ) {
        stop();
        onError();
      }
    } else if (provider === 'youtube') {
      if (data.event === 'onReady') request();
      if (
        (data.event === 'onStateChange' && data.info === 1) ||
        data.info?.playerState === 1
      ) {
        started = true;
        stop();
      }
      if (data.event === 'onError') {
        stop();
        onError();
      }
    }
  };
  frame.addEventListener('load', load);
  window.addEventListener('message', receive);
  load();
  return () => {
    stop();
    frame.removeEventListener('load', load);
    window.removeEventListener('message', receive);
  };
}

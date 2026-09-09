// Ported from PR #3 website/lib/hero-videos.ts (plain ES module, no build step).

/**
 * @typedef {object} HeroVideo
 * @property {'tiktok' | 'twitch' | 'youtube'} provider
 * @property {string} id
 * @property {string} label
 * @property {string} title
 * @property {string} url
 * @property {number} width
 * @property {number} height
 */

/** @type {readonly HeroVideo[]} */
export const heroVideos = [
  {
    provider: 'tiktok',
    id: '6768504823336815877',
    label: 'TikTok · Zach King',
    title: 'Zach King’s broomstick illusion',
    url: 'https://www.tiktok.com/@zachking/video/6768504823336815877',
    width: 325,
    height: 578,
  },
  {
    provider: 'tiktok',
    id: '6745555903166041349',
    label: 'TikTok · Zach King',
    title: 'Zach King: Caution wet paint',
    url: 'https://www.tiktok.com/@zachking/video/6745555903166041349',
    width: 325,
    height: 578,
  },
  {
    provider: 'twitch',
    id: 'BlitheAcceptableOrangeGingerPower-DVLGiMB2Ow6qNreU',
    label: 'Twitch · CaseOh',
    title: 'CaseOh: Perfect timing — The Cooking Class',
    url: 'https://clips.twitch.tv/BlitheAcceptableOrangeGingerPower-DVLGiMB2Ow6qNreU',
    width: 400,
    height: 300,
  },
  {
    provider: 'youtube',
    id: 'DfiLbQsVB_I',
    label: 'YouTube · CNN',
    title: 'CNN: Retired generals break down Iran war strategy after week 4',
    url: 'https://www.youtube.com/watch?v=DfiLbQsVB_I',
    width: 480,
    height: 270,
  },
  {
    provider: 'twitch',
    id: 'AuspiciousTolerantMosquitoCorgiDerp-QPcBWazBm8FAGSoL',
    label: 'Twitch · CaseOh',
    title: 'CaseOh: Steals and swims — Waterpark Simulator',
    url: 'https://clips.twitch.tv/AuspiciousTolerantMosquitoCorgiDerp-QPcBWazBm8FAGSoL',
    width: 400,
    height: 300,
  },
  {
    provider: 'youtube',
    id: 'Lv4bCKjXNQk',
    label: 'YouTube · CNN',
    title: 'CNN: Retired generals break down Iran war strategy after week 5',
    url: 'https://www.youtube.com/watch?v=Lv4bCKjXNQk',
    width: 480,
    height: 270,
  },
  {
    provider: 'youtube',
    id: 'EbSYGcDsUzU',
    label: 'YouTube · CNN',
    title: 'CNN: Retired generals break down Iran war strategy after week 3',
    url: 'https://www.youtube.com/watch?v=EbSYGcDsUzU',
    width: 480,
    height: 270,
  },
  {
    provider: 'youtube',
    id: '62lQhjpz3LI',
    label: 'YouTube · CNN',
    title: 'CNN: Retired generals break down Iran war strategy after week 2',
    url: 'https://www.youtube.com/watch?v=62lQhjpz3LI',
    width: 480,
    height: 270,
  },
  {
    provider: 'youtube',
    id: 'Imc286vgWM8',
    label: 'YouTube Shorts · Zach King',
    title: 'Zach King: The Great Bank Heist',
    url: 'https://www.youtube.com/shorts/Imc286vgWM8',
    width: 325,
    height: 578,
  },
  {
    provider: 'youtube',
    id: 'by0Hc7KxSag',
    label: 'YouTube Shorts · Zach King',
    title: 'Zach King: Why is the TOAST always burnt?',
    url: 'https://www.youtube.com/shorts/by0Hc7KxSag',
    width: 325,
    height: 578,
  },
  {
    provider: 'youtube',
    id: 'tmnw_TnSRsA',
    label: 'YouTube Shorts · Zach King',
    title: 'Zach King: How I went Cave Diving in my Living Room',
    url: 'https://www.youtube.com/shorts/tmnw_TnSRsA',
    width: 325,
    height: 578,
  },
  {
    provider: 'youtube',
    id: 'J518n6uJwXc',
    label: 'YouTube Shorts · Zach King',
    title:
      'Zach King: What would happen if a BLACK HOLE appeared in your classroom',
    url: 'https://www.youtube.com/shorts/J518n6uJwXc',
    width: 325,
    height: 578,
  },
  {
    provider: 'twitch',
    id: 'GenerousSmellyBasenjiANELE-q85QXi2wiB2jT1Ka',
    label: 'Twitch · CaseOh',
    title: 'CaseOh: Lawdddd Have Mercy — Games + Demos',
    url: 'https://clips.twitch.tv/GenerousSmellyBasenjiANELE-q85QXi2wiB2jT1Ka',
    width: 400,
    height: 300,
  },
  {
    provider: 'twitch',
    id: 'EagerFrigidEyeballMoreCowbell-H6t-SgZo1eVJWXqq',
    label: 'Twitch · CaseOh',
    title: 'CaseOh: Case — Games + Demos',
    url: 'https://clips.twitch.tv/EagerFrigidEyeballMoreCowbell-H6t-SgZo1eVJWXqq',
    width: 400,
    height: 300,
  },
];

const videoIndices = (match) =>
  heroVideos.flatMap((video, index) => (match(video) ? [index] : []));

export const heroVideoPools = {
  youtube: videoIndices(
    (video) => video.provider === 'youtube' && video.width > video.height,
  ),
  shorts: videoIndices(
    (video) => video.provider === 'youtube' && video.height > video.width,
  ),
  twitch: videoIndices((video) => video.provider === 'twitch'),
  tiktok: videoIndices((video) => video.provider === 'tiktok'),
};

/**
 * @param {HeroVideo} video
 * @param {string} origin
 * @param {boolean} autoplay
 * @returns {string} embed URL
 */
export function heroVideoEmbed(video, origin, autoplay) {
  if (video.provider === 'tiktok') {
    // Autoplay initializes TikTok's lazy video element; mute is also sent on ready.
    return `https://www.tiktok.com/player/v1/${video.id}?autoplay=${autoplay ? '1' : '0'}&muted=1&loop=1&controls=1&description=0&music_info=0&rel=0`;
  }
  if (video.provider === 'twitch') {
    const query = new URLSearchParams({
      clip: video.id,
      parent: new URL(origin).hostname,
      autoplay: String(autoplay),
      muted: 'true',
    });
    return `https://clips.twitch.tv/embed?${query}`;
  }
  const query = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: '1',
    controls: '1',
    playsinline: '1',
    loop: '1',
    playlist: video.id,
    rel: '0',
    enablejsapi: '1',
    origin,
  });
  return `https://www.youtube.com/embed/${video.id}?${query}`;
}

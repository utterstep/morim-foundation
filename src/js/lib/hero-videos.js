// Ported from PR #3 website/lib/hero-videos.ts (plain ES module, no build step).

/**
 * @typedef {object} HeroVideo
 * @property {'tiktok' | 'twitch' | 'youtube'} provider
 * @property {string} id
 * @property {string} label
 * @property {string} title
 * @property {string} url  the source page: the provider's watch page, or the stock page a self-hosted clip came from
 * @property {string} [file]  self-hosted clip under assets/video/, played by a native <video>
 * @property {string} [poster]  still frame beside `file`
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
    id: '9071269',
    label: 'Twitch · live stream',
    title: 'Live stream: a gamer in a headset under neon light',
    url: 'https://www.pexels.com/video/man-playing-games-in-computer-9071269/',
    file: 'stream-headset-neon.mp4',
    poster: 'stream-headset-neon.webp',
    width: 640,
    height: 360,
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
    id: '9071235',
    label: 'Twitch · live stream',
    title: 'Live stream: a gamer at an esports desk',
    url: 'https://www.pexels.com/video/man-playing-games-in-computer-9071235/',
    file: 'stream-floral-shirt.mp4',
    poster: 'stream-floral-shirt.webp',
    width: 640,
    height: 360,
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
    id: '8128276',
    label: 'Twitch · live stream',
    title: 'Live stream: a gamer in blue light with a mic',
    url: 'https://www.pexels.com/video/a-woman-playing-video-games-8128276/',
    file: 'stream-blue-mic.mp4',
    poster: 'stream-blue-mic.webp',
    width: 640,
    height: 360,
  },
  {
    provider: 'twitch',
    id: '9070652',
    label: 'Twitch · live stream',
    title: 'Live stream: two players at their keyboards',
    url: 'https://www.pexels.com/video/men-playing-computer-games-9070652/',
    file: 'stream-two-players.mp4',
    poster: 'stream-two-players.webp',
    width: 640,
    height: 360,
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
 * Self-hosted clips play in a native <video> instead of a provider iframe.
 * The Twitch clip player was the heaviest embed on the page and stuttered
 * even on fast machines; a muted 640x360 H.264 file is a few hundred
 * kilobytes and decodes on the GPU. The "Twitch" cards are stock footage of
 * streamers under the Pexels licence (free for commercial use, no
 * attribution required), not clips of a real channel, so the site never
 * redistributes anyone's broadcast.
 * @param {HeroVideo} video
 * @returns {{src: string, poster: string} | null}
 */
export function heroVideoFile(video) {
  if (!video.file) return null;
  const asset = (name) => new URL(`../../assets/video/${name}`, import.meta.url).href;
  return { src: asset(video.file), poster: asset(video.poster ?? '') };
}

/**
 * @param {HeroVideo} video  a TikTok or YouTube video (self-hosted files have no embed)
 * @param {string} origin
 * @param {boolean} autoplay
 * @returns {string} embed URL
 */
export function heroVideoEmbed(video, origin, autoplay) {
  if (video.provider === 'tiktok') {
    // Autoplay initializes TikTok's lazy video element; mute is also sent on ready.
    return `https://www.tiktok.com/player/v1/${video.id}?autoplay=${autoplay ? '1' : '0'}&muted=1&loop=1&controls=1&description=0&music_info=0&rel=0`;
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

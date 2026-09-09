'use client';

import { useEffect, useRef, useState } from 'react';
import { heroVideoEmbed, type HeroVideo } from '@/lib/hero-videos';
import { startHeroVideoAutoplay } from '@/lib/hero-video-autoplay';

export function HeroVideoPlayer({
  video,
  playing,
  reduced,
  active,
  interactive = true,
}: {
  video: HeroVideo;
  playing: boolean;
  reduced: boolean;
  active: boolean;
  interactive?: boolean;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const shell = useRef<HTMLSpanElement>(null);
  const [origin, setOrigin] = useState('');
  const [scale, setScale] = useState(1);
  const [failed, setFailed] = useState(false);
  const [twitchVisible, setTwitchVisible] = useState(false);
  // Unmount remote players as soon as the page is hidden or scrolled away.
  const mounted =
    Boolean(origin) && active && (video.provider !== 'twitch' || twitchVisible);
  useEffect(() => {
    if (video.provider !== 'twitch' || !shell.current) return;
    // Clips only honor autoplay when loaded in view, not beneath the fold.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.85) setTwitchVisible(true);
        else if (!entry.isIntersecting) setTwitchVisible(false);
      },
      { threshold: [0, 0.85] },
    );
    observer.observe(shell.current);
    return () => observer.disconnect();
  }, [video.provider]);
  useEffect(() => {
    setOrigin(window.location.origin);
    const resize = () => {
      if (shell.current) setScale(shell.current.clientWidth / video.width);
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (shell.current) observer.observe(shell.current);
    return () => observer.disconnect();
  }, [video.width]);

  useEffect(() => {
    setFailed(false);
    if (!mounted || !frame.current) return;
    return startHeroVideoAutoplay(
      frame.current,
      video.provider,
      playing && !reduced,
      () => setFailed(true),
    );
  }, [mounted, playing, reduced, video.id]);

  return (
    <span
      ref={shell}
      className="hero-video-player"
      style={{ aspectRatio: `${video.width} / ${video.height}` }}
    >
      {mounted && !failed ? (
        <iframe
          ref={frame}
          title={video.title}
          tabIndex={interactive ? undefined : -1}
          src={heroVideoEmbed(video, origin, playing && !reduced)}
          width={video.width}
          height={video.height}
          style={
            video.provider === 'twitch'
              ? {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  inset: 0,
                }
              : { transform: `scale(${scale})` }
          }
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="hero-video-status">
          {failed ? 'Video unavailable' : null}
        </span>
      )}
    </span>
  );
}

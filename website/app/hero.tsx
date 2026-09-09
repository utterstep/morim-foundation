'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import {
  notificationLabel,
  notificationDuration,
} from '@/lib/hero-notification';
import { attentionStatement } from '@/lib/hero-content';
import { startHeroPoof } from '@/lib/hero-poof';
import {
  heroCollageProgress,
  heroCollageStayProgress,
} from '@/lib/hero-collage';
import { poof, poofElement, clearPoofs, POOF_DURATION_MS } from '@/lib/poof';
import { heroVideos } from '@/lib/hero-videos';
import { HeroVideoPlayer } from './hero-video';
import {
  createHeroStoryFloaters,
  heroCompositionSlots,
  HERO_DISMISS_MS,
  replaceHeroFloater,
  type HeroFloater,
} from '@/lib/hero-floating';
import {
  advanceHeroApps,
  heroApps,
  initialHeroDeck,
  dragOffset,
  isDragGesture,
  heroVisibleSlots,
} from '@/lib/hero-interaction';

export function Hero({
  variant = 'original',
}: {
  variant?: 'original' | 'context';
}) {
  const hero = useRef<HTMLElement>(null);
  const but = useRef<HTMLSpanElement>(null);
  const context = useRef<HTMLDivElement>(null);
  const [floaters, setFloaters] = useState<HeroFloater[]>([]);
  const [mediaMode, setMediaMode] = useState<'static' | 'scroll' | 'stay'>(
    'static',
  );
  const [collageProgress, setCollageProgress] = useState(0);
  const scrollCollage = variant === 'original' && mediaMode !== 'static';
  const [deck, setDeck] = useState(() =>
    variant === 'original'
      ? {
          ...initialHeroDeck,
          items: initialHeroDeck.items.map((item, slot) =>
            slot === 0
              ? { ...item, app: 2 }
              : slot === 2
                ? { ...item, app: 0 }
                : item,
          ),
        }
      : initialHeroDeck,
  );
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [compact, setCompact] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dismissing, setDismissing] = useState<number | null>(null);
  const [scrollDismissed, setScrollDismissed] = useState(false);
  const nextAutoSlot = useRef(0);
  const autoDismissing = useRef(false);
  const playing = visible && !reduced && !scrollDismissed;
  const looping = playing;
  const fewerApps = compact || variant === 'original';

  useEffect(() => {
    if (variant === 'original') {
      let lastVideoIds: string[] = [];
      try {
        const stored = JSON.parse(
          sessionStorage.getItem('morim-hero-last-videos') ?? '[]',
        );
        if (Array.isArray(stored))
          lastVideoIds = stored.filter((id) => typeof id === 'string');
      } catch {
        /* Storage is optional; fresh random selection still works. */
      }
      setFloaters(createHeroStoryFloaters(Math.random, lastVideoIds));
    }
    return clearPoofs;
  }, [variant]);

  useEffect(() => {
    if (variant !== 'original' || !floaters.length) return;
    try {
      sessionStorage.setItem(
        'morim-hero-last-videos',
        JSON.stringify(
          floaters
            .filter((item) => item.kind === 'media')
            .map((item) => heroVideos[item.preview].id),
        ),
      );
    } catch {
      /* Browsers may disable session storage. */
    }
  }, [floaters, variant]);

  useLayoutEffect(() => {
    const section = hero.current;
    const anchor = but.current;
    const intro = document.querySelector('[data-hero-story-end]');
    const collage = section?.querySelector('.hero-accents');
    if (!scrollCollage || !section || !anchor || !intro || !collage) return;
    let frame = 0;
    let disposed = false;
    const update = () => {
      frame = 0;
      if (disposed) return;
      const word = anchor.getBoundingClientRect();
      section.style.setProperty(
        '--but-center-y',
        `${word.top - section.getBoundingClientRect().top + word.height / 2}px`,
      );
      if (mediaMode === 'stay') {
        const top = collage.getBoundingClientRect().top;
        const height = window.innerHeight;
        const scroll = window.scrollY;
        setCollageProgress((previous) =>
          heroCollageStayProgress(previous, top, height, scroll),
        );
      } else
        setCollageProgress(
          heroCollageProgress(
            intro.getBoundingClientRect().top,
            window.innerHeight,
            window.scrollY,
          ),
        );
    };
    const schedule = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(section);
    observer.observe(anchor);
    observer.observe(intro);
    observer.observe(collage);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    void document.fonts.ready.then(schedule);
    update();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      section.style.removeProperty('--but-center-y');
    };
  }, [scrollCollage, compact, mediaMode]);

  useEffect(() => {
    // The main collage is part of the page flow, not a scroll-triggered overlay.
    if (variant === 'original') return;
    if (hero.current)
      return startHeroPoof(hero.current, setScrollDismissed, poof, clearPoofs);
  }, [compact, variant]);

  useLayoutEffect(() => {
    const element = hero.current;
    if (!element) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const screen = window.matchMedia('(max-width: 700px)');
    let inView = !('IntersectionObserver' in window);
    const update = () => {
      setReduced(motion.matches);
      setCompact(screen.matches);
      setVisible(inView && !document.hidden);
    };
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            update();
          })
        : null;
    observer?.observe(element);
    update();
    motion.addEventListener('change', update);
    screen.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer?.disconnect();
      motion.removeEventListener('change', update);
      screen.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  useEffect(() => {
    if (
      variant === 'original' ||
      !looping ||
      focused ||
      dragging ||
      dismissing !== null
    )
      return;
    const timer = setTimeout(
      () => {
        if (document.hidden) return;
        const slots = heroVisibleSlots(fewerApps);
        autoDismissing.current = true;
        setDismissing(slots[nextAutoSlot.current % slots.length]);
        nextAutoSlot.current++;
      },
      compact ? 2200 : 1600,
    );
    return () => clearTimeout(timer);
  }, [
    variant,
    looping,
    focused,
    dragging,
    dismissing,
    deck,
    compact,
    fewerApps,
  ]);

  useEffect(() => {
    if (dismissing === null) return;
    // Don't introduce a new icon after scrolling has dismissed the deck.
    if (autoDismissing.current && (!looping || focused || dragging)) {
      autoDismissing.current = false;
      setDismissing(null);
      return;
    }
    const timer = setTimeout(
      () => {
        autoDismissing.current = false;
        if (variant === 'original')
          setFloaters((current) =>
            replaceHeroFloater(current, dismissing).map((item, slot) =>
              slot === dismissing ? { ...item, duration: 700, delay: 0 } : item,
            ),
          );
        else
          setDeck((current) => advanceHeroApps(current, dismissing, fewerApps));
        setDismissing(null);
      },
      reduced ? 0 : variant === 'original' ? POOF_DURATION_MS : 180,
    );
    return () => clearTimeout(timer);
  }, [dismissing, reduced, fewerApps, looping, focused, dragging, variant]);

  const accents = (
    <span
      className="hero-accents"
      role="group"
      aria-label="App distractions"
      onFocus={(event) => setFocused(event.target.matches(':focus-visible'))}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      {(variant === 'original' ? floaters : deck.items).map((item, slot) => (
        <AppItem
          key={slot}
          item={item}
          slot={slot}
          boundary={variant === 'context' ? context : hero}
          playing={playing}
          mediaActive={
            visible &&
            !scrollDismissed &&
            dismissing !== slot &&
            (!scrollCollage || collageProgress > 0.7)
          }
          scrollReveal={scrollCollage ? collageProgress : undefined}
          reduced={reduced}
          compact={compact}
          cycling={false}
          floating={variant === 'original' ? floaters[slot] : undefined}
          dismissing={dismissing === slot}
          onDrag={setDragging}
          onCycle={() => {
            if (
              variant !== 'original' &&
              looping &&
              !focused &&
              !dragging &&
              dismissing !== slot
            ) {
              setFloaters((current) => replaceHeroFloater(current, slot));
            }
          }}
          onDismiss={() => {
            if (dismissing === null) {
              if (variant === 'original' && !reduced) {
                const face = hero.current?.querySelector<HTMLElement>(
                  `.hero-app-item[data-slot="${slot}"] .hero-app-face`,
                );
                if (face) poofElement(face, { hide: false });
              }
              autoDismissing.current = false;
              setDismissing(slot);
            }
          }}
        />
      ))}
    </span>
  );

  return (
    <>
      {variant === 'original' && (
        <div
          className="hero-variation-switch"
          role="group"
          aria-label="Hero preview variation"
        >
          <span>Hero test</span>
          {(['static', 'scroll', 'stay'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={mediaMode === mode}
              onClick={() => {
                if (mode === mediaMode) return;
                setCollageProgress(0);
                setMediaMode(mode);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
            >
              {mode === 'static'
                ? 'Static'
                : mode === 'scroll'
                  ? 'On scroll'
                  : 'Reveal & stay'}
            </button>
          ))}
        </div>
      )}
      <section
        ref={hero}
        className={
          variant === 'context'
            ? 'hero hero-context-layout'
            : 'hero hero-editorial'
        }
        data-playing={playing}
        data-looping={looping && !focused && !dragging}
        data-scroll-dismissed={scrollDismissed}
        data-media-layout={variant === 'original' ? mediaMode : undefined}
        aria-labelledby="hero-title"
      >
        {compact ? (
          <div className="hero-mobile-content" ref={context}>
            <h1
              id="hero-title"
              aria-label="one good teacher can shape hundreds of children, but..."
            >
              one good
              <br />
              teacher can
              <br />
              shape hundreds
              <br />
              of children,
              <br />
              <span className="hero-line" ref={but}>
                but...
              </span>
            </h1>
            {variant === 'context' && (
              <div className="hero-mobile-deck">{accents}</div>
            )}
            {variant === 'context' && (
              <p className="hero-context-copy">{attentionStatement}</p>
            )}
          </div>
        ) : variant === 'context' ? (
          <>
            <h1
              id="hero-title"
              aria-label="one good teacher can shape hundreds of children, but..."
            >
              one good
              <br />
              teacher can
              <br />
              shape hundreds
              <br />
              of children,
              <br />
              <span className="hero-line" ref={but}>
                but...
              </span>
            </h1>
            <div className="hero-context" ref={context}>
              <p className="hero-context-copy">{attentionStatement}</p>
              {accents}
            </div>
          </>
        ) : (
          <h1
            id="hero-title"
            aria-label="one good teacher can shape hundreds of children, but..."
          >
            one good
            <br />
            teacher can
            <br />
            shape hundreds
            <br />
            of children,
            <br />
            <span className="hero-line" ref={but}>
              but...
            </span>
          </h1>
        )}
        {variant === 'original' && accents}
        <span id="hero-app-help" className="sr-only">
          {compact
            ? 'Tap or press Enter to dismiss an item and show the next one. Swipe vertically to keep reading.'
            : 'Drag an app to move it. Click or press Enter to dismiss it and show the next app.'}
        </span>
      </section>
    </>
  );
}

type AppItemProps = {
  item: { app: number; appearance: number };
  slot: number;
  boundary: React.RefObject<HTMLElement | null>;
  playing: boolean;
  mediaActive: boolean;
  reduced: boolean;
  compact: boolean;
  cycling: boolean;
  floating?: HeroFloater;
  scrollReveal?: number;
  dismissing: boolean;
  onDrag: (dragging: boolean) => void;
  onCycle: () => void;
  onDismiss: () => void;
};

function AppItem({
  item,
  slot,
  boundary,
  playing,
  mediaActive,
  reduced,
  compact,
  cycling,
  floating,
  scrollReveal,
  dismissing,
  onDrag,
  onCycle,
  onDismiss,
}: AppItemProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    start: { x: number; y: number };
    limits: { minX: number; maxX: number; minY: number; maxY: number };
  } | null>(null);
  const suppressClick = useRef(false);
  const [videoArrived, setVideoArrived] = useState(false);
  const app = heroApps[item.app];
  const composition =
    floating?.compositionSlot === undefined
      ? undefined
      : heroCompositionSlots[floating.compositionSlot];
  const hasNotification = item.appearance % 3 !== 0;
  const preview = floating?.preview ?? item.appearance % 2;
  const kind =
    floating?.kind ??
    (cycling && item.appearance >= 8 && item.appearance % 3 === 2
      ? 'media'
      : slot === 6
        ? compact && preview
          ? 'message'
          : 'media'
        : slot === 7
          ? 'message'
          : 'icon');

  useEffect(() => {
    setVideoArrived(false);
    if (kind !== 'media' || !mediaActive) return;
    if (reduced || floating) {
      setVideoArrived(true);
      return;
    }
    // Don't initialize autoplay while the card is still hidden by its entrance.
    const timer = setTimeout(() => setVideoArrived(true), 0);
    return () => clearTimeout(timer);
  }, [
    kind,
    mediaActive,
    reduced,
    item.appearance,
    floating?.delay,
    floating?.duration,
  ]);

  useLayoutEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [item.appearance]);

  const begin = (event: PointerEvent<HTMLElement>) => {
    if (compact && event.pointerType === 'touch') {
      suppressClick.current = false;
      return;
    }
    if (!event.isPrimary || event.button !== 0 || dismissing) return;
    const container = boundary.current?.getBoundingClientRect();
    const rect = event.currentTarget.getBoundingClientRect();
    if (!container) return;
    suppressClick.current = false;
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: offset,
      limits: {
        minX: offset.x + container.left + 16 - rect.left,
        maxX: offset.x + container.right - 16 - rect.right,
        minY: offset.y + container.top + 16 - rect.top,
        maxY: offset.y + container.bottom + 12 - rect.bottom,
      },
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    onDrag(true);
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x,
      dy = event.clientY - current.y;
    if (!suppressClick.current && !isDragGesture(dx, dy)) return;
    suppressClick.current = true;
    setDragging(true);
    setOffset(dragOffset(current.start, { x: dx, y: dy }, current.limits));
  };
  const end = (event: PointerEvent<HTMLElement>, cancelled = false) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    if (cancelled) {
      suppressClick.current = true;
      setOffset(current.start);
    }
    setDragging(false);
    onDrag(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  // Clamp a moved icon back inside the hero if its container is resized.
  useEffect(() => {
    const reset = () => {
      if (!gesture.current) setOffset({ x: 0, y: 0 });
    };
    window.addEventListener('resize', reset);
    return () => window.removeEventListener('resize', reset);
  }, []);

  const video =
    kind === 'media' ? heroVideos[preview % heroVideos.length] : null;
  const Tag = video ? 'div' : 'button';
  const reveal =
    reduced && scrollReveal !== undefined
      ? Number(scrollReveal > 0)
      : scrollReveal;
  return (
    <Tag
      type={video ? undefined : 'button'}
      role={video ? 'group' : undefined}
      className="hero-app-item"
      data-slot={slot}
      data-kind={kind}
      data-provider={video?.provider}
      data-format={
        video
          ? video.height > video.width
            ? 'portrait'
            : 'landscape'
          : undefined
      }
      data-motion={floating?.motion}
      data-story-visible={reveal === undefined || reveal > 0}
      inert={reveal !== undefined && reveal === 0}
      data-dragging={dragging}
      data-dismissing={dismissing}
      aria-label={
        video
          ? video.title
          : kind === 'icon'
            ? `Dismiss ${app.name} and show the next app`
            : `Dismiss ${kind === 'media' ? 'social-video' : 'message'} preview and show the next one`
      }
      aria-describedby="hero-app-help"
      style={
        {
          '--drag-x': `${offset.x}px`,
          '--drag-y': `${offset.y}px`,
          ...(reveal !== undefined
            ? {
                '--scroll-reveal': reveal,
                '--story-opacity': reveal,
                '--story-blur': reduced ? '0px' : `${(1 - reveal) * 8}px`,
              }
            : {}),
          ...(floating
            ? {
                '--float-x': floating.x,
                '--float-y': floating.y,
                '--app-tilt': `${floating.tilt}deg`,
                '--float-drift-x': `${floating.driftX}px`,
                '--float-drift-y': `${floating.driftY}px`,
                '--float-rock': `${floating.rock}deg`,
                '--float-dismiss-duration': `${HERO_DISMISS_MS}ms`,
                '--float-duration': `${floating.duration}ms`,
                '--float-delay': `${floating.delay}ms`,
              }
            : {}),
          ...(composition
            ? {
                '--float-mobile-x': floating?.mobileX ?? composition.mobileX,
                '--float-mobile-y': floating?.mobileY ?? composition.mobileY,
                '--composition-layer': composition.layer,
              }
            : {}),
          '--entry-delay':
            item.appearance < 8
              ? `${[0, 160, 460, 610, 920, 1050, 300, 780][slot]}ms`
              : '0ms',
        } as CSSProperties
      }
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={(event) => end(event)}
      onPointerCancel={(event) => end(event, true)}
      onLostPointerCapture={(event) => end(event, true)}
      onClick={(event) => {
        if (video && !floating) return;
        if (suppressClick.current && event.detail !== 0) {
          event.preventDefault();
          return;
        }
        onDismiss();
      }}
    >
      <span
        className="hero-app-bob"
        key={item.appearance}
        data-initial={item.appearance < 8}
        onAnimationEnd={(event) => {
          if (
            event.target === event.currentTarget &&
            event.animationName === 'hero-float-cycle'
          )
            onCycle();
        }}
      >
        <span
          className="hero-app-face"
          key={item.appearance}
          data-initial={item.appearance < 8}
        >
          {video ? (
            <>
              <button
                type="button"
                className={
                  video.provider === 'twitch'
                    ? 'hero-twitch-dismiss'
                    : floating
                      ? 'hero-video-poof-target'
                      : 'hero-video-dismiss sr-only'
                }
                aria-label={`Dismiss ${video.label} and show the next element`}
                onPointerDown={(event) => {
                  if (!floating) event.stopPropagation();
                }}
                onClick={(event) => {
                  // Main-page clicks bubble through the shared drag/click guard.
                  if (floating) return;
                  event.stopPropagation();
                  onDismiss();
                }}
              >
                {video.provider === 'twitch' || !floating ? '×' : null}
              </button>
              <span className="hero-live-media">
                <HeroVideoPlayer
                  video={video}
                  playing={playing}
                  reduced={reduced}
                  active={
                    mediaActive &&
                    videoArrived &&
                    (video.provider !== 'twitch' ||
                      reveal === undefined ||
                      reveal === 1)
                  }
                  interactive={!floating || video.provider === 'twitch'}
                />
              </span>
            </>
          ) : kind === 'message' ? (
            <span className="hero-message-preview">
              <img
                src="/assets/hero-app-messages.png"
                alt=""
                width="32"
                height="32"
                draggable={false}
              />
              <span>
                <span className="hero-message-heading">
                  Group chat <span>now</span>
                </span>
                <span className="hero-message-copy">
                  {preview
                    ? 'wait, you need to see this'
                    : 'someone sent another video'}
                </span>
              </span>
            </span>
          ) : (
            <span className="hero-app-icon-mask">
              <img
                src={app.src}
                alt=""
                width="73"
                height="73"
                draggable={false}
              />
            </span>
          )}
          {kind === 'icon' && hasNotification && (
            <NotificationBadge
              key={item.appearance}
              target={app.notifications}
              playing={playing}
              reduced={reduced}
            />
          )}
        </span>
      </span>
    </Tag>
  );
}

function NotificationBadge({
  target,
  playing,
  reduced,
}: {
  target: number | '99+';
  playing: boolean;
  reduced: boolean;
}) {
  const elapsed = useRef(0);
  const [label, setLabel] = useState('0');
  useEffect(() => {
    if (
      target !== '99+' ||
      !playing ||
      reduced ||
      elapsed.current >= notificationDuration
    )
      return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      elapsed.current += now - previous;
      previous = now;
      setLabel(notificationLabel(elapsed.current));
      if (elapsed.current < notificationDuration)
        frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, playing, reduced]);
  const text = reduced || target !== '99+' ? String(target) : label;
  return (
    <span
      className="hero-notification"
      aria-hidden="true"
      data-complete={text === '99+'}
    >
      {text}
    </span>
  );
}

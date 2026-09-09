// Ported from PR #3 website/lib/poof.ts (plain ES module, no build step).
// The macOS "poof" — the five-frame smoke sprite you get dragging an item off
// the Dock. Reused from the supplied animation for the hero's scroll dismissal.
// Faithful to the reference: hard frame swaps (no cross-fade), the
// cloud stays put (no rising smoke), one fixed compact size, and completely
// silent. Frame rate is a touch slower than the original 66ms, by preference.
//
// The element vanishes the instant the cloud starts, exactly as in the real
// thing — the smoke plays over the space it used to occupy, on a fixed
// full-viewport canvas that outlives the element's unmount.

/** Normalized blob layouts: x, y, r all in [-1, 1] of the cloud's half-size.
 *  `solid` frames get a second flat-white pass over blob interiors so shading
 *  survives only in the crevices, like the hand-drawn art.
 *  @typedef {{ alpha: number, solid?: boolean, blobs: [number, number, number][] }} PoofFrame */

/** @type {PoofFrame[]} */
const FRAMES = [
  // 1 — compact solid cloud, lumpy silhouette
  {
    alpha: 1.0,
    solid: true,
    blobs: [
      [0.0, -0.4, 0.26],
      [-0.26, -0.34, 0.22],
      [0.26, -0.32, 0.23],
      [-0.44, -0.12, 0.22],
      [0.44, -0.1, 0.22],
      [-0.46, 0.16, 0.2],
      [0.46, 0.18, 0.19],
      [-0.28, 0.36, 0.22],
      [0.26, 0.38, 0.21],
      [0.0, 0.44, 0.22],
      [-0.1, -0.48, 0.16],
      [0.14, -0.47, 0.14],
      [0.0, 0.0, 0.4],
      [-0.2, 0.05, 0.3],
      [0.2, -0.02, 0.3],
    ],
  },
  // 2 — slightly expanded, bumps more pronounced
  {
    alpha: 1.0,
    solid: true,
    blobs: [
      [0.02, -0.46, 0.26],
      [-0.32, -0.38, 0.22],
      [0.32, -0.36, 0.22],
      [-0.52, -0.1, 0.22],
      [0.52, -0.08, 0.21],
      [-0.5, 0.22, 0.2],
      [0.5, 0.24, 0.19],
      [-0.28, 0.44, 0.22],
      [0.28, 0.44, 0.21],
      [0.0, 0.52, 0.2],
      [-0.14, -0.56, 0.14],
      [0.18, -0.54, 0.13],
      [0.0, 0.0, 0.4],
      [-0.22, 0.06, 0.3],
      [0.22, 0.0, 0.3],
    ],
  },
  // 3 — splits into chunky "popcorn" clusters with narrow gaps
  {
    alpha: 1.0,
    solid: true,
    blobs: [
      [-0.34, -0.34, 0.2],
      [-0.18, -0.46, 0.16],
      [-0.5, -0.24, 0.15],
      [-0.36, -0.16, 0.14],
      [-0.24, -0.3, 0.13],
      [0.36, -0.36, 0.18],
      [0.2, -0.48, 0.15],
      [0.5, -0.22, 0.15],
      [0.34, -0.18, 0.13],
      [0.48, -0.42, 0.11],
      [-0.38, 0.32, 0.18],
      [-0.22, 0.46, 0.15],
      [-0.52, 0.18, 0.13],
      [-0.3, 0.2, 0.12],
      [-0.44, 0.46, 0.11],
      [0.38, 0.34, 0.18],
      [0.24, 0.48, 0.14],
      [0.52, 0.2, 0.13],
      [0.32, 0.18, 0.12],
      [0.5, 0.44, 0.1],
      [0.0, -0.06, 0.11],
      [-0.04, 0.12, 0.09],
      [0.1, -0.22, 0.08],
      [-0.14, -0.02, 0.07],
    ],
  },
  // 4 — dense irregular cluster of medium blobs
  {
    alpha: 0.95,
    solid: true,
    blobs: [
      [-0.42, -0.38, 0.14],
      [-0.24, -0.48, 0.1],
      [-0.52, -0.2, 0.09],
      [-0.1, -0.36, 0.12],
      [0.14, -0.46, 0.13],
      [0.3, -0.32, 0.09],
      [0.46, -0.42, 0.08],
      [0.52, -0.16, 0.11],
      [0.62, 0.06, 0.07],
      [0.48, 0.26, 0.12],
      [0.3, 0.44, 0.09],
      [0.1, 0.54, 0.11],
      [-0.14, 0.46, 0.09],
      [-0.36, 0.52, 0.12],
      [-0.52, 0.3, 0.09],
      [-0.6, 0.06, 0.08],
      [-0.26, 0.16, 0.09],
      [-0.04, 0.06, 0.08],
      [0.22, 0.08, 0.1],
      [0.02, -0.14, 0.07],
      [-0.18, -0.16, 0.06],
      [0.06, 0.3, 0.07],
    ],
  },
  // 5 — small blobs and specks thinning out
  {
    alpha: 0.9,
    blobs: [
      [-0.44, -0.42, 0.075],
      [-0.28, -0.52, 0.05],
      [-0.08, -0.42, 0.065],
      [0.18, -0.5, 0.08],
      [0.34, -0.36, 0.045],
      [0.52, -0.22, 0.055],
      [0.58, 0.08, 0.045],
      [0.44, 0.32, 0.065],
      [0.2, 0.5, 0.05],
      [-0.06, 0.56, 0.06],
      [-0.32, 0.48, 0.07],
      [-0.52, 0.26, 0.045],
      [-0.56, -0.04, 0.05],
      [-0.22, 0.12, 0.04],
      [0.06, -0.16, 0.045],
      [0.26, 0.12, 0.035],
      [-0.02, 0.28, 0.035],
      [-0.36, -0.2, 0.035],
    ],
  },
  // 6 — last few tiny specks before it is gone
  {
    alpha: 0.6,
    blobs: [
      [-0.48, -0.46, 0.04],
      [-0.1, -0.52, 0.03],
      [0.28, -0.44, 0.04],
      [0.54, -0.1, 0.03],
      [0.4, 0.36, 0.035],
      [0.04, 0.52, 0.03],
      [-0.38, 0.44, 0.035],
      [-0.54, 0.1, 0.028],
      [0.1, -0.2, 0.025],
      [-0.08, 0.22, 0.022],
    ],
  },
];

const FRAME_MS = 80; // a touch slower than the original's 66ms, by preference
/** Total run time of one cloud — callers can time a follow-up against it. */
export const POOF_DURATION_MS = FRAME_MS * FRAMES.length;
const SPRITE_PX = 256; // offscreen render resolution
/** One size for every poof, whatever it is dismissing — the real thing is
 *  always a compact puff, and scaling it to a full-width card produced a smoke
 *  plume the size of the column. */
export const POOF_SIZE_PX = 96;
/** Distance from an element's top to its header row's centre (card padding +
 *  half an avatar), used by the "top" anchor. */
const POOF_HEADER_OFFSET_PX = 30;

/** @typedef {{ x: number, y: number, size: number, born: number }} Puff */

let canvas = null;
let ctx = null;
let sprites = null;
/** @type {Puff[]} */
const active = [];
let running = false;
let animationFrame;

/** Release the viewport overlay when done or when the hero unmounts. */
export function clearPoofs() {
  if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
  animationFrame = undefined;
  active.length = 0;
  running = false;
  canvas?.remove();
  canvas = null;
  ctx = null;
  if (typeof window !== 'undefined')
    window.removeEventListener('resize', resize);
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

/** Pre-render each frame once: every blob is a white puff with a soft rim, so
 *  overlaps read as the cartoon crevice shading of the original artwork. */
function buildSprites() {
  const built = [];
  for (const frame of FRAMES) {
    const c = document.createElement('canvas');
    c.width = c.height = SPRITE_PX;
    const g = c.getContext('2d');
    if (!g) return null; // jsdom and friends — callers degrade to no cloud
    const half = SPRITE_PX / 2;
    for (const [nx, ny, nr] of frame.blobs) {
      const bx = half + nx * half;
      const by = half + ny * half;
      const br = nr * half;
      const grad = g.createRadialGradient(bx, by, br * 0.2, bx, by, br);
      grad.addColorStop(0.0, '#fdfdfe');
      grad.addColorStop(0.72, '#f7f7f8');
      grad.addColorStop(0.92, '#e2e2e5');
      grad.addColorStop(1.0, '#c6c6cb');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(bx, by, br, 0, Math.PI * 2);
      g.fill();
    }
    if (frame.solid) {
      g.fillStyle = '#fafafb';
      for (const [nx, ny, nr] of frame.blobs) {
        g.beginPath();
        g.arc(
          half + nx * half,
          half + ny * half,
          nr * half * 0.8,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
    }
    built.push(c);
  }
  return built;
}

function ensureCanvas() {
  if (typeof document === 'undefined') return false;
  if (ctx && canvas?.isConnected) return true;
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '9999',
  });
  const c2d = canvas.getContext('2d');
  if (!c2d) return false;
  ctx = c2d;
  document.body.appendChild(canvas);
  resize();
  window.addEventListener('resize', resize);
  return true;
}

function viewport() {
  // innerWidth/Height can read 0 in embedded or throttled panes; the document
  // element is the reliable fallback, and a 0x0 canvas draws nothing at all.
  return {
    w: window.innerWidth || document.documentElement.clientWidth || 0,
    h: window.innerHeight || document.documentElement.clientHeight || 0,
  };
}

function resize() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { w, h } = viewport();
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function tick(now) {
  animationFrame = undefined;
  if (!ctx || !sprites) return;
  const { w, h } = viewport();
  ctx.clearRect(0, 0, w, h);
  for (let i = active.length - 1; i >= 0; i--) {
    const p = active[i];
    const age = now - p.born;
    if (age >= POOF_DURATION_MS) {
      active.splice(i, 1);
      continue;
    }
    // rAF timestamps can land a hair before the spawn time, so clamp.
    const idx = Math.max(
      0,
      Math.min(FRAMES.length - 1, Math.floor(age / FRAME_MS)),
    );
    const s = p.size * (1 + 0.12 * Math.max(0, age / POOF_DURATION_MS));
    ctx.globalAlpha = FRAMES[idx].alpha;
    ctx.drawImage(sprites[idx], p.x - s / 2, p.y - s / 2, s, s);
    ctx.globalAlpha = 1;
  }
  if (active.length) animationFrame = requestAnimationFrame(tick);
  else clearPoofs();
}

/** Play a cloud at viewport coordinates. `size` is the cloud's diameter.
 *  Returns how long the cloud will run, or 0 when nothing played (reduced
 *  motion, no canvas) — so callers can pace what follows without assuming the
 *  animation happened.
 *  @param {number} x
 *  @param {number} y
 *  @param {number} [size]
 *  @returns {number} duration in ms */
export function poof(x, y, size = POOF_SIZE_PX) {
  if (prefersReducedMotion() || !ensureCanvas()) return 0;
  sprites ??= buildSprites();
  if (!sprites) {
    clearPoofs();
    return 0;
  }
  // Re-measure per cloud: the canvas may have been sized while the pane was
  // hidden (0x0), and a stale backing store would swallow the animation.
  resize();
  active.push({ x, y, size, born: performance.now() });
  if (!running) {
    running = true;
    animationFrame = requestAnimationFrame(tick);
  }
  return POOF_DURATION_MS;
}

/** Poof an element away: it vanishes instantly (as in the real thing) and the
 *  cloud plays over the spot where it was. Safe to call on an element that is
 *  about to unmount — the canvas outlives it.
 *  @param {HTMLElement} el
 *  @param {{ anchor?: 'center' | 'top', hide?: boolean }} [options]
 *  @returns {number} duration in ms */
export function poofElement(
  el,
  {
    anchor = 'center',
    hide = true,
  } = {},
) {
  const rect = el.getBoundingClientRect();
  // `hide: false` hands the vanish back to the CALLER.
  //
  // Hiding instantly is right when the thing is gone the moment you press —
  // but a surface that wants the cloud and the departure to read as one event
  // needs to fade the element ITSELF under the cloud, and it cannot do that if
  // this already made it invisible (owner, 2026-08-06). The rect is captured
  // first either way, so the cloud lands in the right place regardless.
  //
  // `visibility` is a transitionable property: an element (or a descendant)
  // carrying `transition-all` will ANIMATE the change and linger for the
  // duration — a ghost of the thing that was supposed to vanish instantly.
  if (hide) {
    el.style.transition = 'none';
    el.style.visibility = 'hidden';
  }
  // "top" puts the cloud over the element's header row rather than the middle
  // of its box — on a tall card, a centred puff reads as unrelated to the
  // thing that just vanished.
  const y =
    anchor === 'top'
      ? rect.top + Math.min(rect.height / 2, POOF_HEADER_OFFSET_PX)
      : rect.top + rect.height / 2;
  return poof(rect.left + rect.width / 2, y, POOF_SIZE_PX);
}

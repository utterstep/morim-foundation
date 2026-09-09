export const heroApps = [
  { name: 'ChatGPT', src: '/assets/hero-app-chatgpt.png', notifications: 2 },
  {
    name: 'Messages',
    src: '/assets/hero-app-messages.png',
    notifications: '99+',
  },
  {
    name: 'Instagram',
    src: '/assets/hero-app-instagram.png',
    notifications: 12,
  },
  { name: 'TikTok', src: '/assets/hero-app-tiktok.png', notifications: 8 },
  { name: 'Twitch', src: '/assets/hero-app-twitch.png', notifications: 3 },
  { name: 'Fortnite', src: '/assets/hero-app-fortnite.png', notifications: 1 },
  { name: 'YouTube', src: '/assets/hero-app-youtube.png', notifications: 5 },
] as const;

export type HeroDeck = {
  items: { app: number; appearance: number }[];
  next: number;
};
export const initialHeroDeck: HeroDeck = {
  items: [
    { app: 0, appearance: 0 },
    { app: 1, appearance: 1 },
    { app: 2, appearance: 2 },
    { app: 4, appearance: 3 },
    { app: 5, appearance: 4 },
    { app: 6, appearance: 5 },
    { app: 3, appearance: 6 },
    { app: 1, appearance: 7 },
  ],
  next: 8,
};

export const heroVisibleSlots = (compact: boolean) =>
  compact ? [0, 1, 6] : [0, 1, 2, 3, 4, 5, 6, 7];

export function advanceHeroApps(
  deck: HeroDeck,
  slot: number,
  compact = false,
): HeroDeck {
  if (!deck.items[slot]) return deck;
  // Media and message previews occupy dedicated slots, independent of the icon pool.
  if (slot >= 6) {
    const appearance =
      deck.next + (deck.next % 2 === deck.items[slot].appearance % 2 ? 1 : 0);
    return {
      items: deck.items.map((item, index) =>
        index === slot ? { ...item, appearance } : item,
      ),
      next: appearance + 1,
    };
  }
  if (compact) {
    // Hidden desktop slots must not lock apps out of the mobile rotation.
    const visible = new Set([deck.items[0].app, deck.items[1].app]);
    let next = deck.next;
    while (visible.has(next % heroApps.length)) next++;
    const app = next % heroApps.length;
    const previous = deck.items[slot].app;
    return {
      items: deck.items.map((item, index) =>
        index === slot
          ? { app, appearance: next }
          : index < 6 && item.app === app
            ? { ...item, app: previous }
            : item,
      ),
      next: next + 1,
    };
  }
  const occupied = new Set(deck.items.slice(0, 6).map((item) => item.app));
  let next = deck.next;
  while (occupied.has(next % heroApps.length)) next++;
  return {
    items: deck.items.map((item, index) =>
      index === slot ? { app: next % heroApps.length, appearance: next } : item,
    ),
    next: next + 1,
  };
}

export const isDragGesture = (x: number, y: number) => Math.hypot(x, y) > 6;

export function dragOffset(
  start: { x: number; y: number },
  delta: { x: number; y: number },
  limits: { minX: number; maxX: number; minY: number; maxY: number },
) {
  return {
    x: Math.max(limits.minX, Math.min(limits.maxX, start.x + delta.x)),
    y: Math.max(limits.minY, Math.min(limits.maxY, start.y + delta.y)),
  };
}

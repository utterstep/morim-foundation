// Let the card land before its notification badge starts filling up.
export const notificationDuration = 2250;
export function notificationLabel(elapsed: number): string {
  const progress = Math.min(1, Math.max(0, (elapsed - 450) / 1800));
  if (progress === 1) return '99+';
  return String(Math.floor(99 * (1 - Math.pow(1 - progress, 2))));
}

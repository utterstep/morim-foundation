// Pointer drag for one hero item, ported from `begin`/`move`/`end` and the
// click guard in PR #3 website/app/hero.tsx (lines 528-584, 663-671).

import { dragOffset, isDragGesture } from '../lib/hero-apps.js';

/**
 * @param {HTMLElement} el  the `.hero-app-item`
 * @param {{
 *   boundary: () => HTMLElement,
 *   isCompact: () => boolean,
 *   isDismissing: () => boolean,
 *   onDragChange: (dragging: boolean) => void,
 *   onActivate: () => void,
 * }} hooks
 * @returns {{resetOffset: () => void, inGesture: () => boolean, destroy: () => void}}
 */
export function attachDrag(el, hooks) {
  let offset = { x: 0, y: 0 };
  let gesture = null;
  let suppressClick = false;

  const setOffset = (next) => {
    offset = next;
    el.style.setProperty('--drag-x', `${offset.x}px`);
    el.style.setProperty('--drag-y', `${offset.y}px`);
  };
  const setDragging = (dragging) => {
    el.dataset.dragging = String(dragging);
  };

  const begin = (event) => {
    if (hooks.isCompact() && event.pointerType === 'touch') {
      suppressClick = false;
      return;
    }
    if (!event.isPrimary || event.button !== 0 || hooks.isDismissing()) return;
    const container = hooks.boundary().getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    suppressClick = false;
    gesture = {
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
    el.setPointerCapture(event.pointerId);
    hooks.onDragChange(true);
  };
  const move = (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!suppressClick && !isDragGesture(dx, dy)) return;
    suppressClick = true;
    setDragging(true);
    setOffset(dragOffset(gesture.start, { x: dx, y: dy }, gesture.limits));
  };
  const end = (event, cancelled = false) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const current = gesture;
    gesture = null;
    if (cancelled) {
      suppressClick = true;
      setOffset(current.start);
    }
    setDragging(false);
    hooks.onDragChange(false);
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
  };
  const cancel = (event) => end(event, true);
  const click = (event) => {
    // Main-page clicks bubble through the shared drag/click guard.
    if (suppressClick && event.detail !== 0) {
      event.preventDefault();
      return;
    }
    hooks.onActivate();
  };

  el.addEventListener('pointerdown', begin);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('lostpointercapture', cancel);
  el.addEventListener('click', click);

  return {
    resetOffset: () => setOffset({ x: 0, y: 0 }),
    inGesture: () => gesture !== null,
    destroy() {
      el.removeEventListener('pointerdown', begin);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', end);
      el.removeEventListener('pointercancel', cancel);
      el.removeEventListener('lostpointercapture', cancel);
      el.removeEventListener('click', click);
    },
  };
}

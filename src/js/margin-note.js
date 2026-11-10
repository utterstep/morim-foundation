// The pen arrow from the featured article's note to the word it is about
// (the landing's first stance row, src/template.html.j2). The note hangs
// over the row, on the end side, in the blank beside the section's lead;
// the arrow leaves the note's near edge and lands just above the marked
// word, so it crosses the row's rule and nothing else. Measured, not drawn
// in CSS: the line breaks move with the viewport and the type floors
// (type.css). Without the script there is no arrow; the note still reads
// on its own.

/**
 * A pen stroke from `from` to `to`, bowed a little like a hand-drawn line,
 * with an open arrowhead at `to` along the stroke's direction.
 * @param {{x: number, y: number}} from
 * @param {{x: number, y: number}} to
 * @param {number} sag  how far the middle of the stroke drops (negative: rises)
 * @param {number} head  length of the arrowhead's arms
 * @returns {string} SVG path data
 */
export function arrowPath(from, to, sag, head) {
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2 + sag;
  const dx = to.x - cx;
  const dy = to.y - cy;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const arm = (angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: to.x - head * (ux * cos - uy * sin), y: to.y - head * (ux * sin + uy * cos) };
  };
  const a = arm(0.5);
  const b = arm(-0.5);
  const n = (value) => Math.round(value * 10) / 10;
  return `M${n(from.x)} ${n(from.y)}Q${n(cx)} ${n(cy)} ${n(to.x)} ${n(to.y)}M${n(a.x)} ${n(a.y)}L${n(to.x)} ${n(to.y)}L${n(b.x)} ${n(b.y)}`;
}

/**
 * Where the arrow starts and ends, in the row's own coordinates: from the
 * note's edge facing the word, below the note's middle, to a little above
 * the word, on the half of it nearer the note.
 * @param {DOMRect} box  the row
 * @param {DOMRect} note  the note
 * @param {DOMRect} claim  the marked word's first line box
 * @param {number} gap  air between the arrow and the note, and the word
 */
export function arrowEnds(box, note, claim, gap) {
  const rtl = note.left + note.width / 2 < claim.left + claim.width / 2;
  return {
    from: {
      x: (rtl ? note.right + gap : note.left - gap) - box.left,
      y: note.top + note.height * 0.62 - box.top,
    },
    to: {
      x: claim.left + claim.width * (rtl ? 0.35 : 0.65) - box.left,
      y: claim.top - gap - box.top,
    },
  };
}

/**
 * @param {HTMLElement} note  the `.margin-note` link; `data-claim` names the
 *   word it points at, inside the note's parent
 * @returns {() => void} stop
 */
export function startMarginNote(note) {
  const host = note.parentElement;
  const claim = host?.querySelector(note.dataset.claim || 'mark');
  const path = host?.querySelector('.margin-note-arrow path');
  if (!host || !claim || !path) return () => {};

  const draw = () => {
    const [first] = claim.getClientRects();
    // Phones set the note under the row's text: no arrow there.
    if (!first || getComputedStyle(note).position !== 'absolute') {
      path.setAttribute('d', '');
      return;
    }
    const em = parseFloat(getComputedStyle(host).fontSize) || 16;
    const { from, to } = arrowEnds(host.getBoundingClientRect(), note.getBoundingClientRect(), first, 0.45 * em);
    path.setAttribute('d', arrowPath(from, to, -0.9 * em, 0.55 * em));
  };

  draw();
  const observer = new ResizeObserver(draw);
  observer.observe(host);
  observer.observe(note);
  document.fonts?.ready.then(draw);
  return () => observer.disconnect();
}

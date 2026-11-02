// The pen arrow from the featured article's margin note to the end of the
// sentence it annotates (the landing's intro, src/template.html.j2). The
// note sits in the end margin beside the claim; the arrow runs from the
// note's near edge to just past the claim's last word, through the blank
// end of that line, so it never crosses text. Measured,
// not drawn in CSS: the line breaks move with the viewport and the type
// floors (type.css). Without the script there is no arrow; the note and the
// claim's underline still pair up.

/**
 * A pen stroke from `from` to `to`, sagging a little like a hand-drawn line,
 * with an open arrowhead at `to` along the stroke's direction.
 * @param {{x: number, y: number}} from
 * @param {{x: number, y: number}} to
 * @param {number} sag  how far the middle of the stroke drops
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
 * Where the arrow starts and ends, in the paragraph's own coordinates: from
 * the note's edge facing the claim, at the note's line nearest the claim's
 * last line (level with it when the note spans its height), to a little
 * past the end of that line, at its middle.
 * @param {DOMRect} box  the paragraph
 * @param {DOMRect} note  the note
 * @param {DOMRect} last  the claim's last line box
 * @param {number} noteLine  the note's line height
 * @param {number} gap  air between the arrow and the note, and the text
 */
export function arrowEnds(box, note, last, noteLine, gap) {
  const rtl = note.right <= last.left;
  const target = last.top + last.height / 2;
  const start = Math.min(Math.max(target, note.top + noteLine / 2), note.bottom - noteLine / 2);
  const y = target - box.top;
  return {
    from: { x: (rtl ? note.right + gap : note.left - gap) - box.left, y: start - box.top },
    to: { x: (rtl ? last.left - gap : last.right + gap) - box.left, y },
  };
}

/**
 * @param {HTMLElement} note  the `.margin-note` link
 * @returns {() => void} stop
 */
export function startMarginNote(note) {
  const host = note.parentElement;
  const claim = host?.querySelector('.intro-claim');
  const path = host?.querySelector('.margin-note-arrow path');
  if (!host || !claim || !path) return () => {};

  const draw = () => {
    const lines = claim.getClientRects();
    const last = lines[lines.length - 1];
    // Phones set the note under the paragraph: no arrow there.
    if (!last || getComputedStyle(note).position !== 'absolute') {
      path.setAttribute('d', '');
      return;
    }
    const em = parseFloat(getComputedStyle(host).fontSize) || 16;
    const noteLine = parseFloat(getComputedStyle(note).lineHeight) || em;
    const { from, to } = arrowEnds(host.getBoundingClientRect(), note.getBoundingClientRect(), last, noteLine, 0.45 * em);
    path.setAttribute('d', arrowPath(from, to, 0.3 * em, 0.55 * em));
  };

  draw();
  const observer = new ResizeObserver(draw);
  observer.observe(host);
  observer.observe(note);
  document.fonts?.ready.then(draw);
  return () => observer.disconnect();
}

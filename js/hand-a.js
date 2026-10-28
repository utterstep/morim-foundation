// The hand-drawn «a» comes in four alternates. The markup names one so the
// page reads fine without JS; on load each heading gets the next alternate
// from a random starting point, so two headings never share a hand.
const ALTERNATES = ['caveat', 'caveat-bold', 'kalam', 'gochi'];

/** @param {ParentNode} root */
export function dealHandLetters(root) {
  const glyphs = root.querySelectorAll('.hand-a');
  const start = Math.floor(Math.random() * ALTERNATES.length);
  glyphs.forEach((el, i) => {
    /** @type {HTMLElement} */ (el).dataset.alt = ALTERNATES[(start + i) % ALTERNATES.length];
  });
}

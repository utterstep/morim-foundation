// Ported from PR #3 website/app/sections.tsx (`Programs`). One `.programs`
// block: the location listbox filters the rows, rows are detached rather
// than hidden (so the floating Apply rail and the FLIP animation see the
// same DOM React produced), and a filtered-out results card is reset.

import { initListbox } from './listbox.js';
import { captureProgramLayout, animateProgramLayout } from './program-motion.js';
import { resetDisclosure } from './disclosure.js';

/**
 * @param {HTMLElement} programs  the `.programs` element
 * @returns {() => void} stop
 */
export function startPrograms(programs) {
  const wrap = programs.querySelector('.location-select-wrap');
  const list = programs.querySelector('.program-list');
  if (!(wrap && list)) return () => {};
  // Document order is captured once; filtering re-inserts from this array.
  const rows = Array.from(list.children);
  const matches = (row, value) =>
    value === 'all' || !(row instanceof HTMLElement) || !row.dataset.location || row.dataset.location === value;

  const applyFilter = (value) => {
    const snapshot = captureProgramLayout(list);
    rows.forEach((row) => {
      if (!matches(row, value)) resetDisclosure(row);
    });
    list.replaceChildren(...rows.filter((row) => matches(row, value)));
    animateProgramLayout(list, snapshot);
  };

  const listbox = initListbox(wrap, applyFilter);
  return () => listbox.destroy();
}

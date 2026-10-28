// Ported from PR #3 website/app/sections.tsx (`Programs`). One `.programs`
// block: the location tabs (the audience tab pattern) filter the rows, rows are detached rather
// than hidden (so the floating Apply rail and the FLIP animation see the
// same DOM React produced).

import { startTabs } from './tabs.js';
import { captureProgramLayout, animateProgramLayout } from './program-motion.js';

/**
 * @param {HTMLElement} programs  the `.programs` element
 * @returns {() => void} stop
 */
export function startPrograms(programs) {
  const tablist = programs.querySelector('.program-tabs');
  const list = programs.querySelector('.program-list');
  if (!(tablist && list)) return () => {};
  // Document order is captured once; filtering re-inserts from this array.
  const rows = Array.from(list.children);
  const matches = (row, value) =>
    value === 'all' || !(row instanceof HTMLElement) || !row.dataset.location || row.dataset.location === value;

  const applyFilter = (value) => {
    const snapshot = captureProgramLayout(list);
    list.replaceChildren(...rows.filter((row) => matches(row, value)));
    animateProgramLayout(list, snapshot);
  };

  const values = Array.from(tablist.querySelectorAll(':scope > [role="tab"]'), (tab) => tab.dataset.value ?? 'all');
  let first = true;
  startTabs(tablist, (index) => {
    // Show the first location's rows on start, without the animation.
    if (first) {
      first = false;
      list.replaceChildren(...rows.filter((row) => matches(row, values[index])));
      return;
    }
    applyFilter(values[index]);
  });
  return () => {};
}

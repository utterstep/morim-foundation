// Tabs shared by the audience panel and the selectors inside it (program
// locations): one selected tab with aria-selected and a
// roving tabindex, arrow keys that follow the reading direction, a click
// selects. What a selection shows is up to the caller.

/**
 * @param {HTMLElement} tablist  the `[role="tablist"]`
 * @param {(index: number) => void} onSelect
 * @param {number} [initial]
 * @returns {{ tabs: HTMLElement[], select: (index: number) => void }}
 */
export function startTabs(tablist, onSelect, initial = 0) {
  const tabs = Array.from(tablist.querySelectorAll(':scope > [role="tab"]'));
  const select = (index) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    onSelect(index);
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      select(index);
    });
    tab.addEventListener('keydown', (event) => {
      const rtl = getComputedStyle(tablist).direction === 'rtl';
      const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      const next = (index + step + tabs.length) % tabs.length;
      select(next);
      tabs[next].focus();
    });
  });
  if (tabs.length) select(initial);
  tablist.dataset.ready = '';
  return { tabs, select };
}

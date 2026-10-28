// The audience panel: teachers and coordinators share one card and one
// heading slot (schools open a side panel, js/dialog.js). Tabs are anchors, so
// without JS every pane stays visible. Any same-page link into a hidden pane
// (#leaders, #program-…) switches the pane first, so the browser can scroll to it.

import { startTabs } from './tabs.js';

/**
 * @param {HTMLElement} root the .audiences section
 */
export function startAudiences(root) {
  // Only the panel's own tabs: panes hold tab selectors of their own.
  const tablist = root.querySelector(':scope > .audience-nav > .audience-tabs');
  const tabs = Array.from(tablist?.querySelectorAll(':scope > [role="tab"]') ?? []);
  const panes = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  if (!tabs.length || panes.some((pane) => !pane)) return;

  const show = (index) => {
    panes.forEach((pane, i) => (pane.hidden = i !== index));
    root.dataset.audience = panes[index].id;
  };
  const paneOf = (id) => {
    const target = id && document.getElementById(id);
    return target ? panes.findIndex((pane) => pane.contains(target)) : -1;
  };

  // On desktop both pane headings take the taller one's height, so a switch
  // keeps the terms, Apply and the blocks below at the same height. The
  // shorter heading gets the difference above it and sits on its terms. A
  // hidden pane is unhidden for the measure only, inside one frame, never
  // painted.
  const headings = panes.map((pane) => pane.querySelector(':scope > h2'));
  const desktop = matchMedia('(min-width: 701px)');
  const equalize = () => {
    headings.forEach((h) => h && (h.style.paddingBlockStart = ''));
    if (!desktop.matches || headings.some((h) => !h)) return;
    const hidden = panes.map((pane) => pane.hidden);
    panes.forEach((pane) => (pane.hidden = false));
    const heights = headings.map((h) => h.getBoundingClientRect().height);
    panes.forEach((pane, i) => (pane.hidden = hidden[i]));
    const tallest = Math.max(...heights);
    headings.forEach((h, i) => (h.style.paddingBlockStart = `${tallest - heights[i]}px`));
  };
  addEventListener('resize', equalize);
  document.fonts?.ready.then(equalize);

  root.dataset.tabs = '';
  const { select } = startTabs(tablist, show, Math.max(0, paneOf(decodeURIComponent(location.hash.slice(1)))));
  equalize();
  // The nav sits in the plum block, then sticks to the top as a pill (css
  // .audience-nav[data-stuck]): in the middle of the header's row, clear of the
  // logo and the languages, whenever the tabs and a few letters of the
  // schools link fit there; otherwise just under the two pills. A tab
  // pressed while stuck brings the new pane in from its start.
  const nav = tablist.parentElement;
  const logo = document.querySelector('.header-shell .site-header');
  const langs = document.querySelector('.lang-float');
  const place = () => {
    const rects = [logo, langs].filter(Boolean).map((el) => el.getBoundingClientRect());
    if (rects.length < 2) return;
    const [left, right] = rects.sort((a, b) => a.left - b.left);
    const margin = 8;
    const box = root.getBoundingClientRect();
    const centre = (box.left + box.right) / 2;
    // Centred on the row, the pill is bounded by whichever of the two pills
    // comes closer to the middle.
    const room = 2 * Math.min(centre - left.right, right.left - centre) - 2 * margin;
    // Measured on a hidden copy: in the block, for the height the stuck pill
    // has to make up in its margin; stuck at both ends of --fit, for its full
    // width, and compact with room for the arrow and about three letters of
    // the link.
    const copy = nav.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.inert = true;
    copy.removeAttribute('style');
    copy.removeAttribute('data-stuck');
    copy.style.visibility = 'hidden';
    copy.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    nav.after(copy);
    const inline = copy.getBoundingClientRect().height + parseFloat(getComputedStyle(copy).marginBlockEnd);
    copy.toggleAttribute('data-stuck', true);
    const below = parseFloat(getComputedStyle(copy).maxInlineSize);
    copy.style.maxInlineSize = 'none';
    copy.style.setProperty('--fit', '1');
    const full = copy.getBoundingClientRect().width;
    copy.style.setProperty('--fit', '0');
    const compact = copy.getBoundingClientRect().width;
    const link = copy.querySelector('.audience-trigger > span');
    const css = getComputedStyle(copy);
    const need = compact - link.getBoundingClientRect().width + 4 * parseFloat(css.fontSize);
    const pill = copy.getBoundingClientRect().height;
    copy.remove();
    const inRow = need <= room;
    const width = inRow ? room : below;
    const fit = Math.min(1, Math.max(0, (width - compact) / (full - compact)));
    nav.style.setProperty('--fit', `${fit}`);
    nav.style.setProperty('--nav-gap', `${inline - pill}px`);
    if (inRow) {
      nav.style.setProperty('--nav-top', `${left.top}px`);
      nav.style.setProperty('--nav-width', `${room}px`);
    } else {
      nav.style.setProperty('--nav-top', `${Math.max(left.bottom, right.bottom) + margin}px`);
      nav.style.removeProperty('--nav-width');
    }
  };
  const stuck = () => {
    const top = parseFloat(getComputedStyle(nav).insetBlockStart) || 0;
    return root.getBoundingClientRect().top < 0 && nav.getBoundingClientRect().top <= top + 1;
  };
  const mark = () => nav.toggleAttribute('data-stuck', stuck());
  addEventListener('scroll', mark, { passive: true });
  addEventListener('resize', () => { place(); mark(); });
  document.fonts?.ready.then(() => { place(); mark(); });
  place();
  mark();
  tabs.forEach((tab, index) =>
    tab.addEventListener('click', () => {
      const wasStuck = stuck();
      history.replaceState(null, '', `#${panes[index].id}`);
      if (wasStuck) root.scrollIntoView({ behavior: 'instant', block: 'start' });
    }),
  );

  // Runs before the browser follows the link, so the target is visible by then.
  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element && event.target.closest('a[href^="#"]');
    if (!link || (root.contains(link) && link.matches('[role="tab"]'))) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const index = paneOf(id);
    if (index < 0) return;
    select(index);
    // A pane itself is the card's content: land on the card with its tabs.
    if (panes[index].id === id) {
      event.preventDefault();
      history.pushState(null, '', `#${id}`);
      root.scrollIntoView({ behavior: 'smooth' });
    }
  });
  window.addEventListener('hashchange', () => {
    const index = paneOf(decodeURIComponent(location.hash.slice(1)));
    if (index >= 0) select(index);
  });
}

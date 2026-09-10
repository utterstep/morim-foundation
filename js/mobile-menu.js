// Ported from PR #3 website/app/mobile-menu.tsx. The trigger and close
// button are handled by dialog.js; this adds the two behaviours the React
// component had on top: close on link click, close when the viewport grows
// past the mobile breakpoint.

import { closeDialog } from './dialog.js';

/**
 * @param {HTMLDialogElement} menu
 * @returns {() => void} stop
 */
export function startMobileMenu(menu) {
  const desktop = window.matchMedia('(min-width: 701px)');
  const closeOnDesktop = () => {
    if (desktop.matches) closeDialog(menu);
  };
  const closeOnLink = (event) => {
    if (event.target instanceof Element && event.target.closest('nav a')) closeDialog(menu);
  };
  desktop.addEventListener('change', closeOnDesktop);
  menu.addEventListener('click', closeOnLink);
  return () => {
    desktop.removeEventListener('change', closeOnDesktop);
    menu.removeEventListener('click', closeOnLink);
  };
}

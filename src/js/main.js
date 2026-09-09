// Entry point. Wires the static page up in the same order the React tree
// mounted its effects in PR #3 (website/app/home-content.tsx).

import { startPageMotion } from './lib/page-motion.js';
import { startCardDepth } from './lib/card-depth.js';
import { watchProgramsViewport } from './lib/floating-apply.js';
import { startFloatingHeader } from './header.js';
import { initDialogs } from './dialog.js';
import { startMobileMenu } from './mobile-menu.js';
import { initDetails, initDisclosureButton } from './disclosure.js';
import { watchProgramMotionPreference } from './program-motion.js';
import { startPrograms } from './programs.js';
import { startHero } from './hero/hero.js';
import { startLanguage } from './lang.js';
import { startLanguageMenu } from './lang-menu.js';

const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const FAQ_MOTION = { duration: 250, easing: EASING, fade: 200 };
const RESULTS_MOTION = { duration: 360, easing: EASING, fade: 240 };

const root = document.getElementById('top');
if (root) {
  startPageMotion(root);
  startCardDepth(root);
  root.querySelectorAll('.floating-apply-rail').forEach((rail) => watchProgramsViewport(rail));

  const shell = root.querySelector('.header-shell');
  if (shell) startFloatingHeader(shell);

  initDialogs(document);
  const menu = document.getElementById('mobile-menu');
  if (menu instanceof HTMLDialogElement) startMobileMenu(menu);

  root.querySelectorAll('details.faq-item').forEach((details) => initDetails(details, FAQ_MOTION));
  root
    .querySelectorAll('.results-button[aria-controls]')
    .forEach((button) => initDisclosureButton(button, RESULTS_MOTION));

  watchProgramMotionPreference();
  root.querySelectorAll('.programs').forEach((programs) => startPrograms(programs));

  const hero = root.querySelector('.hero');
  if (hero) startHero(hero);

  root.querySelectorAll('.lang-menu').forEach((menu) => startLanguageMenu(menu));
  startLanguage(root);
}

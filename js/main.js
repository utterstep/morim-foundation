// Entry point. Wires the static page up in the same order the React tree
// mounted its effects in PR #3 (website/app/home-content.tsx).

import { startPageMotion } from './lib/page-motion.js?v=94b7e6ab';
import { startCardDepth } from './lib/card-depth.js?v=94b7e6ab';
import { watchApplyButtons } from './lib/floating-apply.js?v=94b7e6ab';
import { startFloatingHeader } from './header.js?v=94b7e6ab';
import { initDialogs } from './dialog.js?v=94b7e6ab';
import { startMobileMenu } from './mobile-menu.js?v=94b7e6ab';
import { initDetails, initExpander } from './disclosure.js?v=94b7e6ab';
import { watchProgramMotionPreference } from './program-motion.js?v=94b7e6ab';
import { startPrograms } from './programs.js?v=94b7e6ab';
import { startLanguage } from './lang.js?v=94b7e6ab';
import { startNavMenu } from './nav-menu.js?v=94b7e6ab';
import { startScrollHint } from './scroll-hint.js?v=94b7e6ab';
import { startAudiences } from './audiences.js?v=94b7e6ab';
import { dealHandLetters } from './hand-a.js?v=94b7e6ab';
import { startMarginNote } from './margin-note.js?v=94b7e6ab';

const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const FAQ_MOTION = { duration: 250, easing: EASING, fade: 200 };
const EXPAND_MOTION = { duration: 450, easing: EASING, fade: 300 };

const root = document.getElementById('top');
if (root) {
  dealHandLetters(root);
  startPageMotion(root);
  startCardDepth(root);
  root.querySelectorAll('.floating-apply-rail').forEach((rail) => watchApplyButtons(rail, root));

  const shell = root.querySelector('.header-shell');
  if (shell) startFloatingHeader(shell);

  initDialogs(document);
  const menu = document.getElementById('mobile-menu');
  if (menu instanceof HTMLDialogElement) startMobileMenu(menu);

  root.querySelectorAll('details.faq-item').forEach((details) => initDetails(details, FAQ_MOTION));
  // "Learn more" under the camp's figures opens the pilot's story in place.
  root.querySelectorAll('button[data-expand]').forEach((button) => initExpander(button, EXPAND_MOTION));

  watchProgramMotionPreference();
  root.querySelectorAll('.programs').forEach((programs) => startPrograms(programs));
  const audiences = root.querySelector('.audiences');
  if (audiences) startAudiences(audiences);

  // The mobile menu dialog lives outside <main>, so look across the document.
  document.querySelectorAll('.nav-menu').forEach((menu) => startNavMenu(menu));
  // The featured article's pen note over the first row draws its arrow.
  root.querySelectorAll('.margin-note').forEach((note) => startMarginNote(note));
  const hint = root.querySelector('[data-scroll-hint]');
  if (hint) startScrollHint(hint);
  startLanguage(root);
}

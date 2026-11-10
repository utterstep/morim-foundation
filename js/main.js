// Entry point. Wires the static page up in the same order the React tree
// mounted its effects in PR #3 (website/app/home-content.tsx).

import { startPageMotion } from './lib/page-motion.js?v=69496d6a';
import { startCardDepth } from './lib/card-depth.js?v=69496d6a';
import { watchApplyButtons } from './lib/floating-apply.js?v=69496d6a';
import { startFloatingHeader } from './header.js?v=69496d6a';
import { initDialogs } from './dialog.js?v=69496d6a';
import { startMobileMenu } from './mobile-menu.js?v=69496d6a';
import { initDetails } from './disclosure.js?v=69496d6a';
import { watchProgramMotionPreference } from './program-motion.js?v=69496d6a';
import { startPrograms } from './programs.js?v=69496d6a';
import { startLanguage } from './lang.js?v=69496d6a';
import { startNavMenu } from './nav-menu.js?v=69496d6a';
import { startScrollHint } from './scroll-hint.js?v=69496d6a';
import { startAudiences } from './audiences.js?v=69496d6a';
import { dealHandLetters } from './hand-a.js?v=69496d6a';
import { startMarginNote } from './margin-note.js?v=69496d6a';

const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const FAQ_MOTION = { duration: 250, easing: EASING, fade: 200 };

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

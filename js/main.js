// Entry point. Wires the static page up in the same order the React tree
// mounted its effects in PR #3 (website/app/home-content.tsx).

import { startPageMotion } from './lib/page-motion.js?v=b3a925e7';
import { startCardDepth } from './lib/card-depth.js?v=b3a925e7';
import { watchApplyButtons } from './lib/floating-apply.js?v=b3a925e7';
import { startFloatingHeader } from './header.js?v=b3a925e7';
import { initDialogs } from './dialog.js?v=b3a925e7';
import { startMobileMenu } from './mobile-menu.js?v=b3a925e7';
import { initDetails, initExpander } from './disclosure.js?v=b3a925e7';
import { watchProgramMotionPreference } from './program-motion.js?v=b3a925e7';
import { startPrograms } from './programs.js?v=b3a925e7';
import { startHero } from './hero/hero.js?v=b3a925e7';
import { startLanguage } from './lang.js?v=b3a925e7';
import { startNavMenu } from './nav-menu.js?v=b3a925e7';
import { startScrollHint } from './scroll-hint.js?v=b3a925e7';
import { startAudiences } from './audiences.js?v=b3a925e7';
import { dealHandLetters } from './hand-a.js?v=b3a925e7';

const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const FAQ_MOTION = { duration: 250, easing: EASING, fade: 200 };
// The camp's story is a tall block: a slower height, the same curve.
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
  root.querySelectorAll('button[data-expand]').forEach((button) => initExpander(button, EXPAND_MOTION));
  // The teachers' pilot card leads to the camp and opens its story on the way.
  const campMore = root.querySelector('.camp-more');
  root.querySelectorAll('.pilot-link').forEach((link) =>
    link.addEventListener('click', () => {
      if (campMore instanceof HTMLButtonElement && campMore.getAttribute('aria-expanded') !== 'true') campMore.click();
    }),
  );

  watchProgramMotionPreference();
  root.querySelectorAll('.programs').forEach((programs) => startPrograms(programs));
  const audiences = root.querySelector('.audiences');
  if (audiences) startAudiences(audiences);

  const hero = root.querySelector('.hero');
  if (hero) startHero(hero);

  // The mobile menu dialog lives outside <main>, so look across the document.
  document.querySelectorAll('.nav-menu').forEach((menu) => startNavMenu(menu));
  const hint = root.querySelector('[data-scroll-hint]');
  if (hint) startScrollHint(hint);
  startLanguage(root);
}

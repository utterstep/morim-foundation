// Page slide between the landing and the schools page (cross-document view
// transition). Classic script in <head> so the listener is in place before
// the first render of the new page, which is when `pagereveal` fires. Going
// to schools the new page pushes in from the inline end; coming back it
// pushes in from the inline start. Any other navigation (a language switch)
// keeps the plain page change.
(() => {
  const isSchools = (url) => /\/schools\/(?:index\.html)?$/.test(new URL(url).pathname);
  window.addEventListener('pagereveal', (event) => {
    const transition = event.viewTransition;
    if (!transition) return;
    const from = window.navigation?.activation?.from?.url;
    const here = isSchools(location.href);
    if (!from || isSchools(from) === here) {
      transition.skipTransition();
      return;
    }
    transition.types.add(here ? 'slide-forward' : 'slide-back');
    // A link like `#audiences` lands mid-page. With the site's smooth
    // scrolling the page would glide down under the slide, so the jump is
    // instant until the slide is over.
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    transition.finished.finally(() => root.style.removeProperty('scroll-behavior'));
  });
})();

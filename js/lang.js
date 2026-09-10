// Language handling. Pages live at /, /ru/ and /he/; the old site used
// `?lang=xx` on the root page, so those links are redirected once. Choosing a
// language in the switcher is remembered, but nothing redirects automatically.

const STORAGE_KEY = 'lang';

/**
 * @param {string} search  `location.search`
 * @param {string[]} available  language codes other than the default
 * @returns {string | null} the language to redirect to, if any
 */
export function legacyLanguageRedirect(search, available) {
  const match = /[?&]lang=([a-z]{2})(?:&|$)/.exec(search);
  return match && available.includes(match[1]) ? match[1] : null;
}

/**
 * @param {HTMLElement} main  the `<main data-lang>` element
 * @returns {() => void} stop
 */
export function startLanguage(main) {
  const current = main.dataset.lang ?? 'en';
  const switchers = Array.from(document.querySelectorAll('.lang-switcher a, .lang-menu-list a'));
  const others = switchers.map((a) => a.getAttribute('hreflang')).filter((code) => code && code !== current);

  if (current === 'en') {
    const target = legacyLanguageRedirect(window.location.search, others);
    if (target) {
      const link = switchers.find((a) => a.getAttribute('hreflang') === target);
      if (link) {
        window.location.replace(link.href + window.location.hash);
        return () => {};
      }
    }
  }

  const remember = (event) => {
    const link = event.currentTarget;
    try {
      localStorage.setItem(STORAGE_KEY, link.getAttribute('hreflang') ?? current);
    } catch {
      /* storage may be unavailable */
    }
  };
  switchers.forEach((a) => a.addEventListener('click', remember));
  return () => switchers.forEach((a) => a.removeEventListener('click', remember));
}

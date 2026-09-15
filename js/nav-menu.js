// Header drop-downs (Programs, languages): a disclosure button that opens a
// list of links (WAI-ARIA "disclosure navigation menu"). The footer and the
// mobile menu keep plain link lists.
//
// Markup contract (rendered by the template):
//   <div class="nav-menu">
//     <button class="nav-menu-button" aria-expanded aria-controls>…</button>
//     <ul class="nav-menu-list" hidden><li><a>…</a></li>…</ul>
//   </div>

/**
 * @param {HTMLElement} root  the `.nav-menu`
 * @returns {() => void} stop
 */
export function startNavMenu(root) {
  const button = root.querySelector('button');
  const list = root.querySelector('ul');
  if (!(button && list)) return () => {};
  const links = () => Array.from(list.querySelectorAll('a'));

  const open = () => {
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
  };
  const close = ({ refocus = true } = {}) => {
    if (list.hidden) return;
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (refocus) button.focus();
  };
  const focusLink = (index) => {
    const items = links();
    items[(index + items.length) % items.length]?.focus();
  };

  const onButtonClick = () => (list.hidden ? open() : close());
  const onButtonKey = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open();
      focusLink(event.key === 'ArrowDown' ? 0 : -1);
    } else if (event.key === 'Escape' && !list.hidden) {
      event.preventDefault();
      close();
    }
  };
  const onListKey = (event) => {
    const index = links().indexOf(document.activeElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusLink(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusLink(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusLink(0);
        break;
      case 'End':
        event.preventDefault();
        focusLink(-1);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        close({ refocus: false });
        break;
    }
  };
  const onOutsidePointer = (event) => {
    if (!root.contains(event.target)) close({ refocus: false });
  };
  const onFocusOut = (event) => {
    if (!root.contains(event.relatedTarget)) close({ refocus: false });
  };
  // Same-page links (#fellowship) do not reload, so the card closes itself.
  const onLinkClick = () => close({ refocus: false });

  button.addEventListener('click', onButtonClick);
  button.addEventListener('keydown', onButtonKey);
  list.addEventListener('keydown', onListKey);
  root.addEventListener('focusout', onFocusOut);
  list.addEventListener('click', onLinkClick);
  document.addEventListener('pointerdown', onOutsidePointer);
  return () => {
    button.removeEventListener('click', onButtonClick);
    button.removeEventListener('keydown', onButtonKey);
    list.removeEventListener('keydown', onListKey);
    root.removeEventListener('focusout', onFocusOut);
    list.removeEventListener('click', onLinkClick);
    document.removeEventListener('pointerdown', onOutsidePointer);
  };
}

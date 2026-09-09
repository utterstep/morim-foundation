// Single-select listbox replacing Base UI's Select (PR #3
// website/components/ui/select.tsx) for the programs location filter.
//
// Markup contract (rendered by the template):
//   <div class="location-select-wrap">
//     <button class="location-select" aria-haspopup="listbox" aria-expanded aria-controls>
//       <span data-value-label>…</span> <svg/>
//     </button>
//     <ul class="location-options" role="listbox" tabindex="-1" hidden>
//       <li role="option" data-value aria-selected tabindex>…</li>
//     </ul>
//   </div>
//
// Like Base UI with alignItemWithTrigger, the open list overlays the trigger
// so the selected option sits on top of it (`--selected-offset`).

/**
 * @param {HTMLElement} root  the `.location-select-wrap`
 * @param {(value: string) => void} onChange  called only when the value changes
 * @returns {{ value: () => string, setValue: (value: string) => void, destroy: () => void }}
 */
export function initListbox(root, onChange) {
  const button = root.querySelector('button');
  const list = root.querySelector('[role="listbox"]');
  const label = button?.querySelector('[data-value-label]');
  if (!(button && list && label)) return { value: () => '', setValue() {}, destroy() {} };
  const options = () => Array.from(list.querySelectorAll('[role="option"]'));
  const selected = () => options().find((option) => option.getAttribute('aria-selected') === 'true');
  let current = selected()?.dataset.value ?? '';

  const open = () => {
    if (!list.hidden) return;
    const option = selected() ?? options()[0];
    list.hidden = false;
    list.style.setProperty('--selected-offset', `${option ? option.offsetTop : 0}px`);
    button.setAttribute('aria-expanded', 'true');
    option?.focus();
  };
  const close = ({ refocus = true } = {}) => {
    if (list.hidden) return;
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (refocus) button.focus();
  };
  const setValue = (value) => {
    options().forEach((option) => {
      const match = option.dataset.value === value;
      option.setAttribute('aria-selected', String(match));
      option.tabIndex = match ? 0 : -1;
      if (match) label.textContent = option.textContent?.trim() ?? '';
    });
    if (value !== current) {
      current = value;
      onChange(value);
    }
  };
  const choose = (option) => {
    close();
    if (option?.dataset.value !== undefined) setValue(option.dataset.value);
  };
  const focusOption = (index) => {
    const items = options();
    items[Math.max(0, Math.min(items.length - 1, index))]?.focus();
  };

  const onButtonClick = () => (list.hidden ? open() : close());
  const onButtonKey = (event) => {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      open();
    } else if (event.key === 'Escape' && !list.hidden) {
      event.preventDefault();
      close();
    }
  };
  const onListKey = (event) => {
    const items = options();
    const index = items.indexOf(document.activeElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusOption(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusOption(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusOption(0);
        break;
      case 'End':
        event.preventDefault();
        focusOption(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(items[index]);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        close({ refocus: false });
        break;
      default:
        if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
          const letter = event.key.toLowerCase();
          const next = items.find(
            (item, i) => i > index && item.textContent?.trim().toLowerCase().startsWith(letter),
          ) ?? items.find((item) => item.textContent?.trim().toLowerCase().startsWith(letter));
          next?.focus();
        }
    }
  };
  const onListClick = (event) => {
    const option = event.target instanceof Element ? event.target.closest('[role="option"]') : null;
    if (option instanceof HTMLElement) choose(option);
  };
  const onOutsidePointer = (event) => {
    if (!root.contains(event.target)) close({ refocus: false });
  };
  const onFocusOut = (event) => {
    if (!root.contains(event.relatedTarget)) close({ refocus: false });
  };

  button.addEventListener('click', onButtonClick);
  button.addEventListener('keydown', onButtonKey);
  list.addEventListener('keydown', onListKey);
  list.addEventListener('click', onListClick);
  root.addEventListener('focusout', onFocusOut);
  document.addEventListener('pointerdown', onOutsidePointer);

  return {
    value: () => current,
    setValue,
    destroy() {
      button.removeEventListener('click', onButtonClick);
      button.removeEventListener('keydown', onButtonKey);
      list.removeEventListener('keydown', onListKey);
      list.removeEventListener('click', onListClick);
      root.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('pointerdown', onOutsidePointer);
    },
  };
}

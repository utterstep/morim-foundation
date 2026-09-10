// Native <dialog> helper replacing shadcn's Dialog and Sheet (PR #3
// website/components/ui/dialog.tsx, sheet.tsx).
//
// Markup contract:
//   <button data-dialog="some-id" [data-dialog-title="…"]>   opens #some-id
//   <button data-dialog-close>                                closes the enclosing dialog
//   <dialog id="some-id"> … <h2 data-dialog-title>            optional title target
//
// Enter motion is CSS (@starting-style on dialog[open]); exit motion runs
// while `data-closing` is set, and closeDialog waits for it before calling
// dialog.close(). Scroll locking is CSS too (html:has(dialog:modal)).

const openers = new WeakMap();

/**
 * @param {HTMLDialogElement} dialog
 * @param {HTMLElement} [opener]  element to return focus to; defaults to the active element
 */
export function openDialog(dialog, opener) {
  if (dialog.open) return;
  openers.set(dialog, opener ?? document.activeElement);
  const title = opener?.dataset.dialogTitle;
  const titleTarget = dialog.querySelector('[data-dialog-title]');
  if (title && titleTarget) titleTarget.textContent = title;
  dialog.showModal();
}

/**
 * Close with the exit transition, then restore focus to the opener.
 * @param {HTMLDialogElement} dialog
 * @returns {Promise<void>}
 */
export async function closeDialog(dialog) {
  if (!dialog.open || dialog.dataset.closing) return;
  dialog.dataset.closing = 'true';
  await Promise.allSettled(
    dialog.getAnimations({ subtree: true }).map((animation) => animation.finished),
  );
  delete dialog.dataset.closing;
  dialog.close();
  const opener = openers.get(dialog);
  openers.delete(dialog);
  if (opener instanceof HTMLElement && opener.isConnected && document.activeElement === document.body)
    opener.focus();
}

/**
 * Wire every trigger, close button, backdrop click and Escape press under `root`.
 * @param {ParentNode} root
 * @returns {() => void} stop
 */
export function initDialogs(root) {
  const onClick = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const trigger = target.closest('[data-dialog]');
    if (trigger instanceof HTMLElement) {
      const dialog = document.getElementById(trigger.dataset.dialog ?? '');
      if (dialog instanceof HTMLDialogElement) openDialog(dialog, trigger);
      return;
    }
    const closer = target.closest('[data-dialog-close]');
    if (closer) {
      const dialog = closer.closest('dialog');
      if (dialog) closeDialog(dialog);
      return;
    }
    // A click on the dialog element itself (not its content) is the backdrop.
    if (target instanceof HTMLDialogElement) closeDialog(target);
  };
  const onCancel = (event) => {
    // Escape: run the exit transition instead of closing instantly.
    event.preventDefault();
    closeDialog(event.currentTarget);
  };
  document.addEventListener('click', onClick);
  const dialogs = Array.from(document.querySelectorAll('dialog'));
  dialogs.forEach((dialog) => dialog.addEventListener('cancel', onCancel));
  return () => {
    document.removeEventListener('click', onClick);
    dialogs.forEach((dialog) => dialog.removeEventListener('cancel', onCancel));
  };
}

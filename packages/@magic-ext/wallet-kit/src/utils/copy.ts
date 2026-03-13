let clipboardID = 0;
const textareaIdentifierKey = 'usableReactClipboardHook';

function isEphemeralCopyToClipboardTextarea(element: HTMLTextAreaElement | null) {
  return !!element?.dataset?.[textareaIdentifierKey];
}

/**
 * Copies text to the native clipboard, either via the `navigator.clipboard`
 * API, or old `document.execCommand('copy')` hacks.
 *
 * Based on: https://stackoverflow.com/a/45308151
 */
export async function copyToClipboard(text?: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const activeEl = document.activeElement as HTMLElement;
    const textarea = document.createElement('textarea');

    textarea.dataset[textareaIdentifierKey] = `clipboard-${++clipboardID}`;

    textarea.style.position = 'absolute';
    textarea.style.left = '-2147483647em';

    textarea.setAttribute('readonly', 'true');

    document.body.appendChild(textarea);

    textarea.value = text;

    const selected = (document.getSelection()?.rangeCount ?? NaN) > 0 ? document.getSelection()?.getRangeAt(0) : false;

    // iOS Safari blocks programmatic execCommand copying without this hack.
    const iOSPattern = /ipad|ipod|iphone/i;

    if (iOSPattern.test(navigator.userAgent)) {
      const editable = textarea.contentEditable;
      textarea.contentEditable = 'true';
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      textarea.setSelectionRange(0, 999999);
      textarea.contentEditable = editable;
    } else {
      textarea.select();
    }

    document.execCommand('copy');

    if (selected) {
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(selected);
    }

    if (activeEl?.focus && isEphemeralCopyToClipboardTextarea(document.activeElement as HTMLTextAreaElement)) {
      activeEl.focus();
    }
  }
}

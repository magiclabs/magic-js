/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */

import { ViewController, createDuplicateIframeWarning, createURL, createModalNotReadyError } from '@magic-sdk/provider';

/**
 * Magic `<iframe>` overlay styles. These base styles enable `<iframe>` UI
 * to render above all other DOM content.
 */
const overlayStyles: Partial<CSSStyleDeclaration> = {
  display: 'block',
  visibility: 'hidden',
  position: 'fixed',
  top: '0',
  right: '0',
  width: '100%',
  height: '100%',
  borderRadius: '0',
  border: 'none',
  zIndex: '2147483647',
};

/**
 * Apply iframe styles to the given element.
 * @param elem - An element to apply styles using CSSOM.
 */
function applyOverlayStyles(elem: HTMLElement) {
  for (const [cssProperty, value] of Object.entries(overlayStyles)) {
    /* eslint-disable-next-line no-param-reassign */
    (elem.style as any)[cssProperty as any] = value;
  }
}

/**
 * Checks if the given query params are associated with an active `<iframe>`
 * instance.
 *
 * @param parameters - The unique, encoded query parameters to check for
 * duplicates against.
 */
function checkForSameSrcInstances(parameters: string) {
  const iframes: HTMLIFrameElement[] = [].slice.call(document.querySelectorAll('.magic-iframe'));
  return Boolean(iframes.find((iframe) => iframe.src.includes(parameters)));
}

/**
 * View controller for the Magic `<iframe>` overlay.
 */
export class IframeController extends ViewController {
  private iframe!: Promise<HTMLIFrameElement>;
  private activeElement: any = null;

  /**
   * Initializes the underlying `<iframe>` element.
   * Initializes the underlying `Window.onmessage` event listener.
   */
  protected init() {
    (this as any).test = 'hello';
    this.iframe = new Promise((resolve) => {
      const onload = () => {
        if (!checkForSameSrcInstances(encodeURIComponent(this.parameters))) {
          const iframe = document.createElement('iframe');
          iframe.classList.add('magic-iframe');
          iframe.dataset.magicIframeLabel = createURL(this.endpoint).host;
          iframe.title = 'Secure Modal';
          iframe.src = createURL(`/send?params=${encodeURIComponent(this.parameters)}`, this.endpoint).href;
          iframe.allow = 'clipboard-read; clipboard-write';
          applyOverlayStyles(iframe);
          document.body.appendChild(iframe);
          resolve(iframe);
        } else {
          createDuplicateIframeWarning().log();
        }
      };

      // Check DOM state and load...
      if (['loaded', 'interactive', 'complete'].includes(document.readyState)) {
        onload();
      } else {
        // ...or check load events to load
        window.addEventListener('load', onload, false);
      }
    });

    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin === this.endpoint) {
        if (event.data && event.data.msgType && this.messageHandlers.size) {
          // If the response object is undefined, we ensure it's at least an
          // empty object before passing to the event listener.
          /* istanbul ignore next */
          event.data.response = event.data.response ?? {};
          for (const handler of this.messageHandlers.values()) {
            handler(event);
          }
        }
      }
    });
  }

  protected async showOverlay() {
    const iframe = await this.iframe;
    iframe.style.visibility = 'visible';
    this.activeElement = document.activeElement;
    iframe.focus();
  }

  protected async hideOverlay() {
    const iframe = await this.iframe;
    iframe.style.visibility = 'hidden';
    if (this.activeElement?.focus) this.activeElement.focus();
    this.activeElement = null;
  }

  protected async _post(data: any) {
    const iframe = await this.iframe;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(data, this.endpoint);
    } else {
      throw createModalNotReadyError();
    }
  }
}

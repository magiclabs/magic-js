/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */

import { ViewController, createDuplicateIframeWarning, createURL, createModalNotReadyError } from '@magic-sdk/provider';

/**
 * Magic `<iframe>` overlay styles. These base styles enable `<iframe>` UI
 * to render above all other DOM content.
 */
const overlayStyles: Partial<CSSStyleDeclaration> = {
  display: 'none',
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

  protected init() {
    this.iframe = new Promise((resolve) => {
      const onload = () => {
        if (!checkForSameSrcInstances(this.parameters)) {
          const iframe = document.createElement('iframe');
          iframe.classList.add('magic-iframe');
          iframe.dataset.magicIframeLabel = createURL(this.endpoint).host;
          iframe.title = 'Secure Modal';
          iframe.src = createURL(`/send?params=${this.parameters}`, this.endpoint).href;
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
  }

  protected async showOverlay() {
    const iframe = await this.iframe;
    iframe.style.display = 'block';
    this.activeElement = document.activeElement;
    iframe.focus();
  }

  protected async hideOverlay() {
    const iframe = await this.iframe;
    iframe.style.display = 'none';
    if (this.activeElement?.focus) this.activeElement.focus();
    this.activeElement = null;
  }

  public async postMessage(data: any) {
    const iframe = await this.iframe;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(data, this.endpoint);
    } else {
      throw createModalNotReadyError();
    }
  }
}

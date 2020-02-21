/* eslint-disable no-underscore-dangle */

import { FmIncomingWindowMessage } from '../types';
import { FmPayloadTransport } from './fm-payload-transport';

/**
 * Fortmatic `<iframe>` overlay styles. These base styles enable `<iframe>` UI
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
    elem.style[cssProperty as any] = value;
  }
}

/**
 * Checks if the given query params are associated with an active `<iframe>`
 * instance.
 */
/* istanbul ignore next */
function checkForSameSrcInstances(encodedQueryParams: string) {
  const iframes: HTMLIFrameElement[] = [].slice.call(document.querySelectorAll('.fortmatic-iframe'));
  return Boolean(iframes.find(iframe => iframe.src?.includes(encodedQueryParams)));
}

/**
 * View controller for the Fortmatic `<iframe>` overlay.
 */
export class FmIframeController {
  public readonly iframe: Promise<HTMLIFrameElement>;
  private _overlayReady = false;
  private payloadTransport: FmPayloadTransport;

  constructor(private readonly endpoint: string, private readonly encodedQueryParams: string) {
    this.iframe = this.init();
    this.payloadTransport = new FmPayloadTransport(endpoint, encodedQueryParams);
    this.listen();
  }

  /**
   * Represents the ready state of the underlying Fortmatic `<iframe>`.
   */
  public get overlayReady() {
    return this._overlayReady;
  }

  /**
   * The `<iframe>` label inferred from associated endpoint
   */
  private get iframeLabel() {
    return new URL(this.endpoint).host;
  }

  /**
   * Initialize the Fortmatic `<iframe>` and pre-load overlay content when DOM
   * is ready.
   */
  private init(): Promise<HTMLIFrameElement> {
    return new Promise(resolve => {
      const onload = () => {
        // Check duplicate instances
        // TODO: Replace the uncommented `if` statement with the following,
        // commented-out `if` statement to allow multiple iframes per domain.
        if (!checkForSameSrcInstances(this.encodedQueryParams)) {
          const iframe = document.createElement('iframe');
          iframe.classList.add('fortmatic-iframe');
          iframe.dataset.fortmaticIframeLabel = this.iframeLabel;
          iframe.src = `${this.endpoint}/send?params=${this.encodedQueryParams}`;
          applyOverlayStyles(iframe);
          document.body.appendChild(iframe);

          const trans = document.createElement('img');
          trans.src = 'https://static.fortmatic.com/assets/trans.gif';
          document.body.appendChild(trans);

          resolve(iframe);
        } else {
          console.error('Fortmatic: Duplicate instances found.');
        }
      };

      // Check Dom state and load...
      if (['loaded', 'interactive', 'complete'].includes(document.readyState)) {
        onload();
      } else {
        // ...or check load events to load
        window.addEventListener('load', onload, false);
      }
    });
  }

  /**
   * Show the Fortmatic `<iframe>` overlay.
   */
  private async showOverlay() {
    const overlayResolved = await this.iframe;
    overlayResolved.style.display = 'block';
  }

  /**
   * Hide the Fortmatic `<iframe>` overlay.
   */
  private async hideOverlay() {
    const overlayResolved = await this.iframe;
    overlayResolved.style.display = 'none';
  }

  /**
   * Listen for messages sent from the underlying Fortmatic `<iframe>`.
   */
  private listen() {
    this.payloadTransport.on(FmIncomingWindowMessage.FORTMATIC_OVERLAY_READY, () => {
      this._overlayReady = true;
    });

    this.payloadTransport.on(FmIncomingWindowMessage.FORTMATIC_HIDE_OVERLAY, () => {
      this.hideOverlay();
    });

    this.payloadTransport.on(FmIncomingWindowMessage.FORTMATIC_SHOW_OVERLAY, () => {
      this.showOverlay();
    });
  }
}

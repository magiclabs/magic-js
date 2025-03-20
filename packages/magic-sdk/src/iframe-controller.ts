import { ViewController, createDuplicateIframeWarning, createURL, createModalNotReadyError } from '@magic-sdk/provider';
import { MagicIncomingWindowMessage, MagicOutgoingWindowMessage } from '@magic-sdk/types';

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
  // necessary for iOS Safari
  opacity: '0',
  // necessary for iOS 17 and earlier
  zIndex: '-1',
};

/**
 * Apply iframe styles to the given element.
 * @param elem - An element to apply styles using CSSOM.
 */
function applyOverlayStyles(elem: HTMLElement) {
  for (const [cssProperty, value] of Object.entries(overlayStyles)) {
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
  return Boolean(iframes.find(iframe => iframe.src.includes(parameters)));
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const RESPONSE_DELAY = 15 * SECOND; // 15 seconds
const PING_INTERVAL = 5 * MINUTE; // 5 minutes
const INITIAL_HEARTBEAT_DELAY = 60 * MINUTE; // 1 hour

/**
 * View controller for the Magic `<iframe>` overlay.
 */
export class IframeController extends ViewController {
  private iframe!: Promise<HTMLIFrameElement>;
  private activeElement: any = null;
  private lastPingTime = Date.now();
  private heartbeatIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  private getIframeSrc() {
    return createURL(`/send?params=${encodeURIComponent(this.parameters)}`, this.endpoint).href;
  }
  /**
   * Initializes the underlying `<iframe>` element.
   * Initializes the underlying `Window.onmessage` event listener.
   */
  protected init() {
    (this as any).test = 'hello';
    this.iframe = new Promise(resolve => {
      const onload = () => {
        if (!checkForSameSrcInstances(encodeURIComponent(this.parameters))) {
          const iframe = document.createElement('iframe');
          iframe.classList.add('magic-iframe');
          iframe.dataset.magicIframeLabel = createURL(this.endpoint).host;
          iframe.title = 'Secure Modal';
          iframe.src = this.getIframeSrc();
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

    this.iframe.then(iframe => {
      if (iframe instanceof HTMLIFrameElement) {
        iframe.addEventListener('load', async () => {
          await this.startHeartBeat();
        });
      }
    });

    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin === this.endpoint) {
        if (event.data && event.data.msgType && this.messageHandlers.size) {
          const isPongMessage = event.data.msgType.includes(MagicIncomingWindowMessage.MAGIC_PONG);

          if (isPongMessage) {
            this.lastPingTime = Date.now();
          }
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

    window.addEventListener('beforeunload', () => {
      this.stopHeartBeat();
    });
  }

  protected async showOverlay() {
    const iframe = await this.iframe;
    iframe.style.visibility = 'visible';
    iframe.style.zIndex = '2147483647';
    iframe.style.opacity = '1';
    this.activeElement = document.activeElement;
    iframe.focus();
  }

  protected async hideOverlay() {
    const iframe = await this.iframe;
    iframe.style.visibility = 'hidden';
    iframe.style.zIndex = '-1';
    iframe.style.opacity = '0';
    if (this.activeElement?.focus) this.activeElement.focus();
    this.activeElement = null;
  }

  protected async _post(data: any) {
    const iframe = await this.checkIframeExists();

    if (iframe && iframe.contentWindow) {
      console.log('_post endpoint', this.endpoint);
      console.log('_post iframe', iframe);
      try {
        iframe.contentWindow.postMessage(data, this.endpoint);
      } catch (e) {
        console.log('error', e);
      }
    } else {
      console.log('_post', iframe);
      throw createModalNotReadyError();
    }
  }

  /**
   * This code implements a heartbeat monitoring system to ensure the iframe remains active and responsive.
   * It periodically sends a ping message to the iframe at regular intervals (every 5 minutes).
   * If the iframe fails to respond within 15 seconds, it triggers a reload to restore functionality.
   * The heartbeat starts after an initial delay of 1 hour and can be stopped when no longer needed.
   * @private
   */

  private async startHeartBeat() {
    const iframe = await this.iframe;

    if (iframe) {
      const heartBeatCheck = () => {
        this.heartbeatIntervalTimer = setInterval(async () => {
          const message = { msgType: `${MagicOutgoingWindowMessage.MAGIC_PING}-${this.parameters}`, payload: [] };

          await this._post(message);

          const timeSinceLastPing = Date.now() - this.lastPingTime;

          if (timeSinceLastPing > RESPONSE_DELAY) {
            await this.reloadIframe();
            this.lastPingTime = Date.now();
          }
        }, PING_INTERVAL);
      };

      this.heartbeatTimeoutTimer = setTimeout(() => heartBeatCheck(), INITIAL_HEARTBEAT_DELAY);
    }
  }

  private stopHeartBeat() {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }

    if (this.heartbeatIntervalTimer) {
      clearInterval(this.heartbeatIntervalTimer);
      this.heartbeatIntervalTimer = null;
    }
  }

  private async reloadIframe() {
    const iframe = await this.iframe;

    if (iframe) {
      // reload the iframe source
      iframe.src = this.getIframeSrc();
    } else {
      this.init();
      console.log('Magic SDK: iframe lost, re-initiating');
    }
    // Reset HeartBeat
    this.stopHeartBeat();
    this.startHeartBeat();
  }

  async checkIframeExists() {
    // Check if the iframe is already in the DOM
    const iframes: HTMLIFrameElement[] = [].slice.call(document.querySelectorAll('.magic-iframe'));
    const iframe = iframes.find(iframe => iframe.src.includes(encodeURIComponent(this.parameters)));

    console.log('iframe', iframe);
    // Recreate iframe if it doesn't exist in the current doc
    if (!iframe) {
      this.init();
    }

    return await this.iframe;
  }
}

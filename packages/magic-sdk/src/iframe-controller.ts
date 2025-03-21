import {
  createDuplicateIframeWarning,
  createModalLostError,
  createModalNotReadyError,
  createURL,
  ViewController,
} from '@magic-sdk/provider';
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
const PING_INTERVAL = 5 * MINUTE; // 5 minutes
const INITIAL_HEARTBEAT_DELAY = 60 * MINUTE; // 1 hour

/**
 * View controller for the Magic `<iframe>` overlay.
 */
export class IframeController extends ViewController {
  private iframe!: Promise<HTMLIFrameElement>;
  private activeElement: any = null;
  private lastPongTime = Date.now();
  private heartbeatIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatDebounce = debounce(() => this.heartBeatCheck(), INITIAL_HEARTBEAT_DELAY);

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
          this.heartbeatDebounce();
        });
      }
    });

    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin === this.endpoint && event.data.msgType) {
        const isPongMessage = event.data.msgType.includes(MagicIncomingWindowMessage.MAGIC_PONG);

        if (isPongMessage) {
          // Mark the Pong time
          this.lastPongTime = Date.now();
        }

        if (event.data && this.messageHandlers.size) {
          // If the response object is undefined, we ensure it's at least an
          // empty object before passing to the event listener.
          event.data.response = event.data.response ?? {};
          this.stopHeartBeat();
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
    const iframe = await this.checkIframeExistsInDOM();

    if (!iframe) {
      this.init();
      throw createModalLostError();
    }

    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(data, this.endpoint);
    } else {
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

  private heartBeatCheck() {
    this.heartbeatIntervalTimer = setInterval(async () => {
      const timeSinceLastPongMs = Date.now() - this.lastPongTime;

      // Check if the time since the last Pong exceeds the expected Ping interval.
      // If true, the iframe may be frozen or unresponsive, attempt to reload it.
      // Otherwise, continue sending Ping messages to maintain connection.
      if (timeSinceLastPongMs > PING_INTERVAL) {
        this.reloadIframe();
        this.lastPongTime = Date.now();
      } else {
        const message = {
          msgType: `${MagicOutgoingWindowMessage.MAGIC_PING}-${this.parameters}`,
          payload: [],
        };

        await this._post(message);
      }
    }, PING_INTERVAL);
  }

  // Debounce revival mechanism
  // Kill any existing PingPong interval
  private stopHeartBeat() {
    this.heartbeatDebounce();

    if (this.heartbeatIntervalTimer) {
      clearInterval(this.heartbeatIntervalTimer);
      this.heartbeatIntervalTimer = null;
    }
  }

  private async reloadIframe() {
    const iframe = await this.iframe;

    // Reset HeartBeat
    this.stopHeartBeat();

    if (iframe) {
      // reload the iframe source
      iframe.src = this.getIframeSrc();
    } else {
      this.init();
      console.warn('Magic SDK: Modal lost, re-initiating');
    }
  }

  async checkIframeExistsInDOM() {
    // Check if the iframe is already in the DOM
    const iframes: HTMLIFrameElement[] = [].slice.call(document.querySelectorAll('.magic-iframe'));
    return iframes.find(iframe => iframe.src.includes(encodeURIComponent(this.parameters)));
  }
}

type Procedure = (...args: any[]) => void;

function debounce<T extends Procedure>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  } as T;
}

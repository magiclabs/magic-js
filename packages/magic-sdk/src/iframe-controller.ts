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
  private lastPongTime: null | number = null;
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
        if (event.data.msgType.includes(MagicIncomingWindowMessage.MAGIC_PONG)) {
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
   * Sends periodic pings to check the connection.
   * If no pong is received or it’s stale, the iframe is reloaded.
   */
  /* istanbul ignore next */
  private heartBeatCheck() {
    let firstPing = true;

    // Helper function to send a ping message.
    const sendPing = async () => {
      const message = {
        msgType: `${MagicOutgoingWindowMessage.MAGIC_PING}-${this.parameters}`,
        payload: [],
      };
      await this._post(message);
    };

    this.heartbeatIntervalTimer = setInterval(async () => {
      // If no pong has ever been received.
      if (!this.lastPongTime) {
        if (!firstPing) {
          // On subsequent ping with no previous pong response, reload the iframe.
          this.reloadIframe();
          firstPing = true;
          return;
        }
      } else {
        // If we have a pong, check how long ago it was received.
        const timeSinceLastPong = Date.now() - this.lastPongTime;
        if (timeSinceLastPong > PING_INTERVAL * 2) {
          // If the pong is too stale, reload the iframe.
          this.reloadIframe();
          firstPing = true;
          return;
        }
      }

      // Send a new ping message and update the counter.
      await sendPing();
      firstPing = false;
    }, PING_INTERVAL);
  }

  // Debounce revival mechanism
  // Kill any existing PingPong interval
  private stopHeartBeat() {
    this.heartbeatDebounce();
    this.lastPongTime = null;

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

function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

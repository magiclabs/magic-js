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
  zIndex: '2147483647',
  // necessary for iOS Safari
  opacity: '0',
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
const PING_INTERVAL = 2 * MINUTE; // 2 minutes
const INITIAL_HEARTBEAT_DELAY = 60 * MINUTE; // 1 hour

/**
 * View controller for the Magic `<iframe>` overlay.
 */
export class IframeController extends ViewController {
  private iframe!: Promise<HTMLIFrameElement>;
  private activeElement: any = null;
  private lastPingTime = Date.now();
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;

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
    iframe.style.opacity = '1';
    this.activeElement = document.activeElement;
    iframe.focus();
  }

  protected async hideOverlay() {
    const iframe = await this.iframe;
    iframe.style.visibility = 'hidden';
    iframe.style.opacity = '0';
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

  private heartBeatCheck() {
    this.intervalTimer = setInterval(async () => {
      const message = { msgType: `${MagicOutgoingWindowMessage.MAGIC_PING}-${this.parameters}`, payload: [] };

      await this._post(message);

      const timeSinceLastPing = Date.now() - this.lastPingTime;

      if (timeSinceLastPing > RESPONSE_DELAY) {
        await this.reloadIframe();
        this.lastPingTime = Date.now();
      }
    }, PING_INTERVAL);
  }

  private async startHeartBeat() {
    const iframe = await this.iframe;

    if (iframe) {
      this.timeoutTimer = setTimeout(() => this.heartBeatCheck(), INITIAL_HEARTBEAT_DELAY);
    }
  }

  private stopHeartBeat() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }

    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  private async reloadIframe() {
    const iframe = await this.iframe;

    if (iframe) {
      iframe.src = this.getIframeSrc();
    } else {
      throw createModalNotReadyError();
    }
  }
}

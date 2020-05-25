import { PayloadTransport } from '@magic-sdk/core';

export class WebTransport extends PayloadTransport {
  /**
   * Initialize the underlying `Window.onmessage` event listener.
   */
  protected init() {
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin === this.endpoint) {
        if (event.data && event.data.msgType && this.messageHandlers.size) {
          // If the response object is undefined, we ensure it's at least an
          // empty object before passing to the event listener.
          /* eslint-disable-next-line no-param-reassign */
          event.data.response = event.data.response ?? {};
          for (const handler of this.messageHandlers.values()) {
            handler(event);
          }
        }
      }
    });
  }
}

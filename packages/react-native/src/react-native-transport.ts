import { PayloadTransport } from '@magic-sdk/provider';
import { MagicMessageEvent } from '@magic-sdk/types';

export class ReactNativeTransport extends PayloadTransport {
  protected init() {}

  /**
   * Route incoming messages from a React Native `<WebView>`.
   */
  public handleReactNativeWebViewMessage(event: any) {
    if (
      event.nativeEvent &&
      event.nativeEvent.url === `${this.endpoint}/send/?params=${encodeURIComponent(this.encodedQueryParams)}` &&
      typeof event.nativeEvent.data === 'string'
    ) {
      const data: any = JSON.parse(event.nativeEvent.data);
      if (data && data.msgType && this.messageHandlers.size) {
        // If the response object is undefined, we ensure it's at least an
        // empty object before passing to the event listener.
        /* eslint-disable-next-line no-param-reassign */
        data.response = data.response ?? {};

        // Reconstruct event from RN event
        const magicEvent: MagicMessageEvent = { data } as MagicMessageEvent;
        for (const handler of this.messageHandlers.values()) {
          handler(magicEvent);
        }
      }
    }
  }
}

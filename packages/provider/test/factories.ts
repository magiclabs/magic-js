import sinon from 'sinon';
import { MAGIC_RELAYER_FULL_URL, ENCODED_QUERY_PARAMS, TEST_API_KEY } from './constants';
import { PayloadTransport } from '../src/core/payload-transport';
import { createSDK, SDKBase } from '../src/core/sdk';
import { ViewController } from '../src/core/view-controller';

export class TestViewController extends ViewController {
  public init = sinon.stub();
  public showOverlay = sinon.stub();
  public hideOverlay = sinon.stub();
  public postMessage = sinon.stub();
}

export class TestPayloadTransport extends PayloadTransport {
  /**
   * Test `init` implementation is the same as our web entry-point.
   */
  public init() {
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

export function createPayloadTransport(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new TestPayloadTransport(endpoint, ENCODED_QUERY_PARAMS);
}

export function createViewController(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new TestViewController(createPayloadTransport(endpoint), endpoint, ENCODED_QUERY_PARAMS);
}

export const TestMagicSDK = createSDK(SDKBase, {
  sdkName: 'magic-sdk',
  target: 'web',
  defaultEndpoint: MAGIC_RELAYER_FULL_URL,
  ViewController: TestViewController,
  PayloadTransport: TestPayloadTransport,
});

export function createMagicSDK(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new TestMagicSDK(TEST_API_KEY, { endpoint });
}

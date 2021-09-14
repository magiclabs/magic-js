/* eslint-disable no-underscore-dangle */

import * as memoryDriver from 'localforage-driver-memory';
import localForage from 'localforage';
import { MAGIC_RELAYER_FULL_URL, ENCODED_QUERY_PARAMS, TEST_API_KEY } from './constants';
import { PayloadTransport, ViewController } from '../src';
import type { SDKEnvironment } from '../src/core/sdk-environment';

export class TestViewController extends ViewController {
  public init = jest.fn();
  public showOverlay = jest.fn();
  public hideOverlay = jest.fn();
  public postMessage = jest.fn();
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
  return new TestViewController(createPayloadTransport(endpoint));
}

export function createMagicSDKCtor(environment: { [P in keyof SDKEnvironment]?: any } = {}) {
  const { createSDK } = jest.requireActual('../src/core/sdk-environment');
  const { SDKBase } = jest.requireActual('../src/core/sdk');

  const TestMagicSDK = createSDK(SDKBase, {
    sdkName: 'magic-sdk',
    platform: 'web',
    version: '1.0.0-test',
    defaultEndpoint: MAGIC_RELAYER_FULL_URL,
    ViewController: TestViewController,
    PayloadTransport: TestPayloadTransport,
    configureStorage: async () => {
      const lf = localForage.createInstance({});

      await lf.defineDriver(memoryDriver);
      await localForage.setDriver([memoryDriver._driver]);
      await lf.setDriver([memoryDriver._driver]);

      return lf;
    },
    ...environment,
  });

  return TestMagicSDK;
}

export function createMagicSDK(environment: { [P in keyof SDKEnvironment]?: any } = {}) {
  const Ctor = createMagicSDKCtor(environment);
  return new Ctor(TEST_API_KEY);
}

export function createMagicSDKTestMode(environment: { [P in keyof SDKEnvironment]?: any } = {}) {
  const Ctor = createMagicSDKCtor(environment);
  return new Ctor(TEST_API_KEY, { testMode: true });
}

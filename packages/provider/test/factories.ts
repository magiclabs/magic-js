import sinon from 'sinon';
import { MAGIC_RELAYER_FULL_URL, ENCODED_QUERY_PARAMS, TEST_API_KEY } from './constants';
import { PayloadTransport } from '../src/core/payload-transport';
import { createSDK, SDKBase } from '../src/core/sdk';
import { ViewController } from '../src/core/view-controller';

class TestViewController extends ViewController {
  public init() {}

  public showOverlay = sinon.stub();
  public hideOverlay = sinon.stub();
  public postMessage = sinon.stub();
}

class TestPayloadTransport extends PayloadTransport {
  public init() {}
}

export function createPayloadTransport(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new TestPayloadTransport(endpoint, ENCODED_QUERY_PARAMS);
}

export function createViewController(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new TestViewController(createPayloadTransport(endpoint), endpoint, ENCODED_QUERY_PARAMS);
}

const TestMagicSDK = createSDK(SDKBase, {
  sdkName: 'magic-sdk',
  target: 'web',
  defaultEndpoint: MAGIC_RELAYER_FULL_URL,
  ViewController: TestViewController,
  PayloadTransport: TestPayloadTransport,
});

export function createMagicSDK(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new TestMagicSDK(TEST_API_KEY, { endpoint });
}

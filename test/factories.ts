import { MAGIC_RELAYER_FULL_URL, ENCODED_QUERY_PARAMS, TEST_API_KEY } from './constants';
import { IframeController } from '../src/core/views/iframe-controller';
import { PayloadTransport } from '../src/core/payload-transport';
import { MagicSDK } from '../src/core/sdk';

export function createPayloadTransport(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new PayloadTransport(endpoint, ENCODED_QUERY_PARAMS);
}

export function createIframeController(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new IframeController(createPayloadTransport(endpoint), endpoint, ENCODED_QUERY_PARAMS);
}

export function createMagicSDK(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new MagicSDK(TEST_API_KEY, { endpoint });
}

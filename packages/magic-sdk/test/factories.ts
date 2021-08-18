import { WebTransport } from '../src/web-transport';
import { MAGIC_RELAYER_FULL_URL, ENCODED_QUERY_PARAMS, TEST_API_KEY } from './constants';
import { IframeController } from '../src/iframe-controller';
import { Magic } from '../src/index';

export function createWebTransport(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new WebTransport(endpoint, ENCODED_QUERY_PARAMS);
}

export function createIframeController(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new IframeController(createWebTransport(endpoint));
}

export function createMagicSDK(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new Magic(TEST_API_KEY, { endpoint });
}

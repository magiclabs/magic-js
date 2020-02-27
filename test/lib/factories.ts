import { MAGIC_RELAYER_FULL_URL, ENCODED_QUERY_PARAMS } from './constants';
import { IframeController } from '../../src/core/iframe-controller';
import { PayloadTransport } from '../../src/core/payload-transport';

export function createPayloadTransport(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new PayloadTransport(endpoint, ENCODED_QUERY_PARAMS);
}

export function createIframeController(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new IframeController(createPayloadTransport(endpoint), endpoint, ENCODED_QUERY_PARAMS);
}

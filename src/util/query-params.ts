import { deflate } from 'pako';
import { EthNetworkConfiguration } from '../types';

/**
 * Compresses arbitrary string data using the well-known zlib algorithm.
 */
function compress(data: string) {
  const charData = data.split('').map(x => x.charCodeAt(0));
  const binData = new Uint8Array(charData);
  return btoa(deflate(binData, { to: 'string' }));
}

/**
 * The shape of encoded query parameters sent along with the `<iframe>` request.
 */
export interface QueryParameters {
  API_KEY?: string;
  DOMAIN_ORIGIN?: string;
  ETH_NETWORK?: EthNetworkConfiguration;
  host?: string;
  sdk?: string;
  version?: string;
}

/**
 * Encode query parameters as a compressed, Base64-encoded JSON string.
 */
export function encodeQueryParameters(options: QueryParameters): string {
  return compress(JSON.stringify(options));
}

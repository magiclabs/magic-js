import { EthNetworkConfiguration } from '../types';

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
  ext?: any;
}

export function encodeQueryParameters(options: QueryParameters): string {
  return btoa(JSON.stringify(options));
}

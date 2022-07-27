import { EthNetworkConfiguration } from '../modules/rpc-provider-types';

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
  locale?: string;
}

import { EthNetworkConfiguration } from '../modules';

export interface MagicSDKAdditionalConfiguration {
  endpoint?: string;
  web3?: {
    network?: EthNetworkConfiguration;
  };
}

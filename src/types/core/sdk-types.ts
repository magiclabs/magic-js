import { EthNetworkConfiguration } from '../modules';
import { Extension } from './extension-types';

export interface MagicSDKAdditionalConfiguration<TExt extends Extension<any>[]> {
  endpoint?: string;
  network?: EthNetworkConfiguration;
  extensions?: TExt;
}

import { EthNetworkConfiguration } from '../modules';
import { Extension } from './extension-types';

export interface MagicSDKAdditionalConfiguration<
  TCustomExtName extends string,
  TExt extends Extension<string>[] | { [P in TCustomExtName]: Extension<string> }
> {
  endpoint?: string;
  network?: EthNetworkConfiguration;
  extensions?: TExt;
}

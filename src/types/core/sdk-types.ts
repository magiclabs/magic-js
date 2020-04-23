import { EthNetworkConfiguration } from '../modules';
import { Extension } from './extension-types';

export interface MagicSDKAdditionalConfiguration<
  TCustomExtName extends string = string,
  TExt extends Extension<string>[] | { [P in TCustomExtName]: Extension<string> } = any[]
> {
  endpoint?: string;
  network?: EthNetworkConfiguration;
  extensions?: TExt;
}

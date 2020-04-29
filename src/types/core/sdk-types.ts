import { EthNetworkConfiguration } from '../modules';
import { Extension } from '../../modules/base-extension';

export interface MagicSDKAdditionalConfiguration<
  TCustomExtName extends string = string,
  TExt extends Extension<string>[] | { [P in TCustomExtName]: Extension<string> } = any
> {
  endpoint?: string;
  network?: EthNetworkConfiguration;
  extensions?: TExt;
}

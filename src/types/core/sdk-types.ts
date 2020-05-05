import { EthNetworkConfiguration } from '../modules/rpc-provider-types';
import { Extension } from '../../modules/base-extension';

export interface MagicSDKAdditionalConfiguration<
  TCustomExtName extends string = string,
  TExt extends Extension<string>[] | { [P in TCustomExtName]: Extension<string> } = any
> {
  endpoint?: string;
  network?: EthNetworkConfiguration;
  extensions?: TExt;
}

export type MagicSDKReactNativeAdditionalConfiguration<
  TCustomExtName extends string = string,
  TExt extends Extension<string>[] | { [P in TCustomExtName]: Extension<string> } = any
> = Omit<MagicSDKAdditionalConfiguration<TCustomExtName, TExt>, 'endpoint'>;

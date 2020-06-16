import 'regenerator-runtime/runtime';

import { SDKBase, createSDK } from '@magic-sdk/provider';
import { IframeController } from './iframe-controller';
import { WebTransport } from './web-transport';

export {
  Extension,
  MagicSDKError as SDKError,
  MagicExtensionError as ExtensionError,
  MagicRPCError as RPCError,
  MagicSDKWarning as SDKWarning,
  MagicSDKAdditionalConfiguration,
} from '@magic-sdk/provider';

export * from '@magic-sdk/types';

export const Magic = createSDK(SDKBase, {
  target: 'web',
  sdkName: 'magic-sdk',
  version: process.env.WEB_VERSION!,
  defaultEndpoint: 'https://auth.magic.link/',
  ViewController: IframeController,
  PayloadTransport: WebTransport,
});

export type Magic = InstanceType<typeof Magic>;

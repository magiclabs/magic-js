import 'regenerator-runtime/runtime';

import { SDKBase, createSDK } from '@magic-sdk/provider';
import { IframeController } from './iframe-controller';
import { WebTransport } from './web-transport';

export {
  Extension,
  MagicSDKError as SDKError,
  MagicSDKWarning as SDKWarning,
  MagicRPCError as RPCError,
  MagicSDKAdditionalConfiguration,
} from '@magic-sdk/provider';

export * from '@magic-sdk/types';

export const Magic = createSDK(SDKBase, {
  target: 'web',
  sdkName: 'magic-sdk',
  defaultEndpoint: 'https://auth.magic.link/',
  ViewController: IframeController,
  PayloadTransport: WebTransport,
});

export type Magic = InstanceType<typeof Magic>;

import 'regenerator-runtime/runtime';

import { SDKBase, createSDKCtor } from '@magic-sdk/core';
import { IframeController } from './iframe-controller';
import { WebTransport } from './web-transport';

export {
  Extension,
  MagicSDKError as SDKError,
  MagicSDKWarning as SDKWarning,
  MagicRPCError as RPCError,
  MagicSDKAdditionalConfiguration,
} from '@magic-sdk/core';

export * from '@magic-sdk/types';

export const Magic = createSDKCtor(SDKBase, {
  target: 'web',
  sdkName: 'magic-sdk',
  ViewController: IframeController,
  PayloadTransport: WebTransport,
});

export type Magic = InstanceType<typeof Magic>;

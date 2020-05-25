import { SDKBase, createSDKCtor } from '@magic-sdk/core';
import { IframeController } from './iframe-controller';
import { WebTransport } from './web-transport';

export {
  Extension,
  MagicSDKError as SDKError,
  MagicSDKWarning as SDKWarning,
  MagicRPCError as RPCError,
} from '@magic-sdk/core';

export * from '@magic-sdk/core/types';

export const Magic = createSDKCtor(SDKBase, IframeController, WebTransport);
export type Magic = InstanceType<typeof Magic>;

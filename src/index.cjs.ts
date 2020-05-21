// CJS entry-point

import { MagicSDK } from './core/sdk';

export {
  MagicSDKError as SDKError,
  MagicSDKWarning as SDKWarning,
  MagicRPCError as RPCError,
} from './core/sdk-exceptions';
export { Extension } from './modules/base-extension';
export * from './types';

export const Magic = MagicSDK;
export type Magic = InstanceType<typeof MagicSDK>;

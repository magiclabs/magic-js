// CJS entry-point

export { MagicSDK as Magic } from './core/sdk';
export {
  MagicSDKError as SDKError,
  MagicSDKWarning as SDKWarning,
  MagicRPCError as RPCError,
} from './core/sdk-exceptions';
export { Extension } from './modules/base-extension';
export * from './types';

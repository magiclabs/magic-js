// Only re-export modules & types that are intended
// for the public API from this file.

export {
  Extension,
  MagicSDKError as SDKError,
  MagicExtensionError as ExtensionError,
  MagicExtensionWarning as ExtensionWarning,
  MagicRPCError as RPCError,
  MagicSDKWarning as SDKWarning,
  isPromiEvent,
} from '@magic-sdk/provider';

export type { MagicSDKAdditionalConfiguration, MagicSDKExtensionsOption, PromiEvent } from '@magic-sdk/provider';

export * from '@magic-sdk/types';

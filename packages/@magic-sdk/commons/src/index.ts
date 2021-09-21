// Only re-export modules & types that are intended
// for the public API from this file.

export {
  Extension,
  MagicSDKError as SDKError,
  MagicExtensionError as ExtensionError,
  MagicExtensionWarning as ExtensionWarning,
  MagicRPCError as RPCError,
  MagicSDKWarning as SDKWarning,
  MagicSDKAdditionalConfiguration,
  MagicSDKExtensionsOption,
  PromiEvent,
  isPromiEvent,
} from '@magic-sdk/provider';

export * from '@magic-sdk/types';

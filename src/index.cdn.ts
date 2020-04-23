// CDN entry-point

import { MagicSDK } from './core/sdk';
import { MagicSDKError, MagicSDKWarning, MagicRPCError } from './core/sdk-exceptions';
import { Extension } from './modules/base-extension';
import * as types from './types';

// NOTE: enums are emitted by TypeScript -- in the CDN bundle we attach public
// enums and error classes as static members of the `MagicSDK` class.
Object.assign(MagicSDK, {
  ...types,
  SDKError: MagicSDKError,
  SDKWarning: MagicSDKWarning,
  RPCError: MagicRPCError,
  Extension,
});

export { MagicSDK as default };

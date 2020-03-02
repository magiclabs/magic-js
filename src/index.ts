import { MagicSDK } from './core/sdk';
import { MagicSDKError, MagicSDKWarning, MagicRPCError } from './core/sdk-exceptions';
import * as types from './types';

// NOTE: enums are emitted by TypeScript -- in the bundle we attach public enums
// as static members of the `Fortmatic` class.
Object.assign(MagicSDK, { ...types, MagicSDKError, MagicSDKWarning, MagicRPCError });

export { MagicSDK as default };
export { MagicSDKError, MagicSDKWarning, MagicRPCError };
export * from './types';

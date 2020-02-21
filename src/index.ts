import { MagicSDK } from './core/sdk';
import * as types from './types';

// NOTE: enums are emitted by TypeScript -- in the bundle we attach public enums
// as static members of the `Fortmatic` class. This enables us to
Object.assign(MagicSDK, types);

export { MagicSDK as default };
export * from './types';

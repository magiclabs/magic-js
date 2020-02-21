import { Fortmatic } from './core/sdk';
import * as types from './types';

// NOTE: enums are emitted by TypeScript -- in the bundle we attach public enums
// as static members of the `Fortmatic` class. This enables us to
Object.assign(Fortmatic, types);

export { Fortmatic as default };
export * from './types';

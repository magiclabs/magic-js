import { SDKBase, createSDKCtor, Extension, MagicSDKError, MagicSDKWarning, MagicRPCError } from '@magic-sdk/core';
import * as types from '@magic-sdk/types';
import { IframeController } from './iframe-controller';
import { WebTransport } from './web-transport';

const Magic = createSDKCtor(SDKBase, {
  target: 'web',
  sdkName: 'magic-sdk',
  ViewController: IframeController,
  PayloadTransport: WebTransport,
});

// NOTE: enums are emitted by TypeScript -- in the CDN bundle we attach public
// enums and error classes as static members of the `MagicSDK` class.
Object.assign(Magic, {
  ...types,
  SDKError: MagicSDKError,
  SDKWarning: MagicSDKWarning,
  RPCError: MagicRPCError,
  Extension,
});

export { Magic as default };

import { SDKBase, createSDK, Extension, MagicSDKError, MagicSDKWarning, MagicRPCError } from '@magic-sdk/core';
import * as types from '@magic-sdk/types';
import { IframeController } from './iframe-controller';
import { WebTransport } from './web-transport';

const Magic = createSDK(SDKBase, {
  target: 'web',
  sdkName: 'magic-sdk',
  defaultEndpoint: 'https://auth.magic.link/',
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

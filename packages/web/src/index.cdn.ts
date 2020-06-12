import 'regenerator-runtime/runtime';

import {
  SDKBase,
  createSDK,
  Extension,
  MagicSDKError,
  MagicExtensionError,
  MagicRPCError,
  MagicSDKWarning,
} from '@magic-sdk/provider';
import * as types from '@magic-sdk/types';
import { IframeController } from './iframe-controller';
import { WebTransport } from './web-transport';

const Magic = createSDK(SDKBase, {
  target: 'web',
  sdkName: 'magic-sdk',
  version: process.env.WEB_VERSION!,
  defaultEndpoint: 'https://auth.magic.link/',
  ViewController: IframeController,
  PayloadTransport: WebTransport,
});

// NOTE: enums are emitted by TypeScript -- in the CDN bundle we attach public
// enums and error classes as static members of the `MagicSDK` class.
Object.assign(Magic, {
  ...types,
  SDKError: MagicSDKError,
  ExtensionError: MagicExtensionError,
  RPCError: MagicRPCError,
  SDKWarning: MagicSDKWarning,
  Extension,
});

export { Magic as default };

/* eslint-disable no-underscore-dangle */

import 'regenerator-runtime/runtime';

import {
  SDKBase,
  createSDK,
  Extension,
  MagicSDKError,
  MagicExtensionError,
  MagicExtensionWarning,
  MagicRPCError,
  MagicSDKWarning,
} from '@magic-sdk/provider';
import * as types from '@magic-sdk/types';
import localForage from 'localforage';
import * as memoryDriver from 'localforage-driver-memory';
import { IframeController } from './iframe-controller';
import { WebTransport } from './web-transport';

const Magic = createSDK(SDKBase, {
  target: 'web',
  sdkName: 'magic-sdk',
  version: process.env.WEB_VERSION!,
  defaultEndpoint: 'https://auth.magic.link/',
  ViewController: IframeController,
  PayloadTransport: WebTransport,
  configureStorage: /* istanbul ignore next */ async () => {
    localForage.config({
      name: 'MagicAuthSDK',
      storeName: 'magic_auth_sdk_local_store',
    });

    await localForage.defineDriver(memoryDriver);
    await localForage.setDriver([localForage.INDEXEDDB, localForage.LOCALSTORAGE, memoryDriver._driver]);
  },
});

// NOTE: enums are emitted by TypeScript -- in the CDN bundle we attach public
// enums and error classes as static members of the `MagicSDK` class.
Object.assign(Magic, {
  ...types,
  SDKError: MagicSDKError,
  ExtensionError: MagicExtensionError,
  ExtensionWarning: MagicExtensionWarning,
  RPCError: MagicRPCError,
  SDKWarning: MagicSDKWarning,
  Extension,
});

export { Magic as default };

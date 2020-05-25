/* eslint-disable global-require */

import { SDKBase, createSDKCtor } from '@magic-sdk/core';
import { ReactNativeWebViewController } from './react-native-webview-controller';
import { ReactNativeTransport } from './react-native-transport';

// We expect `global.process` to be a Node Process, so we have to replace it
// here.
global.process = require('process');

// WHATWG URL requires global `Buffer` access.
if (typeof global.Buffer === 'undefined') global.Buffer = require('buffer').Buffer;

process.browser = false;

// Web3 assumes a browser context, so we need to provide a `btoa` shim.
if (typeof btoa === 'undefined') {
  global.btoa = str => {
    return Buffer.from(str, 'binary').toString('base64');
  };
}

// Web3 assumes a browser context, so we need to provide an `atob` shim.
if (typeof atob === 'undefined') {
  global.atob = b64Encoded => {
    return Buffer.from(b64Encoded, 'base64').toString('binary');
  };
}

if (typeof URL === 'undefined') {
  global.URL = require('whatwg-url').URL;
}

export {
  Extension,
  MagicSDKError as SDKError,
  MagicSDKWarning as SDKWarning,
  MagicRPCError as RPCError,
} from '@magic-sdk/core';

export * from '@magic-sdk/core/types';

class SDKBaseReactNative extends SDKBase {
  public get Relayer() {
    return (this.overlay as ReactNativeWebViewController).Relayer;
  }
}

export const Magic = createSDKCtor(SDKBaseReactNative, ReactNativeWebViewController, ReactNativeTransport);
export type Magic = InstanceType<typeof Magic>;

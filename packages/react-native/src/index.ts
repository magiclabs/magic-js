/* eslint-disable global-require */

import 'regenerator-runtime/runtime';

import { createSDK } from '@magic-sdk/provider';
import { ReactNativeWebViewController } from './react-native-webview-controller';
import { ReactNativeTransport } from './react-native-transport';
import { SDKBaseReactNative } from './react-native-sdk-base';

// We expect `global.process` to be a Node Process, so we have to replace it
// here.
global.process = require('process');

// WHATWG URL requires global `Buffer` access.
/* istanbul ignore next */
// We cannot test this code path without causing problems for Ava & TS Node.
// Unfortunatley, we must ignore it.
if (typeof global.Buffer === 'undefined') global.Buffer = require('buffer').Buffer;

(process as any).browser = false;

// Web3 assumes a browser context, so we need to provide a `btoa` shim.
if (typeof btoa === 'undefined') {
  /* istanbul ignore next */
  global.btoa = str => {
    return Buffer.from(str, 'binary').toString('base64');
  };
}

// Web3 assumes a browser context, so we need to provide an `atob` shim.
if (typeof atob === 'undefined') {
  /* istanbul ignore next */
  global.atob = b64Encoded => {
    return Buffer.from(b64Encoded, 'base64').toString('binary');
  };
}

/* istanbul ignore next */
// We cannot test this code path without causing problems for Ava & TS Node.
// Unfortunatley, we must ignore it.
if (typeof URL === 'undefined') {
  global.URL = require('whatwg-url').URL;
}

export {
  Extension,
  MagicSDKError as SDKError,
  MagicSDKWarning as SDKWarning,
  MagicRPCError as RPCError,
  MagicSDKAdditionalConfiguration,
} from '@magic-sdk/provider';

export * from '@magic-sdk/types';

export const Magic = createSDK(SDKBaseReactNative, {
  target: 'react-native',
  sdkName: 'magic-sdk-rn',
  defaultEndpoint: 'https://box.magic.link/',
  ViewController: ReactNativeWebViewController,
  PayloadTransport: ReactNativeTransport,
});

export type Magic = InstanceType<typeof Magic>;

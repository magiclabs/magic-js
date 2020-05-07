// React Native entry-point
/* eslint-disable global-require */

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

export { MagicSDKReactNative as Magic } from './core/sdk';
export {
  MagicSDKError as SDKError,
  MagicSDKWarning as SDKWarning,
  MagicRPCError as RPCError,
} from './core/sdk-exceptions';
export { Extension } from './modules/base-extension';
export * from './types';

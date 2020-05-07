// React Native entry-point
/* eslint-disable global-require */

if (typeof global.process === 'undefined') global.process = require('process');
if (typeof global.Buffer === 'undefined') global.Buffer = require('buffer').Buffer;

process.browser = false;

if (typeof btoa === 'undefined') {
  global.btoa = str => {
    return Buffer.from(str, 'binary').toString('base64');
  };
}

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

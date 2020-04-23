// React Native entry-point

import process from 'process';
import { Buffer } from 'buffer';

global.process = process;
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
export * from './types';

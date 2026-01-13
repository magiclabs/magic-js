/* istanbul ignore file */

import 'regenerator-runtime/runtime';

import { createSDK, InstanceWithExtensions, MagicSDKExtensionsOption } from '@magic-sdk/provider';
import * as processPolyfill from 'process';
import { URL as URLPolyfill, URLSearchParams as URLSearchParamsPolyfill } from 'whatwg-url';
import { Buffer } from 'buffer';
import _ from 'lodash';
import { getBundleId } from 'react-native-device-info';
import { ReactNativeWebViewController } from './react-native-webview-controller';
import { SDKBaseReactNative } from './react-native-sdk-base';
import type localForage from 'localforage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Web3 assumes a browser context, so we need
// to provide `btoa` and `atob` shims.

// We expect `global.process` to be a Node Process for web3.js usage
// so we replace it here.
global.process = _.merge(global.process, processPolyfill);

(global.process as any).browser = false;

// WHATWG URL requires global `Buffer` access.
global.Buffer = Buffer;

// Setup global WHATWG URL polyfills
global.URL = URLPolyfill as any;
global.URLSearchParams = URLSearchParamsPolyfill as any;

/* istanbul ignore next */
global.btoa = str => Buffer.from(str, 'binary').toString('base64');
/* istanbul ignore next */
global.atob = b64Encoded => Buffer.from(b64Encoded, 'base64').toString('binary');

export * from '@magic-sdk/provider';
export * from '@magic-sdk/types';

export const Magic = createSDK(SDKBaseReactNative, {
  platform: 'react-native',
  sdkName: '@magic-sdk/react-native-bare',
  version: '34.1.0',
  bundleId: getBundleId(),
  defaultEndpoint: 'https://box.magic.link/',
  ViewController: ReactNativeWebViewController,
  configureStorage: /* istanbul ignore next */ async () => {
    return {
      ready: async () => Promise.resolve(true),
      getItem: AsyncStorage.getItem,
      setItem: AsyncStorage.setItem,
      removeItem: AsyncStorage.removeItem,
      clear: AsyncStorage.clear,
      length: () => {},
      key: () => {},
      keys: AsyncStorage.getAllKeys,
      iterate: () => {},
    } as unknown as typeof localForage;
  },
});

export type Magic<T extends MagicSDKExtensionsOption<any> = MagicSDKExtensionsOption> = InstanceWithExtensions<
  SDKBaseReactNative,
  T
>;

export { useInternetConnection } from './hooks';

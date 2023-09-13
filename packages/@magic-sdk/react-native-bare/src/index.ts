/*
  eslint-disable

  global-require,
  @typescript-eslint/no-var-requires
 */

/* istanbul ignore file */

import 'regenerator-runtime/runtime';

import { createSDK, InstanceWithExtensions, MagicSDKExtensionsOption } from '@magic-sdk/provider';
import * as processPolyfill from 'process';
import localForage from 'localforage';
import { URL as URLPolyfill, URLSearchParams as URLSearchParamsPolyfill } from 'whatwg-url';
import { Buffer } from 'buffer';
import * as _ from 'lodash';
import { getBundleId } from 'react-native-device-info';
import { driverWithoutSerialization } from '@aveq-research/localforage-asyncstorage-driver';
import * as memoryDriver from 'localforage-driver-memory';
import { ReactNativeWebViewController } from './react-native-webview-controller';
import { SDKBaseReactNative } from './react-native-sdk-base';

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
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
/* istanbul ignore next */
global.atob = (b64Encoded) => Buffer.from(b64Encoded, 'base64').toString('binary');

export * from '@magic-sdk/commons';

export const Magic = createSDK(SDKBaseReactNative, {
  platform: 'react-native',
  sdkName: '@magic-sdk/react-native-bare',
  version: process.env.BARE_REACT_NATIVE_VERSION!,
  bundleId: getBundleId(),
  defaultEndpoint: 'https://box.magic.link/',
  ViewController: ReactNativeWebViewController,
  configureStorage: /* istanbul ignore next */ async () => {
    const lf = localForage.createInstance({
      name: 'MagicAuthLocalStorageDB',
      storeName: 'MagicAuthLocalStorage',
    });

    const driver = driverWithoutSerialization();
    await Promise.all([lf.defineDriver(driver), lf.defineDriver(memoryDriver)]);
    await lf.setDriver([driver._driver, memoryDriver._driver]);

    return lf;
  },
});

export type Magic<T extends MagicSDKExtensionsOption<any> = MagicSDKExtensionsOption> = InstanceWithExtensions<
  SDKBaseReactNative,
  T
>;

/*
  eslint-disable

  global-require,
  @typescript-eslint/no-var-requires,
  no-underscore-dangle
 */

import { createSDK } from '@magic-sdk/provider';
import * as processPolyfill from 'process';
import localForage from 'localforage';
import { URL as URLPolyfill, URLSearchParams as URLSearchParamsPolyfill } from 'whatwg-url';
import { Buffer } from 'buffer';
import * as _ from 'lodash';
import { driverWithoutSerialization } from '@aveq-research/localforage-asyncstorage-driver';
import * as memoryDriver from 'localforage-driver-memory';
import { ReactNativeWebViewController } from './react-native-webview-controller';
import { ReactNativeTransport } from './react-native-transport';
import { SDKBaseReactNative } from './react-native-sdk-base';

// We expect `global.process` to be a Node Process for web3.js usage
// so we replace it here.
global.process = _.merge(global.process, processPolyfill);

(global.process as any).browser = false;

// WHATWG URL requires global `Buffer` access.
global.Buffer = Buffer;

// Setup global WHATWG URL polyfills
global.URL = URLPolyfill as any;
global.URLSearchParams = URLSearchParamsPolyfill as any;

// Web3 assumes a browser context, so we need
// to provide `btoa` and `atob` shims.

/* istanbul ignore next */
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
/* istanbul ignore next */
global.atob = (b64Encoded) => Buffer.from(b64Encoded, 'base64').toString('binary');

export * from '@magic-sdk/commons';

export const Magic = createSDK(SDKBaseReactNative, {
  platform: 'react-native',
  sdkName: '@magic-sdk/react-native',
  version: '%REACT_NATIVE_VERSION%',
  defaultEndpoint: 'https://box.magic.link/',
  ViewController: ReactNativeWebViewController,
  PayloadTransport: ReactNativeTransport,
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

export type Magic = InstanceType<typeof Magic>;

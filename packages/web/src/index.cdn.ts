/* eslint-disable no-underscore-dangle */

import 'regenerator-runtime/runtime';

import { SDKBase, createSDK } from '@magic-sdk/provider';
import * as publicAPI from '@magic-sdk/commons';
import localForage from 'localforage';
import memoryDriver from 'localforage-driver-memory';
import { IframeController } from './iframe-controller';
import { WebTransport } from './web-transport';

const Magic = createSDK(SDKBase, {
  platform: 'web',
  sdkName: 'magic-sdk',
  version: '%WEB_VERSION%',
  defaultEndpoint: 'https://auth.magic.link/',
  ViewController: IframeController,
  PayloadTransport: WebTransport,
  configureStorage: /* istanbul ignore next */ async () => {
    const lf = localForage.createInstance({
      name: 'MagicAuthLocalStorageDB',
      storeName: 'MagicAuthLocalStorage',
    });

    await lf.defineDriver(memoryDriver);
    await lf.setDriver([localForage.INDEXEDDB, localForage.LOCALSTORAGE, memoryDriver._driver]);

    return lf;
  },
});

// NOTE: enums are emitted by TypeScript -- in the CDN bundle we attach public
// enums and error classes as static members of the `MagicSDK` class.
Object.assign(Magic, { ...publicAPI });

export { Magic as default };

/* istanbul ignore file */

import { SDKBase, createSDK } from '@magic-sdk/provider';
import * as publicAPI from '@magic-sdk/commons';
import localForage from 'localforage';
import * as memoryDriver from 'localforage-driver-memory';
import { IframeController } from './iframe-controller';

// NOTE: enums are emitted by TypeScript -- in the CDN bundle we attach public
// enums and error classes as static members of the `MagicSDK` class.
const Magic = Object.assign(
  createSDK(SDKBase, {
    platform: 'web',
    sdkName: 'magic-sdk',
    version: process.env.WEB_VERSION!,
    defaultEndpoint: 'https://auth.magic.link/',
    ViewController: IframeController,
    configureStorage: /* istanbul ignore next */ async () => {
      const lf = localForage.createInstance({
        name: 'MagicAuthLocalStorageDB',
        storeName: 'MagicAuthLocalStorage',
      });

      await lf.defineDriver(memoryDriver);
      await lf.setDriver([localForage.INDEXEDDB, localForage.LOCALSTORAGE, memoryDriver._driver]);

      return lf;
    },
  }),

  { ...publicAPI },
);

export default Magic;

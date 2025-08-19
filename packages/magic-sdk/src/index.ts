/* istanbul ignore file */
// Deprecate test API key in v7.0.0

import { SDKBase, createSDK, InstanceWithExtensions, MagicSDKExtensionsOption } from '@magic-sdk/provider';
import localForage from 'localforage';
import * as memoryDriver from 'localforage-driver-memory';
import { IframeController } from './iframe-controller';

export * from '@magic-sdk/commons';

export const Magic = createSDK(SDKBase, {
  platform: 'web',
  sdkName: 'magic-sdk',
  version: process.env.WEB_VERSION!,
  defaultEndpoint: 'https://auth.magic.link/',
  ViewController: IframeController,
  configureStorage: async () => {
    const lf = localForage.createInstance({
      name: 'MagicAuthLocalStorageDB',
      storeName: 'MagicAuthLocalStorage',
    });

    await lf.defineDriver(memoryDriver);
    await lf.setDriver([localForage.INDEXEDDB, localForage.LOCALSTORAGE, memoryDriver._driver]);

    return lf;
  },
});

export type Magic<T extends MagicSDKExtensionsOption<any> = MagicSDKExtensionsOption> = InstanceWithExtensions<
  SDKBase,
  T
>;

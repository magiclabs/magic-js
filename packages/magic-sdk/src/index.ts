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
  version: (() => {
    try {
      // Use a dynamic require that bundlers can't resolve at build time
      // Path from dist/cjs/ to package.json
      const pkgPath = '../../package.json';
      return eval('require')(pkgPath).version;
    } catch {
      // Fallback if require fails (shouldn't happen in normal usage)
      return '0.0.0';
    }
  })(),
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

/* eslint-disable no-underscore-dangle */

import { SDKBase, createSDK } from '@magic-sdk/provider';
import localForage from 'localforage';
import * as memoryDriver from 'localforage-driver-memory';
import { IframeController } from './iframe-controller';
import { WebTransport } from './web-transport';

export {
  Extension,
  MagicSDKError as SDKError,
  MagicExtensionError as ExtensionError,
  MagicExtensionWarning as ExtensionWarning,
  MagicRPCError as RPCError,
  MagicSDKWarning as SDKWarning,
  MagicSDKAdditionalConfiguration,
  PromiEvent,
  isPromiEvent,
} from '@magic-sdk/provider';

export * from '@magic-sdk/types';

export const Magic = createSDK(SDKBase, {
  target: 'web',
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

export type Magic = InstanceType<typeof Magic>;

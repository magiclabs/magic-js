import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
  jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      proxyLocalForageMethod: () => null,
      getItem: () => null,
      removeItem: () => null,
    };
  });
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.logout())).toBeTruthy();
});

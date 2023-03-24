import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Should throw error if incorrect wallet connect config passed to sdk', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn(() => {
    return {
      on: () => null,
    };
  });

  jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      getItem: () => 'wallet_connect',
    };
  });

  expect(() => magic.wallet.getProvider()).rejects.toThrow();
});

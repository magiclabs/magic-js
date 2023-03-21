import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Throws error if no provider config', () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      getItem: () => 'coinbase_wallet',
    };
  });

  expect(() => magic.wallet.getProvider()).rejects.toThrow();
});

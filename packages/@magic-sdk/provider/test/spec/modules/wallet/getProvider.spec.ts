import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Should return magic.rpcProvider if no stored wallet', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      getItem: () => null,
    };
  });

  const provider = await magic.wallet.getProvider();
  expect(provider).toEqual(magic.rpcProvider);
});

import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Should return coinbase provider if metamask is the stored wallet', async () => {
  const provider = {
    isCoinbaseWallet: true,
  };
  (window as any).ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      getItem: () => 'coinbase_wallet',
    };
  });

  const response = await magic.wallet.getProvider();
  expect(response).toEqual(provider);
});

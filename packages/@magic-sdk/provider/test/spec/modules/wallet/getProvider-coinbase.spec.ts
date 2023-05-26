import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { mockLocalForage } from '../../../mocks';
import * as storage from '../../../../src/util/storage';

beforeEach(() => {
  browserEnv.restore();

  mockLocalForage();
});

test('Should return coinbase provider if metamask is the stored wallet', async () => {
  const provider = {
    isCoinbaseWallet: true,
  };
  (window as any).ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  await storage.setItem('mc_active_wallet', 'coinbase_wallet');

  const response = await magic.wallet.getProvider();
  expect(response).toEqual(provider);
});

import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import * as storage from '../../../../src/util/storage';
import { mockLocalForage } from '../../../mocks';

beforeEach(() => {
  browserEnv.restore();

  mockLocalForage();
});

test('Should return metamask provider if metamask is the stored wallet', async () => {
  const provider = {
    isMetaMask: true,
  };
  (window as any).ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  await storage.setItem('mc_active_wallet', 'metamask');

  const response = await magic.wallet.getProvider();
  expect(response).toEqual(provider);
});

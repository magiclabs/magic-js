import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import * as storage from '../../../../src/util/storage';
import { mockLocalForage } from '../../../mocks';

beforeEach(() => {
  browserEnv.restore();

  mockLocalForage();
});

test('Should return magic.rpcProvider if no stored wallet', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  await storage.setItem('mc_active_wallet', null);

  const provider = await magic.wallet.getProvider();
  expect(provider).toEqual(magic.rpcProvider);
});

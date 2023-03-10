import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Should return magic.rpcProvider if no stored wallet', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const provider = await magic.wallet.getProvider();
  expect(provider).toEqual(magic.rpcProvider);
});

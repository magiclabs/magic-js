import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Should return metamask provider if metamask is the stored wallet', async () => {
  const provider = {
    isMetaMask: true,
  };
  window.ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      getItem: () => 'metamask',
    };
  });

  const response = await magic.wallet.getProvider();
  expect(response).toEqual(provider);
});

import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Returns env object with isMetaMaskInstalled true', async () => {
  const provider = {
    isMetaMask: true,
  };
  window.ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.getUserEnv();
  expect(response).toEqual({
    env: {
      isMetaMaskInstalled: true,
      isCoinbaseWalletInstalled: false,
    },
  });
});

test('Returns env object with isCoinbaseWalletInstalled true', async () => {
  const provider = {
    isCoinbaseWallet: true,
  };
  window.ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.getUserEnv();
  expect(response).toEqual({
    env: {
      isMetaMaskInstalled: false,
      isCoinbaseWalletInstalled: true,
    },
  });
});

import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Return undefined if MetaMask is not installed', async () => {
  window.ethereum = undefined;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.getMetaMaskProvider();
  expect(response).toEqual(undefined);
});

test('Return provider if MetaMask is installed, and no other providers', async () => {
  const provider = {
    isMetaMask: true,
  };
  window.ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.getMetaMaskProvider();
  expect(response).toEqual(provider);
});

test('Return MetaMask provider if multiple providers found, and MetaMask is one of them', async () => {
  const ethereum = {
    providers: [
      {
        isMetaMask: true,
      },
      {
        isCoinbaseWallet: true,
      },
    ],
  };
  (window as any).ethereum = ethereum;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.getMetaMaskProvider();
  expect(response).toEqual({
    isMetaMask: true,
  });
});

test('Return provider at window.ethereum if multiple providers found, and MetaMask is not one of them', async () => {
  const ethereum = {
    providers: [
      {
        isAnotherWalletProvider: true,
      },
      {
        isCoinbaseWallet: true,
      },
    ],
  };
  (window as any).ethereum = ethereum;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.getMetaMaskProvider();
  expect(response).toEqual(ethereum);
});

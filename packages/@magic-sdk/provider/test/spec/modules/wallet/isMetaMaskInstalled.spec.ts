import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Return false if provider.isMetaMask is undefined', async () => {
  (window as any).ethereum = undefined;
  const magic = createMagicSDK();

  const response = magic.wallet.isMetaMaskInstalled();
  expect(response).toEqual(false);
});

test('Return false if window.ethereum.isMetaMask is false', async () => {
  const provider = {
    isMetaMask: false,
  };
  (window as any).ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isMetaMaskInstalled();
  expect(response).toEqual(false);
});

test('Return true if window.ethereum.isMetaMask is true', async () => {
  const provider = {
    isMetaMask: true,
  };
  (window as any).ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isMetaMaskInstalled();
  expect(response).toEqual(true);
});

test('Return false if providers is array of undefined and is not metamask', async () => {
  (window as any).ethereum = { providers: [undefined] };
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isMetaMaskInstalled();
  expect(response).toEqual(false);
});

test('Return true if multiple providers found, and MetaMask is one of them', async () => {
  const ethereum = {
    isMetaMask: false,
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

  const response = magic.wallet.isMetaMaskInstalled();
  expect(response).toEqual(true);
});

test('Return false if multiple providers found, and MetaMask is not one of them', async () => {
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

  const response = magic.wallet.isMetaMaskInstalled();
  expect(response).toEqual(false);
});

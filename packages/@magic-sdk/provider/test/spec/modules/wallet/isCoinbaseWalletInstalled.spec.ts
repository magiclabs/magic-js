import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Return false if window.ethereum is undefined', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isCoinbaseWalletInstalled();
  expect(response).toEqual(false);
});

test('Return false if window.ethereum is array of undefined', async () => {
  const provider = { providers: [undefined] };
  (window as any).ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isCoinbaseWalletInstalled();
  expect(response).toEqual(false);
});

test('Return true if window.ethereum.isCoinbaseWallet is true', async () => {
  const provider = {
    isCoinbaseWallet: true,
  };
  (window as any).ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isCoinbaseWalletInstalled();
  expect(response).toEqual(true);
});

test('Return true if multiple providers found, and Coinbase Wallet is one of them', async () => {
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

  const response = magic.wallet.isCoinbaseWalletInstalled();
  expect(response).toEqual(true);
});

test('Return false if multiple providers found, and Coinbase Wallet is not one of them', async () => {
  const ethereum = {
    providers: [
      {
        isAnotherWalletProvider: true,
      },
      {
        isMetaMask: true,
      },
    ],
  };
  (window as any).ethereum = ethereum;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isCoinbaseWalletInstalled();
  expect(response).toEqual(false);
});

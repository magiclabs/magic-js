import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Return undefined if Coinbase is not installed', async () => {
  (window as any).ethereum = undefined;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.getCoinbaseProvider();
  expect(response).toEqual(undefined);
});

test('Return window.ethereum if providers array contains undefined', async () => {
  (window as any).ethereum = { providers: [undefined] };
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.getCoinbaseProvider();
  expect(response).toEqual((window as any).ethereum);
});

test('Return provider if Coinbase is installed, and no other providers', async () => {
  const provider = {
    isCoinbaseWallet: true,
  };
  (window as any).ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.getCoinbaseProvider();
  expect(response).toEqual(provider);
});

test('Return Coinbase provider if multiple providers found, and Coinbase is one of them', async () => {
  const ethereum = {
    providers: [
      {
        isCoinbaseWallet: true,
      },
      {
        isMetaMask: true,
      },
    ],
  };
  (window as any).ethereum = ethereum;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.getCoinbaseProvider();
  expect(response).toEqual({
    isCoinbaseWallet: true,
  });
});

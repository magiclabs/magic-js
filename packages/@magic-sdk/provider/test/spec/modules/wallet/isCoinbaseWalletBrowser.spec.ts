import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Returns true if provider.isCoinbaseBrowser is true', async () => {
  const provider = {
    isCoinbaseBrowser: true,
  };
  (window as any).ethereum = provider;

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isCoinbaseWalletBrowser();
  expect(response).toEqual(true);
});

test('Returns false if provider.isCoinbaseBrowser is not true', async () => {
  const provider = {
    isMetaMask: true,
  };
  (window as any).ethereum = provider;

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isCoinbaseWalletBrowser();
  expect(response).toEqual(false);
});

test('Returns false if provider.isCoinbaseBrowser is undefined', async () => {
  (window as any).ethereum = undefined;

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isCoinbaseWalletBrowser();
  expect(response).toEqual(false);
});

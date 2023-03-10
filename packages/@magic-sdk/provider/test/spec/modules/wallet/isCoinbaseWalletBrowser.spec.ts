import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Returns true if isCoinbaseBrowser is true', async () => {
  const provider = {
    isCoinbaseBrowser: true,
  };
  window.ethereum = provider;

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isCoinbaseWalletBrowser();
  expect(response).toEqual(true);
});

test('Returns false if isCoinbaseBrowser is false', async () => {
  const provider = {
    isMetaMask: true,
  };
  window.ethereum = provider;

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isCoinbaseWalletBrowser();
  expect(response).toEqual(false);
});

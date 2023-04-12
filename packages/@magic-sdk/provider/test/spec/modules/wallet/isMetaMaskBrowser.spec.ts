import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Returns true if is mobile and metamask is installed', async () => {
  Object.defineProperty(window.navigator, 'userAgent', { value: 'iPhone', configurable: true });

  const provider = {
    isMetaMask: true,
  };
  (window as any).ethereum = provider;

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isMetaMaskBrowser();
  expect(response).toEqual(true);
});

test('Returns false if is mobile and metamask is not installed', async () => {
  Object.defineProperty(window.navigator, 'userAgent', { value: 'iPhone', configurable: true });

  const provider = {
    isCoinbaseWallet: true,
  };
  (window as any).ethereum = provider;

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isMetaMaskBrowser();
  expect(response).toEqual(false);
});

test('Returns false if is not mobile and metamask is installed', async () => {
  Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla', configurable: true });

  const provider = {
    isMetaMask: true,
  };
  (window as any).ethereum = provider;

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isMetaMaskBrowser();
  expect(response).toEqual(false);
});

test('Returns false if is not mobile and metamask is not installed', async () => {
  Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla', configurable: true });

  const provider = {
    isCoinbaseWallet: true,
  };
  (window as any).ethereum = provider;

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isMetaMaskBrowser();
  expect(response).toEqual(false);
});

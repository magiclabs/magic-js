import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Throws error if no provider config', () => {
  const magic = createMagicSDK({
    thirdPartyWalletOptions: {
      coinbaseWallet: {
        sdk: {
          appName: 'Magic Test',
          appLogoUrl: '',
          darkMode: false,
        },
      },
    },
  });
  magic.wallet.request = jest.fn();

  expect(() => magic.wallet.getCoinbaseProvider()).toThrowError('Missing Coinbase Wallet Config');
});

test('Throws error if coinbaseWallet is undefined', () => {
  const magic = createMagicSDK({
    thirdPartyWalletOptions: {
      coinbaseWallet: undefined,
    },
  });
  magic.wallet.request = jest.fn();

  expect(() => magic.wallet.getCoinbaseProvider()).toThrowError('Missing Coinbase Wallet Config');
});

test('Throws error if thirdPartyWalletOptions is undefined', () => {
  const magic = createMagicSDK({
    thirdPartyWalletOptions: undefined,
  });
  magic.wallet.request = jest.fn();

  expect(() => magic.wallet.getCoinbaseProvider()).toThrowError('Missing Coinbase Wallet Config');
});

test('Throws error if no sdk config', () => {
  const magic = createMagicSDK({
    thirdPartyWalletOptions: {
      coinbaseWallet: {
        provider: {
          jsonRpcUrl: '',
          chainId: 1,
        },
      },
    },
  });
  magic.wallet.request = jest.fn();

  expect(() => magic.wallet.getCoinbaseProvider()).toThrowError('Missing Coinbase Wallet Config');
});

test('Fetches coinbase provider with window provider', () => {
  const provider = {
    isCoinbaseBrowser: true,
  };
  window.ethereum = provider;

  const magic = createMagicSDK({
    thirdPartyWalletOptions: {
      coinbaseWallet: {
        sdk: {
          appName: 'Magic Test',
          appLogoUrl: '',
          darkMode: false,
        },
        provider: {
          jsonRpcUrl: '',
          chainId: 1,
        },
      },
    },
  });
  magic.wallet.request = jest.fn();

  const response = magic.wallet.getCoinbaseProvider();
  expect(response).toEqual({
    provider: window.ethereum,
    qrCodeUrl: null,
  });
});

import browserEnv from '@ikscodes/browser-env';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { createMagicSDK } from '../../../factories';

jest.mock('@coinbase/wallet-sdk');

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Throws error if no `coinbasewallet` in `thirdPartyWalletOptions`', () => {
  const magic = createMagicSDK({
    thirdPartyWalletOptions: {},
  });
  magic.wallet.request = jest.fn();

  expect(() => magic.wallet.getCoinbaseProvider()).toThrowError('Missing Coinbase Wallet Config');
});

test('Returns connected wallet address in array', async () => {
  jest.spyOn(CoinbaseWalletSDK.prototype, 'getQrUrl').mockImplementation(() => {
    return 'qrCodeUrl';
  });

  const mockedProvider = jest.spyOn(CoinbaseWalletSDK.prototype, 'makeWeb3Provider').mockImplementation(() => {
    return {
      request: async (request: { method: string; params?: Array<any> }) => {
        if (request.method === 'eth_requestAccounts') {
          return ['0x0000000000000000000000000000000000000000'];
        }
        return '';
      },
    } as any;
  });

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
  const response = await magic.wallet.connectToCoinbaseWallet();
  expect(mockedProvider).toBeCalled();
  expect(response).toEqual(['0x0000000000000000000000000000000000000000']);
});

test('Redirects to coinbase deep link if isMobile and is not coinbase wallet browser', async () => {
  const mockResponse = jest.fn();
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost',
      assign: mockResponse,
    },
    writable: true,
  });

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

  magic.wallet.isMobile = jest.fn(() => true);
  magic.wallet.isCoinbaseWalletBrowser = jest.fn(() => false);

  await magic.wallet.connectToCoinbaseWallet();
  expect(window.location.href).toEqual('https://go.cb-w.com/dapp?cb_url=http%3A%2F%2Flocalhost');
});

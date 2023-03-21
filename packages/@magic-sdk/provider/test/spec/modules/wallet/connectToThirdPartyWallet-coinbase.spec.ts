import browserEnv from '@ikscodes/browser-env';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { createMagicSDK } from '../../../factories';

jest.mock('@coinbase/wallet-sdk');

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Throws error trying to connect to coinbase_wallet if invalid sdk params', async () => {
  const magic = createMagicSDK({
    thirdPartyWalletOptions: {},
  });
  magic.wallet.request = jest.fn();

  expect(() => magic.wallet.connectToThirdPartyWallet('coinbase_wallet')).toThrowError(
    'Missing Coinbase Wallet Config',
  );
});

test('Connects to coinbase_wallet', async () => {
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

  const response = await magic.wallet.connectToThirdPartyWallet('coinbase_wallet');
  expect(mockedProvider).toBeCalled();
  expect(response).toEqual(['0x0000000000000000000000000000000000000000']);
});

import browserEnv from '@ikscodes/browser-env';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { createMagicSDK } from '../../../factories';

jest.mock('@coinbase/wallet-sdk');

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Fetches coinbase provider without a window provider', () => {
  const mockedQrCodeUrl = jest.spyOn(CoinbaseWalletSDK.prototype, 'getQrUrl').mockImplementation(() => {
    return 'qrCodeUrl';
  });

  const mockedProvider = jest.spyOn(CoinbaseWalletSDK.prototype, 'makeWeb3Provider').mockImplementation(() => {
    return 'provider' as any;
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

  magic.wallet.getCoinbaseProvider();
  expect(mockedQrCodeUrl).toBeCalled();
  expect(mockedProvider).toBeCalled();
});

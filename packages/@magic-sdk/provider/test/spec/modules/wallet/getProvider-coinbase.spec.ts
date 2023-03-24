import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Should return coinbase provider if coinbase is the stored wallet', async () => {
  const provider = {
    isCoinbaseWallet: true,
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
  magic.wallet.getCoinbaseProvider = jest.fn(() => ({
    provider: window.ethereum,
    qrCodeUrl: 'abc',
  }));

  jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      getItem: () => 'coinbase_wallet',
    };
  });

  const response = await magic.wallet.getProvider();
  expect(response).toEqual(provider);
});

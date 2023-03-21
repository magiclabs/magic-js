import browserEnv from '@ikscodes/browser-env';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { createMagicSDK } from '../../../factories';

jest.mock('@coinbase/wallet-sdk');

beforeEach(() => {
  browserEnv.restore();
});

test('Call disconnect on coinbase wallet if thats the active wallet', async () => {
  const localForageMock = jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      getItem: async () => 'coinbase_wallet',
      removeItem: async () => null,
    };
  });
  const localStorageMock = (function () {
    return {
      getItem(key) {
        return null;
      },
      setItem() {
        return null;
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  const mockedProvider = jest.spyOn(CoinbaseWalletSDK.prototype, 'makeWeb3Provider' as any).mockImplementation(() => {
    return {
      disconnect: () => null,
    };
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

  await magic.wallet.disconnect();

  expect(mockedProvider).toBeCalled();
  localForageMock.clearAllMocks();
});

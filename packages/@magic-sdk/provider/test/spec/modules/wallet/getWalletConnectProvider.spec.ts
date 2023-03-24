import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Fetches wallet connect provider and calls enable()', async () => {
  const localForageMock = jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      getItem: async () => 'wallet_connect',
    };
  });
  const localStorageMock = (function () {
    return {
      getItem(key) {
        return 'abc';
      },
    };
  })();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  const magic = createMagicSDK({
    thirdPartyWalletOptions: {
      walletConnect: {
        rpc: { 5: 'https://rpc.ankr.com/eth_goerli' },
      },
    },
  });

  magic.wallet.request = jest.fn();

  jest.mock('@walletconnect/web3-provider', () => {
    return jest.fn(() => {
      return { enable: () => {} };
    });
  });

  const response = await magic.wallet.getWalletConnectProvider(false);
  expect(response).toBeTruthy();
  localForageMock.clearAllMocks();
});

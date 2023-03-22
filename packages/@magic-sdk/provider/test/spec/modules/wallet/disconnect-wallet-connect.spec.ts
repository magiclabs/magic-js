import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Call disconnect on wallet connect if thats the active wallet', async () => {
  const localForageMock = jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      getItem: async () => 'wallet_connect',
      removeItem: async () => null,
    };
  });
  const localStorageMock = (function () {
    return {
      getItem(key) {
        return null;
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

  magic.wallet.getWalletConnectProvider = jest.fn(() => {
    return {
      disconnect: () => null,
    };
  });

  await magic.wallet.disconnect();

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_disconnect');
  expect(requestPayload.params).toEqual([]);
  localForageMock.clearAllMocks();
});

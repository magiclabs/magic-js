import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Should return wallet connect provider if wallet connect is the stored wallet', async () => {
  const provider = {
    request: async (request: { method: string; params?: Array<any> }) => {
      if (request.method === 'eth_requestAccounts') {
        return ['0x0000000000000000000000000000000000000000'];
      }
      return '';
    },
  };

  const magic = createMagicSDK({
    thirdPartyWalletOptions: {
      walletConnect: {
        rpc: { 5: 'https://rpc.ankr.com/eth_goerli' },
      },
    },
  });
  magic.wallet.request = jest.fn(() => {
    return {
      on: () => null,
    };
  });

  magic.wallet.getWalletConnectProvider = jest.fn(() => provider);

  jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      getItem: () => 'wallet_connect',
    };
  });

  const response = await magic.wallet.getProvider();
  expect(response).toEqual(provider);
});

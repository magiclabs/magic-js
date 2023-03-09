import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Fetches wallet connect provider', async () => {
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

  const response = magic.wallet.getWalletConnectProvider(false);
  expect(response).toEqual(provider);
});

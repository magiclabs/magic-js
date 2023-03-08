import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Returns connected wallet address in array', async () => {
  const provider = {
    isCoinbaseBrowser: true,
    request: async (request: { method: string; params?: Array<any> }) => {
      if (request.method === 'eth_requestAccounts') {
        return ['0x0000000000000000000000000000000000000000'];
      }
      return '';
    },
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
  }));
  const response = await magic.wallet.connectToCoinbaseWallet();
  expect(response).toEqual(['0x0000000000000000000000000000000000000000']);
});

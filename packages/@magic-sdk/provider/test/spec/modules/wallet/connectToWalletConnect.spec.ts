import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Returns connected wallet address in array', async () => {
  const provider = {
    isCoinbaseBrowser: true,
    enable: async () => {
      return ['0x0000000000000000000000000000000000000000'];
    },
  };
  const magic = createMagicSDK({
    thirdPartyWalletOptions: {
      walletConnect: {
        rpc: { 5: 'https://rpc.ankr.com/eth_goerli' },
      },
    },
  });
  magic.wallet.request = jest.fn();
  magic.wallet.getWalletConnectProvider = jest.fn(() => provider);

  const response = await magic.wallet.connectToWalletConnect();
  expect(response).toEqual(['0x0000000000000000000000000000000000000000']);
});

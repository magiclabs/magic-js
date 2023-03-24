import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Throws error if missing configuration', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  expect(() => magic.wallet.connectToWalletConnect()).rejects.toThrow();
});

test('Connects to wallet connect', async () => {
  const magic = createMagicSDK({
    thirdPartyWalletOptions: {
      walletConnect: {
        rpc: { 5: 'https://rpc.ankr.com/eth_goerli' },
      },
    },
  });
  magic.wallet.request = jest.fn();

  jest.mock('@walletconnect/web3-provider');

  const response = magic.wallet.connectToWalletConnect();
  expect(response).toEqual(new Promise(() => null));
});

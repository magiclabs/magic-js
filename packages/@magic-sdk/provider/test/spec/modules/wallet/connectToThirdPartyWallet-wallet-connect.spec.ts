import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Throws error trying to connect to wallet_connect if invalid sdk params', async () => {
  const magic = createMagicSDK({
    thirdPartyWalletOptions: {},
  });
  magic.wallet.request = jest.fn();
  expect(() => magic.wallet.connectToThirdPartyWallet('wallet_connect')).rejects.toThrow();
});

test('Connects to wallet_connect', async () => {
  const magic = createMagicSDK({
    thirdPartyWalletOptions: {
      walletConnect: {
        rpc: { 5: 'https://rpc.ankr.com/eth_goerli' },
      },
    },
  });
  magic.wallet.request = jest.fn();
  const response = magic.wallet.connectToThirdPartyWallet('wallet_connect', 1);
  expect(response).toEqual(new Promise(() => null));
});

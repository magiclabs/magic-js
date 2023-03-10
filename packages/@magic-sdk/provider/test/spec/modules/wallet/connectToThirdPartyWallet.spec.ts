import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Connects to metamask', async () => {
  const address = '0x0000000000000000000000000000000000000000';
  const provider = {
    isMetaMask: true,
    request: async (request: { method: string; params?: Array<any> }) => {
      if (request.method === 'eth_requestAccounts') {
        return [address];
      }
      return '';
    },
  };
  window.ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = await magic.wallet.connectToThirdPartyWallet('metamask');
  expect(response).toEqual([address]);
});

test('Connects to coinbase_wallet', async () => {
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
    qrCodeUrl: 'abc',
  }));

  const response = await magic.wallet.connectToThirdPartyWallet('coinbase_wallet');
  expect(response).toEqual(['0x0000000000000000000000000000000000000000']);
});

test('Connects to wallet_connect', async () => {
  const provider = {
    connector: {
      on: () => null,
    },
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

  const response = await magic.wallet.connectToThirdPartyWallet('wallet_connect');
  expect(response).toEqual(['0x0000000000000000000000000000000000000000']);
});

import browserEnv from '@ikscodes/browser-env';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { createMagicSDK } from '../../../factories';

jest.mock('@coinbase/wallet-sdk');

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `mc_login` and `env` params as an object', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn(() => {
    return {
      on: () => '',
    };
  });

  await magic.wallet.connectWithUI();
  const requestPayload = magic.wallet.request.mock.calls[0][0];

  expect(requestPayload.method).toBe('mc_login');
  expect(requestPayload.params).toEqual([
    {
      env: {
        isCoinbaseWalletInstalled: false,
        isMetaMaskInstalled: false,
      },
    },
  ]);
});

test('auto-connect if metamask browser', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn(() => {
    return {
      on: () => null,
    };
  });

  magic.wallet.isMetaMaskBrowser = jest.fn(() => true);

  jest.mock('@magic-sdk/provider/src/core/json-rpc.ts', () => {
    return {
      createJsonRpcRequestPayload: () => true,
    };
  });

  const provider = {
    isMetaMask: true,
    request: async (request: { method: string; params?: Array<any> }) => {
      if (request.method === 'eth_requestAccounts') {
        return ['0x0000000000000000000000000000000000000000'];
      }
      return '';
    },
  };
  window.ethereum = provider;

  await magic.wallet.connectWithUI();

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_is_wallet_enabled');
  expect(requestPayload.params).toEqual([{ wallet: 'metamask' }]);
});

test('auto-connect if coinbase wallet browser', async () => {
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
  magic.wallet.request = jest.fn(() => {
    return {
      on: () => null,
    };
  });

  magic.wallet.isCoinbaseWalletBrowser = jest.fn(() => true);

  jest.mock('@magic-sdk/provider/src/core/json-rpc.ts', () => {
    return {
      createJsonRpcRequestPayload: () => true,
    };
  });

  jest.spyOn(CoinbaseWalletSDK.prototype, 'makeWeb3Provider').mockImplementation(() => {
    return {
      request: async (request: { method: string; params?: Array<any> }) => {
        if (request.method === 'eth_requestAccounts') {
          return ['0x0000000000000000000000000000000000000000'];
        }
        return '';
      },
    } as any;
  });

  const provider = {
    isCoinbaseWalletBrowser: true,
    request: async (request: { method: string; params?: Array<any> }) => {
      if (request.method === 'eth_requestAccounts') {
        return ['0x0000000000000000000000000000000000000000'];
      }
      return '';
    },
  };
  window.ethereum = provider;

  await magic.wallet.connectWithUI();

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_is_wallet_enabled');
  expect(requestPayload.params).toEqual([{ wallet: 'coinbase_wallet' }]);
});

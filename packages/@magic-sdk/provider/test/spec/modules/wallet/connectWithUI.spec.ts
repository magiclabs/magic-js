import browserEnv from '@ikscodes/browser-env';
import { Wallets } from '@magic-sdk/types';
import { ConnectWithUiEvents } from '../../../../src/modules/wallet';
import { createPromiEvent } from '../../../../src/util';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `mc_login` and `env` params as an object', async () => {
  const magic = createMagicSDK();
  const mockPromiEvent = createPromiEvent<string[], ConnectWithUiEvents>(async (resolve, reject) => {
    resolve(['0x12345']);
  });
  magic.wallet.request = jest.fn(() => mockPromiEvent);
  const handle = magic.wallet.connectWithUI();
  mockPromiEvent.emit('wallet_selected', { wallet: Wallets.CoinbaseWallet });
  mockPromiEvent.emit('id-token-created', { idToken: '1234456' });
  await handle;
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
  magic.wallet.request = jest.fn();
  magic.wallet.isMetaMaskBrowser = jest.fn(() => true);
  magic.wallet.isWalletEnabled = jest.fn().mockResolvedValue(true);

  const provider = {
    isMetaMask: true,
    request: async (request: { method: string; params?: Array<any> }) => {
      if (request.method === 'eth_requestAccounts') {
        return ['0x0000000000000000000000000000000000000000'];
      }
      return '';
    },
  };
  (window as any).ethereum = provider;

  await magic.wallet.connectWithUI();
  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_auto_connect');
  expect(requestPayload.params).toEqual([
    { wallet: 'metamask', address: ['0x0000000000000000000000000000000000000000'] },
  ]);
});

test('throws error auto-connecting if metamask browser', async () => {
  const magic = createMagicSDK();
  magic.wallet.isMetaMaskBrowser = jest.fn(() => true);
  magic.wallet.isWalletEnabled = jest.fn().mockRejectedValue(new Error('Connection error'));

  magic.wallet.request = jest.fn(() => {
    return {
      on: () => '',
    };
  });
  try {
    await magic.wallet.connectWithUI();
  } catch (err) {
    expect(err.message).toBe('Connection error');
  }
});

test('auto-connect if coinbase wallet browser', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();
  magic.wallet.isCoinbaseWalletBrowser = jest.fn(() => true);
  magic.wallet.isWalletEnabled = jest.fn().mockResolvedValue(true);

  const provider = {
    isCoinbaseBrowser: true,
    request: async (request: { method: string; params?: Array<any> }) => {
      if (request.method === 'eth_requestAccounts') {
        return ['0x0000000000000000000000000000000000000000'];
      }
      return '';
    },
  };
  (window as any).ethereum = provider;

  await magic.wallet.connectWithUI();
  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_auto_connect');
  expect(requestPayload.params).toEqual([
    { wallet: 'coinbase_wallet', address: ['0x0000000000000000000000000000000000000000'] },
  ]);
});

test('throws error auto-connecting if coinbase wallet browser', async () => {
  const magic = createMagicSDK();
  magic.wallet.isCoinbaseWalletBrowser = jest.fn(() => true);
  magic.wallet.isWalletEnabled = jest.fn().mockRejectedValue(new Error('Connection error'));

  magic.wallet.request = jest.fn(() => {
    return {
      on: () => '',
    };
  });
  try {
    await magic.wallet.connectWithUI();
  } catch (err) {
    expect(err.message).toBe('Connection error');
  }
});

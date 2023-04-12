import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('If metamask browser, wallet and address params should be populated', async () => {
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

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  await magic.wallet.autoConnectIfWalletBrowser('metamask');
  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_auto_connect');
  expect(requestPayload.params).toEqual([
    { wallet: 'metamask', address: ['0x0000000000000000000000000000000000000000'] },
  ]);
});

test('If coinbase browser, wallet and address params should be populated', async () => {
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

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  await magic.wallet.autoConnectIfWalletBrowser('coinbase_wallet');
  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_auto_connect');
  expect(requestPayload.params).toEqual([
    { wallet: 'coinbase_wallet', address: ['0x0000000000000000000000000000000000000000'] },
  ]);
});

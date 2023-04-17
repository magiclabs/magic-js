import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Returns connected wallet address in array and does not change the window.href', async () => {
  const address = '0x0000000000000000000000000000000000000000';

  const provider = {
    isCoinbaseWallet: true,
    request: async (request: { method: string; params?: Array<any> }) => {
      if (request.method === 'eth_requestAccounts') {
        return [address];
      }
      return '';
    },
  };
  (window as any).ethereum = provider;

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = await magic.wallet.connectToCoinbaseWallet();
  expect(response).toEqual([address]);
  expect(window.location.href).toEqual('http://localhost/');
});

test('Redirects to coinbase deep link if isMobile and coinbase extension is not installed', async () => {
  const mockResponse = jest.fn();
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost',
      assign: mockResponse,
    },
    writable: true,
  });

  const address = '0x0000000000000000000000000000000000000000';

  const provider = {
    isCoinbaseWallet: true,
    request: async (request: { method: string; params?: Array<any> }) => {
      if (request.method === 'eth_requestAccounts') {
        return [address];
      }
      return '';
    },
  };
  (window as any).ethereum = provider;

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  magic.wallet.isMobile = jest.fn(() => true);
  magic.wallet.isCoinbaseWalletInstalled = jest.fn(() => false);

  const response = await magic.wallet.connectToCoinbaseWallet();
  expect(window.location.href).toEqual('https://go.cb-w.com/dapp?cb_url=http%3A%2F%2Flocalhost');
  expect(response).toEqual([address]);
});

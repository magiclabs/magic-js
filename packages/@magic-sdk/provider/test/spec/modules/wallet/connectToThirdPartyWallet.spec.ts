import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Throws error if invalid provider', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();
  expect(() => magic.wallet.connectToThirdPartyWallet('invalid-provider')).toThrowError(
    'Invalid provider: invalid-provider. Must be one of "metamask" or "coinbase_wallet".',
  );
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
  (window as any).ethereum = provider;
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = await magic.wallet.connectToThirdPartyWallet('metamask');
  expect(response).toEqual([address]);
});

test('Connects to coinbase', async () => {
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

  const response = await magic.wallet.connectToThirdPartyWallet('coinbase_wallet');
  expect(response).toEqual([address]);
});

import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

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

beforeEach(() => {
  browserEnv.restore();
  window.ethereum = provider;
});

test('Returns connected wallet address in array', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = await magic.wallet.connectToMetaMask();
  expect(response).toEqual([address]);
});

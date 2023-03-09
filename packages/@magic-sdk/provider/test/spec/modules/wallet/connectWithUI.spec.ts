import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `mc_login` and `env` params as an object', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn(() => {
    return {
      on: () => null,
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

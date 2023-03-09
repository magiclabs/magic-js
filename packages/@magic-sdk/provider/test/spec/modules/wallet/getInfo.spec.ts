import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `mc_get_wallet_info`', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      getItem: () => 'metamask',
    };
  });

  await magic.wallet.getInfo();

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_get_wallet_info');
  expect(requestPayload.params).toEqual([{ walletType: 'metamask' }]);
});

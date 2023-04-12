import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `mc_wallet`', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  magic.wallet.isWalletEnabled('metamask');

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_is_wallet_enabled');
  expect(requestPayload.params).toEqual([{ wallet: 'metamask' }]);
});

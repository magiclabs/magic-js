import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `mc_disconnect`', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  await magic.wallet.disconnect();

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_disconnect');
  expect(requestPayload.params).toEqual([]);
});

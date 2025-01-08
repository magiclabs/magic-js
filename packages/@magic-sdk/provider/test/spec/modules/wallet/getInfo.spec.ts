import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { mockLocalForage } from '../../../mocks';

beforeEach(() => {
  browserEnv.restore();

  mockLocalForage();
});

test('Generate JSON RPC request payload with method `magic_get_info` and the active wallet', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  await magic.wallet.getInfo();

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_get_info');
});

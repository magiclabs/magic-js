import browserEnv from '../../../../../../../../scripts/utils/browser-env';
import { createMagicSDK } from '../../../factories';
import { mockLocalForage } from '../../../mocks';

beforeEach(() => {
  browserEnv.restore();

  mockLocalForage();
});

test('Generate JSON RPC request payload with method `magic_get_info`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.getInfo();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_get_info');
});

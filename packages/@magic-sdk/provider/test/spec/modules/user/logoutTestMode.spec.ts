import browserEnv from '@ikscodes/browser-env';
import { createMagicSDKTestMode } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn();

  magic.user.logout();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_logout_testing_mode');
  expect(requestPayload.params).toEqual([]);
});

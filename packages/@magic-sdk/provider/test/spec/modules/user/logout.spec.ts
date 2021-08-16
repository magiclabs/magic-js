import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = jest.fn();
});

test('Generate JSON RPC request payload with method `magic_auth_logout`', async () => {
  const magic = createMagicSDK();

  magic.user.logout();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_logout');
  expect(requestPayload.params).toEqual([]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();

  magic.user.logout();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_logout_testing_mode');
  expect(requestPayload.params).toEqual([]);
});

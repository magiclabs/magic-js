import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = jest.fn();
});

test('Generate JSON RPC request payload with method `magic_auth_get_id_token`', async () => {
  const magic = createMagicSDK();

  magic.user.getIdToken();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_get_id_token');
  expect(requestPayload.params).toEqual([undefined]);
});

test('Accepts a `lifespan` parameter', async () => {
  const magic = createMagicSDK();

  magic.user.getIdToken({ lifespan: 900 });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_get_id_token');
  expect(requestPayload.params).toEqual([{ lifespan: 900 }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();

  magic.user.getIdToken();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_get_id_token_testing_mode');
  expect(requestPayload.params).toEqual([undefined]);
});

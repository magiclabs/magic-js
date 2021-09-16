import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_auth_enable_mfa_flow`', async () => {
  const magic = createMagicSDK();
  magic.user.settings.request = jest.fn();

  magic.user.settings.enableMfa();

  const requestPayload = magic.user.settings.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_enable_mfa_flow');
  expect(requestPayload.params).toEqual([]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.settings.request = jest.fn();

  magic.user.settings.enableMfa();

  const requestPayload = magic.user.settings.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_enable_mfa_flow_testing_mode');
  expect(requestPayload.params).toEqual([]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.settings.enableMfa())).toBeTruthy();
});

import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { isPromiEvent } from '../../../../src';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_auth_recover_account`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.recoverAccount({ email: 'test' });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_recover_account');
  expect(requestPayload.params).toEqual([{ email: 'test' }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn();

  await magic.user.recoverAccount({ email: 'test' });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_recover_account_testing_mode');
  expect(requestPayload.params).toEqual([{ email: 'test' }]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.recoverAccount({ email: 'test' }))).toBeTruthy();
});

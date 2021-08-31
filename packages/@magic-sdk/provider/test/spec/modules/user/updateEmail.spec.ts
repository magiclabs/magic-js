import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_auth_update_email`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.updateEmail({ email: 'test' });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_update_email');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true }]);
});

test('Accepts a `showUI` parameter', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.updateEmail({ email: 'test', showUI: false });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_update_email');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: false }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn();

  await magic.user.updateEmail({ email: 'test', showUI: false });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_update_email_testing_mode');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: false }]);
});

test('method should be a promi event', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.updateEmail({ email: 'test', showUI: false }))).toBeTruthy();
});

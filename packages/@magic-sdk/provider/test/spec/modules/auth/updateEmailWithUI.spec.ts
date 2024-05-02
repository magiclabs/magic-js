import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_auth_update_email`', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn();

  await magic.auth.updateEmailWithUI({ email: 'test' });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_update_email');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true }]);
});

test('Accepts a `showUI` parameter', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn();

  await magic.auth.updateEmailWithUI({ email: 'test' });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_update_email');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.auth.request = jest.fn();

  await magic.auth.updateEmailWithUI({ email: 'test' });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_update_email_testing_mode');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true }]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.auth.updateEmailWithUI({ email: 'test', showUI: true }))).toBeTruthy();
});

/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import { BaseModule } from '../../../../src/modules/base-module';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
  (BaseModule as any).prototype.request = jest.fn();
});

test('Generates JSON RPC request payload with `email` parameter', async () => {
  const magic = createMagicSDK();

  await magic.auth.loginWithMagicLink({ email: 'test' });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_login_with_magic_link');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true, redirectURI: undefined }]);
});

test('Generates JSON RPC request payload with `showUI` parameter', async () => {
  const magic = createMagicSDK();

  await magic.auth.loginWithMagicLink({ email: 'test', showUI: false });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_login_with_magic_link');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: false, redirectURI: undefined }]);
});

test('Generates JSON RPC request payload with `redirectURI` parameter', async () => {
  const magic = createMagicSDK();

  await magic.auth.loginWithMagicLink({ email: 'test', showUI: true, redirectURI: 'helloworld' });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_login_with_magic_link');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true, redirectURI: 'helloworld' }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();

  await magic.auth.loginWithMagicLink({ email: 'test' });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_login_with_magic_link_testing_mode');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true, redirectURI: undefined }]);
});

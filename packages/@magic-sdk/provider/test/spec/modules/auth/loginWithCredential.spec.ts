/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import { BaseModule } from '../../../../src/modules/base-module';
import { isPromiEvent } from '../../../../src/util';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
});

test('Generates JSON RPC request payload with the given parameter as the credential', async () => {
  const magic = createMagicSDK({ platform: 'web' });
  magic.auth.request = jest.fn();

  await magic.auth.loginWithCredential('helloworld');

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_login_with_credential');
  expect(requestPayload.params).toEqual(['helloworld']);
});

test('If no parameter is given & platform target is "web", URL search string is included in the payload params', async () => {
  const magic = createMagicSDK({ platform: 'web' });
  magic.auth.request = jest.fn();

  browserEnv.stub('window.history.replaceState', () => {});

  browserEnv.stub('window.location', {
    search: '?magic_credential=asdf',
    origin: 'http://example.com',
    pathname: '/hello/world',
  });

  await magic.auth.loginWithCredential();

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_login_with_credential');
  expect(requestPayload.params).toEqual(['?magic_credential=asdf']);
});

test('If no parameter is given & platform target is NOT "web", credential is empty string', async () => {
  const magic = createMagicSDK({ platform: 'react-native' });
  magic.auth.request = jest.fn();

  await magic.auth.loginWithCredential();

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_login_with_credential');
  expect(requestPayload.params).toEqual(['']);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode({ platform: 'web' });
  magic.auth.request = jest.fn();

  await magic.auth.loginWithCredential('helloworld');

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_login_with_credential_testing_mode');
  expect(requestPayload.params).toEqual(['helloworld']);
});

test('method should be a promi event', () => {
  const magic = createMagicSDK({ platform: 'web' });
  expect(isPromiEvent(magic.auth.loginWithCredential('asdf'))).toBeTruthy();
});

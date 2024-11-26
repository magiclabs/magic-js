import browserEnv from '@ikscodes/browser-env';
import { MagicPayloadMethod } from '@magic-sdk/types';

import { isPromiEvent } from '../../../../src/util';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
});

test('Generates JSON RPC request payload with the given parameters as the credential and lifespan', async () => {
  const magic = createMagicSDK({ platform: 'web' });
  magic.auth.request = jest.fn();

  await magic.auth.loginWithCredential({ credentialOrQueryString: 'helloworld', lifespan: 900 });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithCredential);
  expect(requestPayload.params).toEqual(['helloworld', 900]);
});

test('If no parameters are given & platform target is "web", URL search string and default lifespan are included in the payload params', async () => {
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
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithCredential);
  expect(requestPayload.params).toEqual(['?magic_credential=asdf', undefined]);
});

test('If no parameters are given & platform target is NOT "web", credential is empty string and default lifespan is included', async () => {
  const magic = createMagicSDK({ platform: 'react-native' });
  magic.auth.request = jest.fn();

  await magic.auth.loginWithCredential();

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithCredential);
  expect(requestPayload.params).toEqual(['', undefined]);
});

test('If `testMode` is enabled, testing-specific RPC method is used with given parameters', async () => {
  const magic = createMagicSDKTestMode({ platform: 'web' });
  magic.auth.request = jest.fn();

  await magic.auth.loginWithCredential({ credentialOrQueryString: 'helloworld', lifespan: 900 });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithCredentialTestMode);
  expect(requestPayload.params).toEqual(['helloworld', 900]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK({ platform: 'web' });
  expect(isPromiEvent(magic.auth.loginWithCredential({ credentialOrQueryString: 'asdf' }))).toBeTruthy();
});

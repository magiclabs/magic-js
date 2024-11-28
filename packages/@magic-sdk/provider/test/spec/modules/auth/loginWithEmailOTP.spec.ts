import browserEnv from '@ikscodes/browser-env';
import { MagicPayloadMethod } from '@magic-sdk/types';

import { isPromiEvent } from '../../../../src/util';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
});

const expectedEmail = 'john.doe@mail.com';

test('Generates JSON RPC request payload with `email` parameter', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithEmailOTP({ email: expectedEmail, showUI: true });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithEmailOTP);
  expect(requestPayload.params).toEqual([{ email: expectedEmail, showUI: true }]);
});

test('Generates JSON RPC request payload with `showUI: false` parameter', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithEmailOTP({ email: expectedEmail, showUI: false });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithEmailOTP);
  expect(requestPayload.params).toEqual([{ email: expectedEmail, showUI: false }]);
});

test('Generates JSON RPC request payload with `overrides` parameter', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithEmailOTP({ email: expectedEmail, overrides: { variation: 'my custom template' } });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithEmailOTP);
  expect(requestPayload.params).toEqual([{ email: expectedEmail, overrides: { variation: 'my custom template' } }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithEmailOTP({ email: expectedEmail, showUI: true });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithEmailOTPTestMode);
  expect(requestPayload.params).toEqual([{ email: expectedEmail, showUI: true }]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.auth.loginWithEmailOTP({ email: expectedEmail }))).toBeTruthy();
});

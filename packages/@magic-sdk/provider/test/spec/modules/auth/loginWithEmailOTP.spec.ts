/* eslint-disable global-require, @typescript-eslint/no-var-requires */

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

  await magic.auth.loginWithEmailOTP({ email: expectedEmail });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithEmailOTP);
  expect(requestPayload.params).toEqual([{ email: expectedEmail, showUI: true }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithEmailOTP({ email: expectedEmail });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithEmailOTPTestMode);
  expect(requestPayload.params).toEqual([{ email: expectedEmail, showUI: true }]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.auth.loginWithEmailOTP({ email: expectedEmail }))).toBeTruthy();
});

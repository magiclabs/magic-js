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

test('Generates JSON RPC pending for otp-input-sent', async () => {
  const magic = createMagicSDK();
  magic.auth.overlay.post = jest.fn();
  const createIntermediaryEventFn = jest.fn();
  magic.auth.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.auth.loginWithEmailOTP({ email: expectedEmail, showUI: false });

  const troll_otp = '123456';
  handle.emit('verify-email-otp', troll_otp);
  handle.emit('cancel');

  const verifyEvent = magic.auth.createIntermediaryEvent.mock.calls[0];
  expect(verifyEvent[0]).toBe('verify-email-otp');
  expect(verifyEvent[1]).toBe(3); // third call of test
  expect(createIntermediaryEventFn.mock.calls[0][0]).toBe(troll_otp);

  const intermediaryEventSecondMethod = magic.auth.createIntermediaryEvent.mock.calls[1][0];
  expect(intermediaryEventSecondMethod).toBe('cancel');
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

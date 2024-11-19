import browserEnv from '@ikscodes/browser-env';
import { MagicPayloadMethod } from '@magic-sdk/types';

import { isPromiEvent } from '../../../../src/util';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
});

const expectedPhoneNumber = 'hey hey I am a number but jk';

test('Generates JSON RPC request payload with `phone` parameter', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithSMS({ phoneNumber: expectedPhoneNumber, showUI: false });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithSms);
  expect(requestPayload.params).toEqual([{ phoneNumber: expectedPhoneNumber, showUI: false }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithSMS({ phoneNumber: expectedPhoneNumber, showUI: false });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithSmsTestMode);

  expect(requestPayload.params).toEqual([{ phoneNumber: expectedPhoneNumber, showUI: false }]);
});

test('Generates JSON RPC pending for otp-input-sent', () => {
  const magic = createMagicSDK();
  magic.auth.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.auth.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.auth.loginWithSMS({ phoneNumber: expectedPhoneNumber, showUI: false });

  const troll_otp = '123456';
  handle.emit('verify-sms-otp', troll_otp);
  handle.emit('cancel');

  const verifyEvent = magic.auth.createIntermediaryEvent.mock.calls[0];
  expect(verifyEvent[0]).toBe('verify-sms-otp');
  expect(createIntermediaryEventFn.mock.calls[0][0]).toBe(troll_otp);

  const intermediaryEventSecondMethod = magic.auth.createIntermediaryEvent.mock.calls[1][0];
  expect(intermediaryEventSecondMethod).toBe('cancel');
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.auth.loginWithSMS({ email: 'blag' }))).toBeTruthy();
});

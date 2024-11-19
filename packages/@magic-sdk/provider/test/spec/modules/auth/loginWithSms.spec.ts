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

  await magic.auth.loginWithSMS({ phoneNumber: expectedPhoneNumber });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithSms);
  expect(requestPayload.params).toEqual([{ phoneNumber: expectedPhoneNumber, showUI: true }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithSMS({ phoneNumber: expectedPhoneNumber });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithSmsTestMode);
  expect(requestPayload.params).toEqual([{ phoneNumber: expectedPhoneNumber, showUI: true }]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.auth.loginWithSMS({ email: 'blag' }))).toBeTruthy();
});

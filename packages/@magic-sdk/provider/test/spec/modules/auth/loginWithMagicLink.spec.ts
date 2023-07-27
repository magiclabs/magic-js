/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import { MagicPayloadMethod } from '@magic-sdk/types';

import { SDKEnvironment } from '../../../../src/core/sdk-environment';
import { isPromiEvent } from '../../../../src/util';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
});

test('Generates JSON RPC request payload with `email` parameter', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithMagicLink({ email: 'test' });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithMagicLink);
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true, redirectURI: undefined }]);
});

test('Generates JSON RPC request payload with `showUI` parameter', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithMagicLink({ email: 'test', showUI: false });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithMagicLink);
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: false, redirectURI: undefined }]);
});

test('Generates JSON RPC request payload with `redirectURI` parameter', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithMagicLink({ email: 'test', showUI: true, redirectURI: 'helloworld' });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithMagicLink);
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true, redirectURI: 'helloworld' }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.auth.request = jest.fn();

  await magic.auth.loginWithMagicLink({ email: 'test' });

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe(MagicPayloadMethod.LoginWithMagicLinkTestMode);
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true, redirectURI: undefined }]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.auth.loginWithMagicLink({ email: 'blag' }))).toBeTruthy();
});

test('Throws error when the SDK version is 19 or higher', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn();

  // Set SDKEnvironment version to 19
  SDKEnvironment.version = '19';
  SDKEnvironment.sdkName = '@magic-sdk/react-native';

  // Try to invoke the loginWithMagicLink method
  try {
    await magic.auth.loginWithMagicLink({ email: 'test' });
  } catch (err) {
    // Check if the error message is as expected
    expect(err.message).toBe(
      'loginWithMagicLink() is deprecated for this package, please utlize a passcode method like loginWithSMS or loginWithEmailOTP instead.',
    );
  }
});

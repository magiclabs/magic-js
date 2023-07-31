import browserEnv from '@ikscodes/browser-env';
import { DeepLinkPage } from '@magic-sdk/types/src/core/deep-link-pages';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_auth_settings`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings');
  expect(requestPayload.params).toEqual([undefined]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn();

  magic.user.showSettings();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings_testing_mode');
  expect(requestPayload.params).toEqual([undefined]);
});

test('Generate JSON RPC request payload with method `magic_auth_settings` and page params `email`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings({ page: DeepLinkPage.Email });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings');
  expect(requestPayload.params).toEqual([{ page: 'email' }]);
});

test('Generate JSON RPC request payload with method `magic_auth_settings` and page params `mfa`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings({ page: DeepLinkPage.MFA });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings');
  expect(requestPayload.params).toEqual([{ page: 'mfa' }]);
});

test('Generate JSON RPC request payload with method `magic_auth_settings` and page params `recovery`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings({ page: DeepLinkPage.Recovery });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings');
  expect(requestPayload.params).toEqual([{ page: 'recovery' }]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.showSettings())).toBeTruthy();
});

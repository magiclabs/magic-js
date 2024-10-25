import browserEnv from '@ikscodes/browser-env';
import { DeepLinkPage } from '@magic-sdk/types/src/core/deep-link-pages';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

jest.mock('@magic-sdk/types', () => ({
  ...jest.requireActual('@magic-sdk/types'),
  RecoveryFactorEventEmit: {
    SendNewPhoneNumber: 'send-new-phone-number',
    SendOtpCode: 'send-otp-code',
    Cancel: 'cancel',
    StartEditPhoneNumber: 'start-edit-phone-number',
  },
}));

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
});

test('Generate JSON RPC request payload with method `magic_auth_settings`', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings');
  expect(requestPayload.params).toEqual([undefined]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn();

  magic.user.showSettings();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings_testing_mode');
  expect(requestPayload.params).toEqual([undefined]);
});

test('Generate JSON RPC request payload with method `magic_auth_settings` and page params `update-email`', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings({ page: DeepLinkPage.UpdateEmail });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings');
  expect(requestPayload.params).toEqual([{ page: 'update-email' }]);
});

test('Generate JSON RPC request payload with method `magic_auth_settings` and page params `mfa`', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings({ page: DeepLinkPage.MFA, showUI: false });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings');
  expect(requestPayload.params).toEqual([{ page: 'mfa', showUI: false }]);
});

test('Generate JSON RPC request payload with method `magic_auth_settings` and page params `recovery`', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings({ page: DeepLinkPage.Recovery, showUI: false });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings');
  expect(requestPayload.params).toEqual([{ page: 'recovery', showUI: false }]);
});

test('Generate JSON RPC request payload with `showUI` undefined', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings({ page: DeepLinkPage.MFA });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.params).toEqual([{ page: 'mfa', showUI: undefined }]);
});

test('Generate JSON RPC request payload with method `magic_auth_settings` and page params `recovery` and showUI true', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings({ page: DeepLinkPage.Recovery, showUI: true });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings');
  expect(requestPayload.params).toEqual([{ page: 'recovery', showUI: true }]);
});

test('Generate JSON RPC request payload without `page` parameter', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings');
  expect(requestPayload.params).toEqual([undefined]);
});

test('ShowSettings should attach event listeners for recovery factor events', () => {
  const magic = createMagicSDK();

  const mockOn = jest.fn();
  const mockHandle = {
    on: mockOn,
  };

  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  const config = { page: DeepLinkPage.Recovery, showUI: false };
  magic.user.showSettings(config);

  expect(mockOn).toHaveBeenCalledWith('send-new-phone-number', expect.any(Function));
  expect(mockOn).toHaveBeenCalledWith('send-otp-code', expect.any(Function));

  const phoneNumber = '123-456-7890';
  const otp = '123456';

  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn(() => createIntermediaryEventFn);

  mockOn.mock.calls[0][1](phoneNumber);
  mockOn.mock.calls[1][1](otp);

  expect(createIntermediaryEventFn).toHaveBeenCalledWith(phoneNumber);
  expect(createIntermediaryEventFn).toHaveBeenCalledWith(otp);
});
test('ShowSettings should call createIntermediaryEvent with StartEditPhoneNumber', () => {
  const magic = createMagicSDK();
  const mockOn = jest.fn();
  const mockHandle = { on: mockOn };

  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  const config = { page: DeepLinkPage.Recovery, showUI: false };
  magic.user.showSettings(config);

  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn(() => createIntermediaryEventFn);

  const startEditPhoneNumberListener = mockOn.mock.calls.find((call) => call[0] === 'start-edit-phone-number')[1];

  startEditPhoneNumberListener();

  expect(createIntermediaryEventFn).toHaveBeenCalled();
});
test('ShowSettings should call createIntermediaryEvent with Cancel', () => {
  const magic = createMagicSDK();
  const mockOn = jest.fn();
  const mockHandle = { on: mockOn };

  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  const config = { page: DeepLinkPage.Recovery, showUI: false };
  magic.user.showSettings(config);

  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn(() => createIntermediaryEventFn);

  const startEditPhoneNumberListener = mockOn.mock.calls.find((call) => call[0] === 'cancel')[1];

  startEditPhoneNumberListener();

  expect(createIntermediaryEventFn).toHaveBeenCalled();
});

test('ShowSettings should attach event listener for StartEditPhoneNumber event', () => {
  const magic = createMagicSDK();
  const mockOn = jest.fn();
  const mockHandle = { on: mockOn };

  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  const config = { page: DeepLinkPage.Recovery, showUI: false };
  magic.user.showSettings(config);

  expect(mockOn).toHaveBeenCalledWith('Recency/auth-factor-verify-email-otp', expect.any(Function));

  expect(mockOn).toHaveBeenCalledWith('start-edit-phone-number', expect.any(Function));
});
test('ShowSettings should not call createIntermediaryEvent if StartEditPhoneNumber event is not triggered', () => {
  const magic = createMagicSDK();
  const mockOn = jest.fn();
  const mockHandle = { on: mockOn };

  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  const config = { page: DeepLinkPage.Recovery, showUI: false };
  magic.user.showSettings(config);

  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn(() => createIntermediaryEventFn);

  expect(magic.user.createIntermediaryEvent).not.toHaveBeenCalled();
  expect(createIntermediaryEventFn).not.toHaveBeenCalled();
});
test('ShowSettings should handle missing config gracefully', () => {
  const magic = createMagicSDK();
  const mockOn = jest.fn();
  const mockHandle = { on: mockOn };

  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  magic.user.showSettings(undefined);

  expect(mockOn).not.toHaveBeenCalled();
});

test('Generate JSON RPC request payload with invalid page param', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings({ page: 'invalid-page' });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.params).toEqual([{ page: 'invalid-page' }]);
});
test('method should not return a PromiEvent if called with invalid options', () => {
  const magic = createMagicSDK();
  const result = magic.user.showSettings({ invalidOption: true });
  expect(isPromiEvent(result)).toBeTruthy();
});
test('ShowSettings should not attach event listeners when `showUI` is true', () => {
  const magic = createMagicSDK();
  const mockHandle = { on: jest.fn() };
  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  const config = { page: DeepLinkPage.Recovery, showUI: true };
  magic.user.showSettings(config);

  expect(mockHandle.on).not.toHaveBeenCalled();
});
test('ShowSettings should handle no configuration passed gracefully', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_settings');
  expect(requestPayload.params).toEqual([undefined]);
});
test('ShowSettings should return a PromiEvent for valid config', () => {
  const magic = createMagicSDK();
  const result = magic.user.showSettings({ page: DeepLinkPage.Recovery });

  expect(isPromiEvent(result)).toBeTruthy();
});

test('ShowSettings should not return a PromiEvent for invalid config', () => {
  const magic = createMagicSDK();
  const result = magic.user.showSettings({ invalidOption: true });

  expect(isPromiEvent(result)).toBeTruthy();
});

test('ShowSettings called multiple times should maintain state correctly', () => {
  const magic = createMagicSDK();
  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn(() => createIntermediaryEventFn);

  const handle1 = magic.user.showSettings({ page: DeepLinkPage.Recovery, showUI: false });
  handle1.emit('send-otp-code', '123456');

  const handle2 = magic.user.showSettings({ page: DeepLinkPage.MFA, showUI: false });
  handle2.emit('send-new-phone-number', '987654');

  expect(createIntermediaryEventFn).toHaveBeenCalledWith('123456');
  expect(createIntermediaryEventFn).toHaveBeenCalledWith('987654');
});
test('ShowSettings should handle request failure gracefully', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn(() => {
    throw new Error('Request failed');
  });

  try {
    magic.user.showSettings();
  } catch (error) {
    expect(error.message).toBe('Request failed');
  }
});

test('ShowSettings should attach event listeners for VerifyEmailOtp event', () => {
  const magic = createMagicSDK();
  const mockOn = jest.fn();
  const mockHandle = { on: mockOn };

  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  const config = { page: DeepLinkPage.Recovery, showUI: false };
  magic.user.showSettings(config);

  expect(mockOn).toHaveBeenCalledWith('Recency/auth-factor-verify-email-otp', expect.any(Function));

  const otp = '123456';
  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn(() => createIntermediaryEventFn);

  const verifyEmailOtpListener = mockOn.mock.calls.find(
    (call) => call[0] === 'Recency/auth-factor-verify-email-otp',
  )[1];

  verifyEmailOtpListener(otp);

  expect(createIntermediaryEventFn).toHaveBeenCalledWith(otp);
});

test('ShowSettings should return a PromiEvent even for invalid config', () => {
  const magic = createMagicSDK();
  const result = magic.user.showSettings({ invalidOption: true });

  expect(isPromiEvent(result)).toBeTruthy();
});
test('Generate JSON RPC request payload with undefined showUI', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.showSettings({ page: DeepLinkPage.MFA });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.params).toEqual([{ page: 'mfa', showUI: undefined }]);
});
test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.showSettings())).toBeTruthy();
});

import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { isPromiEvent } from '../../../../src';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_auth_recover_account`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.recoverAccount({ email: 'test', showUI: false });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_recover_account');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: false }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn();

  await magic.user.recoverAccount({ email: 'test', showUI: false });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_recover_account_testing_mode');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: false }]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.recoverAccount({ email: 'test', showUI: false }))).toBeTruthy();
});

test('method should create intermediary event on cancel', () => {
  const magic = createMagicSDK();
  magic.user.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.user.recoverAccount({ email: 'test', showUI: false });
  handle.emit('cancel');

  const cancelEvent = magic.user.createIntermediaryEvent.mock.calls[0][0];

  expect(cancelEvent).toBe('cancel');
});

test('method should create intermediary event on ResendSms', () => {
  const magic = createMagicSDK();
  magic.user.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.user.recoverAccount({ email: 'test', showUI: false });
  handle.emit('resend-sms-otp');

  const resendEvent = magic.user.createIntermediaryEvent.mock.calls[0][0];

  expect(resendEvent).toBe('resend-sms-otp');
});

test('method should create intermediary event on VerifyOtp', () => {
  const magic = createMagicSDK();
  magic.user.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.user.recoverAccount({ email: 'test', showUI: false });
  handle.emit('verify-otp-code');

  const verifyEvent = magic.user.createIntermediaryEvent.mock.calls[0][0];

  expect(verifyEvent).toBe('verify-otp-code');
});

test('method should create intermediary event on UpdateEmail', () => {
  const magic = createMagicSDK();
  magic.user.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.user.recoverAccount({ email: 'test', showUI: false });
  handle.emit('update-email');

  const UpdateEmail = magic.user.createIntermediaryEvent.mock.calls[0][0];

  expect(UpdateEmail).toBe('update-email');
});

test('method should create intermediary event on UpdateEmailEventEmit.Cancel', () => {
  const magic = createMagicSDK();
  magic.user.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.user.recoverAccount({ email: 'test', showUI: false });
  handle.emit('UpdateEmail/new-email-verification-cancel');

  const cancelEvent = magic.user.createIntermediaryEvent.mock.calls[0][0];

  expect(cancelEvent).toBe('UpdateEmail/new-email-verification-cancel');
});

test('method should create intermediary event on RetryWithNewEmail', () => {
  const magic = createMagicSDK();
  magic.user.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.user.recoverAccount({ email: 'test', showUI: false });
  handle.emit('UpdateEmail/retry-with-new-email');

  const retryEvent = magic.user.createIntermediaryEvent.mock.calls[0][0];

  expect(retryEvent).toBe('UpdateEmail/retry-with-new-email');
});

test('method should create intermediary event on VerifyEmailOtp', () => {
  const magic = createMagicSDK();
  magic.user.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.user.recoverAccount({ email: 'test', showUI: false });
  handle.emit('UpdateEmail/new-email-verify-otp');

  const retryEvent = magic.user.createIntermediaryEvent.mock.calls[0][0];

  expect(retryEvent).toBe('UpdateEmail/new-email-verify-otp');
});

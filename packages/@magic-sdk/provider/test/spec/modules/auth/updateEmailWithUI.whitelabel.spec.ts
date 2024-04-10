import browserEnv from '@ikscodes/browser-env';
import { RecencyCheckEventEmit, UpdateEmailEventEmit } from '@magic-sdk/types';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_auth_update_email` whitelabel and start recency check', async () => {
  const magic = createMagicSDK();
  magic.auth.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.auth.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.auth.updateEmailWithUI({ email: 'test', showUI: false });

  const troll_otp = '123456';
  handle.emit(RecencyCheckEventEmit.VerifyEmailOtp, troll_otp);
  handle.emit(RecencyCheckEventEmit.Cancel);

  const verifyEvent = magic.auth.createIntermediaryEvent.mock.calls[0];
  expect(verifyEvent[0]).toBe(RecencyCheckEventEmit.VerifyEmailOtp);
  expect(createIntermediaryEventFn.mock.calls[0][0]).toBe(troll_otp);

  const intermediaryEventSecondMethod = magic.auth.createIntermediaryEvent.mock.calls[1][0];
  expect(intermediaryEventSecondMethod).toBe(RecencyCheckEventEmit.Cancel);
});

test('Whitelabel `magic_auth_update_email`, recency check Retry event', async () => {
  const magic = createMagicSDK();
  magic.auth.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.auth.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.auth.updateEmailWithUI({ email: 'test', showUI: false });

  handle.emit(RecencyCheckEventEmit.Retry);

  const intermediaryEventSecondMethod = magic.auth.createIntermediaryEvent.mock.calls[0][0];
  expect(intermediaryEventSecondMethod).toBe(RecencyCheckEventEmit.Retry);
});

test('Whitelabel `magic_auth_update_email`, Update Email, fire retry with Email event', async () => {
  const magic = createMagicSDK();
  magic.auth.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.auth.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.auth.updateEmailWithUI({ email: 'test', showUI: false });

  const alternativeEmail = 'alternativeEmail@test.com';

  handle.emit(UpdateEmailEventEmit.RetryWithNewEmail, alternativeEmail);

  const intermediaryEventFirstMethod = magic.auth.createIntermediaryEvent.mock.calls[0][0];
  expect(intermediaryEventFirstMethod).toBe(UpdateEmailEventEmit.RetryWithNewEmail);
  expect(createIntermediaryEventFn.mock.calls[0][0]).toBe(alternativeEmail);
});

test('Generate JSON RPC request payload with method `magic_auth_update_email` whitelabel and start verify Email otp ', async () => {
  const magic = createMagicSDK();
  magic.auth.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.auth.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.auth.updateEmailWithUI({ email: 'test', showUI: false });

  const troll_otp = '123456';
  handle.emit(UpdateEmailEventEmit.VerifyEmailOtp, troll_otp);
  handle.emit(UpdateEmailEventEmit.Cancel);

  const verifyEvent = magic.auth.createIntermediaryEvent.mock.calls[0];
  expect(verifyEvent[0]).toBe(UpdateEmailEventEmit.VerifyEmailOtp);
  expect(createIntermediaryEventFn.mock.calls[0][0]).toBe(troll_otp);

  const intermediaryEventSecondMethod = magic.auth.createIntermediaryEvent.mock.calls[1][0];
  expect(intermediaryEventSecondMethod).toBe(UpdateEmailEventEmit.Cancel);
});

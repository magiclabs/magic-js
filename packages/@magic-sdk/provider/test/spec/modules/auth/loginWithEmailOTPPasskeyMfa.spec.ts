import { createMagicSDK } from '../../../factories';

jest.mock('../../../../src/util/polyfills', () => ({
  parseRequestOptionsFromJSON: jest.fn().mockReturnValue({ challenge: new ArrayBuffer(8) }),
  toJSON: jest.fn().mockReturnValue({ id: 'mocked-id', rawId: 'mocked-raw-id', type: 'public-key', response: {}, clientExtensionResults: {} }),
}));

beforeEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

const expectedEmail = 'john.doe@mail.com';

test('handles selected-mfa-type event when showUI is false', () => {
  const magic = createMagicSDK();
  magic.auth.overlay.post = jest.fn().mockImplementation(() => new Promise(() => { /* noop */ }));
  const createIntermediaryEventFn = jest.fn();
  magic.auth.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.auth.loginWithEmailOTP({ email: expectedEmail, showUI: false });

  handle.emit('selected-mfa-type', 'passkey');

  const mfaTypeEvent = magic.auth.createIntermediaryEvent.mock.calls.find(([method]) => method === 'selected-mfa-type');
  expect(mfaTypeEvent).toBeDefined();
  expect(createIntermediaryEventFn).toHaveBeenCalledWith('passkey');
});

test('handles mfa-passkey-options event - success path', async () => {
  const magic = createMagicSDK();
  magic.auth.overlay.post = jest.fn().mockImplementation(() => new Promise(() => { /* noop */ }));
  const createIntermediaryEventFn = jest.fn();
  magic.auth.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const fakeCredential = { id: 'cred', rawId: new ArrayBuffer(8), type: 'public-key', response: {} };
  Object.defineProperty(navigator, 'credentials', {
    value: { get: jest.fn().mockResolvedValue(fakeCredential) },
    writable: true,
    configurable: true,
  });

  const handle = magic.auth.loginWithEmailOTP({ email: expectedEmail, showUI: false });

  handle.emit('mfa-passkey-options', { webauthnOptions: { challenge: 'dGVzdA', rpId: 'example.com' } });

  await new Promise(resolve => setTimeout(resolve, 10));

  const assertionResponseCall = magic.auth.createIntermediaryEvent.mock.calls.find(
    ([method]) => method === 'mfa-passkey-assertion-response',
  );
  expect(assertionResponseCall).toBeDefined();
});

test('handles mfa-passkey-options event - error path', async () => {
  const magic = createMagicSDK();
  magic.auth.overlay.post = jest.fn().mockImplementation(() => new Promise(() => { /* noop */ }));
  const createIntermediaryEventFn = jest.fn();
  magic.auth.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  Object.defineProperty(navigator, 'credentials', {
    value: { get: jest.fn().mockRejectedValue(new Error('User cancelled')) },
    writable: true,
    configurable: true,
  });

  const handle = magic.auth.loginWithEmailOTP({ email: expectedEmail, showUI: false });

  handle.emit('mfa-passkey-options', { webauthnOptions: { challenge: 'dGVzdA', rpId: 'example.com' } });

  await new Promise(resolve => setTimeout(resolve, 10));

  const errorCall = magic.auth.createIntermediaryEvent.mock.calls.find(
    ([method]) => method === 'mfa-passkey-assertion-error',
  );
  expect(errorCall).toBeDefined();
  expect(createIntermediaryEventFn).toHaveBeenCalledWith('User cancelled');
});

test('handles mfa-passkey-options event - error with no message falls back to empty string', async () => {
  const magic = createMagicSDK();
  magic.auth.overlay.post = jest.fn().mockImplementation(() => new Promise(() => { /* noop */ }));
  const createIntermediaryEventFn = jest.fn();
  magic.auth.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  Object.defineProperty(navigator, 'credentials', {
    value: { get: jest.fn().mockRejectedValue({}) },
    writable: true,
    configurable: true,
  });

  const handle = magic.auth.loginWithEmailOTP({ email: expectedEmail, showUI: false });

  handle.emit('mfa-passkey-options', { webauthnOptions: { challenge: 'dGVzdA', rpId: 'example.com' } });

  await new Promise(resolve => setTimeout(resolve, 10));

  const errorCall = magic.auth.createIntermediaryEvent.mock.calls.find(
    ([method]) => method === 'mfa-passkey-assertion-error',
  );
  expect(errorCall).toBeDefined();
  expect(createIntermediaryEventFn).toHaveBeenCalledWith('');
});

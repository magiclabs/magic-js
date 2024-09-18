import { createMagicSDK } from '../../../factories';

test('Resolves immediately when cached magic.user.enableMFA.spec is true with ShowUI: true', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.enableMFA({ showUI: true });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_enable_mfa_flow');
  expect(requestPayload.params).toEqual([{ showUI: true }]);
});

test('Resolves immediately when cached magic.user.enableMFA.spec is true with ShowUI: false', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.enableMFA({ showUI: false });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_enable_mfa_flow');
  expect(requestPayload.params).toEqual([{ showUI: false }]);
});

test('Resolves immediately when cached magic.user.enableMFA.spec is true with empty param', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.enableMFA({});

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_enable_mfa_flow');
  expect(requestPayload.params).toEqual([{ showUI: true }]);
});

test('Enable MFA flow returns invalid mfa event', () => {
  const magic = createMagicSDK();
  magic.user.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.user.enableMFA({ showUI: false });

  const troll_otp = '123456';
  handle.emit('verify-mfa-code', troll_otp);
  handle.emit('cancel-mfa-setup');

  const verifyEvent = magic.user.createIntermediaryEvent.mock.calls[0];
  expect(verifyEvent[0]).toBe('verify-mfa-code');
  expect(createIntermediaryEventFn.mock.calls[0][0]).toBe(troll_otp);

  const intermediaryEventSecondMethod = magic.user.createIntermediaryEvent.mock.calls[1][0];
  expect(intermediaryEventSecondMethod).toBe('cancel-mfa-setup');
});

test('Resolves immediately when cached magic.user.enableMFA.spec is true with ShowUI: true', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.disableMFA({ showUI: true });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_disable_mfa_flow');
  expect(requestPayload.params).toEqual([{ showUI: true }]);
});

test('Resolves immediately when cached magic.user.enableMFA.spec is true with ShowUI: false', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.disableMFA({ showUI: false });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_disable_mfa_flow');
  expect(requestPayload.params).toEqual([{ showUI: false }]);
});

test('Resolves immediately when cached magic.user.enableMFA.spec is true with empty object', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.disableMFA({});

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_disable_mfa_flow');
  expect(requestPayload.params).toEqual([{ showUI: true }]);
});

test('Disable MFA flow returns invalid mfa event', () => {
  const magic = createMagicSDK();
  magic.user.overlay.post = jest.fn().mockImplementation(() => new Promise(() => {}));
  const createIntermediaryEventFn = jest.fn();
  magic.user.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.user.disableMFA({ showUI: false });

  const troll_otp = '123456';
  handle.emit('verify-mfa-code', troll_otp);
  handle.emit('cancel-mfa-disable');
  handle.emit('lost-device', troll_otp);

  const events = magic.user.createIntermediaryEvent.mock.calls;

  const verifyEvent = events[0][0];
  expect(verifyEvent).toBe('verify-mfa-code');
  expect(createIntermediaryEventFn.mock.calls[0][0]).toBe(troll_otp);

  const cancelEvent = events[1][0];
  expect(cancelEvent).toBe('cancel-mfa-disable');

  const lostDeviceEvent = events[2][0];
  expect(lostDeviceEvent).toBe('lost-device');
});

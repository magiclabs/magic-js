import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { isPromiEvent } from '../../../../src';

jest.mock('@magic-sdk/types', () => ({
  ...jest.requireActual('@magic-sdk/types'),
  RecoverAccountEmit: {
    SendOtpCode: 'send-otp-code',
  },
}));

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
});

test('Generate JSON RPC request payload with method `magic_auth_recover_account`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.recoverAccount({ email: 'test' });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_recover_account');
  expect(requestPayload.params).toEqual([{ email: 'test' }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn();

  await magic.user.recoverAccount({ email: 'test' });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.method).toBe('magic_auth_recover_account_testing_mode');
  expect(requestPayload.params).toEqual([{ email: 'test' }]);
});
test('attach event handlers when showUI is false', async () => {
  const magic = createMagicSDK();
  const mockOn = jest.fn();
  const mockHandle = { on: mockOn };
  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  magic.user.recoverAccount({ email: 'test', showUI: false });

  expect(mockOn).toHaveBeenCalledWith('send-otp-code', expect.any(Function));
});
test('does not attach event handlers when showUI is true (default)', async () => {
  const magic = createMagicSDK();
  const mockOn = jest.fn();
  const mockHandle = { on: mockOn };
  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  magic.user.recoverAccount({ email: 'test' });

  expect(mockOn).not.toHaveBeenCalled();
});
test('handle recoverAccount without configuration', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.recoverAccount();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_recover_account');
  expect(requestPayload.params).toEqual([undefined]);
});
test('handle request failure gracefully', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn(() => {
    throw new Error('Request failed');
  });

  expect(() => magic.user.recoverAccount({ email: 'test' })).toThrow('Request failed');
});
test('handle invalid configuration', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.recoverAccount({ invalidOption: true });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.params).toEqual([{ invalidOption: true }]);
});
test('calls request with correct payload when configuration is partial', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.recoverAccount({});

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_recover_account');
  expect(requestPayload.params).toEqual([{}]);
});
test('handles null configuration gracefully', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.recoverAccount(null as any);

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_recover_account');
  expect(requestPayload.params).toEqual([null]);
});
test('gracefully handles invalid event emission', async () => {
  const magic = createMagicSDK();
  const mockOn = jest.fn();
  const mockHandle = { on: mockOn };
  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  magic.user.recoverAccount({ email: 'test', showUI: false });

  const unexpectedEvent = 'unexpected-event';
  mockOn.mock.calls.forEach(([event, handler]) => {
    if (event === unexpectedEvent) {
      handler();
    }
  });

  expect(mockOn).not.toHaveBeenCalledWith(unexpectedEvent, expect.any(Function));
});
test('handles null return from `request` method', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn().mockReturnValue(null);

  const result = await magic.user.recoverAccount({ email: 'test', showUI: false });

  expect(result).toBeNull();
});
test('calls `createIntermediaryEvent` when OTP is sent and `showUI` is false', async () => {
  const magic = createMagicSDK();
  const mockHandle = { on: jest.fn() };

  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  const createIntermediaryEventSpy = jest.spyOn(magic.user, 'createIntermediaryEvent');

  await magic.user.recoverAccount({ email: 'test', showUI: false });

  expect(mockHandle.on).toHaveBeenCalledWith('send-otp-code', expect.any(Function));

  const otpHandler = mockHandle.on.mock.calls[0][1];

  const otp = '123456';
  otpHandler(otp);

  expect(createIntermediaryEventSpy).toHaveBeenCalledWith('send-otp-code', expect.any(Number));

  createIntermediaryEventSpy.mockRestore();
});

test('does not register event listener when `showUI` is true (default)', async () => {
  const magic = createMagicSDK();
  const mockHandle = { on: jest.fn() };
  magic.user.request = jest.fn().mockReturnValue(mockHandle);

  await magic.user.recoverAccount({ email: 'test' });

  expect(mockHandle.on).not.toHaveBeenCalled();
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.recoverAccount({ email: 'test' }))).toBeTruthy();
});

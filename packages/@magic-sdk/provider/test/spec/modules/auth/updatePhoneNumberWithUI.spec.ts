import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  jest.resetAllMocks();
});

test.skip('Generate JSON RPC request payload with method `magic_auth_update_phone_number`', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn();

  magic.auth.updatePhoneNumberWithUI();

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_update_phone_number');
  expect(requestPayload.params).toEqual([]);
});

test.skip('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.auth.request = jest.fn();

  magic.auth.updatePhoneNumberWithUI();

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_update_phone_number_testing_mode');
  expect(requestPayload.params).toEqual([]);
});

test.skip('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.auth.updatePhoneNumberWithUI())).toBeTruthy();
});

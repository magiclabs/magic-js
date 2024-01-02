import browserEnv from '@ikscodes/browser-env';
import { isPromiEvent, storage } from '../../../../src/util';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { mockLocalForage } from '../../../mocks';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_auth_logout`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.logout();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_logout');
  expect(requestPayload.params).toEqual([]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.logout())).toBeTruthy();
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn();

  magic.user.logout();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_logout_testing_mode');
  expect(requestPayload.params).toEqual([]);
});

test('Removes magic_auth_is_logged_in from local storage', async () => {
  const magic = createMagicSDKTestMode();
  mockLocalForage({ magic_auth_is_logged_in: 'true' });

  magic.user.logout();

  expect(storage.removeItem).toHaveBeenCalledWith('magic_auth_is_logged_in');
});

test('Removes mc_active_wallet from local storage', async () => {
  const magic = createMagicSDKTestMode();
  mockLocalForage({ mc_active_wallet: 'test' });

  magic.user.logout();

  expect(storage.removeItem).toHaveBeenCalledWith('mc_active_wallet');
});

test('Should reject with error if error occurs', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn().mockRejectedValue(new Error('something went wrong'));

  await expect(magic.user.logout()).rejects.toThrowError(new Error('something went wrong'));
});

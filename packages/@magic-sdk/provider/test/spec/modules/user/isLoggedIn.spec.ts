import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';
import { isPromiEvent, storage } from '../../../../src/util';
import { mockLocalForage } from '../../../mocks';

beforeEach(() => {
  browserEnv.restore();
});

test('Resolves immediately when cached magic_auth_is_logged_in is true', async () => {
  mockLocalForage({ magic_auth_is_logged_in: 'true' });
  const magic = createMagicSDK();
  magic.useStorageCache = true;

  const isLoggedIn = await magic.user.isLoggedIn();

  expect(isLoggedIn).toEqual(true);
});

test('Waits for request before resolving when cached magic_auth_is_logged_in is false', async () => {
  mockLocalForage({ magic_auth_is_logged_in: 'true' });
  const magic = createMagicSDK();
  magic.user.request = jest.fn().mockResolvedValue(true);

  const isLoggedIn = await magic.user.isLoggedIn();

  expect(isLoggedIn).toEqual(true);
});

test('Stores magic_auth_is_logged_in=true in local storage when request resolves true', async () => {
  mockLocalForage();
  const magic = createMagicSDK();
  magic.useStorageCache = true;
  magic.user.request = jest.fn().mockResolvedValue(true);

  await magic.user.isLoggedIn();

  expect(storage.setItem).toHaveBeenCalledWith('magic_auth_is_logged_in', true);
});

test('Removes magic_auth_is_logged_in=true from local storage when request resolves false', async () => {
  mockLocalForage();
  const magic = createMagicSDK();
  magic.useStorageCache = true;
  magic.user.request = jest.fn().mockResolvedValue(false);

  await magic.user.isLoggedIn();

  expect(storage.removeItem).toHaveBeenCalledWith('magic_auth_is_logged_in');
});

test(' Generate JSON RPC request payload with method `magic_is_logged_in`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.isLoggedIn();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_is_logged_in');
  expect(requestPayload.params).toEqual([]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn();

  await magic.user.isLoggedIn();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_is_logged_in_testing_mode');
  expect(requestPayload.params).toEqual([]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.isLoggedIn())).toBeTruthy();
});

test('Should reject with error if error occurs', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn().mockRejectedValue(new Error('something went wrong'));

  await expect(magic.user.isLoggedIn()).rejects.toThrowError(new Error('something went wrong'));
});

test('Emits user logged out event when logout resolves', async () => {
  mockLocalForage({ magic_auth_is_logged_in: 'true' });
  const magic = createMagicSDK();
  magic.useStorageCache = true;
  magic.user.request = jest.fn().mockResolvedValue(true);

  const spyEmitUserLoggedOut = jest.spyOn(magic.user, 'emitUserLoggedOut');

  await magic.user.logout();

  expect(spyEmitUserLoggedOut).toHaveBeenCalledWith(true);
});

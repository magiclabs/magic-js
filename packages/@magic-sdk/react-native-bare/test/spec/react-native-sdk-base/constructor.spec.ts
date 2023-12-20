import browserEnv from '@ikscodes/browser-env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserModule } from '@magic-sdk/provider';
import { createMagicSDK } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv.restore();
  reactNativeStyleSheetStub();
});

test('SDKBaseReactNative constructor sets up UserModule instance when useStorageCacheMobile is true', () => {
  const magic = createMagicSDK({ useStorageCacheMobile: true });

  // Ensure that the UserModule instance is created
  expect(magic.usr).toBeDefined();
  expect(magic.usr).toBeInstanceOf(UserModule);
});

test('Returns true if the cached value of isLoggedIn is true', async () => {
  const magic = createMagicSDK({ useStorageCacheMobile: true });

  AsyncStorage.getItem = jest.fn().mockResolvedValue('true');
  const isLoggedInResult = await magic.user.isLoggedIn();

  expect(AsyncStorage.getItem).toHaveBeenCalledWith('isLoggedIn');
  expect(isLoggedInResult).toBe(true);
});

test('Saves isLoggedIn=true in cache when user is logged in', async () => {
  const magic = createMagicSDK({ useStorageCacheMobile: true });

  AsyncStorage.getItem = jest.fn().mockResolvedValue('false');
  jest.spyOn(magic.usr, 'isLoggedIn').mockResolvedValue(true);
  const isLoggedInResult = await magic.user.isLoggedIn();

  expect(AsyncStorage.getItem).toHaveBeenCalledWith('isLoggedIn');
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('isLoggedIn', 'true');
  expect(isLoggedInResult).toBe(true);
});

test('Removes isLoggedIn from cache when user is not logged in', async () => {
  const magic = createMagicSDK({ useStorageCacheMobile: true });

  AsyncStorage.getItem = jest.fn().mockResolvedValue('true');
  jest.spyOn(magic.usr, 'isLoggedIn').mockResolvedValue(false);
  const isLoggedInResult = await magic.user.isLoggedIn();

  expect(AsyncStorage.getItem).toHaveBeenCalledWith('isLoggedIn');
  expect(AsyncStorage.removeItem).toHaveBeenCalledWith('isLoggedIn');
  expect(isLoggedInResult).toBe(true);
});

test('Removes isLoggedIn from cache user logs out', async () => {
  const magic = createMagicSDK({ useStorageCacheMobile: true });

  const emitUserLoggedOutSpy = jest.spyOn(magic, 'emitUserLoggedOut');
  AsyncStorage.getItem = jest.fn().mockResolvedValue('false');
  jest.spyOn(magic.usr, 'logout').mockResolvedValue(true);
  const isLoggedOut = await magic.user.logout();

  expect(AsyncStorage.removeItem).toHaveBeenCalledWith('isLoggedIn');
  expect(emitUserLoggedOutSpy).toHaveBeenCalledWith(isLoggedOut);
  expect(isLoggedOut).toBe(true);
});

test('Rejects with error if an error is thrown', async () => {
  const magic = createMagicSDK({ useStorageCacheMobile: true });

  const emitUserLoggedOutSpy = jest.spyOn(magic, 'emitUserLoggedOut');
  AsyncStorage.getItem = jest.fn().mockResolvedValue('false');
  jest.spyOn(magic.usr, 'logout').mockRejectedValue(new Error('something went wrong'));

  await expect(magic.user.logout()).rejects.toThrowError('something went wrong');
  expect(AsyncStorage.removeItem).toHaveBeenCalledWith('isLoggedIn');
  expect(emitUserLoggedOutSpy).not.toHaveBeenCalled(); // Since logout threw an error, emitUserLoggedOut should not be called
});

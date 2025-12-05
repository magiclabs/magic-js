// Mock expo-secure-store before importing the module
const mockSetItemAsync = jest.fn();
const mockGetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  setItemAsync: mockSetItemAsync,
  getItemAsync: mockGetItemAsync,
  deleteItemAsync: mockDeleteItemAsync,
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
}));

// Mock expo-application
jest.mock('expo-application', () => ({
  applicationId: 'com.test.app',
}));

import {
  setRefreshTokenInSecureStore,
  getRefreshTokenInSecureStore,
  removeRefreshTokenInSecureStore,
} from '../../../src/native-crypto/keychain';

describe('keychain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the module to clear cached token
    jest.resetModules();
  });

  describe('setRefreshTokenInSecureStore', () => {
    it('should store refresh token successfully', async () => {
      mockSetItemAsync.mockResolvedValue(undefined);

      // Need to re-import to get fresh module state
      jest.isolateModules(async () => {
        const { setRefreshTokenInSecureStore: setToken } = require('../../../src/native-crypto/keychain');
        const result = await setToken('test-token');

        expect(result).toBe(true);
        expect(mockSetItemAsync).toHaveBeenCalledWith('com.test.app.magic.sdk.rt', 'test-token', {
          keychainService: 'com.test.app.magic.sdk.rt.service',
          keychainAccessible: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
        });
      });
    });

    it('should skip write if token has not changed (cached)', async () => {
      mockSetItemAsync.mockResolvedValue(undefined);

      // Set the token first
      await setRefreshTokenInSecureStore('same-token');
      mockSetItemAsync.mockClear();

      // Try to set the same token again
      const result = await setRefreshTokenInSecureStore('same-token');

      expect(result).toBe(true);
      expect(mockSetItemAsync).not.toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      jest.isolateModules(async () => {
        const mockSetItem = jest.fn().mockRejectedValue(new Error('Storage error'));
        jest.doMock('expo-secure-store', () => ({
          setItemAsync: mockSetItem,
          AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
        }));

        const { setRefreshTokenInSecureStore: setToken } = require('../../../src/native-crypto/keychain');
        const result = await setToken('test-token');

        expect(result).toBe(false);
      });
    });
  });

  describe('getRefreshTokenInSecureStore', () => {
    it('should retrieve refresh token successfully', async () => {
      jest.isolateModules(async () => {
        const mockGetItem = jest.fn().mockResolvedValue('stored-token');
        jest.doMock('expo-secure-store', () => ({
          getItemAsync: mockGetItem,
        }));
        jest.doMock('expo-application', () => ({
          applicationId: 'com.test.app',
        }));

        const { getRefreshTokenInSecureStore: getToken } = require('../../../src/native-crypto/keychain');
        const result = await getToken();

        expect(result).toBe('stored-token');
        expect(mockGetItem).toHaveBeenCalledWith('com.test.app.magic.sdk.rt', {
          keychainService: 'com.test.app.magic.sdk.rt.service',
        });
      });
    });

    it('should return cached token if available', async () => {
      mockSetItemAsync.mockResolvedValue(undefined);
      mockGetItemAsync.mockResolvedValue('stored-token');

      // First set a token to populate the cache
      await setRefreshTokenInSecureStore('cached-token');

      // Now get should return cached value without calling getItemAsync
      mockGetItemAsync.mockClear();
      const result = await getRefreshTokenInSecureStore();

      expect(result).toBe('cached-token');
      expect(mockGetItemAsync).not.toHaveBeenCalled();
    });

    it('should return null if no token exists', async () => {
      jest.isolateModules(async () => {
        const mockGetItem = jest.fn().mockResolvedValue(null);
        jest.doMock('expo-secure-store', () => ({
          getItemAsync: mockGetItem,
        }));
        jest.doMock('expo-application', () => ({
          applicationId: 'com.test.app',
        }));

        const { getRefreshTokenInSecureStore: getToken } = require('../../../src/native-crypto/keychain');
        const result = await getToken();

        expect(result).toBeNull();
      });
    });

    it('should return null on error', async () => {
      jest.isolateModules(async () => {
        const mockGetItem = jest.fn().mockRejectedValue(new Error('Storage error'));
        jest.doMock('expo-secure-store', () => ({
          getItemAsync: mockGetItem,
        }));
        jest.doMock('expo-application', () => ({
          applicationId: 'com.test.app',
        }));

        const { getRefreshTokenInSecureStore: getToken } = require('../../../src/native-crypto/keychain');
        const result = await getToken();

        expect(result).toBeNull();
      });
    });
  });

  describe('removeRefreshTokenInSecureStore', () => {
    it('should remove refresh token successfully', async () => {
      mockDeleteItemAsync.mockResolvedValue(undefined);

      await removeRefreshTokenInSecureStore();

      expect(mockDeleteItemAsync).toHaveBeenCalledWith('com.test.app.magic.sdk.rt', {
        keychainService: 'com.test.app.magic.sdk.rt.service',
      });
    });

    it('should clear cache when removing token', async () => {
      mockSetItemAsync.mockResolvedValue(undefined);
      mockDeleteItemAsync.mockResolvedValue(undefined);
      mockGetItemAsync.mockResolvedValue('new-token');

      // Set a token first
      await setRefreshTokenInSecureStore('cached-token');

      // Remove the token
      await removeRefreshTokenInSecureStore();

      // Now get should call getItemAsync since cache is cleared
      const result = await getRefreshTokenInSecureStore();

      expect(mockGetItemAsync).toHaveBeenCalled();
      expect(result).toBe('new-token');
    });

    it('should handle error gracefully', async () => {
      mockDeleteItemAsync.mockRejectedValue(new Error('Delete error'));

      // Should not throw
      await expect(removeRefreshTokenInSecureStore()).resolves.not.toThrow();
    });
  });
});


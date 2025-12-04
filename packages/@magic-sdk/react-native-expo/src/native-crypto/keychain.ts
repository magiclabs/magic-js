import * as SecureStore from 'expo-secure-store';
import { getKeyAlias } from './utils/key-alias';

const SERVICE = getKeyAlias('refreshTokenService');
const KEY = getKeyAlias('refreshToken');

let cachedRefreshToken: string | null = null;

/**
 * Stores the refresh token securely using Expo SecureStore.
 * Uses 'WHEN_UNLOCKED_THIS_DEVICE_ONLY' for security similar to the original keychain accessible level.
 */
export const setRefreshTokenInSecureStore = async (rt: string): Promise<boolean> => {
  console.log('Setting Refresh Token In SECURE STORAGE', { rt });
  // Skip write if token hasn't changed
  if (cachedRefreshToken === rt) {
    console.log('Refresh Token Has NOT Changed');
    return true;
  }

  try {
    await SecureStore.setItemAsync(KEY, rt, {
      keychainService: SERVICE, // Used on iOS to scope the item
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });

    cachedRefreshToken = rt; // Update cache on successful write
    console.log('Successfully Has Set Refresh Token');
    return true;
  } catch (error) {
    console.error('Failed to set refresh token in secure store', error);
    return false;
  }
};

/**
 * Retrieves the refresh token from secure storage.
 * Returns the cached value if available to improve performance.
 */
export const getRefreshTokenInSecureStore = async (): Promise<string | null> => {
  console.log('Getting Refresh Token In SECURE STORAGE');
  // Return cached value if available
  if (cachedRefreshToken !== null) {
    console.log('Refresh Token Has Been Cached');
    return cachedRefreshToken;
  }

  try {
    const token = await SecureStore.getItemAsync(KEY, {
      keychainService: SERVICE,
    });

    if (!token) return null;

    cachedRefreshToken = token;
    console.log('Successfully Has Got Refresh Token');
    return cachedRefreshToken;
  } catch (error) {
    console.error('Failed to get refresh token in secure store', error);
    return null;
  }
};

/**
 * Removes the refresh token from secure storage and clears the local cache.
 */
export const removeRefreshTokenInSecureStore = async (): Promise<void> => {
  try {
    cachedRefreshToken = null; // Clear cache immediately
    await SecureStore.deleteItemAsync(KEY, {
      keychainService: SERVICE,
    });
  } catch (error) {
    console.error('Failed to remove refresh token in secure store', error);
  }
};

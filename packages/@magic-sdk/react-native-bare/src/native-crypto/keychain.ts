import * as Keychain from 'react-native-keychain';
import { getKeyAlias } from './utils/key-alias';

const SERVICE = getKeyAlias('refreshTokenService');
const KEY = getKeyAlias('refreshToken');

let cachedRefreshToken: string | null = null;

export const setRefreshTokenInKeychain = async (rt: string) => {
  // Skip write if token hasn't changed
  if (cachedRefreshToken === rt) {
    return true;
  }

  try {
    const result = await Keychain.setGenericPassword(KEY, rt, {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
    cachedRefreshToken = rt; // Update cache on successful write
    return result;
  } catch (error) {
    console.error('Failed to set refresh token in keychain', error);
    return false;
  }
};

export const getRefreshTokenInKeychain = async () => {
  // Return cached value if available
  if (cachedRefreshToken !== null) {
    return cachedRefreshToken;
  }

  try {
    const keychainEntry = await Keychain.getGenericPassword({ service: SERVICE });
    if (!keychainEntry) return null;

    cachedRefreshToken = keychainEntry.password;
    return cachedRefreshToken;
  } catch (error) {
    console.error('Failed to get refresh token in keychain', error);
    return null;
  }
};

export const removeRefreshTokenInKeychain = async () => {
  try {
    cachedRefreshToken = null; // Clear cache
    return await Keychain.resetGenericPassword({ service: SERVICE });
  } catch (error) {
    console.error('Failed to remove refresh token in keychain', error);
    return null;
  }
};

import * as Keychain from 'react-native-keychain';
import { getKeyAlias } from './utils/key-alias';

const SERVICE = getKeyAlias('refreshTokenService');
const KEY = getKeyAlias('refreshToken');

export const setRefreshTokenInKeychain = async (rt: string) => {
  try {
    return await Keychain.setGenericPassword(KEY, rt, {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  } catch (error) {
    console.error('Failed to set refresh token in keychain', error);
    return false;
  }
};

export const getRefreshTokenInKeychain = async () => {
  try {
    const keychainEntry = await Keychain.getGenericPassword({ service: SERVICE });
    if (!keychainEntry) return null;

    return keychainEntry.password;
  } catch (error) {
    console.error('Failed to get refresh token in keychain', error);
    return null;
  }
};

export const removeRefreshTokenInKeychain = async () => {
  try {
    return await Keychain.resetGenericPassword({ service: SERVICE });
  } catch (error) {
    console.error('Failed to remove refresh token in keychain', error);
    return null;
  }
};

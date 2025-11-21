import * as Keychain from 'react-native-keychain';

const SERVICE = 'magic_sdk_rt';
const KEY = 'magic_rt';

export const setRefreshTokenInKeychain = async (rt: string) => {
  return await Keychain.setGenericPassword(KEY, rt, {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
};

export const getRefreshTokenInKeychain = async () => {
  const keychainEntry = await Keychain.getGenericPassword({ service: SERVICE });
  if (!keychainEntry) return null;

  return keychainEntry.password;
};

export const removeRefreshTokenInKeychain = async () => {
  return await Keychain.resetGenericPassword({ service: SERVICE });
};

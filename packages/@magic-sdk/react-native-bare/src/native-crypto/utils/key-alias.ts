import DeviceInfo from 'react-native-device-info';

const KEY_SUFFIX_MAP = {
  dpop: 'magic.sdk.dpop',
  refreshToken: 'magic.sdk.rt',
  refreshTokenService: 'magic.sdk.rt.service',
};

/**
 * Returns the key alias for the given key.
 * Let's us to safely store the keys in the keychain and avoid conflicts with other apps using magic sdk.
 */
export function getKeyAlias(key: keyof typeof KEY_SUFFIX_MAP): string {
  const appId = DeviceInfo.getBundleId();
  console.log('Getting key alias', { appId, key, alias: `${appId}.${KEY_SUFFIX_MAP[key]}` });
  return `${appId}.${KEY_SUFFIX_MAP[key]}`;
}

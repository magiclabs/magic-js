import * as Application from 'expo-application';

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
  return `${Application.applicationId}.${KEY_SUFFIX_MAP[key]}`;
}

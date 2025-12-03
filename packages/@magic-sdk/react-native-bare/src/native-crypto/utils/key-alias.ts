import DeviceInfo from 'react-native-device-info';

const KEY_SUFFIX_MAP = {
  dpop: 'magic.sdk.dpop',
  refreshToken: 'magic.sdk.rt',
  refreshTokenService: 'magic.sdk.rt.service',
};

export function getKeyAlias(key: keyof typeof KEY_SUFFIX_MAP): string {
  const appId = DeviceInfo.getBundleId();
  return `${appId}.${KEY_SUFFIX_MAP[key]}`;
}

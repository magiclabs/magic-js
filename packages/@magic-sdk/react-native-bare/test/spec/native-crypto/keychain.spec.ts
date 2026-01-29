import {
  getRefreshTokenInKeychain,
  removeRefreshTokenInKeychain,
  setRefreshTokenInKeychain,
} from '../../../src/native-crypto/keychain';
import { setGenericPassword, getGenericPassword, resetGenericPassword, ACCESSIBLE } from 'react-native-keychain';

jest.mock('react-native-device-info', () => ({
  getBundleId: () => 'com.apple.mockApp',
}));

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve('mock-result')),
  getGenericPassword: jest.fn(() => Promise.resolve({ password: 'test-token' })),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
  ACCESSIBLE: {
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
  },
}));

describe('setRefreshTokenInKeychain', () => {
  it('should store refresh token successfully', async () => {
    await removeRefreshTokenInKeychain();
    const result = await setRefreshTokenInKeychain('test-token');

    expect(setGenericPassword).toHaveBeenCalledWith('com.apple.mockApp.magic.sdk.rt', 'test-token', {
      service: 'com.apple.mockApp.magic.sdk.rt.service',
      accessible: ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
    expect(result).toBe('mock-result');
  });
  it('should skip write if token has not changed (cached)', async () => {
    await setRefreshTokenInKeychain('test-token');
    await setRefreshTokenInKeychain('test-token');

    expect(setGenericPassword).toHaveBeenCalledTimes(1);
  });
  it('should return false on error', async () => {
    (setGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('test-error'));

    await removeRefreshTokenInKeychain();
    const result = await setRefreshTokenInKeychain('test-token-2');

    expect(result).toBe(false);
    expect(setGenericPassword).toHaveBeenCalledWith('com.apple.mockApp.magic.sdk.rt', 'test-token', {
      service: 'com.apple.mockApp.magic.sdk.rt.service',
      accessible: ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  });
});

describe('getRefreshTokenInKeychain', () => {
  it('should retrieve refresh token successfully', async () => {
    await removeRefreshTokenInKeychain(); // make sure to reset cache;

    const result = await getRefreshTokenInKeychain();

    expect(result).toBe('test-token');
    expect(getGenericPassword).toHaveBeenCalledWith({ service: 'com.apple.mockApp.magic.sdk.rt.service' });
  });
  it('should return cached token if available', async () => {
    jest.clearAllMocks();
    await setRefreshTokenInKeychain('cached-token');

    const result = await getRefreshTokenInKeychain();

    expect(result).toBe('cached-token');
    expect(getGenericPassword).not.toHaveBeenCalled();
  });
  it('should return null on error', async () => {
    (getGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('test-error'));

    await removeRefreshTokenInKeychain();
    const result = await getRefreshTokenInKeychain();

    expect(result).toBeNull();
  });
  it('should return null if no refresh token found in keychain', async () => {
    (getGenericPassword as jest.Mock).mockResolvedValueOnce(undefined);

    await removeRefreshTokenInKeychain();
    const result = await getRefreshTokenInKeychain();

    expect(result).toBeNull();
  });
});

describe('removeRefreshTokenInKeychain', () => {
  it('should remove refresh token successfully', async () => {
    const result = await removeRefreshTokenInKeychain();
    expect(result).toBe(true);
    expect(resetGenericPassword).toHaveBeenCalledWith({ service: 'com.apple.mockApp.magic.sdk.rt.service' });
  });
  it('should clear cache when removing token', async () => {
    await setRefreshTokenInKeychain('cached-token'); // cache the token

    const success = await removeRefreshTokenInKeychain(); // remove both from cache & keychain
    const refreshToken = await getRefreshTokenInKeychain(); // try to get it from keychain and get mock value

    expect(success).toBe(true);
    expect(refreshToken).toBe('test-token');
    expect(resetGenericPassword).toHaveBeenCalledWith({ service: 'com.apple.mockApp.magic.sdk.rt.service' });
    expect(getGenericPassword).toHaveBeenCalledWith({ service: 'com.apple.mockApp.magic.sdk.rt.service' });
  });
  it('should handle error gracefully', async () => {
    (resetGenericPassword as jest.Mock).mockRejectedValue(new Error('test-error'));
    const result = await removeRefreshTokenInKeychain();
    expect(result).toBeNull();
    expect(resetGenericPassword).toHaveBeenCalledWith({ service: 'com.apple.mockApp.magic.sdk.rt.service' });
  });
});

import { getKeyAlias } from '../../../../src/native-crypto/utils/key-alias';

// react-native-device-info is already mocked in test/mocks.ts

describe('key-alias utilities', () => {
  describe('getKeyAlias', () => {
    it('should return correct alias for dpop key', () => {
      const result = getKeyAlias('dpop');
      expect(result).toBe('com.apple.mockApp.magic.sdk.dpop');
    });

    it('should return correct alias for refreshToken key', () => {
      const result = getKeyAlias('refreshToken');
      expect(result).toBe('com.apple.mockApp.magic.sdk.rt');
    });

    it('should return correct alias for refreshTokenService key', () => {
      const result = getKeyAlias('refreshTokenService');
      expect(result).toBe('com.apple.mockApp.magic.sdk.rt.service');
    });
  });
});


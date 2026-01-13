import { getKeyAlias } from '../../../../src/native-crypto/utils/key-alias';

// Mock expo-application
jest.mock('expo-application', () => ({
  applicationId: 'com.test.app',
}));

describe('key-alias utilities', () => {
  describe('getKeyAlias', () => {
    it('should return correct alias for dpop key', () => {
      const result = getKeyAlias('dpop');
      expect(result).toBe('com.test.app.magic.sdk.dpop');
    });

    it('should return correct alias for refreshToken key', () => {
      const result = getKeyAlias('refreshToken');
      expect(result).toBe('com.test.app.magic.sdk.rt');
    });

    it('should return correct alias for refreshTokenService key', () => {
      const result = getKeyAlias('refreshTokenService');
      expect(result).toBe('com.test.app.magic.sdk.rt.service');
    });
  });
});


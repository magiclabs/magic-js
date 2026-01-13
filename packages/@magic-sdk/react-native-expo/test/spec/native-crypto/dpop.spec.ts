// Mock dependencies before imports
const mockGetOrCreateAsymmetricKey = jest.fn();
const mockSign = jest.fn();
const mockDeleteKey = jest.fn();

jest.mock('react-native-device-crypto', () => ({
  __esModule: true,
  default: {
    getOrCreateAsymmetricKey: mockGetOrCreateAsymmetricKey,
    sign: mockSign,
    deleteKey: mockDeleteKey,
  },
  AccessLevel: {
    ALWAYS: 'ALWAYS',
  },
}));

jest.mock('react-native-uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

// Mock expo-application
jest.mock('expo-application', () => ({
  applicationId: 'com.test.app',
}));

import { getDpop, deleteDpop } from '../../../src/native-crypto/dpop';
import { uint8ArrayToBase64 } from '../../../src/native-crypto/utils/uint8';

describe('dpop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDpop', () => {
    it('should generate a valid DPoP token', async () => {
      // Create a mock SPKI public key (P-256 format)
      const xCoord = new Uint8Array(32).fill(0x11);
      const yCoord = new Uint8Array(32).fill(0x22);
      const spkiHeader = new Uint8Array([
        0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48,
        0xce, 0x3d, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00,
      ]);
      const keyData = new Uint8Array([0x04, ...xCoord, ...yCoord]);
      const mockPublicKey = uint8ArrayToBase64(new Uint8Array([...spkiHeader, ...keyData]));

      mockGetOrCreateAsymmetricKey.mockResolvedValue(mockPublicKey);

      // Create a mock DER signature
      const r = new Uint8Array(32).fill(0x33);
      const s = new Uint8Array(32).fill(0x44);
      const derSignature = new Uint8Array([0x30, 68, 0x02, 32, ...r, 0x02, 32, ...s]);
      mockSign.mockResolvedValue(uint8ArrayToBase64(derSignature));

      const result = await getDpop();

      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');

      // Verify the token structure (header.payload.signature)
      const parts = result!.split('.');
      expect(parts.length).toBe(3);

      // Verify header
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      expect(header.typ).toBe('dpop+jwt');
      expect(header.alg).toBe('ES256');
      expect(header.jwk).toBeDefined();
      expect(header.jwk.kty).toBe('EC');
      expect(header.jwk.crv).toBe('P-256');

      // Verify payload
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      expect(payload.jti).toBe('test-uuid-1234');
      expect(typeof payload.iat).toBe('number');

      // Verify DeviceCrypto was called correctly
      expect(mockGetOrCreateAsymmetricKey).toHaveBeenCalledWith('com.test.app.magic.sdk.dpop', {
        accessLevel: 'ALWAYS',
        invalidateOnNewBiometry: false,
      });

      expect(mockSign).toHaveBeenCalledWith(
        'com.test.app.magic.sdk.dpop',
        expect.stringContaining('.'),
        expect.objectContaining({
          biometryTitle: 'Sign DPoP',
          biometrySubTitle: 'Sign DPoP',
          biometryDescription: 'Sign DPoP',
        }),
      );
    });

    it('should return null on key creation error', async () => {
      mockGetOrCreateAsymmetricKey.mockRejectedValue(new Error('Key creation failed'));

      const result = await getDpop();

      expect(result).toBeNull();
    });

    it('should return null on signing error', async () => {
      // Create a mock SPKI public key
      const xCoord = new Uint8Array(32).fill(0x11);
      const yCoord = new Uint8Array(32).fill(0x22);
      const spkiHeader = new Uint8Array([
        0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48,
        0xce, 0x3d, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00,
      ]);
      const keyData = new Uint8Array([0x04, ...xCoord, ...yCoord]);
      const mockPublicKey = uint8ArrayToBase64(new Uint8Array([...spkiHeader, ...keyData]));

      mockGetOrCreateAsymmetricKey.mockResolvedValue(mockPublicKey);
      mockSign.mockRejectedValue(new Error('Signing failed'));

      const result = await getDpop();

      expect(result).toBeNull();
    });

    it('should use correct timestamp in claims', async () => {
      const mockDate = new Date('2024-01-15T12:00:00Z');
      jest.spyOn(global.Date, 'now').mockReturnValue(mockDate.getTime());

      // Create a mock SPKI public key
      const xCoord = new Uint8Array(32).fill(0x11);
      const yCoord = new Uint8Array(32).fill(0x22);
      const spkiHeader = new Uint8Array([
        0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48,
        0xce, 0x3d, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00,
      ]);
      const keyData = new Uint8Array([0x04, ...xCoord, ...yCoord]);
      const mockPublicKey = uint8ArrayToBase64(new Uint8Array([...spkiHeader, ...keyData]));

      mockGetOrCreateAsymmetricKey.mockResolvedValue(mockPublicKey);

      // Create a mock DER signature
      const r = new Uint8Array(32).fill(0x33);
      const s = new Uint8Array(32).fill(0x44);
      const derSignature = new Uint8Array([0x30, 68, 0x02, 32, ...r, 0x02, 32, ...s]);
      mockSign.mockResolvedValue(uint8ArrayToBase64(derSignature));

      const result = await getDpop();

      const parts = result!.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      expect(payload.iat).toBe(Math.floor(mockDate.getTime() / 1000));

      jest.restoreAllMocks();
    });
  });

  describe('deleteDpop', () => {
    it('should delete the DPoP key successfully', async () => {
      mockDeleteKey.mockResolvedValue(true);

      const result = await deleteDpop();

      expect(result).toBe(true);
      expect(mockDeleteKey).toHaveBeenCalledWith('com.test.app.magic.sdk.dpop');
    });

    it('should return false on deletion error', async () => {
      mockDeleteKey.mockRejectedValue(new Error('Deletion failed'));

      const result = await deleteDpop();

      expect(result).toBe(false);
    });

    it('should return false when deleteKey returns false', async () => {
      mockDeleteKey.mockResolvedValue(false);

      const result = await deleteDpop();

      expect(result).toBe(false);
    });
  });
});


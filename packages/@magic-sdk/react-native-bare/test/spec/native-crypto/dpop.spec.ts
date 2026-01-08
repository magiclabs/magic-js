// Mock react-native-device-crypto before any imports
jest.mock('react-native-device-crypto', () => ({
  __esModule: true,
  default: {
    getOrCreateAsymmetricKey: jest.fn(),
    sign: jest.fn(),
    deleteKey: jest.fn(),
  },
  AccessLevel: {
    ALWAYS: 'ALWAYS',
  },
}));

jest.mock('react-native-uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

// react-native-device-info is already mocked in test/mocks.ts

import DeviceCrypto from 'react-native-device-crypto';
import { getDpop, deleteDpop } from '../../../src/native-crypto/dpop';
import { uint8ArrayToBase64 } from '../../../src/native-crypto/utils/uint8';

// Helper to create a mock SPKI public key
const createMockPublicKey = () => {
  const xCoord = new Uint8Array(32).fill(0x11);
  const yCoord = new Uint8Array(32).fill(0x22);
  const spkiHeader = new Uint8Array([
    0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce,
    0x3d, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00,
  ]);
  const keyData = new Uint8Array([0x04, ...xCoord, ...yCoord]);
  return uint8ArrayToBase64(new Uint8Array([...spkiHeader, ...keyData]));
};

// Helper to create a mock DER signature
const createMockDerSignature = () => {
  const r = new Uint8Array(32).fill(0x33);
  const s = new Uint8Array(32).fill(0x44);
  return uint8ArrayToBase64(new Uint8Array([0x30, 68, 0x02, 32, ...r, 0x02, 32, ...s]));
};

describe('dpop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDpop', () => {
    it('should generate a valid DPoP token', async () => {
      const mockPublicKey = createMockPublicKey();
      const mockSignature = createMockDerSignature();

      (DeviceCrypto.getOrCreateAsymmetricKey as jest.Mock).mockResolvedValue(mockPublicKey);
      (DeviceCrypto.sign as jest.Mock).mockResolvedValue(mockSignature);

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
    });

    it('should call DeviceCrypto with correct key alias and options', async () => {
      const mockPublicKey = createMockPublicKey();
      const mockSignature = createMockDerSignature();

      (DeviceCrypto.getOrCreateAsymmetricKey as jest.Mock).mockResolvedValue(mockPublicKey);
      (DeviceCrypto.sign as jest.Mock).mockResolvedValue(mockSignature);

      await getDpop();

      expect(DeviceCrypto.getOrCreateAsymmetricKey).toHaveBeenCalledWith('com.apple.mockApp.magic.sdk.dpop', {
        accessLevel: 'ALWAYS',
        invalidateOnNewBiometry: false,
      });

      expect(DeviceCrypto.sign).toHaveBeenCalledWith(
        'com.apple.mockApp.magic.sdk.dpop',
        expect.stringContaining('.'),
        expect.objectContaining({
          biometryTitle: 'Sign DPoP',
          biometrySubTitle: 'Sign DPoP',
          biometryDescription: 'Sign DPoP',
        }),
      );
    });

    it('should return null when key creation fails', async () => {
      (DeviceCrypto.getOrCreateAsymmetricKey as jest.Mock).mockRejectedValue(new Error('Key creation failed'));

      const result = await getDpop();

      expect(result).toBeNull();
    });

    it('should return null when signing fails', async () => {
      const mockPublicKey = createMockPublicKey();

      (DeviceCrypto.getOrCreateAsymmetricKey as jest.Mock).mockResolvedValue(mockPublicKey);
      (DeviceCrypto.sign as jest.Mock).mockRejectedValue(new Error('Signing failed'));

      const result = await getDpop();

      expect(result).toBeNull();
    });

    it('should include correct timestamp in claims', async () => {
      const mockDate = new Date('2024-01-15T12:00:00Z');
      jest.spyOn(global.Date, 'now').mockReturnValue(mockDate.getTime());

      const mockPublicKey = createMockPublicKey();
      const mockSignature = createMockDerSignature();

      (DeviceCrypto.getOrCreateAsymmetricKey as jest.Mock).mockResolvedValue(mockPublicKey);
      (DeviceCrypto.sign as jest.Mock).mockResolvedValue(mockSignature);

      const result = await getDpop();

      const parts = result!.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      expect(payload.iat).toBe(Math.floor(mockDate.getTime() / 1000));

      jest.restoreAllMocks();
    });
  });

  describe('deleteDpop', () => {
    it('should return true when key is deleted successfully', async () => {
      (DeviceCrypto.deleteKey as jest.Mock).mockResolvedValue(true);

      const result = await deleteDpop();

      expect(result).toBe(true);
      expect(DeviceCrypto.deleteKey).toHaveBeenCalledWith('com.apple.mockApp.magic.sdk.dpop');
    });

    it('should return false when deletion throws an error', async () => {
      (DeviceCrypto.deleteKey as jest.Mock).mockRejectedValue(new Error('Deletion failed'));

      const result = await deleteDpop();

      expect(result).toBe(false);
    });

    it('should return false when deleteKey returns false', async () => {
      (DeviceCrypto.deleteKey as jest.Mock).mockResolvedValue(false);

      const result = await deleteDpop();

      expect(result).toBe(false);
    });
  });
});

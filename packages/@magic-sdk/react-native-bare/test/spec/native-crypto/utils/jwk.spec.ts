import { spkiToJwk } from '../../../../src/native-crypto/utils/jwk';
import { uint8ArrayToBase64 } from '../../../../src/native-crypto/utils/uint8';

describe('jwk utilities', () => {
  describe('spkiToJwk', () => {
    it('should convert SPKI public key to JWK format', () => {
      // Create a mock P-256 SPKI public key
      // SPKI header for P-256 is 26 bytes, followed by 65 bytes of key data
      const spkiHeader = new Uint8Array([
        0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce,
        0x3d, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00,
      ]);

      // 65 bytes: 0x04 (uncompressed point indicator) + 32 bytes X + 32 bytes Y
      const xCoord = new Uint8Array(32);
      xCoord.fill(0x11);
      const yCoord = new Uint8Array(32);
      yCoord.fill(0x22);

      const keyData = new Uint8Array([0x04, ...xCoord, ...yCoord]);

      const spkiKey = new Uint8Array([...spkiHeader, ...keyData]);
      const spkiBase64 = uint8ArrayToBase64(spkiKey);

      const result = spkiToJwk(spkiBase64);

      expect(result).toEqual({
        kty: 'EC',
        crv: 'P-256',
        x: expect.any(String),
        y: expect.any(String),
      });

      // Verify X and Y are base64url encoded
      expect(result.x).not.toContain('+');
      expect(result.x).not.toContain('/');
      expect(result.x).not.toContain('=');
      expect(result.y).not.toContain('+');
      expect(result.y).not.toContain('/');
      expect(result.y).not.toContain('=');
    });

    it('should extract correct X and Y coordinates', () => {
      // Create predictable coordinates
      const xCoord = new Uint8Array(32);
      for (let i = 0; i < 32; i++) xCoord[i] = i;

      const yCoord = new Uint8Array(32);
      for (let i = 0; i < 32; i++) yCoord[i] = 32 + i;

      const spkiHeader = new Uint8Array([
        0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce,
        0x3d, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00,
      ]);

      const keyData = new Uint8Array([0x04, ...xCoord, ...yCoord]);
      const spkiKey = new Uint8Array([...spkiHeader, ...keyData]);
      const spkiBase64 = uint8ArrayToBase64(spkiKey);

      const result = spkiToJwk(spkiBase64);

      // Decode and verify
      const decodedX = Buffer.from(result.x, 'base64');
      const decodedY = Buffer.from(result.y, 'base64');

      expect(decodedX).toEqual(Buffer.from(xCoord));
      expect(decodedY).toEqual(Buffer.from(yCoord));
    });

    it('should throw error for compressed point format', () => {
      const spkiHeader = new Uint8Array([
        0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce,
        0x3d, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00,
      ]);

      // Compressed point starts with 0x02 or 0x03 instead of 0x04
      const compressedKey = new Uint8Array([0x02, ...new Uint8Array(64).fill(0x11)]);
      const spkiKey = new Uint8Array([...spkiHeader, ...compressedKey]);
      const spkiBase64 = uint8ArrayToBase64(spkiKey);

      expect(() => spkiToJwk(spkiBase64)).toThrow('Invalid Public Key format: Expected uncompressed point');
    });

    it('should handle minimal SPKI with just the required 65 bytes at the end', () => {
      // The function extracts the last 65 bytes regardless of header
      const xCoord = new Uint8Array(32).fill(0xaa);
      const yCoord = new Uint8Array(32).fill(0xbb);

      // Just some arbitrary header bytes
      const header = new Uint8Array(10).fill(0x00);
      const keyData = new Uint8Array([0x04, ...xCoord, ...yCoord]);

      const spkiKey = new Uint8Array([...header, ...keyData]);
      const spkiBase64 = uint8ArrayToBase64(spkiKey);

      const result = spkiToJwk(spkiBase64);

      expect(result.kty).toBe('EC');
      expect(result.crv).toBe('P-256');

      const decodedX = Buffer.from(result.x, 'base64');
      const decodedY = Buffer.from(result.y, 'base64');

      expect(decodedX).toEqual(Buffer.from(xCoord));
      expect(decodedY).toEqual(Buffer.from(yCoord));
    });

    it('should handle real-world SPKI key format', () => {
      // A realistic P-256 SPKI public key structure with proper uncompressed point (0x04 prefix)
      // SPKI header (26 bytes) + 0x04 + X (32 bytes) + Y (32 bytes)
      const xCoord = new Uint8Array(32).fill(0x11);
      const yCoord = new Uint8Array(32).fill(0x22);
      const spkiHeader = new Uint8Array([
        0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce,
        0x3d, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00,
      ]);
      const keyData = new Uint8Array([0x04, ...xCoord, ...yCoord]);
      const spkiKey = new Uint8Array([...spkiHeader, ...keyData]);
      const realSpkiBase64 = uint8ArrayToBase64(spkiKey);

      const result = spkiToJwk(realSpkiBase64);

      expect(result).toEqual({
        kty: 'EC',
        crv: 'P-256',
        x: expect.any(String),
        y: expect.any(String),
      });
    });
  });
});


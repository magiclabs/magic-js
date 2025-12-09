import { derToRawSignature } from '../../../../src/native-crypto/utils/der';
import { uint8ArrayToBase64 } from '../../../../src/native-crypto/utils/uint8';

describe('der utilities', () => {
  describe('derToRawSignature', () => {
    it('should convert DER signature to raw P1363 format', () => {
      // Create a valid DER signature structure
      // DER: 0x30 | total_len | 0x02 | r_len | r_bytes | 0x02 | s_len | s_bytes
      const r = new Uint8Array(32).fill(0x11);
      const s = new Uint8Array(32).fill(0x22);

      // Build DER encoded signature
      const derSignature = new Uint8Array([
        0x30,
        68, // total length: 2 + 32 + 2 + 32 = 68
        0x02,
        32, // R length
        ...r,
        0x02,
        32, // S length
        ...s,
      ]);

      const derBase64 = uint8ArrayToBase64(derSignature);
      const result = derToRawSignature(derBase64);

      // Decode the result to verify
      const decoded = Buffer.from(result, 'base64');
      expect(decoded.length).toBe(64);
      expect(decoded.subarray(0, 32)).toEqual(Buffer.from(r));
      expect(decoded.subarray(32, 64)).toEqual(Buffer.from(s));
    });

    it('should handle DER signature with padded R (33 bytes with leading 0x00)', () => {
      // When R has high bit set, it gets padded with 0x00 in DER
      const r = new Uint8Array(32);
      r[0] = 0x80; // High bit set
      r.fill(0x11, 1);

      const s = new Uint8Array(32).fill(0x22);

      // Build DER with padded R
      const derSignature = new Uint8Array([
        0x30,
        69, // total length: 2 + 33 + 2 + 32 = 69
        0x02,
        33, // R length (padded)
        0x00, // padding byte
        ...r,
        0x02,
        32, // S length
        ...s,
      ]);

      const derBase64 = uint8ArrayToBase64(derSignature);
      const result = derToRawSignature(derBase64);

      const decoded = Buffer.from(result, 'base64');
      expect(decoded.length).toBe(64);
      expect(decoded.subarray(0, 32)).toEqual(Buffer.from(r));
      expect(decoded.subarray(32, 64)).toEqual(Buffer.from(s));
    });

    it('should handle DER signature with padded S (33 bytes with leading 0x00)', () => {
      const r = new Uint8Array(32).fill(0x11);

      // When S has high bit set, it gets padded with 0x00 in DER
      const s = new Uint8Array(32);
      s[0] = 0x80; // High bit set
      s.fill(0x22, 1);

      // Build DER with padded S
      const derSignature = new Uint8Array([
        0x30,
        69, // total length: 2 + 32 + 2 + 33 = 69
        0x02,
        32, // R length
        ...r,
        0x02,
        33, // S length (padded)
        0x00, // padding byte
        ...s,
      ]);

      const derBase64 = uint8ArrayToBase64(derSignature);
      const result = derToRawSignature(derBase64);

      const decoded = Buffer.from(result, 'base64');
      expect(decoded.length).toBe(64);
      expect(decoded.subarray(0, 32)).toEqual(Buffer.from(r));
      expect(decoded.subarray(32, 64)).toEqual(Buffer.from(s));
    });

    it('should handle DER signature with both R and S padded', () => {
      const r = new Uint8Array(32);
      r[0] = 0x80;
      r.fill(0x11, 1);

      const s = new Uint8Array(32);
      s[0] = 0x80;
      s.fill(0x22, 1);

      // Build DER with both padded
      const derSignature = new Uint8Array([
        0x30,
        70, // total length: 2 + 33 + 2 + 33 = 70
        0x02,
        33, // R length (padded)
        0x00,
        ...r,
        0x02,
        33, // S length (padded)
        0x00,
        ...s,
      ]);

      const derBase64 = uint8ArrayToBase64(derSignature);
      const result = derToRawSignature(derBase64);

      const decoded = Buffer.from(result, 'base64');
      expect(decoded.length).toBe(64);
      expect(decoded.subarray(0, 32)).toEqual(Buffer.from(r));
      expect(decoded.subarray(32, 64)).toEqual(Buffer.from(s));
    });

    it('should throw error if R tag is missing', () => {
      const invalidDer = new Uint8Array([
        0x30,
        4,
        0x03, // Invalid tag (should be 0x02)
        2,
        0x11,
        0x22,
      ]);

      const derBase64 = uint8ArrayToBase64(invalidDer);
      expect(() => derToRawSignature(derBase64)).toThrow('Invalid DER: R tag missing');
    });

    it('should throw error if S tag is missing', () => {
      const r = new Uint8Array(32).fill(0x11);
      const invalidDer = new Uint8Array([
        0x30,
        38,
        0x02,
        32,
        ...r,
        0x03, // Invalid tag (should be 0x02)
        2,
        0x22,
        0x33,
      ]);

      const derBase64 = uint8ArrayToBase64(invalidDer);
      expect(() => derToRawSignature(derBase64)).toThrow('Invalid DER: S tag missing');
    });

    it('should produce base64url encoded output', () => {
      const r = new Uint8Array(32).fill(0xff);
      const s = new Uint8Array(32).fill(0xff);

      const derSignature = new Uint8Array([0x30, 68, 0x02, 32, ...r, 0x02, 32, ...s]);

      const derBase64 = uint8ArrayToBase64(derSignature);
      const result = derToRawSignature(derBase64);

      // Should be base64url encoded (no +, /, or =)
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toContain('=');
    });

    it('should handle shorter R value with proper padding', () => {
      // R value is only 31 bytes (needs left-padding in output)
      const r = new Uint8Array(31).fill(0x11);
      const s = new Uint8Array(32).fill(0x22);

      const derSignature = new Uint8Array([
        0x30,
        67, // total length: 2 + 31 + 2 + 32 = 67
        0x02,
        31, // R length (shorter)
        ...r,
        0x02,
        32, // S length
        ...s,
      ]);

      const derBase64 = uint8ArrayToBase64(derSignature);
      const result = derToRawSignature(derBase64);

      const decoded = Buffer.from(result, 'base64');
      expect(decoded.length).toBe(64);
      // R should be left-padded with one zero byte
      expect(decoded[0]).toBe(0);
      expect(decoded.subarray(1, 32)).toEqual(Buffer.from(r));
      expect(decoded.subarray(32, 64)).toEqual(Buffer.from(s));
    });

    it('should handle shorter S value with proper padding', () => {
      const r = new Uint8Array(32).fill(0x11);
      // S value is only 31 bytes (needs left-padding in output)
      const s = new Uint8Array(31).fill(0x22);

      const derSignature = new Uint8Array([
        0x30,
        67, // total length: 2 + 32 + 2 + 31 = 67
        0x02,
        32, // R length
        ...r,
        0x02,
        31, // S length (shorter)
        ...s,
      ]);

      const derBase64 = uint8ArrayToBase64(derSignature);
      const result = derToRawSignature(derBase64);

      const decoded = Buffer.from(result, 'base64');
      expect(decoded.length).toBe(64);
      expect(decoded.subarray(0, 32)).toEqual(Buffer.from(r));
      // S should be left-padded with one zero byte
      expect(decoded[32]).toBe(0);
      expect(decoded.subarray(33, 64)).toEqual(Buffer.from(s));
    });
  });
});


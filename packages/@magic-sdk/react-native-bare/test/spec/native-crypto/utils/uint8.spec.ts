import {
  uint8ArrayToBase64,
  base64ToUint8Array,
  stringToUint8Array,
  toBase64Url,
} from '../../../../src/native-crypto/utils/uint8';

describe('uint8 utilities', () => {
  describe('uint8ArrayToBase64', () => {
    it('should encode empty array to empty string', () => {
      const result = uint8ArrayToBase64(new Uint8Array([]));
      expect(result).toBe('');
    });

    it('should encode simple byte array', () => {
      // "Hello" in ASCII bytes
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const result = uint8ArrayToBase64(bytes);
      expect(result).toBe('SGVsbG8=');
    });

    it('should encode binary data correctly', () => {
      const bytes = new Uint8Array([0x00, 0xff, 0x80, 0x7f]);
      const result = uint8ArrayToBase64(bytes);
      expect(result).toBe('AP+Afw==');
    });
  });

  describe('base64ToUint8Array', () => {
    it('should decode empty string to empty array', () => {
      const result = base64ToUint8Array('');
      expect(result).toEqual(new Uint8Array([]));
    });

    it('should decode base64 string to byte array', () => {
      const result = base64ToUint8Array('SGVsbG8=');
      expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    it('should decode binary data correctly', () => {
      const result = base64ToUint8Array('AP+Afw==');
      expect(result).toEqual(new Uint8Array([0x00, 0xff, 0x80, 0x7f]));
    });

    it('should roundtrip with uint8ArrayToBase64', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 255, 128, 0]);
      const encoded = uint8ArrayToBase64(original);
      const decoded = base64ToUint8Array(encoded);
      expect(decoded).toEqual(original);
    });
  });

  describe('stringToUint8Array', () => {
    const originalTextEncoder = global.TextEncoder;

    afterEach(() => {
      // Restore original TextEncoder after each test
      global.TextEncoder = originalTextEncoder;
    });

    it('uses TextEncoder when it exists', () => {
      const mockEncode = jest.fn().mockReturnValue(new Uint8Array([97, 98, 99])); // "abc"
      const mockConstructor = jest.fn(() => ({ encode: mockEncode }));

      // Set up a mock TextEncoder on the global object
      global.TextEncoder = mockConstructor as any;

      const result = stringToUint8Array('abc');

      expect(mockConstructor).toHaveBeenCalledTimes(1);
      expect(mockEncode).toHaveBeenCalledWith('abc');
      expect(result).toEqual(new Uint8Array([97, 98, 99]));
    });

    it('should encode ASCII string', () => {
      const result = stringToUint8Array('Hello');
      expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    it('should encode empty string', () => {
      const result = stringToUint8Array('');
      expect(result).toEqual(new Uint8Array([]));
    });

    it('should encode UTF-8 string with 2-byte characters', () => {
      // "é" = 0xC3 0xA9 in UTF-8
      const result = stringToUint8Array('é');
      expect(result).toEqual(new Uint8Array([0xc3, 0xa9]));
    });

    it('should encode UTF-8 string with 3-byte characters', () => {
      // "€" = 0xE2 0x82 0xAC in UTF-8
      const result = stringToUint8Array('€');
      expect(result).toEqual(new Uint8Array([0xe2, 0x82, 0xac]));
    });

    it('should encode UTF-8 string with 4-byte characters (surrogate pairs)', () => {
      // "𝄞" (musical G clef) = 0xF0 0x9D 0x84 0x9E in UTF-8
      const result = stringToUint8Array('𝄞');
      expect(result).toEqual(new Uint8Array([0xf0, 0x9d, 0x84, 0x9e]));
    });

    it('should use fallback when TextEncoder is unavailable', () => {
      const originalTextEncoder = global.TextEncoder;
      // @ts-ignore - Testing fallback behavior
      delete global.TextEncoder;

      try {
        // ASCII
        expect(stringToUint8Array('abc')).toEqual(new Uint8Array([97, 98, 99]));

        // 2-byte UTF-8
        expect(stringToUint8Array('é')).toEqual(new Uint8Array([0xc3, 0xa9]));

        // 3-byte UTF-8
        expect(stringToUint8Array('€')).toEqual(new Uint8Array([0xe2, 0x82, 0xac]));

        // 4-byte UTF-8 (surrogate pair)
        expect(stringToUint8Array('𝄞')).toEqual(new Uint8Array([0xf0, 0x9d, 0x84, 0x9e]));
      } finally {
        global.TextEncoder = originalTextEncoder;
      }
    });
  });

  describe('toBase64Url', () => {
    it('should encode string to base64url', () => {
      const result = toBase64Url('Hello');
      expect(result).toBe('SGVsbG8');
    });

    it('should encode Uint8Array to base64url', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const result = toBase64Url(bytes);
      expect(result).toBe('SGVsbG8');
    });

    it('should replace + with - and / with _', () => {
      // Create bytes that result in + and / in standard base64
      // 0xFB, 0xFF, 0xFE produces "+//+" in standard base64
      const bytes = new Uint8Array([0xfb, 0xff, 0xfe]);
      const result = toBase64Url(bytes);
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).toBe('-__-');
    });

    it('should remove padding characters', () => {
      // "Hi" produces "SGk=" in standard base64
      const result = toBase64Url('Hi');
      expect(result).not.toContain('=');
      expect(result).toBe('SGk');
    });

    it('should handle JSON object strings', () => {
      const obj = { typ: 'dpop+jwt', alg: 'ES256' };
      const result = toBase64Url(JSON.stringify(obj));
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toContain('=');
    });
  });
});

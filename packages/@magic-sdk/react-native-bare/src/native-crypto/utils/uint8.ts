/**
 * Encodes a Uint8Array to a Base64 string.
 * Uses native 'btoa' by converting bytes to a binary string first.
 */
export const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Decodes a Base64 string to a Uint8Array.
 * Uses native 'atob'.
 */
export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Converts a string (UTF-8) to Uint8Array.
 * Polyfill for simple ASCII/UTF-8 if TextEncoder is not available,
 * but TextEncoder is standard in RN 0.68+.
 */
export const stringToUint8Array = (str: string): Uint8Array => {
  // Use TextEncoder if available (standard in modern RN)
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  // Fallback for older environments
  const arr = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      arr.push(code);
    } else if (code < 0x800) {
      arr.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      arr.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      i++;
      code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      arr.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return new Uint8Array(arr);
};

/**
 * Encodes input (String or Uint8Array) to Base64Url (RFC 4648).
 * Removes padding '=', replaces '+' with '-', and '/' with '_'
 */
export const toBase64Url = (input: string | Uint8Array): string => {
  let bytes: Uint8Array;

  if (typeof input === 'string') {
    bytes = stringToUint8Array(input);
  } else {
    bytes = input;
  }

  const base64 = uint8ArrayToBase64(bytes);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

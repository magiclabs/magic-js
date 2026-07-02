function percentToByte(p: string) {
  return String.fromCharCode(parseInt(p.slice(1), 16));
}

function byteToPercent(b: string) {
  return `%${`00${b.charCodeAt(0).toString(16)}`.slice(-2)}`;
}

/**
 * Encodes a Base64 string. Safe for UTF-8 characters.
 * Original source is from the `universal-base64` NPM package.
 *
 * @source https://github.com/blakeembrey/universal-base64/blob/master/src/browser.ts
 */
function btoaUTF8(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%[0-9A-F]{2}/g, percentToByte));
}

/**
 * Decodes a Base64 string. Safe for UTF-8 characters.
 * Original source is from the `universal-base64` NPM package.
 *
 * @source https://github.com/blakeembrey/universal-base64/blob/master/src/browser.ts
 */
function atobUTF8(str: string): string {
  return decodeURIComponent(Array.from(atob(str), byteToPercent).join(''));
}

/**
 * Given a JSON-serializable object, encode as a Base64 string.
 */
export function encodeJSON<T>(options: T): string {
  return btoaUTF8(JSON.stringify(options));
}

/**
 * Given a Base64 JSON string, decode a JavaScript object.
 */
export function decodeJSON<T>(queryString: string): T {
  return JSON.parse(atobUTF8(queryString));
}

/**
 * Encode given buffer or decode given string with Base64URL.
 */
/* istanbul ignore next */
export class Base64URL {
  /**
   * Convert bytes into a base64url-encoded string
   */
  static encode(buffer: ArrayBuffer): string {
    const base64 = globalThis.btoa(String.fromCharCode(...new Uint8Array(buffer)));

    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  /**
   * Convert a base64url-encoded string into bytes
   */
  static decode(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const binStr = globalThis.atob(base64);
    const bin = new Uint8Array(binStr.length);

    for (let i = 0; i < binStr.length; i++) {
      bin[i] = binStr.charCodeAt(i);
    }

    return bin.buffer;
  }
}

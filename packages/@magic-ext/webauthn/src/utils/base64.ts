/**
 * Encode given buffer or decode given string with Base64URL.
 */
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

import { base64ToUint8Array, toBase64Url } from './uint8';

/**
 * Converts SPKI Public Key (Base64) to JWK format.
 * Extracts Raw X and Y coordinates from the uncompressed point.
 */
export const spkiToJwk = (spkiBase64: string) => {
  const buf = base64ToUint8Array(spkiBase64);
  // P-256 SPKI Header is 26 bytes. The key data (0x04 + X + Y) is at the end.
  // We explicitly look for the last 65 bytes (1 header byte + 32 bytes X + 32 bytes Y)
  const rawKey = buf.subarray(buf.length - 65);

  if (rawKey[0] !== 0x04) {
    throw new Error('Invalid Public Key format: Expected uncompressed point');
  }

  const x = rawKey.subarray(1, 33);
  const y = rawKey.subarray(33, 65);

  return {
    kty: 'EC',
    crv: 'P-256',
    x: toBase64Url(x),
    y: toBase64Url(y),
  };
};

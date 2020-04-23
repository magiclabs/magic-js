import { inflate } from 'pako';

/**
 * Decode and decompress a Base64-encoded JSON string. We use this to assert
 * encoded query parameters are valid.
 */
export function inflateBase64Json(base64EncodedBinaryData?: string): any {
  const encodedBinData = atob(base64EncodedBinaryData);
  const charData = encodedBinData.split('').map(x => x.charCodeAt(0));
  const binData = new Uint8Array(charData);
  return JSON.parse(inflate(binData, { to: 'string' }));
}

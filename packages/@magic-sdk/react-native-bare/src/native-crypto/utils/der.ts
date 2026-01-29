import { base64ToUint8Array, toBase64Url } from './uint8';

/**
 * Converts a DER encoded signature (ASN.1) to a Raw R|S signature (64 bytes).
 * Device Crypto returns DER; Toaster backend expects Raw P1363.
 */
export const derToRawSignature = (derBase64: string): string => {
  const der = base64ToUint8Array(derBase64);

  // DER Structure: 0x30 | total_len | 0x02 | r_len | r_bytes | 0x02 | s_len | s_bytes
  let offset = 2; // Skip Sequence Tag (0x30) and Total Length

  // --- Read R ---
  if (der[offset] !== 0x02) throw new Error('Invalid DER: R tag missing');
  offset++; // skip tag
  const rLen = der[offset++]; // read length
  let rBytes = der.subarray(offset, offset + rLen);
  offset += rLen;

  // Handle ASN.1 Integer padding for R (remove leading 0x00 if present)
  if (rLen === 33 && rBytes[0] === 0x00) {
    rBytes = rBytes.subarray(1);
  }

  // --- Read S ---
  if (der[offset] !== 0x02) throw new Error('Invalid DER: S tag missing');
  offset++; // skip tag
  const sLen = der[offset++]; // read length
  let sBytes = der.subarray(offset, offset + sLen);

  // Handle ASN.1 Integer padding for S
  if (sLen === 33 && sBytes[0] === 0x00) {
    sBytes = sBytes.subarray(1);
  }

  // --- Construct Raw Signature (64 bytes) ---
  const rawSignature = new Uint8Array(64);

  // Copy R into the first 32 bytes (right-aligned/padded)
  rawSignature.set(rBytes, 32 - rBytes.length);

  // Copy S into the last 32 bytes (right-aligned/padded)
  rawSignature.set(sBytes, 64 - sBytes.length);

  return toBase64Url(rawSignature);
};

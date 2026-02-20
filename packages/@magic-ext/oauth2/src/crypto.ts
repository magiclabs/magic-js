import sha256 from 'crypto-js/sha256';
import CryptoJS from 'crypto-js';

const HAS_BUILT_IN_CRYPTO = typeof window !== 'undefined' && !!window.crypto;

function bytesToOAuth2CompatibleString(bytes: Uint8Array): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  return Array.from(bytes)
    .map((value) => charset[value % charset.length])
    .join('');
}

function createRandomString(size: number): string {
  if (!HAS_BUILT_IN_CRYPTO) {
    throw new Error('Secure random number generation is not available in this environment. PKCE requires crypto.getRandomValues.');
  }
  const bytes = new Uint8Array(size);
  window.crypto.getRandomValues(bytes);
  return bytesToOAuth2CompatibleString(bytes);
}

function verifierToBase64URL(input: CryptoJS.lib.WordArray): string {
  return input.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function createCryptoChallenge(): { codeVerifier: string; codeChallenge: string; cryptoChallengeState: string } {
  const cryptoChallengeState = createRandomString(128);
  const codeVerifier = createRandomString(128);
  const codeChallenge = verifierToBase64URL(sha256(codeVerifier));
  return { codeVerifier, codeChallenge, cryptoChallengeState };
}

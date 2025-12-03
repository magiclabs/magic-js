import uuid from 'react-native-uuid'; // Ensure you have installed: npm install react-native-uuid
import { toBase64Url } from './utils/uint8';
import { spkiToJwk } from './utils/jwk';
import { ALG, TYP } from './constants';
import { derToRawSignature } from './utils/der';
import { DpopClaims, DpopHeader } from './types';
import DeviceCrypto, { AccessLevel } from 'react-native-device-crypto';
import { getKeyAlias } from './utils/key-alias';

const KEY_ALIAS = getKeyAlias('dpop');

/**
 * Generates the DPoP proof compatible with the Python backend.
 * Handles key creation (if missing), JWK construction, and signing.
 */
export const getDpop = async (): Promise<string | null> => {
  try {
    // 1. Get or Create Key in Secure Enclave
    // We strictly disable authentication to avoid biometric prompts
    const publicKey = await DeviceCrypto.getOrCreateAsymmetricKey(KEY_ALIAS, {
      accessLevel: AccessLevel.ALWAYS, // Key is always accessible in this device
      invalidateOnNewBiometry: false,
    });

    // 2. Prepare Public Key as JWK
    // Toaster backend expects JWK in the header
    const publicJwk = spkiToJwk(publicKey);

    // 3. Construct Payload
    const now = Math.floor(Date.now() / 1000);
    const claims: DpopClaims = {
      iat: now,
      jti: uuid.v4(),
    };

    const header: DpopHeader = {
      typ: TYP,
      alg: ALG,
      jwk: publicJwk,
    };

    // 4. Prepare Signing Input
    const headerB64 = toBase64Url(JSON.stringify(header));
    const payloadB64 = toBase64Url(JSON.stringify(claims));
    const signingInput = `${headerB64}.${payloadB64}`;

    // 5. Sign Data
    // DeviceCrypto returns a Base64 signature.
    const signatureBase64 = await DeviceCrypto.sign(KEY_ALIAS, signingInput, {
      // Biometry prompts should not be fired since the key is always accessible in this device
      biometryTitle: 'Sign DPoP',
      biometrySubTitle: 'Sign DPoP',
      biometryDescription: 'Sign DPoP',
    });

    // 6. Convert Signature (Toaster expects Raw R|S)
    const signatureB64 = derToRawSignature(signatureBase64);

    return `${signingInput}.${signatureB64}`;
  } catch (error) {
    console.error('DPoP Generation Error:', error);
    return null;
  }
};

/**
 * Removes the keys from the Secure Enclave
 * Returns true if the key was deleted successfully, false otherwise.
 * @returns {Promise<boolean>} True if the key was deleted successfully, false otherwise.
 */
export const deleteDpop = async (): Promise<boolean> => {
  try {
    return await DeviceCrypto.deleteKey(KEY_ALIAS);
  } catch (error) {
    console.error('DPoP Deletion Error:', error);
    return false;
  }
};

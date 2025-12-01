import * as Biometrics from '@sbaiahmed1/react-native-biometrics';
import uuid from 'react-native-uuid'; // Ensure you have installed: npm install react-native-uuid
import { toBase64Url } from './utils/uint8';
import { spkiToJwk } from './utils/jwk';
import { ALG, TYP } from './constants';
import { derToRawSignature } from './utils/der';
import { getDpopAlias } from './utils/dpop-alias';

/**
 * Generates the DPoP proof compatible with the Python backend.
 * Handles key creation (if missing), JWK construction, and signing.
 * @param httpMethod - The HTTP method (e.g., 'POST')
 * @param httpUrl - The HTTP URL being accessed
 */
export const getDpop = async (httpMethod?: string, httpUrl?: string): Promise<string> => {
  try {
    // 1. Configure Isolation
    const DPOP_KEY_ALIAS = await getDpopAlias();
    await Biometrics.configureKeyAlias(DPOP_KEY_ALIAS);

    // 2. Retrieve Public Key (Check if exists)
    const keyAttrs = await Biometrics.getKeyAttributes(DPOP_KEY_ALIAS);
    let publicKeyBase64 = '';

    if (!keyAttrs.exists) {
      // Create new keys in Secure Enclave (ec256)
      const keyResult = await Biometrics.createKeys(DPOP_KEY_ALIAS, 'ec256', Biometrics.BiometricStrength.Weak);
      publicKeyBase64 = keyResult.publicKey;
    } else {
      // Retrieve existing key
      const allKeys = await Biometrics.getAllKeys(DPOP_KEY_ALIAS);
      if (allKeys.keys.length > 0) {
        publicKeyBase64 = allKeys.keys[0].publicKey;
      } else {
        // Fallback: Re-create if lookup failed but attributes said it existed
        const keyResult = await Biometrics.createKeys(DPOP_KEY_ALIAS, 'ec256', Biometrics.BiometricStrength.Weak);
        publicKeyBase64 = keyResult.publicKey;
      }
    }

    // 3. Construct JWK
    const publicJwk = spkiToJwk(publicKeyBase64);

    // 4. Construct Payload
    const iat = Math.floor(Date.now() / 1000);
    const jti = uuid.v4();

    const payload: any = {
      iat,
      jti,
    };

    if (httpMethod) payload.htm = httpMethod.toUpperCase();
    if (httpUrl) payload.htu = httpUrl;

    // 5. Construct Header
    const header = {
      typ: TYP,
      alg: ALG,
      jwk: publicJwk,
    };

    // 6. Prepare Signing Input
    const headerB64 = toBase64Url(JSON.stringify(header));
    const payloadB64 = toBase64Url(JSON.stringify(payload));
    const signingInput = `${headerB64}.${payloadB64}`;

    // 7. Sign
    const signatureResult = await Biometrics.verifyKeySignature(DPOP_KEY_ALIAS, signingInput);

    if (!signatureResult.success || !signatureResult.signature) {
      throw new Error(`Signing failed: ${signatureResult.error || 'No signature returned'}`);
    }

    // 8. Convert Signature (Toaster expects Raw R|S)
    const signatureB64 = derToRawSignature(signatureResult.signature);

    // 9. Return DPoP String
    return `${signingInput}.${signatureB64}`;
  } catch (error) {
    console.error('DPoP Generation Error:', error);
    throw error;
  }
};

/**
 * Removes existing keys and invalidates the DPoP
 */
export const deleteDpop = async (): Promise<boolean> => {
  try {
    const DPOP_KEY_ALIAS = await getDpopAlias();
    const result = await Biometrics.deleteKeys(DPOP_KEY_ALIAS);
    return result.success;
  } catch (error) {
    console.error('DPoP Deletion Error:', error);
    return false;
  }
};

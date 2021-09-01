import { setItem, getItem, removeItem } from './storage';
import { uuid } from './uuid';

export const STORE_KEY_PRIVATE_KEY = 'STORE_KEY_PRIVATE_KEY';
export const STORE_KEY_PUBLIC_JWK = 'STORE_KEY_PUBLIC_JWK';
const ALGO_NAME = 'ECDSA';
const ALGO_CURVE = 'P-256';

const EC_GEN_PARAMS: EcKeyGenParams = {
  name: ALGO_NAME,
  namedCurve: ALGO_CURVE,
};
const EC_IMPORT_PARAMS: EcKeyImportParams = {
  name: ALGO_NAME,
  namedCurve: ALGO_CURVE,
};

function getCryptoClient() {
  return window.crypto;
}

export function clearKeys() {
  removeItem(STORE_KEY_PUBLIC_JWK);
  removeItem(STORE_KEY_PRIVATE_KEY);
}

export async function createJwt() {
  const publicJwk = await getPublicKey();

  if (!publicJwk) {
    console.info('unable to create public key');
    return undefined;
  }

  const crypto = getCryptoClient();
  const privateJwk = await getItem<CryptoKey>(STORE_KEY_PRIVATE_KEY);

  if (!privateJwk || !crypto) {
    console.info('unable to find private key or webcrypto unsupported');
    return undefined;
  }

  const claims = {
    iat: Math.floor(new Date().getTime() / 1000),
    jti: uuid(),
  };

  const headers = {
    typ: 'dpop+jwt',
    alg: 'ES256',
    jwk: publicJwk,
  };

  const jws = {
    protected: strToUrlBase64(JSON.stringify(headers)),
    claims: strToUrlBase64(JSON.stringify(claims)),
  };

  const data = strToUint8(`${jws.protected}.${jws.claims}`);
  const sigType = { name: ALGO_NAME, hash: { name: 'SHA-256' } };

  const sig = uint8ToUrlBase64(new Uint8Array(await crypto.subtle.sign(sigType, privateJwk, data)));
  return `${jws.protected}.${jws.claims}.${sig}`;
}

async function getPublicKey() {
  if (!isWebCryptoSupported()) {
    console.info('webcrypto is not supported');
    return undefined;
  }

  if (!(await getItem(STORE_KEY_PUBLIC_JWK))) {
    await generateWCKP();
  }

  return getItem(STORE_KEY_PUBLIC_JWK) as JsonWebKey;
}

async function generateWCKP() {
  const crypto = getCryptoClient();
  const { subtle } = crypto;
  const kp = await subtle.generateKey(
    EC_GEN_PARAMS,
    true, // need to export the public key which means private exports too
    ['sign'],
  );

  // export keys so we can send the public key.
  const jwkPrivateKey = await subtle.exportKey('jwk', kp.privateKey);
  const jwkPublicKey = await subtle.exportKey('jwk', kp.publicKey);

  // reimport the private key so it becomes non exportable when persisting.
  const nonExportPrivateKey = await subtle.importKey('jwk', jwkPrivateKey, EC_IMPORT_PARAMS, false, ['sign']);

  // persist keys
  await setItem(STORE_KEY_PRIVATE_KEY, nonExportPrivateKey);
  // persist the jwk public key since it needs to be exported anyways
  await setItem(STORE_KEY_PUBLIC_JWK, jwkPublicKey);
}

function isWebCryptoSupported() {
  const hasCrypto = typeof window !== 'undefined' && !!(window.crypto as any);
  const hasSubtleCrypto = hasCrypto && !!(window.crypto.subtle as any);

  return hasCrypto && hasSubtleCrypto;
}

function strToUrlBase64(str: string) {
  return binToUrlBase64(utf8ToBinaryString(str));
}

function strToUint8(str: string) {
  return new TextEncoder().encode(str);
}

function binToUrlBase64(bin: string) {
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+/g, '');
}

function utf8ToBinaryString(str: string) {
  const escstr = encodeURIComponent(str);
  // replaces any uri escape sequence, such as %0A,
  // with binary escape, such as 0x0A
  return escstr.replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));
}

function uint8ToUrlBase64(uint8: Uint8Array) {
  let bin = '';
  uint8.forEach((code) => {
    bin += String.fromCharCode(code);
  });
  return binToUrlBase64(bin);
}

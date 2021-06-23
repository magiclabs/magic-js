import { setItem, getItem } from './storage';

const STORE_KEY_PRIVATE_KEY = 'STORE_KEY_PRIVATE_KEY';
const STORE_KEY_PUBLIC_JWK = 'STORE_KEY_PUBLIC_JWK';
const ALGO_NAME = 'RSASSA-PKCS1-v1_5';
const HASH_NAME = 'SHA-256';

function getCryptoClient() {
  return window.crypto;
}

async function generateWCKP() {
  if (!isWebCryptoSupported()) {
    return;
  }

  const crypto = getCryptoClient();
  const { subtle } = crypto;

  // @TODO update later with platform specifics
  const kp = await subtle.generateKey(
    {
      name: ALGO_NAME,
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: HASH_NAME },
    },
    true, // need to export the public key which means private exports too
    ['sign'],
  );

  // export keys so we can send the public key.
  const jwkPrivateKey = await subtle.exportKey('jwk', kp.privateKey);
  const jwkPublicKey = await subtle.exportKey('jwk', kp.publicKey);

  // reimport the private key so it becomes non exportable when persisting.
  const nonExportPrivateKey = await subtle.importKey(
    'jwk',
    jwkPrivateKey,
    { name: ALGO_NAME, hash: HASH_NAME },
    false,
    ['sign'],
  );

  // persist keys
  await setItem(STORE_KEY_PRIVATE_KEY, nonExportPrivateKey);
  // persist the jwk public key since it needs to be exported anyways
  await setItem(STORE_KEY_PUBLIC_JWK, jwkPublicKey);
}

export async function getPublicKey() {
  if (!isWebCryptoSupported()) {
    return undefined;
  }

  if (!(await getItem(STORE_KEY_PUBLIC_JWK))) {
    await generateWCKP();
  }

  return getItem(STORE_KEY_PUBLIC_JWK);
}

export async function signData(data: string) {
  if (!isWebCryptoSupported()) {
    return undefined;
  }

  const { subtle } = getCryptoClient();
  const privateKey = await getItem<CryptoKey>(STORE_KEY_PRIVATE_KEY);

  if (!privateKey) {
    return undefined;
  }

  return new TextDecoder().decode(await subtle.sign(ALGO_NAME, privateKey, new TextEncoder().encode(data)));
}

export function isWebCryptoSupported() {
  const hasCrypto = typeof window !== 'undefined' && !!(window.crypto as any);
  const hasSubtleCrypto = hasCrypto && !!(window.crypto.subtle as any);

  return hasCrypto && hasSubtleCrypto;
}

// import { ec as EC } from 'elliptic';
// import base64url from 'base64url';
import { SDKEnvironment } from '../core/sdk-environment';
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

const ec = new EC('p256');

export function clearKeys() {
  removeItem(STORE_KEY_PUBLIC_JWK);
  removeItem(STORE_KEY_PRIVATE_KEY);
}

export async function createJwt() {
  // Will return undefined if webcrypto is not supported
  const publicJwk = await getPublicKey();

  if (!publicJwk) {
    console.info('Unable to create public key or webcrypto is unsupported');
    return undefined;
  }

  const isMobileContext = SDKEnvironment.platform === 'react-native';

  if (!isMobileContext) {
    const { subtle } = window.crypto;
    const privateJwk = await getItem<CryptoKey>(STORE_KEY_PRIVATE_KEY);

    if (!privateJwk || !subtle) {
      console.info('Unable to find private key or webcrypto unsupported');
      return undefined;
    }
  }

  const claims = {
    iat: Math.floor(new Date().getTime() / 1000),
    jti: uuid(),
  };

  const headers = {
    typ: 'dpop+jwt',
    alg: 'ES256',
    jwk: isMobileContext ? JSON.parse(publicJwk.toString()) : publicJwk,
  };

  const jws = {
    protected: strToUrlBase64(JSON.stringify(headers)),
    claims: strToUrlBase64(JSON.stringify(claims)),
  };

  const data = strToUint8(`${jws.protected}.${jws.claims}`);

  let sig;
  if (isMobileContext) {
    // Use elliptic for signing in React Native
    const privateJwkString = await getItem<string>(STORE_KEY_PRIVATE_KEY);

    const privateJwk = JSON.parse(privateJwkString!);
    const keyPair = ec.keyFromPrivate(privateJwk.d);

    // SHA-256 hash the data first, to align with the Web Crypto method
    const sha256Hash = ec.hash().update(data).digest();
    const signature = keyPair.sign(sha256Hash);

    // Convert the signature to DER format
    const derSignature = signature.toDER();

    // Convert to URL-safe Base64, aligned with Web Crypto method
    sig = uint8ToUrlBase64(new Uint8Array(derSignature));
  } else {
    const { subtle } = window.crypto;
    const privateJwk = await getItem<CryptoKey>(STORE_KEY_PRIVATE_KEY);

    const sigType = { name: ALGO_NAME, hash: { name: 'SHA-256' } };
    sig = uint8ToUrlBase64(new Uint8Array(await subtle.sign(sigType, privateJwk!, data)));
  }

  return `${jws.protected}.${jws.claims}.${sig}`;
}

async function getPublicKey() {
  const isMobileContext = SDKEnvironment.platform === 'react-native';
  // return undefiend if webcrypto is not supported in web based context, if mobile proceed
  if (!isWebCryptoSupported() && !isMobileContext) {
    console.info('webcrypto is not supported');
    return undefined;
  }

  console.log(`!(await getItem(STORE_KEY_PUBLIC_JWK)) => ${!(await getItem(STORE_KEY_PUBLIC_JWK))}`);

  if (!(await getItem(STORE_KEY_PUBLIC_JWK))) {
    await generateWCKP();
  }

  return getItem(STORE_KEY_PUBLIC_JWK) as JsonWebKey;
}

async function generateWCKP() {
  // to avoid a nasty babel bug we have to hoist this above the await ourselves
  // https://github.com/rpetrich/babel-plugin-transform-async-to-promises/issues/20
  let jwkPublicKey = null;
  let nonExportPrivateKey = null;

  if (SDKEnvironment.platform === 'react-native') {
    const keyPair = ec.genKeyPair();
    // Convert the public and private keys to a JWK-like format]

    jwkPublicKey = JSON.stringify({
      kty: 'EC',
      crv: ALGO_CURVE,
      x: base64url.encode(keyPair.getPublic().getX().toBuffer('be', 32)).toString(),
      y: base64url.encode(keyPair.getPublic().getY().toBuffer('be', 32)).toString(),
    });

    nonExportPrivateKey = JSON.stringify({
      kty: 'EC',
      crv: ALGO_CURVE,
      d: keyPair.getPrivate(),
    });

    console.log(`jwkPublicKey => ${jwkPublicKey}`);
    console.log(`typeof jwkPublicKey => ${typeof jwkPublicKey}`);
    console.log(`nonExportPrivateKey => ${nonExportPrivateKey}`);
    console.log(`typeof nonExportPrivateKey => ${typeof nonExportPrivateKey}`);
  } else {
    const { subtle } = window.crypto;
    const kp = await subtle.generateKey(
      EC_GEN_PARAMS,
      true, // need to export the public key which means private exports too
      ['sign'],
    );
    // export keys so we can send the public key.
    const jwkPrivateKey = await subtle.exportKey('jwk', kp.privateKey as CryptoKey);

    jwkPublicKey = await subtle.exportKey('jwk', kp.publicKey as CryptoKey);
    console.log(`web jwkPublicKey => ${jwkPublicKey}`);
    console.log(`web typeof jwkPublicKey => ${typeof jwkPublicKey}`);

    // reimport the private key so it becomes non exportable when persisting.
    nonExportPrivateKey = await subtle.importKey('jwk', jwkPrivateKey, EC_IMPORT_PARAMS, false, ['sign']);
    console.log(`web nonExportPrivateKey => ${nonExportPrivateKey}`);
    console.log(`web typeof nonExportPrivateKey => ${typeof nonExportPrivateKey}`);
  }

  console.log(`STORE_KEY_PRIVATE_KEY => ${nonExportPrivateKey}`);
  console.log(`STORE_KEY_PUBLIC_JWK => ${jwkPublicKey}`);

  await setItem(STORE_KEY_PRIVATE_KEY, nonExportPrivateKey);
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

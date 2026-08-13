import { setItem, getItem, removeItem } from './storage';
import { uuid } from './uuid';

export const STORE_KEY_PRIVATE_KEY = 'STORE_KEY_PRIVATE_KEY';
export const STORE_KEY_PUBLIC_JWK = 'STORE_KEY_PUBLIC_JWK';
const ALGO_NAME = 'ECDSA';
const ALGO_CURVE = 'P-256';

// The auth service rejects DPoP proofs whose `iat` is older than 180 seconds with
// zero leeway (DPoPClaims.DPOP_PROOF_MAX_AGE). Stop reusing a proof well before
// that so network latency and modest client-clock skew can't push a request over
// the server's limit.
export const DPOP_PROOF_STALE_AFTER_SECONDS = 120;

const EC_GEN_PARAMS: EcKeyGenParams = {
  name: ALGO_NAME,
  namedCurve: ALGO_CURVE,
};

export function isWebCryptoSupported() {
  const hasCrypto = typeof window !== 'undefined' && !!(window.crypto as any);
  const hasSubtleCrypto = hasCrypto && !!(window.crypto.subtle as any);

  return hasCrypto && hasSubtleCrypto;
}

export function clearKeys() {
  removeItem(STORE_KEY_PUBLIC_JWK);
  removeItem(STORE_KEY_PRIVATE_KEY);
}

export async function createJwt() {
  // will return undefined if webcrypto is not supported
  const publicJwk = await getPublicKey();

  if (!publicJwk) {
    console.info('unable to creat kee publicy or webcrypto is unsupported');
    return undefined;
  }

  const { subtle } = window.crypto;
  const privateJwk = await getItem<CryptoKey>(STORE_KEY_PRIVATE_KEY);

  if (!privateJwk || !subtle) {
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

  const sig = uint8ToUrlBase64(new Uint8Array(await subtle.sign(sigType, privateJwk, data)));
  return `${jws.protected}.${jws.claims}.${sig}`;
}

/**
 * Returns true only when the proof's `iat` claim decodes to a timestamp older
 * than DPOP_PROOF_STALE_AFTER_SECONDS. Anything that cannot be decoded is NOT
 * treated as stale — the caller falls back to passing the token through
 * untouched. Staleness alone does not authorize a re-mint; see `isOwnDpopProof`.
 */
export function isDpopProofStale(jwt: string): boolean {
  try {
    const claimsSegment = jwt.split('.')[1];
    if (!claimsSegment) return false;

    const { iat } = JSON.parse(urlBase64ToStr(claimsSegment));
    if (typeof iat !== 'number') return false;

    return Math.floor(Date.now() / 1000) - iat > DPOP_PROOF_STALE_AFTER_SECONDS;
  } catch {
    return false;
  }
}

/**
 * True only when `jwt` is a DPoP proof (`typ: 'dpop+jwt'`) whose embedded header
 * JWK matches the public key this SDK has stored — i.e. a proof we can re-mint
 * without changing the JWK thumbprint the auth service keys device trust and
 * refresh-token binding on.
 *
 * The `jwt` storage entry is an external injection point (session-persistence
 * escape hatch): the SDK never writes it. So a stored value may be a non-DPoP
 * token, or a DPoP proof minted under a *different* keypair (e.g. a natively
 * injected proof). Re-minting either of those would swap the thumbprint the
 * server expects — exactly the failure this returning `false` prevents by
 * leaving such tokens untouched.
 */
export async function isOwnDpopProof(jwt: string): Promise<boolean> {
  try {
    const headerSegment = jwt.split('.')[0];
    if (!headerSegment) return false;

    const header = JSON.parse(urlBase64ToStr(headerSegment));
    if (header?.typ !== 'dpop+jwt' || !header.jwk) return false;

    const storedJwk = await getItem<JsonWebKey>(STORE_KEY_PUBLIC_JWK);
    return !!storedJwk && jwkPublicKeyMatches(header.jwk, storedJwk);
  } catch {
    return false;
  }
}

/**
 * EC public keys are identified by (kty, crv, x, y) — the same members that form
 * the RFC 7638 JWK thumbprint — so equality across them means an identical
 * thumbprint. Extra members (e.g. `use`, `kid`) are intentionally ignored.
 */
function jwkPublicKeyMatches(a: JsonWebKey, b: JsonWebKey): boolean {
  return a.kty === b.kty && a.crv === b.crv && a.x === b.x && a.y === b.y;
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
  // to avoid a nasty babel bug we have to hoist this above the await ourselves
  // https://github.com/rpetrich/babel-plugin-transform-async-to-promises/issues/20
  const { subtle } = window.crypto;
  const kp = await subtle.generateKey(
    EC_GEN_PARAMS,
    false, // need to export the public key, while keeping private key non-extractable
    ['sign'],
  );

  const jwkPublicKey = await subtle.exportKey('jwk', kp.publicKey!);

  // persist keys
  await setItem(STORE_KEY_PRIVATE_KEY, kp.privateKey!);
  // persist the jwk public key since it needs to be exported anyways
  await setItem(STORE_KEY_PUBLIC_JWK, jwkPublicKey);
}

function strToUrlBase64(str: string) {
  return binToUrlBase64(utf8ToBinaryString(str));
}

function urlBase64ToStr(urlBase64: string) {
  let base64 = urlBase64.replace(/-/g, '+').replace(/_/g, '/');
  // `binToUrlBase64` strips `=` padding, but some `atob` implementations reject
  // unpadded input. Re-pad to a multiple of 4. (A remainder of 1 is never valid
  // base64; padding still leaves it invalid so `atob` throws — the caller's
  // try/catch then treats the token as undecodable, which is the safe path.)
  const remainder = base64.length % 4;
  if (remainder) base64 += '='.repeat(4 - remainder);
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map(char => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );
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
  uint8.forEach(code => {
    bin += String.fromCharCode(code);
  });
  return binToUrlBase64(bin);
}

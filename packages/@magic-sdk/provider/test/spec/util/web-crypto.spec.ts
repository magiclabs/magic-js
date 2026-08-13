import { Crypto } from '@peculiar/webcrypto';
import * as storage from '../../../src/util/storage';
import {
  clearKeys,
  createJwt,
  isDpopProofStale,
  isOwnDpopProof,
  DPOP_PROOF_STALE_AFTER_SECONDS,
  STORE_KEY_PRIVATE_KEY,
  STORE_KEY_PUBLIC_JWK,
} from '../../../src/util/web-crypto';
import { TextEncoder } from 'util';

let FAKE_STORE: Record<string, any> = {};

beforeAll(() => {
  jest.spyOn(storage, 'getItem').mockImplementation(async (key: string) => FAKE_STORE[key]);
  jest.spyOn(storage, 'setItem').mockImplementation(async (key: string, value: any) => {
    FAKE_STORE[key] = value;
  });
  jest.spyOn(storage, 'removeItem').mockImplementation(async (key: string) => {
    FAKE_STORE[key] = null;
  });

  Object.assign(global, { TextEncoder });
});

beforeEach(() => {
  Object.defineProperty(window, 'crypto', {
    value: new Crypto,
    writable: true,
  });
});

afterEach(() => {
  FAKE_STORE = {};
});

test('should return undefined if unsupported', async () => {
  (window as any).crypto = undefined;
  jest.spyOn(global.console, 'info').mockImplementation();
  const jwt = await createJwt();
  expect(jwt).toEqual(undefined);
});

test('should give undefined if missing private key', async () => {
  await createJwt(); // create keys
  FAKE_STORE[STORE_KEY_PRIVATE_KEY] = null;
  const jwt = await createJwt();
  expect(jwt).toEqual(undefined);
});

test('should return jwt if supported', async () => {
  const jwt = await createJwt();
  expect(jwt).toBeTruthy();
  expect(jwt?.split('.')?.length).toEqual(3);
});

test('jwt is unique', async () => {
  const jwtA = await createJwt();
  const jwtB = await createJwt();
  expect(jwtA).not.toEqual(jwtB);
});

test('should store public and private keys after creating JWT', async () => {
  await createJwt();
  expect(FAKE_STORE[STORE_KEY_PUBLIC_JWK]).toBeTruthy();
  expect(FAKE_STORE[STORE_KEY_PRIVATE_KEY]).toBeTruthy();
});

describe('isDpopProofStale', () => {
  const encode = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+/g, '');
  const jwtWithClaims = (claims: unknown) => `${encode({ typ: 'dpop+jwt', alg: 'ES256' })}.${encode(claims)}.sig`;
  const nowSeconds = () => Math.floor(Date.now() / 1000);

  test('a fresh iat is not stale', () => {
    expect(isDpopProofStale(jwtWithClaims({ iat: nowSeconds(), jti: 'a' }))).toBe(false);
  });

  test('an iat just inside the threshold is not stale', () => {
    expect(isDpopProofStale(jwtWithClaims({ iat: nowSeconds() - DPOP_PROOF_STALE_AFTER_SECONDS + 5, jti: 'a' }))).toBe(
      false,
    );
  });

  test('an iat past the threshold is stale', () => {
    expect(isDpopProofStale(jwtWithClaims({ iat: nowSeconds() - DPOP_PROOF_STALE_AFTER_SECONDS - 5, jti: 'a' }))).toBe(
      true,
    );
  });

  // Tokens we cannot positively date must pass through untouched — the persisted
  // `jwt` entry doubles as an injection point for tokens this SDK did not mint.
  test('a token with no iat claim is not stale', () => {
    expect(isDpopProofStale(jwtWithClaims({ jti: 'a' }))).toBe(false);
  });

  test('a token with a non-numeric iat is not stale', () => {
    expect(isDpopProofStale(jwtWithClaims({ iat: 'yesterday', jti: 'a' }))).toBe(false);
  });

  test('an undecodable token is not stale', () => {
    expect(isDpopProofStale('not a jwt at all')).toBe(false);
    expect(isDpopProofStale('one.!!!not-base64!!!.three')).toBe(false);
    expect(isDpopProofStale('')).toBe(false);
  });

  test('a freshly minted proof is not stale', async () => {
    const jwt = await createJwt();
    expect(jwt).toBeTruthy();
    expect(isDpopProofStale(jwt!)).toBe(false);
  });

  // The claims segment is base64url with its `=` padding stripped; decoding must
  // re-pad so `atob` never rejects it (which the try/catch would mask as "fresh").
  // Varying the jti length walks the stripped payload through every length % 4
  // remainder, including the 2- and 3-char cases that need padding.
  test('decodes the claims regardless of base64url padding length', () => {
    const remaindersSeen = new Set<number>();
    for (let n = 0; n < 8; n++) {
      const jwt = jwtWithClaims({ iat: nowSeconds() - DPOP_PROOF_STALE_AFTER_SECONDS - 5, jti: 'a'.repeat(n) });
      remaindersSeen.add(jwt.split('.')[1].length % 4);
      expect(isDpopProofStale(jwt)).toBe(true);
    }
    // ensure the loop actually exercised the padding-sensitive remainders
    expect(remaindersSeen.has(2)).toBe(true);
    expect(remaindersSeen.has(3)).toBe(true);
  });
});

describe('isOwnDpopProof', () => {
  const OWN_JWK = { kty: 'EC', crv: 'P-256', x: 'own-x-coordinate', y: 'own-y-coordinate' };
  const encode = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+/g, '');
  const proofWith = (header: object, claims: unknown = { iat: 1, jti: 'a' }) =>
    `${encode(header)}.${encode(claims)}.sig`;

  test('true when typ is dpop+jwt and the header jwk matches the stored key', async () => {
    FAKE_STORE[STORE_KEY_PUBLIC_JWK] = OWN_JWK;
    expect(await isOwnDpopProof(proofWith({ typ: 'dpop+jwt', alg: 'ES256', jwk: OWN_JWK }))).toBe(true);
  });

  test('matches on (kty, crv, x, y) and ignores extra jwk members', async () => {
    FAKE_STORE[STORE_KEY_PUBLIC_JWK] = { ...OWN_JWK, use: 'sig', kid: '1' };
    expect(await isOwnDpopProof(proofWith({ typ: 'dpop+jwt', alg: 'ES256', jwk: { ...OWN_JWK, ext: true } }))).toBe(true);
  });

  test('false when the header jwk is a different key', async () => {
    FAKE_STORE[STORE_KEY_PUBLIC_JWK] = OWN_JWK;
    expect(await isOwnDpopProof(proofWith({ typ: 'dpop+jwt', alg: 'ES256', jwk: { ...OWN_JWK, x: 'other-x' } }))).toBe(
      false,
    );
  });

  test('false when typ is not dpop+jwt even if the jwk matches', async () => {
    FAKE_STORE[STORE_KEY_PUBLIC_JWK] = OWN_JWK;
    expect(await isOwnDpopProof(proofWith({ typ: 'JWT', alg: 'ES256', jwk: OWN_JWK }))).toBe(false);
  });

  test('false when no key is stored', async () => {
    expect(await isOwnDpopProof(proofWith({ typ: 'dpop+jwt', alg: 'ES256', jwk: OWN_JWK }))).toBe(false);
  });

  test('false for an undecodable token', async () => {
    FAKE_STORE[STORE_KEY_PUBLIC_JWK] = OWN_JWK;
    expect(await isOwnDpopProof('not a jwt at all')).toBe(false);
    expect(await isOwnDpopProof('')).toBe(false);
  });

  // End-to-end against real WebCrypto: createJwt() generates + stores a keypair
  // and embeds its public jwk in the proof header, so its own proof is recognised.
  test('recognises a proof actually minted by createJwt', async () => {
    const jwt = await createJwt();
    expect(jwt).toBeTruthy();
    expect(await isOwnDpopProof(jwt!)).toBe(true);
  });
});

test('when asked should clear keys', async () => {
  const jwk = await createJwt();
  expect(jwk).toBeTruthy();
  expect(FAKE_STORE[STORE_KEY_PUBLIC_JWK]).toBeTruthy();
  expect(FAKE_STORE[STORE_KEY_PRIVATE_KEY]).toBeTruthy();

  clearKeys();

  expect(FAKE_STORE[STORE_KEY_PUBLIC_JWK]).toBeFalsy();
  expect(FAKE_STORE[STORE_KEY_PRIVATE_KEY]).toBeFalsy();
});

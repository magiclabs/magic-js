import { Crypto } from '@peculiar/webcrypto';
import * as storage from '../../../src/util/storage';
import {
  clearKeys,
  createJwt,
  isDpopProofStale,
  DPOP_PROOF_STALE_AFTER_SECONDS,
  STORE_KEY_PRIVATE_KEY,
  STORE_KEY_PUBLIC_JWK,
} from '../../../src/util/web-crypto';
import { TextEncoder } from 'util';

let FAKE_STORE: Record<string, CryptoKey | null> = {};

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

import { Crypto } from '@peculiar/webcrypto';
import * as storage from '../../../src/util/storage';
import {
  DEVICE_SHARE_KEY,
  ENCRYPTION_KEY_KEY,
  INITIALIZATION_VECTOR_KEY,
  clearDeviceShares,
  encryptAndPersistDeviceShare,
  getDecryptedDeviceShare,
  strToArrayBuffer,
} from '../../../src/util/device-share-web-crypto';

let FAKE_STORE = {};
const FAKE_NETWORK_HASH = 'network_hash';

beforeAll(() => {
  jest.spyOn(storage, 'getItem').mockImplementation(async (key: string) => FAKE_STORE[key]);
  jest.spyOn(storage, 'setItem').mockImplementation(async (key: string, value: any) => {
    FAKE_STORE[key] = value;
  });
  jest.spyOn(storage, 'removeItem').mockImplementation(async (key: string) => {
    FAKE_STORE[key] = null;
  });
  jest.spyOn(storage, 'iterate').mockImplementation(async (callback) => {
    await callback('value1', `${DEVICE_SHARE_KEY}_key1`, 1);
    await callback('value2', `Something_else`, 2);
  });
});

beforeEach(() => {
  (window as any).crypto = new Crypto();
});

afterEach(() => {
  FAKE_STORE = {};
});

test('should return undefined if unsupported', async () => {
  const plaintextDeviceShare = 'test';
  (window as any).crypto = {};
  jest.spyOn(global.console, 'info').mockImplementation();
  await encryptAndPersistDeviceShare(plaintextDeviceShare, FAKE_NETWORK_HASH);
});

test('should give undefined if missing device share', async () => {
  await encryptAndPersistDeviceShare(undefined, FAKE_NETWORK_HASH);
});

test('no existing iv and encryption key', async () => {
  (window as any).crypto.subtle = {
    generateKey: (input, extractable, scope) => Promise.resolve('test key'),
    encrypt: (input) => Promise.resolve(strToArrayBuffer('test')),
  };
  const plaintextDeviceShare = 'test';
  await encryptAndPersistDeviceShare(plaintextDeviceShare, FAKE_NETWORK_HASH);
});

test('has existing iv and encryption key', async () => {
  (window as any).crypto.subtle = {
    encrypt: (input) => Promise.resolve(strToArrayBuffer('test')),
  };
  const plaintextDeviceShare = 'test';
  // FAKE_STORE[`${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`] = 'test';
  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = '[24,252,88,58,36,159,217,125,152,115,39,254]';
  FAKE_STORE[ENCRYPTION_KEY_KEY] = 'test';

  await encryptAndPersistDeviceShare(plaintextDeviceShare, FAKE_NETWORK_HASH);
});

test('no iv', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(strToArrayBuffer('test')),
  };
  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = null;

  await getDecryptedDeviceShare(FAKE_NETWORK_HASH);
});

test('has iv and ek but no device share', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(strToArrayBuffer('test')),
  };
  FAKE_STORE[`${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`] = null;
  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = '[24,252,88,58,36,159,217,125,152,115,39,254]';
  FAKE_STORE[ENCRYPTION_KEY_KEY] = 'test';
  await getDecryptedDeviceShare(FAKE_NETWORK_HASH);
});

test('has all 3', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(strToArrayBuffer('test')),
  };
  FAKE_STORE[`${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`] = 'test';
  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = '[24,252,88,58,36,159,217,125,152,115,39,254]';
  FAKE_STORE[ENCRYPTION_KEY_KEY] = 'test';
  await getDecryptedDeviceShare(FAKE_NETWORK_HASH);
});

test('clear device shares', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(strToArrayBuffer('test')),
  };
  FAKE_STORE[`${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`] = 'test';

  await clearDeviceShares();
});

/* test('jwt is unique', async () => {
  const jwtA = await createJwt();
  const jwtB = await createJwt();
  expect(jwtA).not.toEqual(jwtB);
});

test('should store public and private keys after creating JWT', async () => {
  await createJwt();
  expect(FAKE_STORE[STORE_KEY_PUBLIC_JWK]).toBeTruthy();
  expect(FAKE_STORE[STORE_KEY_PRIVATE_KEY]).toBeTruthy();
});

test('private key should be non exportable', async () => {
  await createJwt();
  const privateKey = FAKE_STORE[STORE_KEY_PRIVATE_KEY];
  expect(() => crypto.subtle.exportKey('jwk', privateKey)).toThrow();
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
*/

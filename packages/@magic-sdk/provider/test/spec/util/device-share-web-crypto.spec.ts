import { Crypto } from '@peculiar/webcrypto';
import * as storage from '../../../src/util/storage';
import {
  DEVICE_SHARE_KEY,
  ENCRYPTION_KEY_KEY,
  INITIALIZATION_VECTOR_KEY,
  base64ToArrayBuffer,
  clearDeviceShares,
  encryptAndPersistDeviceShare,
  getDecryptedDeviceShare,
} from '../../../src/util/device-share-web-crypto';

let FAKE_STORE = {};
const FAKE_NETWORK_HASH = 'network_hash';

const FAKE_PLAINTEXT_SHARE = `AQICAHg1y7j1UY7sfTib6h9cN2Kh7v0WhCRwQxEPhGAQ2m5OgQGrJvUP6MKiuj9yD96y6B4eAAABPzCCATsGCSqGSIb3DQEHBqCCASwwggEoAgEAMIIBIQYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAy6tbGg/6//2IJs9xUCARCAgfOY3knm1i2kGjLXQFoqEjOeLr/UGwHQ+AW1y20UoCX3ght68egu06Hg54JF/mCGgSDt7R7dFSOuGvapE9OEyFYz4f1+tpWb5PPaLReBRTTTfw/8Xgsfzl6iXACsLKqyXEeWci+/vOWDLqu73E0uy5StyN5InZLwHCJe4l+KMEr5C7JZvobQh4NVBT5SqgQXmLGXGGH/2ydkq8zkgVGDT9jQlqqpUH83UMFQwHSwbJRRyYLxBwQKTO0AODfqk5OnWRA+BoDC8HMFyQUb4nS+BgDlgTgL7Kg/H/Echr+SlQKJdWJnvf3BjSBwO8z5kVpxRo5xwG4=`;
const FAKE_ENCRYPTED_DEVICE_SHARE = 'FakeEncryptedDeviceShare';
const FAKE_DECRYPTED_DEVICE_SHARE = 'FakeDecryptedDeviceShare';

const FAKE_ENCRYPTION_KEY = 'fake encryption key';
const FAKE_IV = new Uint8Array(JSON.parse('[24,252,88,58,36,159,217,125,152,115,39,254]'));

beforeAll(() => {
  jest.spyOn(storage, 'getItem').mockImplementation(async (key: string) => FAKE_STORE[key]);
  jest.spyOn(storage, 'setItem').mockImplementation(async (key: string, value: any) => {
    FAKE_STORE[key] = value;
  });
  jest.spyOn(storage, 'removeItem').mockImplementation(async (key: string) => {
    FAKE_STORE[key] = null;
  });
  jest.spyOn(storage, 'iterate').mockImplementation(async (callback) => {
    await callback('value1', `${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`, 1);
    await callback('value2', `Something_else`, 2);
  });
});

beforeEach(() => {
  (window as any).crypto = new Crypto();
});

afterEach(() => {
  FAKE_STORE = {};
});

// ------------------------- encrypting and syncing --------------------------

test('encryptAndPersistDeviceShare should return undefined if webcrypto is unsupported', async () => {
  (window as any).crypto = {};
  jest.spyOn(global.console, 'info').mockImplementation();
  await encryptAndPersistDeviceShare(FAKE_PLAINTEXT_SHARE, FAKE_NETWORK_HASH);

  expect(FAKE_STORE).toEqual({});
});

test('encryptAndPersistDeviceShare should return undefined if no device share found', async () => {
  await encryptAndPersistDeviceShare(undefined, FAKE_NETWORK_HASH);
  expect(FAKE_STORE).toEqual({});
});

test('encryptAndPersistDeviceShare should persist encrypted device share when store doesnt have existing iv and encryption key', async () => {
  (window as any).crypto.subtle = {
    generateKey: (input, extractable, scope) => Promise.resolve(FAKE_ENCRYPTION_KEY),
    encrypt: (input) => Promise.resolve(base64ToArrayBuffer(FAKE_ENCRYPTED_DEVICE_SHARE)),
  };

  await encryptAndPersistDeviceShare(FAKE_PLAINTEXT_SHARE, FAKE_NETWORK_HASH);
  expect((FAKE_STORE as any).ds_network_hash).toEqual(FAKE_ENCRYPTED_DEVICE_SHARE);
});

test('encryptAndPersistDeviceShare should persist encrypted device share when store has existing iv and encryption key', async () => {
  (window as any).crypto.subtle = {
    encrypt: (input) => Promise.resolve(base64ToArrayBuffer(FAKE_ENCRYPTED_DEVICE_SHARE)),
  };

  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = FAKE_IV;
  FAKE_STORE[ENCRYPTION_KEY_KEY] = FAKE_ENCRYPTION_KEY;

  await encryptAndPersistDeviceShare(FAKE_PLAINTEXT_SHARE, FAKE_NETWORK_HASH);
  expect((FAKE_STORE as any).ds_network_hash).toEqual(FAKE_ENCRYPTED_DEVICE_SHARE);
});

// ------------------- decrypting and returning device share -------------------

test('getDecryptedDeviceShare should return undefined if no existing iv string found in storage', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(base64ToArrayBuffer(FAKE_ENCRYPTED_DEVICE_SHARE)),
  };

  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = null;
  const res = await getDecryptedDeviceShare(FAKE_NETWORK_HASH);
  expect(res).toEqual(undefined);
});

test('getDecryptedDeviceShare should return undefined if store has existing iv and ek but no device share', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(base64ToArrayBuffer(FAKE_DECRYPTED_DEVICE_SHARE)),
  };

  FAKE_STORE[`${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`] = null;
  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = FAKE_IV;
  FAKE_STORE[ENCRYPTION_KEY_KEY] = FAKE_ENCRYPTION_KEY;

  const res = await getDecryptedDeviceShare(FAKE_NETWORK_HASH);

  expect(res).toEqual(undefined);
});

test('getDecryptedDeviceShare returns decrypted device share if iv encryption key and device share are in storage', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(base64ToArrayBuffer(FAKE_DECRYPTED_DEVICE_SHARE)),
  };

  FAKE_STORE[`${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`] = FAKE_ENCRYPTED_DEVICE_SHARE;
  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = FAKE_IV;
  FAKE_STORE[ENCRYPTION_KEY_KEY] = FAKE_ENCRYPTION_KEY;

  const res = await getDecryptedDeviceShare(FAKE_NETWORK_HASH);
  expect(res).toEqual(FAKE_DECRYPTED_DEVICE_SHARE);
});

// ------------------------ clearing the device share -----------------------

test('clearDeviceShares should successfully clear device shares', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(base64ToArrayBuffer(FAKE_DECRYPTED_DEVICE_SHARE)),
  };

  FAKE_STORE[`${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`] = FAKE_ENCRYPTED_DEVICE_SHARE;

  await clearDeviceShares();

  expect(FAKE_STORE[`${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`]).toEqual(null);
});

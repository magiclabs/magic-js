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

const FAKE_PLAINTEXT_SHARE = 'fake plainext share';
const FAKE_ENCRYPTED_DEVICE_SHARE = window.atob('fake encrypted device share');
const FAKE_DECRYPTED_DEVICE_SHARE = 'fake decrypted device share';

const FAKE_ENCRYPTION_KEY = 'fake encryption key';
const FAKE_IV_STRING = '[24,252,88,58,36,159,217,125,152,115,39,254]';

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

// ----------------- encrypting and syncing ------------------

test('should return undefined if unsupported', async () => {
  (window as any).crypto = {};
  jest.spyOn(global.console, 'info').mockImplementation();
  await encryptAndPersistDeviceShare(FAKE_PLAINTEXT_SHARE, FAKE_NETWORK_HASH);

  expect(FAKE_STORE).toEqual({});
});

test('should give undefined if missing device share', async () => {
  await encryptAndPersistDeviceShare(undefined, FAKE_NETWORK_HASH);
  expect(FAKE_STORE).toEqual({});
});

test('no existing iv and encryption key', async () => {
  (window as any).crypto.subtle = {
    generateKey: (input, extractable, scope) => Promise.resolve(FAKE_ENCRYPTION_KEY),
    encrypt: (input) => Promise.resolve(strToArrayBuffer(FAKE_ENCRYPTED_DEVICE_SHARE)),
  };

  await encryptAndPersistDeviceShare(FAKE_PLAINTEXT_SHARE, FAKE_NETWORK_HASH);
  // expect((FAKE_STORE as any).ds_network_hash).toEqual(FAKE_ENCRYPTED_DEVICE_SHARE);
});

test('should save has existing iv and encryption key', async () => {
  (window as any).crypto.subtle = {
    encrypt: (input) => Promise.resolve(strToArrayBuffer(FAKE_ENCRYPTED_DEVICE_SHARE)),
  };

  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = FAKE_IV_STRING;
  FAKE_STORE[ENCRYPTION_KEY_KEY] = FAKE_ENCRYPTION_KEY;

  await encryptAndPersistDeviceShare(FAKE_PLAINTEXT_SHARE, FAKE_NETWORK_HASH);
  // expect((FAKE_STORE as any).ds_network_hash).toEqual(FAKE_ENCRYPTED_DEVICE_SHARE);
});

// --------------- decrypting and returning ---------------

test('should return undefined if no existing iv string found in storage', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(strToArrayBuffer(FAKE_ENCRYPTED_DEVICE_SHARE)),
  };

  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = null;
  const res = await getDecryptedDeviceShare(FAKE_NETWORK_HASH);
  expect(res).toEqual(undefined);
});

test('has iv and ek but no device share', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(strToArrayBuffer(FAKE_DECRYPTED_DEVICE_SHARE)),
  };

  FAKE_STORE[`${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`] = null;
  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = FAKE_IV_STRING;
  FAKE_STORE[ENCRYPTION_KEY_KEY] = FAKE_ENCRYPTION_KEY;

  const res = await getDecryptedDeviceShare(FAKE_NETWORK_HASH);
});

test('returns decrypted device share if iv encryption key and device share are in storage', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(strToArrayBuffer(FAKE_DECRYPTED_DEVICE_SHARE)),
  };

  FAKE_STORE[`${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`] = FAKE_ENCRYPTED_DEVICE_SHARE;
  FAKE_STORE[INITIALIZATION_VECTOR_KEY] = FAKE_IV_STRING;
  FAKE_STORE[ENCRYPTION_KEY_KEY] = FAKE_ENCRYPTION_KEY;

  const res = await getDecryptedDeviceShare(FAKE_NETWORK_HASH);
});

test('clear device shares', async () => {
  (window as any).crypto.subtle = {
    decrypt: (input) => Promise.resolve(strToArrayBuffer(FAKE_DECRYPTED_DEVICE_SHARE)),
  };

  FAKE_STORE[`${DEVICE_SHARE_KEY}_${FAKE_NETWORK_HASH}`] = FAKE_ENCRYPTED_DEVICE_SHARE;

  const res = await clearDeviceShares();
});

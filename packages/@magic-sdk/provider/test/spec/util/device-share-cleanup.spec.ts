import * as storage from '../../../src/util/storage';
import { clearDeviceShares } from '../../../src/util/device-share-cleanup';
import { STORE_KEY_PRIVATE_KEY, STORE_KEY_PUBLIC_JWK } from '../../../src/util/web-crypto';

const DEVICE_SHARE_KEY = 'ds';
const ENCRYPTION_KEY_KEY = 'ek';
const INITIALIZATION_VECTOR_KEY = 'iv';

let FAKE_STORE: Record<string, unknown> = {};
let removedKeys: string[] = [];

/**
 * Keys the SDK persists alongside the retired device share. None of these may be
 * touched by the cleanup.
 */
const UNRELATED_ENTRIES: Record<string, unknown> = {
  rt: 'refresh token',
  jwt: 'dpop jwt',
  magic_auth_is_logged_in: true,
  [STORE_KEY_PRIVATE_KEY]: 'private key',
  [STORE_KEY_PUBLIC_JWK]: 'public jwk',
};

/**
 * Keys chosen to collide with the cleanup if it ever matches on a substring or a
 * bare prefix rather than on `ds_` and the exact `ek` / `iv` names.
 */
const NEAR_MISS_ENTRIES: Record<string, unknown> = {
  ds: 'no trailing underscore',
  dsomething: 'prefix without the underscore',
  not_ds_prefixed: 'ds_ appears mid-key',
  deck: 'contains ek',
  private: 'contains iv',
};

beforeEach(() => {
  FAKE_STORE = {};
  removedKeys = [];

  jest.spyOn(storage, 'removeItem').mockImplementation(async (key: string) => {
    removedKeys.push(key);
    delete FAKE_STORE[key];
  });

  jest.spyOn(storage, 'iterate').mockImplementation(async (callback: any) => {
    // Snapshot the keys so the walk is not affected by concurrent mutation.
    Object.keys(FAKE_STORE).forEach((key, i) => callback(FAKE_STORE[key], key, i + 1));
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('clearDeviceShares removes every persisted device share record', async () => {
  FAKE_STORE = {
    [`${DEVICE_SHARE_KEY}_apikey_eth_mainnet`]: 'share one',
    [`${DEVICE_SHARE_KEY}_apikey_eth_sepolia`]: 'share two',
    [`${DEVICE_SHARE_KEY}_apikey_https://custom.rpc.url_12345_eth`]: 'share three',
  };

  await clearDeviceShares();

  expect(FAKE_STORE).toEqual({});
});

test('clearDeviceShares removes the encryption key and initialization vector', async () => {
  FAKE_STORE = {
    [`${DEVICE_SHARE_KEY}_apikey_eth_mainnet`]: 'share one',
    [ENCRYPTION_KEY_KEY]: 'aes key',
    [INITIALIZATION_VECTOR_KEY]: new Uint8Array(12),
  };

  await clearDeviceShares();

  expect(FAKE_STORE).toEqual({});
});

test('clearDeviceShares removes the encryption key and initialization vector when no share remains', async () => {
  // The pre-removal code cleared `ds_*` on logout but left `ek` and `iv` behind,
  // so this residue is expected on existing installs.
  FAKE_STORE = {
    [ENCRYPTION_KEY_KEY]: 'aes key',
    [INITIALIZATION_VECTOR_KEY]: new Uint8Array(12),
    ...UNRELATED_ENTRIES,
  };

  await clearDeviceShares();

  expect(FAKE_STORE).toEqual(UNRELATED_ENTRIES);
});

test('clearDeviceShares leaves unrelated storage entries intact', async () => {
  FAKE_STORE = {
    [`${DEVICE_SHARE_KEY}_apikey_eth_mainnet`]: 'share one',
    [ENCRYPTION_KEY_KEY]: 'aes key',
    [INITIALIZATION_VECTOR_KEY]: new Uint8Array(12),
    ...UNRELATED_ENTRIES,
  };

  await clearDeviceShares();

  expect(FAKE_STORE).toEqual(UNRELATED_ENTRIES);
});

test('clearDeviceShares does not match keys that merely resemble the device share keys', async () => {
  FAKE_STORE = { ...NEAR_MISS_ENTRIES };

  await clearDeviceShares();

  expect(FAKE_STORE).toEqual(NEAR_MISS_ENTRIES);
});

test('clearDeviceShares only ever removes device share keys', async () => {
  FAKE_STORE = {
    [`${DEVICE_SHARE_KEY}_apikey_eth_mainnet`]: 'share one',
    [ENCRYPTION_KEY_KEY]: 'aes key',
    [INITIALIZATION_VECTOR_KEY]: new Uint8Array(12),
    ...UNRELATED_ENTRIES,
    ...NEAR_MISS_ENTRIES,
  };

  await clearDeviceShares();

  expect(removedKeys.sort()).toEqual(
    [ENCRYPTION_KEY_KEY, INITIALIZATION_VECTOR_KEY, `${DEVICE_SHARE_KEY}_apikey_eth_mainnet`].sort(),
  );
});

test('clearDeviceShares is a no-op against storage with nothing to clean', async () => {
  FAKE_STORE = { ...UNRELATED_ENTRIES };

  await expect(clearDeviceShares()).resolves.toBeUndefined();

  expect(FAKE_STORE).toEqual(UNRELATED_ENTRIES);
  expect(removedKeys.sort()).toEqual([ENCRYPTION_KEY_KEY, INITIALIZATION_VECTOR_KEY].sort());
});

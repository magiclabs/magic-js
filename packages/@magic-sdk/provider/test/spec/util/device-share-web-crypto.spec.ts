import { Crypto } from '@peculiar/webcrypto';
import * as storage from '../../../src/util/storage';
import { clearKeys, createJwt, STORE_KEY_PRIVATE_KEY, STORE_KEY_PUBLIC_JWK } from '../../../src/util/web-crypto';
import { DEVICE_SHARE_KEY, encryptDeviceShare, strToArrayBuffer } from '../../../src/util/device-share-web-crypto';

let FAKE_STORE = {};
const testIv = strToArrayBuffer('testiv');

beforeAll(() => {
  jest.spyOn(storage, 'getItem').mockImplementation(async (key: string) => FAKE_STORE[key]);
  jest.spyOn(storage, 'setItem').mockImplementation(async (key: string, value: any) => {
    FAKE_STORE[key] = value;
  });
  jest.spyOn(storage, 'removeItem').mockImplementation(async (key: string) => {
    FAKE_STORE[key] = null;
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
  (window as any).crypto = undefined;
  jest.spyOn(global.console, 'info').mockImplementation();
  const { encryptedDeviceShare } = await encryptDeviceShare(plaintextDeviceShare);
  expect(encryptedDeviceShare).toEqual(undefined);
});

test('should give undefined if missing device share', async () => {
  const plaintextDeviceShare = 'test';
  FAKE_STORE[DEVICE_SHARE_KEY] = null;
  const { encryptedDeviceShare } = await encryptDeviceShare(plaintextDeviceShare);
  expect(encryptedDeviceShare).toEqual(undefined);
});

test('should return jwt if supported', async () => {
  const plaintextDeviceShare = 'test';
  FAKE_STORE[DEVICE_SHARE_KEY] = 'test';

  const jwt = await encryptDeviceShare(plaintextDeviceShare);
  expect(jwt).toBeTruthy();
  expect(jwt.split('.').length).toEqual(3);
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

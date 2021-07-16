import test from 'ava';
import sinon from 'sinon';
import { Crypto } from '@peculiar/webcrypto';
import * as storage from '../../../src/util/storage';
import { clearKeys, createJwt, STORE_KEY_PRIVATE_KEY, STORE_KEY_PUBLIC_JWK } from '../../../src/util/web-crypto';

let FAKE_STORE = {};

test.before(() => {
  sinon.stub(storage, 'getItem').callsFake(async (key: string) => FAKE_STORE[key]);
  sinon.stub(storage, 'setItem').callsFake(async (key: string, value: any) => {
    FAKE_STORE[key] = value;
  });
  sinon.stub(storage, 'removeItem').callsFake(async (key: string) => {
    FAKE_STORE[key] = null;
  });
});

test.beforeEach(() => {
  (window as any).crypto = new Crypto();
});

test.afterEach(() => {
  FAKE_STORE = {};
});

test.serial('should return undefined if unsupported', async (t) => {
  (window as any).crypto = undefined;
  const jwt = await createJwt();
  t.is(jwt, undefined);
});

test.serial('should give undefined if missing private key', async (t) => {
  await createJwt(); // create keys
  FAKE_STORE[STORE_KEY_PRIVATE_KEY] = null;
  const jwt = await createJwt();
  t.is(jwt, undefined);
});

test.serial('should return jwt if supported', async (t) => {
  const jwt = await createJwt();
  t.truthy(jwt);
  t.is(jwt.split('.').length, 3, 'should have 3 parts to jwt string');
});

test.serial('jwt is unique', async (t) => {
  const jwtA = await createJwt();
  const jwtB = await createJwt();
  t.false(jwtA === jwtB);
});

test.serial('should store public and private keys after creating JWT', async (t) => {
  await createJwt();
  t.truthy(FAKE_STORE[STORE_KEY_PUBLIC_JWK]);
  t.truthy(FAKE_STORE[STORE_KEY_PRIVATE_KEY]);
});

test.serial('private key should be non exportable', async (t) => {
  await createJwt();
  const privateKey = FAKE_STORE[STORE_KEY_PRIVATE_KEY];
  t.throws(() => crypto.subtle.exportKey('jwk', privateKey));
});

test.serial('when asked should clear keys', async (t) => {
  const jwk = await createJwt();
  t.truthy(jwk);
  t.truthy(FAKE_STORE[STORE_KEY_PUBLIC_JWK]);
  t.truthy(FAKE_STORE[STORE_KEY_PRIVATE_KEY]);

  clearKeys();

  t.falsy(FAKE_STORE[STORE_KEY_PUBLIC_JWK]);
  t.falsy(FAKE_STORE[STORE_KEY_PRIVATE_KEY]);
});

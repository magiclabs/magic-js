/* eslint-disable no-underscore-dangle */

import test, { ExecutionContext } from 'ava';
import sinon from 'sinon';
import localForage from 'localforage';
import * as memoryDriver from 'localforage-driver-memory';
import * as storage from '../../../src/util/storage';
import { mockSDKEnvironmentConstant } from '../../mocks';

/**
 * Stubs the given `method` on `localforage` and determines if the underlying
 * storage utility calls it successfully.
 */
async function assertLocalForageDbMethodCalled<T extends keyof LocalForageDbMethods>(
  t: ExecutionContext,
  method: T,
  ...args: Parameters<LocalForageDbMethods[T]>
) {
  mockSDKEnvironmentConstant('configureStorage', async () => {
    await localForage.defineDriver(memoryDriver);
    await localForage.setDriver([memoryDriver._driver]);
  });

  const localForageStub = sinon.spy(memoryDriver, method);
  (localForage as any).test = 'hello';

  await storage[method as keyof LocalForageDbMethods](...args);

  t.true(localForageStub.called);
}

test('getItem', async (t) => {
  await assertLocalForageDbMethodCalled(t, 'getItem', 'test');
});

test('setItem', async (t) => {
  await assertLocalForageDbMethodCalled(t, 'setItem', 'hello', 'world');
});

test('removeItem', async (t) => {
  await assertLocalForageDbMethodCalled(t, 'removeItem', 'hello');
});

test('clear', async (t) => {
  await assertLocalForageDbMethodCalled(t, 'clear');
});

test('length', async (t) => {
  await assertLocalForageDbMethodCalled(t, 'length');
});

test('key', async (t) => {
  await assertLocalForageDbMethodCalled(t, 'key', 0);
});

test('keys', async (t) => {
  await assertLocalForageDbMethodCalled(t, 'keys');
});

test('iterate', async (t) => {
  await assertLocalForageDbMethodCalled(t, 'iterate', () => {});
});

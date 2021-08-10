/* eslint-disable no-underscore-dangle */

import sinon from 'sinon';
import localForage from 'localforage';
import * as memoryDriver from 'localforage-driver-memory';
import * as storage from '../../../src/util/storage';
import { mockSDKEnvironmentConstant } from '../../mocks';

beforeAll(() => {
  mockSDKEnvironmentConstant('configureStorage', async () => {
    const lf = localForage.createInstance({
      driver: [],
    });

    await lf.defineDriver(memoryDriver);
    await localForage.setDriver(memoryDriver._driver);
    await lf.setDriver([memoryDriver._driver]);

    return lf;
  });
});

/**
 * Stubs the given `method` on `localforage` and determines if the underlying
 * storage utility calls it successfully.
 */
async function assertLocalForageDbMethodCalled<T extends keyof LocalForageDbMethods>(
  t: ExecutionContext,
  method: T,
  ...args: Parameters<LocalForageDbMethods[T]>
) {
  const localForageStub = sinon.spy(memoryDriver, method);
  await storage[method as keyof LocalForageDbMethods](...args);
  expect(localForageStub.called).toBe(true);
}

test('getItem', async () => {
  await assertLocalForageDbMethodCalled(t, 'getItem', 'test');
});

test('setItem', async () => {
  await assertLocalForageDbMethodCalled(t, 'setItem', 'hello', 'world');
});

test('removeItem', async () => {
  await assertLocalForageDbMethodCalled(t, 'removeItem', 'hello');
});

test('clear', async () => {
  await assertLocalForageDbMethodCalled(t, 'clear');
});

test('length', async () => {
  await assertLocalForageDbMethodCalled(t, 'length');
});

test('key', async () => {
  await assertLocalForageDbMethodCalled(t, 'key', 0);
});

test('keys', async () => {
  await assertLocalForageDbMethodCalled(t, 'keys');
});

test('iterate', async () => {
  await assertLocalForageDbMethodCalled(t, 'iterate', () => {});
});

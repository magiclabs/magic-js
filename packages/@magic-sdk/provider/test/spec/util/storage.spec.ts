/* global LocalForageDbMethods */

import browserEnv from '@ikscodes/browser-env';
import localForage from 'localforage';
import * as memoryDriver from 'localforage-driver-memory';
import { mockSDKEnvironmentConstant } from '../../mocks';

beforeEach(() => {
  browserEnv.restore();
  browserEnv.stub('console.info', jest.fn()); // Silence LocalForage info logs
  jest.resetModules();

  mockSDKEnvironmentConstant({
    configureStorage: async () => {
      const lf = localForage.createInstance({
        driver: [],
      });

      await lf.defineDriver(memoryDriver);
      await localForage.setDriver(memoryDriver._driver);
      await lf.setDriver([memoryDriver._driver]);

      return lf;
    },
  });
});

/**
 * Stubs the given `method` on `localforage` and determines if the underlying
 * storage utility calls it successfully.
 */
async function assertLocalForageDbMethodCalled<T extends keyof LocalForageDbMethods>(
  method: T,
  ...args: Parameters<LocalForageDbMethods[T]>
) {
  const localForageStub = jest.spyOn(memoryDriver, method).mockImplementation();
  const storage = require('../../../src/util/storage');
  await storage[method](...args);
  expect(localForageStub).toBeCalled();
}

test('getItem', async () => {
  await assertLocalForageDbMethodCalled('getItem', 'test');
});

test('setItem', async () => {
  await assertLocalForageDbMethodCalled('setItem', 'hello', 'world');
});

test('removeItem', async () => {
  await assertLocalForageDbMethodCalled('removeItem', 'hello');
});

test('clear', async () => {
  await assertLocalForageDbMethodCalled('clear');
});

test('length', async () => {
  await assertLocalForageDbMethodCalled('length');
});

test('key', async () => {
  await assertLocalForageDbMethodCalled('key', 0);
});

test('keys', async () => {
  await assertLocalForageDbMethodCalled('keys');
});

test('iterate', async () => {
  await assertLocalForageDbMethodCalled('iterate', () => {});
});

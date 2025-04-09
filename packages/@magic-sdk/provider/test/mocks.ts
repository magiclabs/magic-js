import type { SDKEnvironment } from '../src/core/sdk-environment';
import * as storage from '../src/util/storage';

export function getPayloadIdStub(mockID: number) {
  const stub = jest.fn().mockImplementation(() => mockID);
  jest.mock('../src/util/get-payload-id', () => ({
    getPayloadId: stub,
  }));
  return stub;
}

const originalSDKEnvironment = jest.requireActual('../src/core/sdk-environment');

export function mockSDKEnvironmentConstant(environment: { [P in keyof SDKEnvironment]?: any } = {}) {
  jest.mock('../src/core/sdk-environment', () => ({
    // ...originalSDKEnvironment,
    SDKEnvironment: {
      ...originalSDKEnvironment.SDKEnvironment,
      ...environment,
    },
  }));
}

export function restoreSDKEnvironmentConstants() {
  jest.unmock('../src/core/sdk-environment');
}

export function mockLocalForage(FAKE_STORE: Record<string, unknown> = {}) {
  jest.spyOn(storage, 'getItem').mockImplementation((key: string, callback?: (err: unknown, value: unknown) => void) => {
    const value = FAKE_STORE[key];

    if (callback) {
      callback(null, value);
    }

    return Promise.resolve(value);
  });
  jest.spyOn(storage, 'setItem').mockImplementation(async (key: string, value: any) => {
    FAKE_STORE[key] = value;
  });
  jest.spyOn(storage, 'removeItem').mockImplementation(async (key: string) => {
    FAKE_STORE[key] = null;
  });
}

export function mockLocalStorage() {
  const ls = {};
  const localStorageMock = {
    getItem: jest.fn((key) => ls[key]),
    setItem: jest.fn((key, value) => {
      ls[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      ls[key] = undefined;
    }),
    clear: jest.fn(() => {
      Object.keys(ls).forEach((key) => {
        ls[key] = undefined;
      });
    }),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
}

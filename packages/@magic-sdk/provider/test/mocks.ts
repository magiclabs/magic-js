import type { SDKEnvironment } from '../src/core/sdk-environment';

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

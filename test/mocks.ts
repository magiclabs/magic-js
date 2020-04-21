import sinon from 'sinon';
import mockery from 'mockery';
import * as ConfigConstants from '../src/constants/config';
import { getPayloadId } from '../src/util/get-payload-id';

const noopModule = {};

export function getPayloadIdStub() {
  const stub = sinon.stub();
  (getPayloadId as any) = stub;
  return stub;
}

export function mockConfigConstant(key: keyof typeof ConfigConstants, value: boolean) {
  (ConfigConstants as any)[key] = value;
}

export function removeReactDependencies() {
  mockery.registerMock('react', noopModule);
  mockery.registerMock('react-native', noopModule);
  mockery.registerMock('react-native-webview', noopModule);
}

export function removeWhatwgUrl() {
  mockery.registerMock('whatwg-url', noopModule);
}

export function resetModuleCache() {
  mockery.resetCache();
}

export function enableMocks() {
  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
  });
}

import sinon from 'sinon';
import mockery from 'mockery';
import { getPayloadId } from '../src/util/get-payload-id';

const noopModule = {};

export function getPayloadIdStub() {
  const stub = sinon.stub();
  (getPayloadId as any) = stub;
  return stub;
}

export function mockReactDependencies() {
  mockery.registerMock('react', noopModule);
  mockery.registerMock('react-native', noopModule);
  mockery.registerMock('react-native-webview', noopModule);
}

export function mockWhatwgUrl() {
  mockery.registerMock('whatwg-url', noopModule);
}

export function unmockWhatwgUrl() {
  mockery.registerMock('whatwg-url', noopModule);
}

export function enableMocks() {
  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
  });
}

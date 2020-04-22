/*
  eslint-disable

  global-require,
  @typescript-eslint/no-var-requires
 */

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
  mockery.registerMock('whatwg-url', noopModule);

  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
  });
}

export function reactNativeStyleSheetStub() {
  const ReactNative = require('react-native');

  const createStub = sinon.stub();

  ReactNative.StyleSheet = {
    create: createStub,
  };

  return createStub;
}

/*
  eslint-disable

  global-require,
  @typescript-eslint/no-var-requires
 */

import sinon from 'sinon';
import mockery from 'mockery';

export function reactNativeStyleSheetStub() {
  const ReactNative = require('react-native');

  const createStub = sinon.stub();

  ReactNative.StyleSheet = {
    create: createStub,
  };

  return createStub;
}

const noopModule = {};

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

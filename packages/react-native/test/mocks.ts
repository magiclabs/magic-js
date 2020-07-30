/*
  eslint-disable

  global-require,
  @typescript-eslint/no-var-requires
 */

import sinon from 'sinon';
import mockery from 'mockery';
import importFresh from 'import-fresh';

export function requireIndex() {
  return importFresh('../src/index') as typeof import('../src/index');
}

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

  // The `localforage` driver we use to enable React Native's `AsyncStorage`
  // currently uses an `import` statement at the top of it's index file, this is
  // causing TypeScript + `ts-node` to throw a SyntaxError. Until that is
  // resolved, we have no choice but to mock it.
  //
  // Relevant issue:
  // https://github.com/aveq-research/localforage-asyncstorage-driver/issues/1
  mockery.registerMock('@aveq-research/localforage-asyncstorage-driver', noopModule);

  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
  });
}

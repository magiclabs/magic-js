export function reactNativeStyleSheetStub() {
  const { StyleSheet } = jest.requireActual('react-native');
  return jest.spyOn(StyleSheet, 'create');
}

const noopModule = () => ({});

export function removeReactDependencies() {
  jest.mock('react', noopModule);
  jest.mock('react-native-webview', noopModule);

  // The `localforage` driver we use to enable React Native's `AsyncStorage`
  // currently uses an `import` statement at the top of it's index file, this is
  // causing TypeScript + `ts-node` to throw a SyntaxError. Until that is
  // resolved, we have no choice but to mock it.
  //
  // Relevant issue:
  // https://github.com/aveq-research/localforage-asyncstorage-driver/issues/1
  jest.mock('@aveq-research/localforage-asyncstorage-driver', noopModule);
}

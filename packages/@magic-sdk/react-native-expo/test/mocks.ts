export function reactNativeStyleSheetStub() {
  const { StyleSheet } = jest.requireActual('react-native');
  return jest.spyOn(StyleSheet, 'create');
}

export function removeReactDependencies() {
  jest.mock('react-native-webview', () => ({}));
  jest.mock('react-native-safe-area-context', () => ({}));
  jest.mock('@react-native-community/netinfo', () => {
    return require('@react-native-community/netinfo/jest/netinfo-mock');
  });
}

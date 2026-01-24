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
  jest.mock('expo-modules-core', () => ({
    EventEmitter: jest.fn(),
    NativeModule: jest.fn(),
    requireNativeModule: jest.fn(),
    requireOptionalNativeModule: jest.fn(),
  }));
  jest.mock('expo-application', () => ({
    nativeApplicationVersion: '1.0.0',
    nativeBuildVersion: '1',
    applicationName: 'TestApp',
    applicationId: 'com.test.app',
  }));
}

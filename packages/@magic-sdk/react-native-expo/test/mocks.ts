// @react-native-community/netinfo mocks
const defaultState = {
  type: 'cellular',
  isConnected: true,
  isInternetReachable: true,
  details: {
    isConnectionExpensive: true,
    cellularGeneration: '3g',
  },
};

const NetInfoStateType = {
  unknown: 'unknown',
  none: 'none',
  cellular: 'cellular',
  wifi: 'wifi',
  bluetooth: 'bluetooth',
  ethernet: 'ethernet',
  wimax: 'wimax',
  vpn: 'vpn',
  other: 'other',
};

const RNCNetInfoMock = {
  NetInfoStateType,
  configure: jest.fn(),
  fetch: jest.fn(),
  refresh: jest.fn(),
  addEventListener: jest.fn(),
  useNetInfo: jest.fn(),
  getCurrentState: jest.fn(),
};

RNCNetInfoMock.fetch.mockResolvedValue(defaultState);
RNCNetInfoMock.refresh.mockResolvedValue(defaultState);
RNCNetInfoMock.useNetInfo.mockReturnValue(defaultState);
RNCNetInfoMock.addEventListener.mockReturnValue(jest.fn());

export function reactNativeStyleSheetStub() {
  const { StyleSheet } = jest.requireActual('react-native');
  return jest.spyOn(StyleSheet, 'create');
}

const noopModule = () => ({});

export function removeReactDependencies() {
  jest.mock('react-native-webview', noopModule);
  jest.mock('react-native-safe-area-context', noopModule);
  jest.mock('@react-native-community/netinfo', () => RNCNetInfoMock);

  // The `localforage` driver we use to enable React Native's `AsyncStorage`
  // currently uses an `import` statement at the top of it's index file, this is
  // causing TypeScript + `ts-node` to throw a SyntaxError. Until that is
  // resolved, we have no choice but to mock it.
  //
  // Relevant issue:
  // https://github.com/aveq-research/localforage-asyncstorage-driver/issues/1
  jest.mock('@aveq-research/localforage-asyncstorage-driver', noopModule);
}

const mockNativeModules: Record<string, unknown> = {};
const mockPlatform: { OS: string } = { OS: 'ios' };

jest.mock('react-native', () => ({
  NativeModules: mockNativeModules,
  Platform: mockPlatform,
}));

describe('checkNativeModules', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset module to clear hasWarned state between tests
    jest.resetModules();

    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Clear native modules
    delete mockNativeModules['ExpoSecureStore'];
    delete mockNativeModules['DeviceCrypto'];
    mockPlatform.OS = 'ios';
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should not log any warning when all native modules are present', () => {
    mockNativeModules.ExpoSecureStore = {};
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should log a warning when expo-secure-store is missing', () => {
    mockNativeModules.ExpoSecureStore = undefined;
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('expo-secure-store'));
  });

  it('should log a warning when react-native-device-crypto is missing', () => {
    mockNativeModules.ExpoSecureStore = {};
    mockNativeModules.DeviceCrypto = undefined;

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('react-native-device-crypto'));
  });

  it('should log a warning when both native modules are missing', () => {
    mockNativeModules.ExpoSecureStore = undefined;
    mockNativeModules.DeviceCrypto = undefined;

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('expo-secure-store'));
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('react-native-device-crypto'));
  });

  it('should only log warning once even if called multiple times', () => {
    mockNativeModules.ExpoSecureStore = undefined;
    mockNativeModules.DeviceCrypto = undefined;

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();
    checkNativeModules();
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  });

  it('should include iOS instructions when platform is ios', () => {
    mockPlatform.OS = 'ios';
    mockNativeModules.ExpoSecureStore = undefined;
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('npx expo run:ios'));
  });

  it('should include Android instructions when platform is android', () => {
    mockPlatform.OS = 'android';
    mockNativeModules.ExpoSecureStore = undefined;
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('npx expo run:android'));
  });

  it('should not include iOS instructions when platform is android', () => {
    mockPlatform.OS = 'android';
    mockNativeModules.ExpoSecureStore = undefined;
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining('npx expo run:ios'));
  });

  it('should not include Android instructions when platform is ios', () => {
    mockPlatform.OS = 'ios';
    mockNativeModules.ExpoSecureStore = undefined;
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining('npx expo run:android'));
  });

  it('should include install commands for missing packages', () => {
    mockNativeModules.ExpoSecureStore = undefined;
    mockNativeModules.DeviceCrypto = undefined;

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('npx expo install expo-secure-store'));
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('npx expo install react-native-device-crypto'));
  });
});
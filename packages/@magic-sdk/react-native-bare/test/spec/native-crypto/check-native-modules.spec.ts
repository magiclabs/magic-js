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
    delete mockNativeModules['RNKeychainManager'];
    delete mockNativeModules['DeviceCrypto'];
    mockPlatform.OS = 'ios';
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should not log any warning when all native modules are present', () => {
    mockNativeModules.RNKeychainManager = {};
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should log a warning when react-native-keychain is missing', () => {
    mockNativeModules.RNKeychainManager = undefined;
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('react-native-keychain'));
  });

  it('should log a warning when react-native-device-crypto is missing', () => {
    mockNativeModules.RNKeychainManager = {};
    mockNativeModules.DeviceCrypto = undefined;

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('react-native-device-crypto'));
  });

  it('should log a warning when both native modules are missing', () => {
    mockNativeModules.RNKeychainManager = undefined;
    mockNativeModules.DeviceCrypto = undefined;

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('react-native-keychain'));
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('react-native-device-crypto'));
  });

  it('should only log warning once even if called multiple times', () => {
    mockNativeModules.RNKeychainManager = undefined;
    mockNativeModules.DeviceCrypto = undefined;

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();
    checkNativeModules();
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  });

  it('should include iOS instructions when platform is ios', () => {
    mockPlatform.OS = 'ios';
    mockNativeModules.RNKeychainManager = undefined;
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('pod install'));
  });

  it('should include Android instructions when platform is android', () => {
    mockPlatform.OS = 'android';
    mockNativeModules.RNKeychainManager = undefined;
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('npx react-native run-android'));
  });

  it('should not include iOS instructions when platform is android', () => {
    mockPlatform.OS = 'android';
    mockNativeModules.RNKeychainManager = undefined;
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining('pod install'));
  });

  it('should not include Android instructions when platform is ios', () => {
    mockPlatform.OS = 'ios';
    mockNativeModules.RNKeychainManager = undefined;
    mockNativeModules.DeviceCrypto = {};

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining('npx react-native run-android'));
  });

  it('should include install commands for missing packages', () => {
    mockNativeModules.RNKeychainManager = undefined;
    mockNativeModules.DeviceCrypto = undefined;

    const { checkNativeModules } = require('../../../src/native-crypto/check-native-modules');
    checkNativeModules();

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('npm install react-native-keychain'));
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('npm install react-native-device-crypto'));
  });
});
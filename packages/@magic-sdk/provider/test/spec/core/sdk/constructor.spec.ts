/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-new, class-methods-use-this, global-require */

import browserEnv from '@ikscodes/browser-env';
import { MAGIC_RELAYER_FULL_URL, TEST_API_KEY } from '../../../constants';
import { createMagicSDKCtor } from '../../../factories';
import { AuthModule } from '../../../../src/modules/auth';
import { UserModule } from '../../../../src/modules/user';
import { RPCProviderModule } from '../../../../src/modules/rpc-provider';
import { Extension } from '../../../../src/modules/base-extension';

beforeEach(() => {
  browserEnv.restore();
  jest.resetAllMocks();
});

function assertEncodedQueryParams(parameters: string, expectedParams: any = {}) {
  const defaultExpectedParams = {
    API_KEY: TEST_API_KEY,
    DOMAIN_ORIGIN: 'null',
    host: 'auth.magic.link',
    sdk: 'magic-sdk',
    version: '1.0.0-test',
    locale: 'en_US',
  };

  expect(JSON.parse(atob(parameters))).toEqual({
    ...defaultExpectedParams,
    ...expectedParams,
  });
}

function assertModuleInstanceTypes(sdk: any) {
  expect(sdk.auth instanceof AuthModule).toBe(true);
  expect(sdk.user instanceof UserModule).toBe(true);
  expect(sdk.rpcProvider instanceof RPCProviderModule).toBe(true);
}

test('Initialize `MagicSDK`', () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY);

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect(magic.endpoint).toBe(MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(magic.parameters);
  assertModuleInstanceTypes(magic);
});

test('Fail to initialize `MagicSDK`', () => {
  try {
    const Ctor = createMagicSDKCtor();
    new Ctor(undefined as any);
  } catch (err) {
    expect(err.message).toBe(
      'Magic SDK Error: [MISSING_API_KEY] Please provide an API key that you acquired from the Magic developer dashboard.',
    );
  }
});

test('Initialize `MagicSDK` with custom endpoint', () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY, { endpoint: 'https://example.com' });

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect(magic.endpoint).toBe('https://example.com');
  assertEncodedQueryParams(magic.parameters, { host: 'example.com' });
  assertModuleInstanceTypes(magic);
});

test('Initialize `MagicSDK` when `window.location` is missing', () => {
  browserEnv.stub('location', undefined);

  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY);

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect(magic.endpoint).toBe(MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(magic.parameters, { DOMAIN_ORIGIN: '' });
  assertModuleInstanceTypes(magic);
});

test('Initialize `MagicSDK` with custom Web3 network', () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY, { network: 'mainnet' });

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect(magic.endpoint).toBe(MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(magic.parameters, { ETH_NETWORK: 'mainnet' });
  assertModuleInstanceTypes(magic);
});

test('Initialize `MagicSDK` with custom locale', () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY, { locale: 'pl_PL' });

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect(magic.endpoint).toBe(MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(magic.parameters, { locale: 'pl_PL' });
  assertModuleInstanceTypes(magic);
});

test('Initialize `MagicSDK` with test mode', () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY, { testMode: true });

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect(magic.endpoint).toBe(MAGIC_RELAYER_FULL_URL);
  expect(magic.auth instanceof AuthModule).toBe(true);
  expect(magic.user instanceof UserModule).toBe(true);
  expect(magic.rpcProvider instanceof RPCProviderModule).toBe(true);
});

class NoopExtNoConfig extends Extension<'noop'> {
  name = 'noop' as const;
  helloWorld() {}
}

class NoopExtWithConfig extends Extension.Internal<'noop'> {
  name = 'noop' as const;
  config = { hello: 'world' };
  helloWorld() {}
}

class NoopExtWithEmptyConfig extends Extension.Internal<'noop'> {
  name = 'noop' as const;
  config = {};
  helloWorld() {}
}

class NoopExtSupportingWeb extends Extension<'noop'> {
  name = 'noop' as const;
  compat = {
    'magic-sdk': '>1.0.0',
    '@magic-sdk/react-native-bare': false,
    '@magic-sdk/react-native-expo': false,
  };
  helloWorld() {}
}

class NoopExtSupportingBareReactNative extends Extension<'noop'> {
  name = 'noop' as const;
  compat = {
    'magic-sdk': false,
    '@magic-sdk/react-native-bare': '>1.0.0',
    '@magic-sdk/react-native-expo': false,
  };
  helloWorld() {}
}

class NoopExtSupportingExpoReactNative extends Extension<'noop'> {
  name = 'noop' as const;
  compat = {
    'magic-sdk': false,
    '@magic-sdk/react-native-bare': false,
    '@magic-sdk/react-native-expo': '>1.0.0',
  };
  helloWorld() {}
}

test('Initialize `MagicSDK` with config-less extensions via array', () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY, { extensions: [new NoopExtNoConfig()] });

  assertEncodedQueryParams(magic.parameters);
  expect(magic.noop instanceof NoopExtNoConfig).toBe(true);
});

test('Initialize `MagicSDK` with config-ful extensions via array (non-empty config)', () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY, { extensions: [new NoopExtWithConfig()] });

  assertEncodedQueryParams(magic.parameters, {
    ext: { noop: { hello: 'world' } },
  });

  expect(magic.noop instanceof NoopExtWithConfig).toBe(true);
});

test('Initialize `MagicSDK` with config-ful extensions via array (empty config)', () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY, { extensions: [new NoopExtWithEmptyConfig()] });

  assertEncodedQueryParams(magic.parameters);

  expect(magic.noop instanceof NoopExtWithEmptyConfig).toBe(true);
});

test('Initialize `MagicSDK` with config-less extensions via dictionary', () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY, { extensions: { foobar: new NoopExtNoConfig() } });

  assertEncodedQueryParams(magic.parameters);

  expect(magic.foobar instanceof NoopExtNoConfig).toBe(true);
});

test('Initialize `MagicSDK` with config-ful extensions via dictionary (non-empty config)', () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY, { extensions: { foobar: new NoopExtWithConfig() } });

  assertEncodedQueryParams(magic.parameters, {
    ext: { noop: { hello: 'world' } },
  });

  expect(magic.foobar instanceof NoopExtWithConfig).toBe(true);
});

test('Initialize `MagicSDK` with config-ful extensions via dictionary (empty config)', () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY, { extensions: { foobar: new NoopExtWithEmptyConfig() } });
  assertEncodedQueryParams(magic.parameters);
  expect(magic.foobar instanceof NoopExtWithEmptyConfig).toBe(true);
});

test('Initialize `MagicSDK` with incompatible web extension (platform) via array', () => {
  const Ctor = createMagicSDKCtor();
  const ext = new NoopExtSupportingBareReactNative();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: [ext] })).toThrow(expectedError);
});

test('Initialize `MagicSDK` with incompatible web extension (platform) via dictionary', () => {
  const Ctor = createMagicSDKCtor();
  const ext = new NoopExtSupportingBareReactNative();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: { foobar: ext } })).toThrow(expectedError);
});

test('Initialize `MagicSDK` with incompatible React Native extension (platform) via array', () => {
  const Ctor = createMagicSDKCtor({ sdkName: '@magic-sdk/react-native-bare', platform: 'react-native' });
  const ext = new NoopExtSupportingWeb();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: [ext] })).toThrow(expectedError);
});

test('Initialize `MagicSDK` with incompatible React Native extension (platform) via dictionary', () => {
  const Ctor = createMagicSDKCtor({ sdkName: '@magic-sdk/react-native-bare', platform: 'react-native' });
  const ext = new NoopExtSupportingWeb();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: { foobar: ext } })).toThrow(expectedError);
});

test('Initialize `MagicSDK` with incompatible Expo React Native extension (platform) via array', () => {
  const Ctor = createMagicSDKCtor({ sdkName: '@magic-sdk/react-native-expo', platform: 'react-native' });
  const ext = new NoopExtSupportingWeb();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: [ext] })).toThrow(expectedError);
});

test('Initialize `MagicSDK` with incompatible Expo React Native extension (platform) via dictionary', () => {
  const Ctor = createMagicSDKCtor({ sdkName: '@magic-sdk/react-native-expo', platform: 'react-native' });
  const ext = new NoopExtSupportingWeb();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: { foobar: ext } })).toThrow(expectedError);
});

test('Initialize `MagicSDK` with incompatible web extension (version) via array', () => {
  const Ctor = createMagicSDKCtor({ version: '0.1.0' });
  const ext = new NoopExtSupportingWeb();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: [ext] })).toThrow(expectedError);
});

test('Initialize `MagicSDK` with incompatible web extension (version) via dictionary', () => {
  const Ctor = createMagicSDKCtor({ version: '0.1.0' });
  const ext = new NoopExtSupportingWeb();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: { foobar: ext } })).toThrow(expectedError);
});

test('Initialize `MagicSDK` with incompatible React Native extension (version) via array', () => {
  const Ctor = createMagicSDKCtor({
    sdkName: '@magic-sdk/react-native-bare',
    platform: 'react-native',
    version: '0.1.0',
  });
  const ext = new NoopExtSupportingBareReactNative();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: [ext] })).toThrow(expectedError);
});

test('Initialize `MagicSDK` with incompatible React Native extension (version) via dictionary', () => {
  const Ctor = createMagicSDKCtor({
    sdkName: '@magic-sdk/react-native-bare',
    platform: 'react-native',
    version: '0.1.0',
  });
  const ext = new NoopExtSupportingBareReactNative();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: { foobar: ext } })).toThrow(expectedError);
});

test('Initialize `MagicSDK` with incompatible Expo React Native extension (version) via array', () => {
  const Ctor = createMagicSDKCtor({
    sdkName: '@magic-sdk/react-native-expo',
    platform: 'react-native',
    version: '0.1.0',
  });
  const ext = new NoopExtSupportingExpoReactNative();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: [ext] })).toThrow(expectedError);
});

test('Initialize `MagicSDK` with incompatible Expo React Native extension (version) via dictionary', () => {
  const Ctor = createMagicSDKCtor({
    sdkName: '@magic-sdk/react-native-expo',
    platform: 'react-native',
    version: '0.1.0',
  });
  const ext = new NoopExtSupportingExpoReactNative();
  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const expectedError = createIncompatibleExtensionsError([ext]);
  expect(() => new Ctor(TEST_API_KEY, { extensions: { foobar: ext } })).toThrow(expectedError);
});

test('Warns upon construction of `MagicSDK` instance if `endpoint` parameter is provided with `react-native` target.', () => {
  const Ctor = createMagicSDKCtor({ platform: 'react-native' });
  const consoleWarnStub = jest.fn();
  browserEnv.stub('console.warn', consoleWarnStub);
  const { createReactNativeEndpointConfigurationWarning } = require('../../../../src/core/sdk-exceptions');
  const expectedWarning = createReactNativeEndpointConfigurationWarning();
  new Ctor(TEST_API_KEY, { endpoint: 'https://example.com' } as any);
  expect(consoleWarnStub).toBeCalledWith(expectedWarning.message);
});

test('Does not warn upon construction of `MagicSDK` instance if `endpoint` parameter is omitted with `react-native` target.', () => {
  const Ctor = createMagicSDKCtor({ platform: 'react-native' });
  const consoleWarnStub = jest.fn();
  browserEnv.stub('console.warn', consoleWarnStub);
  new Ctor(TEST_API_KEY);
  expect(consoleWarnStub).not.toBeCalled();
});

test('Initialize `Magic Bare RN SDK`', () => {
  const bundleIdMock = 'link.magic.test';
  const Ctor = createMagicSDKCtor({
    sdkName: '@magic-sdk/react-native-bare',
    platform: 'react-native',
    bundleId: bundleIdMock,
  });
  const magic = new Ctor(TEST_API_KEY);

  expect(magic.apiKey).toBe(TEST_API_KEY);

  expect(magic.endpoint).toBe(MAGIC_RELAYER_FULL_URL);

  assertEncodedQueryParams(magic.parameters, { bundleId: bundleIdMock, sdk: 'magic-sdk-rn-bare' });
  assertModuleInstanceTypes(magic);
});

test('Initialize `Magic Bare RN SDK without bundleId`', () => {
  const Ctor = createMagicSDKCtor({
    sdkName: '@magic-sdk/react-native-bare',
    platform: 'react-native',
    bundleId: null,
  });
  const magic = new Ctor(TEST_API_KEY);

  expect(magic.apiKey).toBe(TEST_API_KEY);

  expect(magic.endpoint).toBe(MAGIC_RELAYER_FULL_URL);

  assertEncodedQueryParams(magic.parameters, { sdk: 'magic-sdk-rn-bare' });
  assertModuleInstanceTypes(magic);
});

test('Initialize `Magic Expo RN SDK`', () => {
  const bundleIdMock = 'link.magic.test';
  const Ctor = createMagicSDKCtor({
    sdkName: '@magic-sdk/react-native-expo',
    platform: 'react-native',
    bundleId: bundleIdMock,
  });
  const magic = new Ctor(TEST_API_KEY);

  expect(magic.apiKey).toBe(TEST_API_KEY);

  expect(magic.endpoint).toBe(MAGIC_RELAYER_FULL_URL);

  assertEncodedQueryParams(magic.parameters, { bundleId: bundleIdMock, sdk: 'magic-sdk-rn-expo' });
  assertModuleInstanceTypes(magic);
});

test('Initialize `Magic Expo RN SDK without bundleId`', () => {
  const Ctor = createMagicSDKCtor({
    sdkName: '@magic-sdk/react-native-expo',
    platform: 'react-native',
    bundleId: null,
  });
  const magic = new Ctor(TEST_API_KEY);

  expect(magic.apiKey).toBe(TEST_API_KEY);

  expect(magic.endpoint).toBe(MAGIC_RELAYER_FULL_URL);

  assertEncodedQueryParams(magic.parameters, { sdk: 'magic-sdk-rn-expo' });
  assertModuleInstanceTypes(magic);
});

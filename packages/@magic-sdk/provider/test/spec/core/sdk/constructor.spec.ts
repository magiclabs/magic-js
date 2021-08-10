/* eslint-disable no-new, class-methods-use-this, global-require */

import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { MAGIC_RELAYER_FULL_URL, TEST_API_KEY } from '../../../constants';
import { TestMagicSDK } from '../../../factories';
import { mockSDKEnvironmentConstant, restoreSDKEnvironmentConstants } from '../../../mocks';
import {
  createReactNativeEndpointConfigurationWarning,
  createIncompatibleExtensionsError,
  MagicSDKError,
} from '../../../../src/core/sdk-exceptions';
import { AuthModule } from '../../../../src/modules/auth';
import { UserModule } from '../../../../src/modules/user';
import { RPCProviderModule } from '../../../../src/modules/rpc-provider';
import { Extension } from '../../../../src/modules/base-extension';

beforeEach(() => {
  browserEnv.restore();
  restoreSDKEnvironmentConstants();
});

function assertEncodedQueryParams(t: ExecutionContext, parameters: string, expectedParams: any = {}) {
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

function assertModuleInstanceTypes(t: ExecutionContext, sdk: any) {
  expect(sdk.auth instanceof AuthModule).toBe(true);
  expect(sdk.user instanceof UserModule).toBe(true);
  expect(sdk.rpcProvider instanceof RPCProviderModule).toBe(true);
}

test('Initialize `MagicSDK`', () => {
  const magic = new TestMagicSDK(TEST_API_KEY);

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect((magic as any).endpoint).toBe(MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(t, (magic as any).parameters);
  assertModuleInstanceTypes(t, magic);
});

test('Fail to initialize `MagicSDK`', () => {
  try {
    new TestMagicSDK(undefined as any);
  } catch (err) {
    expect(err.message).toBe(
      'Magic SDK Error: [MISSING_API_KEY] Please provide an API key that you acquired from the Magic developer dashboard.',
    );
  }
});

test('Initialize `MagicSDK` with custom endpoint', () => {
  const magic = new TestMagicSDK(TEST_API_KEY, { endpoint: 'https://example.com' });

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect((magic as any).endpoint).toBe('https://example.com');
  assertEncodedQueryParams(t, (magic as any).parameters, {
    host: 'example.com',
  });
  assertModuleInstanceTypes(t, magic);
});

test('Initialize `MagicSDK` when `window.location` is missing', () => {
  browserEnv.stub('location', undefined);

  const magic = new TestMagicSDK(TEST_API_KEY);

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect((magic as any).endpoint).toBe(MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(t, (magic as any).parameters, {
    DOMAIN_ORIGIN: '',
  });
  assertModuleInstanceTypes(t, magic);
});

test('Initialize `MagicSDK` with custom Web3 network', () => {
  const magic = new TestMagicSDK(TEST_API_KEY, { network: 'mainnet' });

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect((magic as any).endpoint).toBe(MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(t, (magic as any).parameters, {
    ETH_NETWORK: 'mainnet',
  });
  assertModuleInstanceTypes(t, magic);
});

test('Initialize `MagicSDK` with custom locale', () => {
  const magic = new TestMagicSDK(TEST_API_KEY, { locale: 'pl_PL' });

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect((magic as any).endpoint).toBe(MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(t, (magic as any).parameters, {
    locale: 'pl_PL',
  });
  assertModuleInstanceTypes(t, magic);
});

test('Initialize `MagicSDK` with test mode', () => {
  const magic = new TestMagicSDK(TEST_API_KEY, { testMode: true });

  expect(magic.apiKey).toBe(TEST_API_KEY);
  expect((magic as any).endpoint).toBe(MAGIC_RELAYER_FULL_URL);
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
    '@magic-sdk/react-native': false,
  };
  helloWorld() {}
}

class NoopExtSupportingReactNative extends Extension<'noop'> {
  name = 'noop' as const;
  compat = {
    'magic-sdk': false,
    '@magic-sdk/react-native': '>1.0.0',
  };
  helloWorld() {}
}

test('Initialize `MagicSDK` with config-less extensions via array', () => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: [new NoopExtNoConfig()] });

  assertEncodedQueryParams(t, (magic as any).parameters);
  expect(magic.noop instanceof NoopExtNoConfig).toBe(true);
});

test('Initialize `MagicSDK` with config-ful extensions via array (non-empty config)', () => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: [new NoopExtWithConfig()] });

  assertEncodedQueryParams(t, (magic as any).parameters, {
    ext: { noop: { hello: 'world' } },
  });

  expect(magic.noop instanceof NoopExtWithConfig).toBe(true);
});

test('Initialize `MagicSDK` with config-ful extensions via array (empty config)', () => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: [new NoopExtWithEmptyConfig()] });

  assertEncodedQueryParams(t, (magic as any).parameters);

  expect(magic.noop instanceof NoopExtWithEmptyConfig).toBe(true);
});

test('Initialize `MagicSDK` with config-less extensions via dictionary', () => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: new NoopExtNoConfig() } });

  assertEncodedQueryParams(t, (magic as any).parameters);

  expect(magic.foobar instanceof NoopExtNoConfig).toBe(true);
});

test('Initialize `MagicSDK` with config-ful extensions via dictionary (non-empty config)', () => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: new NoopExtWithConfig() } });

  assertEncodedQueryParams(t, (magic as any).parameters, {
    ext: { noop: { hello: 'world' } },
  });

  expect(magic.foobar instanceof NoopExtWithConfig).toBe(true);
});

test('Initialize `MagicSDK` with config-ful extensions via dictionary (empty config)', () => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: new NoopExtWithEmptyConfig() } });

  assertEncodedQueryParams(t, (magic as any).parameters);

  expect(magic.foobar instanceof NoopExtWithEmptyConfig).toBe(true);
});

test('Initialize `MagicSDK` with incompatible web extension (platform) via array', () => {
  const ext = new NoopExtSupportingReactNative();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = expect(() => new TestMagicSDK(TEST_API_KEY, { extensions: [ext] })).toThrow();

  expect(error.code).toBe(expectedError.code);
  expect(error.message).toBe(expectedError.message);
});

test('Initialize `MagicSDK` with incompatible web extension (platform) via dictionary', () => {
  const ext = new NoopExtSupportingReactNative();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = expect(() => new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: ext } })).toThrow();

  expect(error.code).toBe(expectedError.code);
  expect(error.message).toBe(expectedError.message);
});

test('Initialize `MagicSDK` with incompatible React Native extension (platform) via array', () => {
  mockSDKEnvironmentConstant('sdkName', '@magic-sdk/react-native');
  mockSDKEnvironmentConstant('platform', 'react-native');

  const ext = new NoopExtSupportingWeb();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = expect(() => new TestMagicSDK(TEST_API_KEY, { extensions: [ext] })).toThrow();

  expect(error.code).toBe(expectedError.code);
  expect(error.message).toBe(expectedError.message);
});

test('Initialize `MagicSDK` with incompatible React Native extension (platform) via dictionary', () => {
  mockSDKEnvironmentConstant('sdkName', '@magic-sdk/react-native');
  mockSDKEnvironmentConstant('platform', 'react-native');

  const ext = new NoopExtSupportingWeb();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = expect(() => new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: ext } })).toThrow();

  expect(error.code).toBe(expectedError.code);
  expect(error.message).toBe(expectedError.message);
});

test('Initialize `MagicSDK` with incompatible web extension (version) via array', () => {
  mockSDKEnvironmentConstant('version', '0.1.0');

  const ext = new NoopExtSupportingWeb();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = expect(() => new TestMagicSDK(TEST_API_KEY, { extensions: [ext] })).toThrow();

  expect(error.code).toBe(expectedError.code);
  expect(error.message).toBe(expectedError.message);
});

test('Initialize `MagicSDK` with incompatible web extension (version) via dictionary', () => {
  mockSDKEnvironmentConstant('version', '0.1.0');

  const ext = new NoopExtSupportingWeb();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = expect(() => new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: ext } })).toThrow();

  expect(error.code).toBe(expectedError.code);
  expect(error.message).toBe(expectedError.message);
});

test('Initialize `MagicSDK` with incompatible React Native extension (version) via array', () => {
  mockSDKEnvironmentConstant('sdkName', '@magic-sdk/react-native');
  mockSDKEnvironmentConstant('platform', 'react-native');
  mockSDKEnvironmentConstant('version', '0.1.0');

  const ext = new NoopExtSupportingReactNative();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = expect(() => new TestMagicSDK(TEST_API_KEY, { extensions: [ext] })).toThrow();

  expect(error.code).toBe(expectedError.code);
  expect(error.message).toBe(expectedError.message);
});

test('Initialize `MagicSDK` with incompatible React Native extension (version) via dictionary', () => {
  mockSDKEnvironmentConstant('sdkName', '@magic-sdk/react-native');
  mockSDKEnvironmentConstant('platform', 'react-native');
  mockSDKEnvironmentConstant('version', '0.1.0');
  const ext = new NoopExtSupportingReactNative();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = expect(() => new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: ext } })).toThrow();

  expect(error.code).toBe(expectedError.code);
  expect(error.message).toBe(expectedError.message);
});

test('Warns upon construction of `MagicSDK` instance if `endpoint` parameter is provided with `react-native` target.', () => {
  mockSDKEnvironmentConstant('platform', 'react-native');

  const consoleWarnStub = sinon.stub();
  browserEnv.stub('console.warn', consoleWarnStub);
  const expectedWarning = createReactNativeEndpointConfigurationWarning();

  new TestMagicSDK(TEST_API_KEY, { endpoint: 'https://example.com' } as any);

  expect(consoleWarnStub.calledWith(expectedWarning.message)).toBe(true);
});

test('Does not warn upon construction of `MagicSDK` instance if `endpoint` parameter is omitted with `react-native` target.', () => {
  mockSDKEnvironmentConstant('platform', 'react-native');

  const consoleWarnStub = sinon.stub();
  browserEnv.stub('console.warn', consoleWarnStub);

  new TestMagicSDK(TEST_API_KEY);

  expect(consoleWarnStub.called).toBe(false);
});

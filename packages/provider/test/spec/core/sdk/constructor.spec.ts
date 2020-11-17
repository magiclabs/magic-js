/* eslint-disable no-new, class-methods-use-this, global-require */

import browserEnv from '@ikscodes/browser-env';
import test, { ExecutionContext } from 'ava';
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

test.beforeEach((t) => {
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

  t.deepEqual(JSON.parse(atob(parameters)), {
    ...defaultExpectedParams,
    ...expectedParams,
  });
}

function assertModuleInstanceTypes(t: ExecutionContext, sdk: any) {
  t.true(sdk.auth instanceof AuthModule);
  t.true(sdk.user instanceof UserModule);
  t.true(sdk.rpcProvider instanceof RPCProviderModule);
}

test.serial('Initialize `MagicSDK`', (t) => {
  const magic = new TestMagicSDK(TEST_API_KEY);

  t.is(magic.apiKey, TEST_API_KEY);
  t.is((magic as any).endpoint, MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(t, (magic as any).parameters);
  assertModuleInstanceTypes(t, magic);
});

test.serial('Fail to initialize `MagicSDK`', (t) => {
  try {
    new TestMagicSDK(undefined as any);
  } catch (err) {
    t.is(
      err.message,
      'Magic SDK Error: [MISSING_API_KEY] Please provide an API key that you acquired from the Magic developer dashboard.',
    );
  }
});

test.serial('Initialize `MagicSDK` with custom endpoint', (t) => {
  const magic = new TestMagicSDK(TEST_API_KEY, { endpoint: 'https://example.com' });

  t.is(magic.apiKey, TEST_API_KEY);
  t.is((magic as any).endpoint, 'https://example.com');
  assertEncodedQueryParams(t, (magic as any).parameters, {
    host: 'example.com',
  });
  assertModuleInstanceTypes(t, magic);
});

test.serial('Initialize `MagicSDK` when `window.location` is missing', (t) => {
  browserEnv.stub('location', undefined);

  const magic = new TestMagicSDK(TEST_API_KEY);

  t.is(magic.apiKey, TEST_API_KEY);
  t.is((magic as any).endpoint, MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(t, (magic as any).parameters, {
    DOMAIN_ORIGIN: '',
  });
  assertModuleInstanceTypes(t, magic);
});

test.serial('Initialize `MagicSDK` with custom Web3 network', (t) => {
  const magic = new TestMagicSDK(TEST_API_KEY, { network: 'mainnet' });

  t.is(magic.apiKey, TEST_API_KEY);
  t.is((magic as any).endpoint, MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(t, (magic as any).parameters, {
    ETH_NETWORK: 'mainnet',
  });
  assertModuleInstanceTypes(t, magic);
});

test.serial('Initialize `MagicSDK` with custom locale', (t) => {
  const magic = new TestMagicSDK(TEST_API_KEY, { locale: 'pl_PL' });

  t.is(magic.apiKey, TEST_API_KEY);
  t.is((magic as any).endpoint, MAGIC_RELAYER_FULL_URL);
  assertEncodedQueryParams(t, (magic as any).parameters, {
    locale: 'pl_PL',
  });
  assertModuleInstanceTypes(t, magic);
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

test.serial('Initialize `MagicSDK` with config-less extensions via array', (t) => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: [new NoopExtNoConfig()] });

  assertEncodedQueryParams(t, (magic as any).parameters);
  t.true(magic.noop instanceof NoopExtNoConfig);
});

test.serial('Initialize `MagicSDK` with config-ful extensions via array (non-empty config)', (t) => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: [new NoopExtWithConfig()] });

  assertEncodedQueryParams(t, (magic as any).parameters, {
    ext: { noop: { hello: 'world' } },
  });

  t.true(magic.noop instanceof NoopExtWithConfig);
});

test.serial('Initialize `MagicSDK` with config-ful extensions via array (empty config)', (t) => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: [new NoopExtWithEmptyConfig()] });

  assertEncodedQueryParams(t, (magic as any).parameters);

  t.true(magic.noop instanceof NoopExtWithEmptyConfig);
});

test.serial('Initialize `MagicSDK` with config-less extensions via dictionary', (t) => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: new NoopExtNoConfig() } });

  assertEncodedQueryParams(t, (magic as any).parameters);

  t.true(magic.foobar instanceof NoopExtNoConfig);
});

test.serial('Initialize `MagicSDK` with config-ful extensions via dictionary (non-empty config)', (t) => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: new NoopExtWithConfig() } });

  assertEncodedQueryParams(t, (magic as any).parameters, {
    ext: { noop: { hello: 'world' } },
  });

  t.true(magic.foobar instanceof NoopExtWithConfig);
});

test.serial('Initialize `MagicSDK` with config-ful extensions via dictionary (empty config)', (t) => {
  const magic = new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: new NoopExtWithEmptyConfig() } });

  assertEncodedQueryParams(t, (magic as any).parameters);

  t.true(magic.foobar instanceof NoopExtWithEmptyConfig);
});

test.serial('Initialize `MagicSDK` with incompatible web extension (platform) via array', (t) => {
  const ext = new NoopExtSupportingReactNative();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = t.throws(() => new TestMagicSDK(TEST_API_KEY, { extensions: [ext] }));

  t.is(error.code, expectedError.code);
  t.is(error.message, expectedError.message);
});

test.serial('Initialize `MagicSDK` with incompatible web extension (platform) via dictionary', (t) => {
  const ext = new NoopExtSupportingReactNative();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = t.throws(() => new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: ext } }));

  t.is(error.code, expectedError.code);
  t.is(error.message, expectedError.message);
});

test.serial('Initialize `MagicSDK` with incompatible React Native extension (platform) via array', (t) => {
  mockSDKEnvironmentConstant('sdkName', '@magic-sdk/react-native');
  mockSDKEnvironmentConstant('platform', 'react-native');

  const ext = new NoopExtSupportingWeb();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = t.throws(() => new TestMagicSDK(TEST_API_KEY, { extensions: [ext] }));

  t.is(error.code, expectedError.code);
  t.is(error.message, expectedError.message);
});

test.serial('Initialize `MagicSDK` with incompatible React Native extension (platform) via dictionary', (t) => {
  mockSDKEnvironmentConstant('sdkName', '@magic-sdk/react-native');
  mockSDKEnvironmentConstant('platform', 'react-native');

  const ext = new NoopExtSupportingWeb();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = t.throws(() => new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: ext } }));

  t.is(error.code, expectedError.code);
  t.is(error.message, expectedError.message);
});

test.serial('Initialize `MagicSDK` with incompatible web extension (version) via array', (t) => {
  mockSDKEnvironmentConstant('version', '0.1.0');

  const ext = new NoopExtSupportingWeb();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = t.throws(() => new TestMagicSDK(TEST_API_KEY, { extensions: [ext] }));

  t.is(error.code, expectedError.code);
  t.is(error.message, expectedError.message);
});

test.serial('Initialize `MagicSDK` with incompatible web extension (version) via dictionary', (t) => {
  mockSDKEnvironmentConstant('version', '0.1.0');

  const ext = new NoopExtSupportingWeb();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = t.throws(() => new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: ext } }));

  t.is(error.code, expectedError.code);
  t.is(error.message, expectedError.message);
});

test.serial('Initialize `MagicSDK` with incompatible React Native extension (version) via array', (t) => {
  mockSDKEnvironmentConstant('sdkName', '@magic-sdk/react-native');
  mockSDKEnvironmentConstant('platform', 'react-native');
  mockSDKEnvironmentConstant('version', '0.1.0');

  const ext = new NoopExtSupportingReactNative();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = t.throws(() => new TestMagicSDK(TEST_API_KEY, { extensions: [ext] }));

  t.is(error.code, expectedError.code);
  t.is(error.message, expectedError.message);
});

test.serial('Initialize `MagicSDK` with incompatible React Native extension (version) via dictionary', (t) => {
  mockSDKEnvironmentConstant('sdkName', '@magic-sdk/react-native');
  mockSDKEnvironmentConstant('platform', 'react-native');
  mockSDKEnvironmentConstant('version', '0.1.0');
  const ext = new NoopExtSupportingReactNative();
  const expectedError = createIncompatibleExtensionsError([ext]);
  const error: MagicSDKError = t.throws(() => new TestMagicSDK(TEST_API_KEY, { extensions: { foobar: ext } }));

  t.is(error.code, expectedError.code);
  t.is(error.message, expectedError.message);
});

test.serial(
  'Warns upon construction of `MagicSDK` instance if `endpoint` parameter is provided with `react-native` target.',
  (t) => {
    mockSDKEnvironmentConstant('platform', 'react-native');

    const consoleWarnStub = sinon.stub();
    browserEnv.stub('console.warn', consoleWarnStub);
    const expectedWarning = createReactNativeEndpointConfigurationWarning();

    new TestMagicSDK(TEST_API_KEY, { endpoint: 'https://example.com' } as any);

    t.true(consoleWarnStub.calledWith(expectedWarning.message));
  },
);

test.serial(
  'Does not warn upon construction of `MagicSDK` instance if `endpoint` parameter is omitted with `react-native` target.',
  (t) => {
    mockSDKEnvironmentConstant('platform', 'react-native');

    const consoleWarnStub = sinon.stub();
    browserEnv.stub('console.warn', consoleWarnStub);

    new TestMagicSDK(TEST_API_KEY);

    t.false(consoleWarnStub.called);
  },
);

/* eslint-disable no-new, class-methods-use-this */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicSDK } from '../../../../src/core/sdk';
import { MAGIC_RELAYER_FULL_URL, TEST_API_KEY } from '../../../constants';
import { name as sdkName, version as sdkVersion } from '../../../../package.json';
import { AuthModule } from '../../../../src/modules/auth';
import { UserModule } from '../../../../src/modules/user';
import { RPCProviderModule } from '../../../../src/modules/rpc-provider';
import { Extension } from '../../../../src/modules/base-extension';

test.beforeEach(t => {
  browserEnv.restore();
});

test.serial('Initialize `MagicSDK`', t => {
  const magic = new MagicSDK(TEST_API_KEY);

  t.is(magic.apiKey, TEST_API_KEY);
  t.is(magic.endpoint, MAGIC_RELAYER_FULL_URL);
  t.deepEqual(JSON.parse(atob(magic.encodedQueryParams)), {
    API_KEY: TEST_API_KEY,
    DOMAIN_ORIGIN: 'null',
    host: 'auth.magic.link',
    sdk: sdkName,
    version: sdkVersion,
  });
  t.true(magic.auth instanceof AuthModule);
  t.true(magic.user instanceof UserModule);
  t.true(magic.rpcProvider instanceof RPCProviderModule);
});

test.serial('Fail to initialize `MagicSDK`', t => {
  try {
    new MagicSDK(undefined as any);
  } catch (err) {
    t.is(
      err.message,
      'Magic SDK Error: [MISSING_API_KEY] Please provide an API key that you acquired from the Magic developer dashboard.',
    );
  }
});

test.serial('Initialize `MagicSDK` with custom endpoint', t => {
  const magic = new MagicSDK(TEST_API_KEY, { endpoint: 'https://example.com' });

  t.is(magic.apiKey, TEST_API_KEY);
  t.is(magic.endpoint, 'https://example.com');
  t.deepEqual(JSON.parse(atob(magic.encodedQueryParams)), {
    API_KEY: TEST_API_KEY,
    DOMAIN_ORIGIN: 'null',
    host: 'example.com',
    sdk: sdkName,
    version: sdkVersion,
  });
  t.true(magic.auth instanceof AuthModule);
  t.true(magic.user instanceof UserModule);
  t.true(magic.rpcProvider instanceof RPCProviderModule);
});

test.serial('Initialize `MagicSDK` when `window.location` is missing', t => {
  browserEnv.stub('location', undefined);

  const magic = new MagicSDK(TEST_API_KEY);

  t.is(magic.apiKey, TEST_API_KEY);
  t.is(magic.endpoint, MAGIC_RELAYER_FULL_URL);
  t.deepEqual(JSON.parse(atob(magic.encodedQueryParams)), {
    API_KEY: TEST_API_KEY,
    DOMAIN_ORIGIN: '',
    host: 'auth.magic.link',
    sdk: sdkName,
    version: sdkVersion,
  });
  t.true(magic.auth instanceof AuthModule);
  t.true(magic.user instanceof UserModule);
  t.true(magic.rpcProvider instanceof RPCProviderModule);
});

test.serial('Initialize `MagicSDK` with custom Web3 network', t => {
  const magic = new MagicSDK(TEST_API_KEY, { network: 'mainnet' });

  t.is(magic.apiKey, TEST_API_KEY);
  t.is(magic.endpoint, MAGIC_RELAYER_FULL_URL);
  t.deepEqual(JSON.parse(atob(magic.encodedQueryParams)), {
    API_KEY: TEST_API_KEY,
    DOMAIN_ORIGIN: 'null',
    ETH_NETWORK: 'mainnet',
    host: 'auth.magic.link',
    sdk: sdkName,
    version: sdkVersion,
  });
  t.true(magic.auth instanceof AuthModule);
  t.true(magic.user instanceof UserModule);
  t.true(magic.rpcProvider instanceof RPCProviderModule);
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

test.serial('Initialize `MagicSDK` with config-less extensions via array', t => {
  const magic = new MagicSDK(TEST_API_KEY, { extensions: [new NoopExtNoConfig()] });

  t.deepEqual(JSON.parse(atob(magic.encodedQueryParams)), {
    API_KEY: TEST_API_KEY,
    DOMAIN_ORIGIN: 'null',
    host: 'auth.magic.link',
    sdk: sdkName,
    version: sdkVersion,
  });

  t.true(magic.noop instanceof NoopExtNoConfig);
});

test.serial('Initialize `MagicSDK` with config-ful extensions via array (non-empty config)', t => {
  const magic = new MagicSDK(TEST_API_KEY, { extensions: [new NoopExtWithConfig()] });

  t.deepEqual(JSON.parse(atob(magic.encodedQueryParams)), {
    API_KEY: TEST_API_KEY,
    DOMAIN_ORIGIN: 'null',
    host: 'auth.magic.link',
    sdk: sdkName,
    version: sdkVersion,
    ext: { noop: { hello: 'world' } },
  });

  t.true(magic.noop instanceof NoopExtWithConfig);
});

test.serial('Initialize `MagicSDK` with config-ful extensions via array (empty config)', t => {
  const magic = new MagicSDK(TEST_API_KEY, { extensions: [new NoopExtWithEmptyConfig()] });

  t.deepEqual(JSON.parse(atob(magic.encodedQueryParams)), {
    API_KEY: TEST_API_KEY,
    DOMAIN_ORIGIN: 'null',
    host: 'auth.magic.link',
    sdk: sdkName,
    version: sdkVersion,
  });

  t.true(magic.noop instanceof NoopExtWithEmptyConfig);
});

test.serial('Initialize `MagicSDK` with config-less extensions via dictionary', t => {
  const magic = new MagicSDK(TEST_API_KEY, { extensions: { foobar: new NoopExtNoConfig() } });

  t.deepEqual(JSON.parse(atob(magic.encodedQueryParams)), {
    API_KEY: TEST_API_KEY,
    DOMAIN_ORIGIN: 'null',
    host: 'auth.magic.link',
    sdk: sdkName,
    version: sdkVersion,
  });

  t.true(magic.foobar instanceof NoopExtNoConfig);
});

test.serial('Initialize `MagicSDK` with config-ful extensions via dictionary (non-empty config)', t => {
  const magic = new MagicSDK(TEST_API_KEY, { extensions: { foobar: new NoopExtWithConfig() } });

  t.deepEqual(JSON.parse(atob(magic.encodedQueryParams)), {
    API_KEY: TEST_API_KEY,
    DOMAIN_ORIGIN: 'null',
    host: 'auth.magic.link',
    sdk: sdkName,
    version: sdkVersion,
    ext: { noop: { hello: 'world' } },
  });

  t.true(magic.foobar instanceof NoopExtWithConfig);
});

test.serial('Initialize `MagicSDK` with config-ful extensions via dictionary (empty config)', t => {
  const magic = new MagicSDK(TEST_API_KEY, { extensions: { foobar: new NoopExtWithEmptyConfig() } });

  t.deepEqual(JSON.parse(atob(magic.encodedQueryParams)), {
    API_KEY: TEST_API_KEY,
    DOMAIN_ORIGIN: 'null',
    host: 'auth.magic.link',
    sdk: sdkName,
    version: sdkVersion,
  });

  t.true(magic.foobar instanceof NoopExtWithEmptyConfig);
});

/* eslint-disable no-new */

import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicSDK } from '../../../../src/core/sdk';
import { MAGIC_RELAYER_FULL_URL, TEST_API_KEY } from '../../../lib/constants';
import { name as sdkName, version as sdkVersion } from '../../../../package.json';
import { AuthModule } from '../../../../src/modules/auth';
import { UserModule } from '../../../../src/modules/user';
import { Web3Module } from '../../../../src/modules/web3';

test.beforeEach(t => {
  browserEnv.restore();
});

/**
 * Initialize `MagicSDK`.
 *
 * Action Must:
 * - Initialize `MagicSDK` instance.
 * - Not throw.
 */
test.serial('#01', t => {
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
  t.true(magic.web3 instanceof Web3Module);
});

/**
 * Fail to initialize `MagicSDK`.
 *
 * Action Must:
 * - Fail to Initialize `MagicSDK` instance without a key.
 */
test.serial('#02', t => {
  try {
    new MagicSDK(undefined as any);
  } catch (err) {
    t.is(
      err.message,
      'Magic SDK Error: [MISSING_API_KEY] Please provide an API key that you acquired from the Magic developer dashboard.',
    );
  }
});

/**
 * Initialize `MagicSDK` with custom endpoint.
 *
 * Action Must:
 * - Initialize `MagicSDK` instance.
 * - Not throw.
 */
test.serial('#03', t => {
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
  t.true(magic.web3 instanceof Web3Module);
});

/**
 * Initialize `MagicSDK` when `window.location` is missing.
 *
 * Action Must:
 * - Initialize `MagicSDK` instance.
 * - Not throw.
 */
test.serial('#04', t => {
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
  t.true(magic.web3 instanceof Web3Module);
});

/**
 * Initialize `MagicSDK` with custom Web3 network.
 *
 * Action Must:
 * - Initialize `MagicSDK` instance.
 * - Not throw.
 */
test.serial('#05', t => {
  const magic = new MagicSDK(TEST_API_KEY, { web3: { network: 'mainnet' } });

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
  t.true(magic.web3 instanceof Web3Module);
});

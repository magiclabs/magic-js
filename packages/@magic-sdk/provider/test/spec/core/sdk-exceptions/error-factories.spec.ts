/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import browserEnv from '@ikscodes/browser-env';
import { Extension } from '../../../../src/modules/base-extension';
import { mockSDKEnvironmentConstant, restoreSDKEnvironmentConstants } from '../../../mocks';

function errorAssertions(error: any, expectedCode: string, expectedMessage: string) {
  const { MagicSDKError } = require('../../../../src/core/sdk-exceptions');
  expect(error instanceof MagicSDKError).toBe(true);
  expect(error.code).toBe(expectedCode);
  expect(error.message).toBe(`Magic SDK Error: [${expectedCode}] ${expectedMessage}`);
  expect(error.rawMessage).toBe(expectedMessage);
}

beforeEach(() => {
  jest.resetModules();
  browserEnv.restore();
  restoreSDKEnvironmentConstants();
});

test('Creates a `MISSING_API_KEY` error', async () => {
  const { createMissingApiKeyError } = require('../../../../src/core/sdk-exceptions');
  const error = createMissingApiKeyError();
  errorAssertions(
    error,
    'MISSING_API_KEY',
    'Please provide an API key that you acquired from the Magic developer dashboard.',
  );
});

test('Creates a `MODAL_NOT_READY` error', async () => {
  const { createModalNotReadyError } = require('../../../../src/core/sdk-exceptions');
  const error = createModalNotReadyError();
  errorAssertions(error, 'MODAL_NOT_READY', 'Modal is not ready.');
});

test('Creates a `MALFORMED_RESPONSE` error', async () => {
  const { createMalformedResponseError } = require('../../../../src/core/sdk-exceptions');
  const error = createMalformedResponseError();
  errorAssertions(error, 'MALFORMED_RESPONSE', 'Response from the Magic iframe is malformed.');
});

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*st"', async () => {
  const { createInvalidArgumentError } = require('../../../../src/core/sdk-exceptions');
  const error = createInvalidArgumentError({
    procedure: 'test',
    argument: 0,
    expected: 'something',
    received: 'anotherThing',
  });

  errorAssertions(
    error,
    'INVALID_ARGUMENT',
    'Invalid 1st argument given to `test`.\n  Expected: `something`\n  Received: `anotherThing`',
  );
});

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*nd"', async () => {
  const { createInvalidArgumentError } = require('../../../../src/core/sdk-exceptions');
  const error = createInvalidArgumentError({
    procedure: 'test',
    argument: 1,
    expected: 'something',
    received: 'anotherThing',
  });

  errorAssertions(
    error,
    'INVALID_ARGUMENT',
    'Invalid 2nd argument given to `test`.\n  Expected: `something`\n  Received: `anotherThing`',
  );
});

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*rd"', async () => {
  const { createInvalidArgumentError } = require('../../../../src/core/sdk-exceptions');
  const error = createInvalidArgumentError({
    procedure: 'test',
    argument: 2,
    expected: 'something',
    received: 'anotherThing',
  });

  errorAssertions(
    error,
    'INVALID_ARGUMENT',
    'Invalid 3rd argument given to `test`.\n  Expected: `something`\n  Received: `anotherThing`',
  );
});

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*th"', async () => {
  const { createInvalidArgumentError } = require('../../../../src/core/sdk-exceptions');
  const error = createInvalidArgumentError({
    procedure: 'test',
    argument: 3,
    expected: 'something',
    received: 'anotherThing',
  });

  errorAssertions(
    error,
    'INVALID_ARGUMENT',
    'Invalid 4th argument given to `test`.\n  Expected: `something`\n  Received: `anotherThing`',
  );
});

test('Creates an `EXTENSION_NOT_INITIALIZED` error', async () => {
  const { createExtensionNotInitializedError } = require('../../../../src/core/sdk-exceptions');
  const error = createExtensionNotInitializedError('foo');

  errorAssertions(
    error,
    'EXTENSION_NOT_INITIALIZED',
    'Extensions must be initialized with a Magic SDK instance before `Extension.foo` can be accessed. Do not invoke `Extension.foo` inside an extension constructor.',
  );
});

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

test('Creates an `INCOMPATIBLE_EXTENSIONS` error for web (version-related)', async () => {
  mockSDKEnvironmentConstant({ platform: 'web', sdkName: 'magic-sdk', version: '0.0.0' });

  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const error = createIncompatibleExtensionsError([new NoopExtSupportingWeb(), new NoopExtSupportingWeb()]);

  errorAssertions(
    error,
    'INCOMPATIBLE_EXTENSIONS',
    'Some extensions are incompatible with `magic-sdk@0.0.0`:\n  - Extension `noop` supports version(s) `>1.0.0`\n  - Extension `noop` supports version(s) `>1.0.0`',
  );
});

test('Creates an `INCOMPATIBLE_EXTENSIONS` error for Bare React Native (version-related)', async () => {
  mockSDKEnvironmentConstant({ platform: 'react-native', sdkName: '@magic-sdk/react-native-bare', version: '0.0.0' });

  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const error = createIncompatibleExtensionsError([
    new NoopExtSupportingBareReactNative(),
    new NoopExtSupportingBareReactNative(),
  ]);

  errorAssertions(
    error,
    'INCOMPATIBLE_EXTENSIONS',
    'Some extensions are incompatible with `@magic-sdk/react-native-bare@0.0.0`:\n  - Extension `noop` supports version(s) `>1.0.0`\n  - Extension `noop` supports version(s) `>1.0.0`',
  );
});

test('Creates an `INCOMPATIBLE_EXTENSIONS` error for Expo React Native (version-related)', async () => {
  mockSDKEnvironmentConstant({ platform: 'react-native', sdkName: '@magic-sdk/react-native-expo', version: '0.0.0' });

  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const error = createIncompatibleExtensionsError([
    new NoopExtSupportingExpoReactNative(),
    new NoopExtSupportingExpoReactNative(),
  ]);

  errorAssertions(
    error,
    'INCOMPATIBLE_EXTENSIONS',
    'Some extensions are incompatible with `@magic-sdk/react-native-expo@0.0.0`:\n  - Extension `noop` supports version(s) `>1.0.0`\n  - Extension `noop` supports version(s) `>1.0.0`',
  );
});

test('Creates an `INCOMPATIBLE_EXTENSIONS` error for web (environment-related)', async () => {
  mockSDKEnvironmentConstant({ platform: 'web', sdkName: 'magic-sdk', version: '0.0.0' });

  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const error = createIncompatibleExtensionsError([new NoopExtSupportingBareReactNative()]);

  errorAssertions(
    error,
    'INCOMPATIBLE_EXTENSIONS',
    'Some extensions are incompatible with `magic-sdk@0.0.0`:\n  - Extension `noop` does not support web environments.',
  );
});

test('Creates an `INCOMPATIBLE_EXTENSIONS` error for Bare React Native (environment-related)', async () => {
  mockSDKEnvironmentConstant({ platform: 'react-native', sdkName: '@magic-sdk/react-native-bare', version: '0.0.0' });

  const { createIncompatibleExtensionsError } = require('../../../../src/core/sdk-exceptions');
  const error = createIncompatibleExtensionsError([new NoopExtSupportingWeb()]);

  errorAssertions(
    error,
    'INCOMPATIBLE_EXTENSIONS',
    'Some extensions are incompatible with `@magic-sdk/react-native-bare@0.0.0`:\n  - Extension `noop` does not support react-native environments.',
  );
});

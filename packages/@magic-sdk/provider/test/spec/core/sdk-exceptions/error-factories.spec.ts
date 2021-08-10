/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import {
  MagicSDKError,
  createMissingApiKeyError,
  createModalNotReadyError,
  createMalformedResponseError,
  createInvalidArgumentError,
  createExtensionNotInitializedError,
  createIncompatibleExtensionsError,
} from '../../../../src/core/sdk-exceptions';
import { Extension } from '../../../../src/modules/base-extension';
import { mockSDKEnvironmentConstant, restoreSDKEnvironmentConstants } from '../../../mocks';

function errorAssertions<T extends ExecutionContext<any>>(
  t: T,
  error: MagicSDKError,
  expectedCode: string,
  expectedMessage: string,
) {
  expect(error instanceof MagicSDKError).toBe(true);
  expect(error.code).toBe(expectedCode);
  expect(error.message).toBe(`Magic SDK Error: [${expectedCode}] ${expectedMessage}`);
  expect(error.rawMessage).toBe(expectedMessage);
}

beforeEach(() => {
  browserEnv.restore();
  restoreSDKEnvironmentConstants();
});

test('Creates a `MISSING_API_KEY` error', async () => {
  const error = createMissingApiKeyError();
  errorAssertions(
    t,
    error,
    'MISSING_API_KEY',
    'Please provide an API key that you acquired from the Magic developer dashboard.',
  );
});

test('Creates a `MODAL_NOT_READY` error', async () => {
  const error = createModalNotReadyError();
  errorAssertions(t, error, 'MODAL_NOT_READY', 'Modal is not ready.');
});

test('Creates a `MALFORMED_RESPONSE` error', async () => {
  const error = createMalformedResponseError();
  errorAssertions(t, error, 'MALFORMED_RESPONSE', 'Response from the Magic iframe is malformed.');
});

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*st"', async () => {
  const error = createInvalidArgumentError({
    procedure: 'test',
    argument: 0,
    expected: 'something',
    received: 'anotherThing',
  });

  errorAssertions(
    t,
    error,
    'INVALID_ARGUMENT',
    'Invalid 1st argument given to `test`.\n  Expected: `something`\n  Received: `anotherThing`',
  );
});

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*nd"', async () => {
  const error = createInvalidArgumentError({
    procedure: 'test',
    argument: 1,
    expected: 'something',
    received: 'anotherThing',
  });

  errorAssertions(
    t,
    error,
    'INVALID_ARGUMENT',
    'Invalid 2nd argument given to `test`.\n  Expected: `something`\n  Received: `anotherThing`',
  );
});

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*rd"', async () => {
  const error = createInvalidArgumentError({
    procedure: 'test',
    argument: 2,
    expected: 'something',
    received: 'anotherThing',
  });

  errorAssertions(
    t,
    error,
    'INVALID_ARGUMENT',
    'Invalid 3rd argument given to `test`.\n  Expected: `something`\n  Received: `anotherThing`',
  );
});

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*th"', async () => {
  const error = createInvalidArgumentError({
    procedure: 'test',
    argument: 3,
    expected: 'something',
    received: 'anotherThing',
  });

  errorAssertions(
    t,
    error,
    'INVALID_ARGUMENT',
    'Invalid 4th argument given to `test`.\n  Expected: `something`\n  Received: `anotherThing`',
  );
});

test('Creates an `EXTENSION_NOT_INITIALIZED` error', async () => {
  const error = createExtensionNotInitializedError('foo');

  errorAssertions(
    t,
    error,
    'EXTENSION_NOT_INITIALIZED',
    'Extensions must be initialized with a Magic SDK instance before `Extension.foo` can be accessed. Do not invoke `Extension.foo` inside an extension constructor.',
  );
});

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

test('Creates an `INCOMPATIBLE_EXTENSIONS` error for web (version-related)', async () => {
  mockSDKEnvironmentConstant('platform', 'web');
  mockSDKEnvironmentConstant('sdkName', 'magic-sdk');
  mockSDKEnvironmentConstant('version', '0.0.0');

  const error = createIncompatibleExtensionsError([new NoopExtSupportingWeb(), new NoopExtSupportingWeb()]);

  errorAssertions(
    t,
    error,
    'INCOMPATIBLE_EXTENSIONS',
    'Some extensions are incompatible with `magic-sdk@0.0.0`:\n  - Extension `noop` supports version(s) `>1.0.0`\n  - Extension `noop` supports version(s) `>1.0.0`',
  );
});

test('Creates an `INCOMPATIBLE_EXTENSIONS` error for React Native (version-related)', async () => {
  mockSDKEnvironmentConstant('platform', 'react-native');
  mockSDKEnvironmentConstant('sdkName', '@magic-sdk/react-native');
  mockSDKEnvironmentConstant('version', '0.0.0');

  const error = createIncompatibleExtensionsError([
    new NoopExtSupportingReactNative(),
    new NoopExtSupportingReactNative(),
  ]);

  errorAssertions(
    t,
    error,
    'INCOMPATIBLE_EXTENSIONS',
    'Some extensions are incompatible with `@magic-sdk/react-native@0.0.0`:\n  - Extension `noop` supports version(s) `>1.0.0`\n  - Extension `noop` supports version(s) `>1.0.0`',
  );
});

test('Creates an `INCOMPATIBLE_EXTENSIONS` error for web (environment-related)', async () => {
  mockSDKEnvironmentConstant('platform', 'web');
  mockSDKEnvironmentConstant('sdkName', 'magic-sdk');
  mockSDKEnvironmentConstant('version', '0.0.0');

  const error = createIncompatibleExtensionsError([new NoopExtSupportingReactNative()]);

  errorAssertions(
    t,
    error,
    'INCOMPATIBLE_EXTENSIONS',
    'Some extensions are incompatible with `magic-sdk@0.0.0`:\n  - Extension `noop` does not support web environments.',
  );
});

test('Creates an `INCOMPATIBLE_EXTENSIONS` error for React Native (environment-related)', async () => {
  mockSDKEnvironmentConstant('platform', 'react-native');
  mockSDKEnvironmentConstant('sdkName', '@magic-sdk/react-native');
  mockSDKEnvironmentConstant('version', '0.0.0');

  const error = createIncompatibleExtensionsError([new NoopExtSupportingWeb()]);

  errorAssertions(
    t,
    error,
    'INCOMPATIBLE_EXTENSIONS',
    'Some extensions are incompatible with `@magic-sdk/react-native@0.0.0`:\n  - Extension `noop` does not support react-native environments.',
  );
});

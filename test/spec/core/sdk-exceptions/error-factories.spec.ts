/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test, { ExecutionContext } from 'ava';
import {
  MagicSDKError,
  createMissingApiKeyError,
  createModalNotReadyError,
  createMalformedResponseError,
  createInvalidArgumentError,
  createExtensionNotInitializedError,
} from '../../../../src/core/sdk-exceptions';

function errorAssertions<T extends ExecutionContext<any>>(
  t: T,
  error: MagicSDKError,
  expectedCode: string,
  expectedMessage: string,
) {
  t.true(error instanceof MagicSDKError);
  t.is(error.code, expectedCode);
  t.is(error.message, `Magic SDK Error: [${expectedCode}] ${expectedMessage}`);
  t.is(error.rawMessage, expectedMessage);
}

test.beforeEach(t => {
  browserEnv.restore();
});

test('Creates a `MISSING_API_KEY` error', async t => {
  const error = createMissingApiKeyError();
  errorAssertions(
    t,
    error,
    'MISSING_API_KEY',
    'Please provide an API key that you acquired from the Magic developer dashboard.',
  );
});

test('Creates a `MODAL_NOT_READY` error', async t => {
  const error = createModalNotReadyError();
  errorAssertions(t, error, 'MODAL_NOT_READY', 'Modal is not ready.');
});

test('Creates a `MALFORMED_RESPONSE` error', async t => {
  const error = createMalformedResponseError();
  errorAssertions(t, error, 'MALFORMED_RESPONSE', 'Response from the Magic iframe is malformed.');
});

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*st"', async t => {
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

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*nd"', async t => {
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

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*rd"', async t => {
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

test('Creates an `INVALID_ARGUMENT` error and format the ordinal argument index with "*th"', async t => {
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

test('Creates an `EXTENSION_NOT_INITIALIZED` error', async t => {
  const error = createExtensionNotInitializedError('foo');

  errorAssertions(
    t,
    error,
    'EXTENSION_NOT_INITIALIZED',
    'Extensions must be initialized with a SDK instance before `Extension.foo` can be accessed. Do not invoke `Extension.foo` inside an extension constructor.',
  );
});

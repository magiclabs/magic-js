/* eslint-disable no-underscore-dangle */

import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test, { ExecutionContext } from 'ava';
import {
  MagicSDKError,
  createMissingApiKeyError,
  createModalNotReadyError,
  createMalformedResponseError,
  createInvalidArgumentError,
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
}

test.beforeEach(t => {
  browserEnv.restore();
});

/**
 * Creates a `MISSING_API_KEY` warning.
 *
 * Action Must:
 * - Create an instance of `MagicSDKError`
 * - Message and code should be the expected value for `MISSING_API_KEY`
 *   warning.
 */
test('#01 MISSING_API_KEY', async t => {
  const error = createMissingApiKeyError();
  errorAssertions(
    t,
    error,
    'MISSING_API_KEY',
    'Please provide an API key that you acquired from the Magic developer dashboard.',
  );
});

/**
 * Creates a `MODAL_NOT_READY` warning.
 *
 * Action Must:
 * - Create an instance of `MagicSDKError`
 * - Message and code should be the expected value for `MODAL_NOT_READY`
 *   warning.
 */
test('#02 MODAL_NOT_READY', async t => {
  const error = createModalNotReadyError();
  errorAssertions(t, error, 'MODAL_NOT_READY', 'Modal is not ready.');
});

/**
 * Creates a `MALFORMED_RESPONSE` warning.
 *
 * Action Must:
 * - Create an instance of `MagicSDKError`
 * - Message and code should be the expected value for `MALFORMED_RESPONSE`
 *   warning.
 */
test('#03 MALFORMED_RESPONSE', async t => {
  const error = createMalformedResponseError();
  errorAssertions(t, error, 'MALFORMED_RESPONSE', 'Response from the Magic iframe is malformed.');
});

/**
 * Creates a `INVALID_ARGUMENT` error.
 *
 * Action Must:
 * - Create an instance of `MagicSDKError`
 * - Format the ordinal argument index with '*st'
 */
test('#04 INVALID_ARGUMENT', async t => {
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

/**
 * Creates a `INVALID_ARGUMENT` error.
 *
 * Action Must:
 * - Create an instance of `MagicSDKError`
 * - Format the ordinal argument index with '*nd'
 */
test('#05 INVALID_ARGUMENT', async t => {
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

/**
 * Creates a `INVALID_ARGUMENT` error.
 *
 * Action Must:
 * - Create an instance of `MagicSDKError`
 * - Format the ordinal argument index with '*rd'
 */
test('#06 INVALID_ARGUMENT', async t => {
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

/**
 * Creates a `INVALID_ARGUMENT` error.
 *
 * Action Must:
 * - Create an instance of `MagicSDKError`
 * - Format the ordinal argument index with '*th'
 */
test('#07 INVALID_ARGUMENT', async t => {
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

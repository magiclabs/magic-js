/* eslint-disable no-underscore-dangle */

import '../../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicRPCError } from '../../../../../src/core/sdk-exceptions';

test.beforeEach(t => {
  browserEnv.restore();
});

/**
 * MagicRPCError class
 *
 *  Action Must:
 *  - Initialize MagicRPCError with object argument.
 */
test('#01', t => {
  const err = new MagicRPCError({
    code: -32603,
    message: 'hello world',
  });

  t.true(err instanceof MagicRPCError);
  t.is(err.code, -32603);
  t.is(err.message, 'Magic RPC Error: [-32603] hello world');
  t.is(err.rawMessage, 'hello world');
});

/**
 * MagicRPCError class
 *
 *  Action Must:
 *  - Initialize MagicRPCError with `null` argument.
 */
test('#02', t => {
  const err = new MagicRPCError(null);

  t.true(err instanceof MagicRPCError);
  t.is(err.code, -32603);
  t.is(err.message, 'Magic RPC Error: [-32603] Internal error');
  t.is(err.rawMessage, 'Internal error');
});

/**
 * MagicRPCError class
 *
 *  Action Must:
 *  - Initialize MagicRPCError with `undefined` argument.
 */
test('#03', t => {
  const err = new MagicRPCError();

  t.true(err instanceof MagicRPCError);
  t.is(err.code, -32603);
  t.is(err.message, 'Magic RPC Error: [-32603] Internal error');
  t.is(err.rawMessage, 'Internal error');
});

/**
 * MagicRPCError class
 *
 *  Action Must:
 *  - Initialize MagicRPCError with unknown error code argument.
 */
test('#04', t => {
  const err = new MagicRPCError({
    code: 1,
    message: 'hello world',
  });

  t.true(err instanceof MagicRPCError);
  t.is(err.code, -32603);
  t.is(err.message, 'Magic RPC Error: [-32603] hello world');
  t.is(err.rawMessage, 'hello world');
});

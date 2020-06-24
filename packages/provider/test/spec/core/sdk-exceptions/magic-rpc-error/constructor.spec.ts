/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicRPCError } from '../../../../../src/core/sdk-exceptions';

test.beforeEach((t) => {
  browserEnv.restore();
});

test('Initialize `MagicRPCError` with object argument', (t) => {
  const err = new MagicRPCError({
    code: -32603,
    message: 'hello world',
  });

  t.true(err instanceof MagicRPCError);
  t.is(err.code, -32603);
  t.is(err.message, 'Magic RPC Error: [-32603] hello world');
  t.is(err.rawMessage, 'hello world');
});

test('Initialize MagicRPCError with `null` argument', (t) => {
  const err = new MagicRPCError(null);

  t.true(err instanceof MagicRPCError);
  t.is(err.code, -32603);
  t.is(err.message, 'Magic RPC Error: [-32603] Internal error');
  t.is(err.rawMessage, 'Internal error');
});

test('Initialize MagicRPCError with `undefined` argument', (t) => {
  const err = new MagicRPCError();

  t.true(err instanceof MagicRPCError);
  t.is(err.code, -32603);
  t.is(err.message, 'Magic RPC Error: [-32603] Internal error');
  t.is(err.rawMessage, 'Internal error');
});

test('Initialize MagicRPCError with unknown error code argument', (t) => {
  const err = new MagicRPCError({
    code: 1,
    message: 'hello world',
  });

  t.true(err instanceof MagicRPCError);
  t.is(err.code, -32603);
  t.is(err.message, 'Magic RPC Error: [-32603] hello world');
  t.is(err.rawMessage, 'hello world');
});

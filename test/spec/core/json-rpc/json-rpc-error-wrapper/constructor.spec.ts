/* eslint-disable no-underscore-dangle */

import '../../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { JsonRpcErrorWrapper } from '../../../../../src/core/json-rpc';

test.beforeEach(t => {
  browserEnv.restore();
});

/**
 * JsonRpcErrorWrapper class
 *
 *  Action Must:
 *  - Initialize JsonRpcErrorWrapper with object argument.
 */
test('#01', t => {
  const err = new JsonRpcErrorWrapper({
    code: 1,
    message: 'hello world',
  });

  t.true(err instanceof JsonRpcErrorWrapper);
  t.is(err.code, 1);
  t.is(err.message, 'hello world');
});

/**
 * JsonRpcErrorWrapper class
 *
 *  Action Must:
 *  - Initialize JsonRpcErrorWrapper with `JsonRpcErrorWrapper` argument.
 */
test('#02', t => {
  const first = new JsonRpcErrorWrapper({
    code: 1,
    message: 'hello world',
  });

  const second = new JsonRpcErrorWrapper(first);

  t.is(second.code, 1);
  t.is(second.message, 'hello world');
});

/**
 * JsonRpcErrorWrapper class
 *
 *  Action Must:
 *  - Initialize JsonRpcErrorWrapper with `null` argument.
 */
test('#03', t => {
  const err = new JsonRpcErrorWrapper(null);

  t.true(err instanceof JsonRpcErrorWrapper);
  t.is(err.code, -32603);
  t.is(err.message, '');
});

/**
 * JsonRpcErrorWrapper class
 *
 *  Action Must:
 *  - Initialize JsonRpcErrorWrapper with `undefined` argument.
 */
test('#04', t => {
  const err = new JsonRpcErrorWrapper();

  t.true(err instanceof JsonRpcErrorWrapper);
  t.is(err.code, -32603);
  t.is(err.message, '');
});

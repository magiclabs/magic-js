/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { JsonRpcResponse } from '../../../../../src/core/json-rpc';
import { JsonRpcRequestPayload } from '../../../../../src/types';

function createSourcePayload(): JsonRpcRequestPayload {
  return {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_accounts',
    params: [],
  };
}

test.beforeEach(t => {
  browserEnv.restore();
});

test('Applies a result to the response.', t => {
  const payload = createSourcePayload();
  const result = 123;

  const response = new JsonRpcResponse(payload);

  t.false(response.hasResult);
  response.applyResult(result);
  t.is((response as any)._result, result);
  t.true(response.hasResult);
});

test('`null` can be a valid a result..', t => {
  const payload = createSourcePayload();
  const result = null;

  const response = new JsonRpcResponse(payload);

  t.false(response.hasResult);
  response.applyResult(result);
  t.is((response as any)._result, result);
  t.true(response.hasResult);
});

test('Applies `null` or `undefined` results explicitly', t => {
  const payload = createSourcePayload();
  const nullResult = null;
  const undefinedResult = undefined;

  const response1 = new JsonRpcResponse(payload);
  const response2 = new JsonRpcResponse(payload);

  t.false(response1.hasResult);
  t.false(response2.hasResult);

  response1.applyResult(nullResult);
  response2.applyResult(undefinedResult);

  t.is((response1 as any)._result, null);
  t.is((response2 as any)._result, undefined);
  t.true(response1.hasResult);
  t.false(response2.hasResult);
});

/* eslint-disable no-underscore-dangle */

import '../../../../setup';

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

/**
 * JsonRpcResponse.applyResult
 *
 *  Action Must:
 *  - Add a formatted error to the response by providing a JsonRpcError as
 *    argument.
 */
test('#01', t => {
  const payload = createSourcePayload();
  const result = 123;

  const response = new JsonRpcResponse(payload);

  t.false(response.hasResult);
  response.applyResult(result);
  t.is((response as any)._result, result);
  t.true(response.hasResult);
});

/**
 * JsonRpcResponse.applyResult
 *
 *  Action Must:
 *  - Apply `null` and `undefined` explicitly.
 */
test('#02', t => {
  const payload = createSourcePayload();
  const nullResult = null;
  const undefinedResult = undefined;

  const response1 = new JsonRpcResponse(payload);
  response1.applyResult(nullResult);

  const response2 = new JsonRpcResponse(payload);
  response2.applyResult(undefinedResult);

  t.is((response1 as any)._result, null);
  t.is((response2 as any)._result, undefined);
});

/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { JsonRpcResponse } from '../../../../../src/core/json-rpc';
import { JsonRpcError, JsonRpcRequestPayload } from '../../../../../src/types';

function createSourcePayload(): JsonRpcRequestPayload {
  return {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_accounts',
    params: [],
  };
}

function createJsonRcpError(): JsonRpcError {
  return {
    message: 'hello wolrd',
    code: 1,
  };
}

test.beforeEach(t => {
  browserEnv.restore();
});

/**
 * JsonRpcResponse.applyError
 *
 *  Action Must:
 *  - Add a formatted error to the response by providing a JsonRpcError as
 *    argument.
 */
test('#01', t => {
  const payload = createSourcePayload();
  const error = createJsonRcpError();

  const response = new JsonRpcResponse(payload);

  t.false(response.hasError);
  response.applyError(error);
  t.deepEqual((response as any)._error, error);
  t.true(response.hasError);
});

/**
 * JsonRpcResponse.applyError
 *
 *  Action Must:
 *  - Apply `null` and `undefined` explicitly.
 */
test('#02', t => {
  const payload = createSourcePayload();
  const nullError = null;
  const undefinedError = undefined;

  const response1 = new JsonRpcResponse(payload);
  response1.applyError(nullError);

  const response2 = new JsonRpcResponse(payload);
  response2.applyError(undefinedError);

  t.is((response1 as any)._error, null);
  t.is((response2 as any)._error, undefined);
});

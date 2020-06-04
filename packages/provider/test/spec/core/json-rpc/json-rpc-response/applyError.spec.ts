/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { JsonRpcError, JsonRpcRequestPayload } from '@magic-sdk/types';
import { JsonRpcResponse } from '../../../../../src/core/json-rpc';

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

test('Add a formatted error to the response with `JsonRpcError` object as argument', t => {
  const payload = createSourcePayload();
  const error = createJsonRcpError();

  const response = new JsonRpcResponse(payload);

  t.false(response.hasError);
  response.applyError(error);
  t.deepEqual((response as any)._error, error);
  t.true(response.hasError);
});

test('Apply `null` or `undefined` errors explicitly', t => {
  const payload = createSourcePayload();
  const nullError = null;
  const undefinedError = undefined;

  const response1 = new JsonRpcResponse(payload);
  const response2 = new JsonRpcResponse(payload);

  t.false(response1.hasError);
  t.false(response2.hasError);

  response1.applyError(nullError);
  response2.applyError(undefinedError);

  t.is((response1 as any)._error, null);
  t.is((response2 as any)._error, undefined);
  t.false(response1.hasError);
  t.false(response2.hasError);
});

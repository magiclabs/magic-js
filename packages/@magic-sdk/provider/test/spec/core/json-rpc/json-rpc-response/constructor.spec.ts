/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { JsonRpcResponse } from '../../../../../src/core/json-rpc';

test.beforeEach((t) => {
  browserEnv.restore();
});

test('Initialize JsonRpcResponse instance if argument is `instanceof` JsonRpcReponse', (t) => {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    result: 123,
    error: null,
  };

  const first = new JsonRpcResponse(payload);
  const second = new JsonRpcResponse(first);

  t.deepEqual(first, second);
  t.is((second as any)._jsonrpc, '2.0');
  t.is((second as any)._id, 1);
  t.is((second as any)._result, 123);
  t.is((second as any)._error, null);
});

test('Initialize JsonRpcResponse instance if argument is a JsonRpcResponsePayload', (t) => {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    result: 123,
    error: null,
  };

  const response = new JsonRpcResponse(payload);

  t.is((response as any)._jsonrpc, '2.0');
  t.is((response as any)._id, 1);
  t.is((response as any)._result, 123);
  t.is((response as any)._error, null);
});

test('Initialize JsonRpcResponse instance if argument is a JsonRpcRequestPayload', (t) => {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_accounts',
    params: [],
  };

  const response = new JsonRpcResponse(payload);

  t.is((response as any)._jsonrpc, '2.0');
  t.is((response as any)._id, 1);
  t.is((response as any)._result, undefined);
  t.is((response as any)._error, undefined);
});

test('Initialize `JsonRpcResponse` instance if argument is a `JsonRpcBatchRequestPayload`', (t) => {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_batchRequest',
    batch: [],
  };

  const response = new JsonRpcResponse(payload);

  t.is((response as any)._jsonrpc, '2.0');
  t.is((response as any)._id, 1);
  t.is((response as any)._result, undefined);
  t.is((response as any)._error, undefined);
});

import browserEnv from '@ikscodes/browser-env';
import { JsonRpcResponse } from '../../../../../src/core/json-rpc';

beforeEach(() => {
  browserEnv.restore();
});

test('Initialize JsonRpcResponse instance if argument is `instanceof` JsonRpcReponse', () => {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    result: 123,
    error: null,
  };

  const first = new JsonRpcResponse(payload);
  const second = new JsonRpcResponse(first);

  expect(first).toEqual(second);
  expect((second as any)._jsonrpc).toBe('2.0');
  expect((second as any)._id).toBe(1);
  expect((second as any)._result).toBe(123);
  expect((second as any)._error).toBe(null);
});

test('Initialize JsonRpcResponse instance if argument is a JsonRpcResponsePayload', () => {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    result: 123,
    error: null,
  };

  const response = new JsonRpcResponse(payload);

  expect((response as any)._jsonrpc).toBe('2.0');
  expect((response as any)._id).toBe(1);
  expect((response as any)._result).toBe(123);
  expect((response as any)._error).toBe(null);
});

test('Initialize JsonRpcResponse instance if argument is a JsonRpcRequestPayload', () => {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_accounts',
    params: [],
  };

  const response = new JsonRpcResponse(payload);

  expect((response as any)._jsonrpc).toBe('2.0');
  expect((response as any)._id).toBe(1);
  expect((response as any)._result).toBe(undefined);
  expect((response as any)._error).toBe(undefined);
});

test('Initialize `JsonRpcResponse` instance if argument is a `JsonRpcBatchRequestPayload`', () => {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_batchRequest',
    batch: [],
  };

  const response = new JsonRpcResponse(payload);

  expect((response as any)._jsonrpc).toBe('2.0');
  expect((response as any)._id).toBe(1);
  expect((response as any)._result).toBe(undefined);
  expect((response as any)._error).toBe(undefined);
});

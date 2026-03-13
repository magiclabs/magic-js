import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { JsonRpcResponse } from '../../../../../src/core/json-rpc';

function createSourcePayload(): JsonRpcRequestPayload {
  return {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_accounts',
    params: [],
  };
}

beforeEach(() => {
  jest.resetAllMocks();
});

test('Applies a result to the response.', () => {
  const payload = createSourcePayload();
  const result = 123;

  const response = new JsonRpcResponse(payload);

  expect(response.hasResult).toBe(false);
  response.applyResult(result);
  expect((response as any)._result).toBe(result);
  expect(response.hasResult).toBe(true);
});

test('`null` can be a valid a result..', () => {
  const payload = createSourcePayload();
  const result = null;

  const response = new JsonRpcResponse(payload);

  expect(response.hasResult).toBe(false);
  response.applyResult(result);
  expect((response as any)._result).toBe(result);
  expect(response.hasResult).toBe(true);
});

test('Applies `null` or `undefined` results explicitly', () => {
  const payload = createSourcePayload();
  const nullResult = null;
  const undefinedResult = undefined;

  const response1 = new JsonRpcResponse(payload);
  const response2 = new JsonRpcResponse(payload);

  expect(response1.hasResult).toBe(false);
  expect(response2.hasResult).toBe(false);

  response1.applyResult(nullResult);
  response2.applyResult(undefinedResult);

  expect((response1 as any)._result).toBe(null);
  expect((response2 as any)._result).toBe(undefined);
  expect(response1.hasResult).toBe(true);
  expect(response2.hasResult).toBe(false);
});

test('hasResult returns true when result is 0', () => {
  const payload = createSourcePayload();
  const response = new JsonRpcResponse(payload);
  response.applyResult(0);
  
  expect(response.hasResult).toBe(true);
  expect((response as any)._result).toBe(0);
});

test('hasResult returns true when result is empty string', () => {
  const payload = createSourcePayload();
  const response = new JsonRpcResponse(payload);
  response.applyResult('');
  
  expect(response.hasResult).toBe(true);
  expect((response as any)._result).toBe('');
});

test('hasResult returns true when result is false', () => {
  const payload = createSourcePayload();
  const response = new JsonRpcResponse(payload);
  response.applyResult(false);
  
  expect(response.hasResult).toBe(true);
  expect((response as any)._result).toBe(false);
});

import browserEnv from '@ikscodes/browser-env';
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
  browserEnv.restore();
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

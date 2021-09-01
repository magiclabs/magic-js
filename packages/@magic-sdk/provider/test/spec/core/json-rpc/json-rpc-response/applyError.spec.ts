import browserEnv from '@ikscodes/browser-env';
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

beforeEach(() => {
  browserEnv.restore();
});

test('Add a formatted error to the response with `JsonRpcError` object as argument', () => {
  const payload = createSourcePayload();
  const error = createJsonRcpError();

  const response = new JsonRpcResponse(payload);

  expect(response.hasError).toBe(false);
  response.applyError(error);
  expect((response as any)._error).toEqual(error);
  expect(response.hasError).toBe(true);
});

test('Apply `null` or `undefined` errors explicitly', () => {
  const payload = createSourcePayload();
  const nullError = null;
  const undefinedError = undefined;

  const response1 = new JsonRpcResponse(payload);
  const response2 = new JsonRpcResponse(payload);

  expect(response1.hasError).toBe(false);
  expect(response2.hasError).toBe(false);

  response1.applyError(nullError);
  response2.applyError(undefinedError);

  expect((response1 as any)._error).toBe(null);
  expect((response2 as any)._error).toBe(undefined);
  expect(response1.hasError).toBe(false);
  expect(response2.hasError).toBe(false);
});

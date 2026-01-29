import { JsonRpcError, JsonRpcRequestPayload, RPCErrorCode } from '@magic-sdk/types';
import { JsonRpcResponse } from '../../../../../src/core/json-rpc';
import * as webCrypto from '../../../../../src/util/web-crypto';

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
    code: RPCErrorCode.InternalError,
  };
}

beforeEach(() => {
  jest.restoreAllMocks();
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

test('Calls clearKeys when hasError is accessed with DpopInvalidated error', () => {
  const payload = createSourcePayload();
  const clearKeysSpy = jest.spyOn(webCrypto, 'clearKeys').mockImplementation(() => {});

  const response = new JsonRpcResponse(payload).applyError({
    code: RPCErrorCode.DpopInvalidated,
    message: 'DPOP invalidated',
  });

  expect(response.hasError).toBe(true);
  expect(clearKeysSpy).toHaveBeenCalledTimes(1);

  clearKeysSpy.mockRestore();
});

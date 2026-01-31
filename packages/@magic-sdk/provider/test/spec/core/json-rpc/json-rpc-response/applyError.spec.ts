import { JsonRpcError, JsonRpcRequestPayload, RPCErrorCode } from '@magic-sdk/types';
import { JsonRpcResponse } from '../../../../../src/core/json-rpc';
import * as webCrypto from '../../../../../src/util/web-crypto';

jest.mock('../../../../../src/util/web-crypto', () => ({
  clearKeys: jest.fn(),
}));

import { clearKeys } from '../../../../../src/util/web-crypto';

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
  jest.clearAllMocks();
  (clearKeys as jest.Mock).mockReset();
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

test('Does not call clearKeys when error code is not DpopInvalidated', () => {
  const payload = createSourcePayload();
  const otherError: JsonRpcError = {
    message: 'Some other error',
    code: RPCErrorCode.InternalError,
  };

  const response = new JsonRpcResponse(payload);
  response.applyError(otherError);

  // Accessing hasError should not trigger clearKeys for non-DPOP errors
  expect(response.hasError).toBe(true);
  expect(clearKeys).not.toHaveBeenCalled();
});

test('Calls clearKeys when DpopInvalidated error is encountered', () => {
  const payload = createSourcePayload();
  const dpopError: JsonRpcError = {
    message: 'DPOP invalidated',
    code: RPCErrorCode.DpopInvalidated,
  };

  const response = new JsonRpcResponse(payload);
  response.applyError(dpopError);

  // Accessing hasError should trigger clearKeys
  expect(response.hasError).toBe(true);
  expect(clearKeys).toHaveBeenCalledTimes(1);
});

test('Does not call clearKeys when error exists but has no code property', () => {
  const payload = createSourcePayload();
  const response = new JsonRpcResponse(payload);
  // Apply an error-like object without a code property
  response.applyError({ message: 'Some error' } as any);

  expect(response.hasError).toBe(true);
  expect(clearKeys).not.toHaveBeenCalled();
});

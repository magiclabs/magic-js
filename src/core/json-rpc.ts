/* eslint-disable no-underscore-dangle */

import { JsonRpcRequestPayload, JsonRpcResponsePayload, JsonRpcError } from '../types';
import { isJsonRpcResponsePayload } from '../util/type-guards';
import { getPayloadId } from '../util/get-payload-id';

/**
 * Build a valid JSON RPC payload for emitting to the Magic SDK iframe relayer.
 */
export function createJsonRpcRequestPayload(method: string, ...params: any[]): JsonRpcRequestPayload {
  return {
    params,
    method,
    jsonrpc: '2.0',
    id: getPayloadId(),
  };
}

/**
 * Wraps JSON RPC Payload errors in a JavaScript `Error` object.
 */
export class JsonRpcErrorWrapper extends Error {
  __proto__ = Error;

  public readonly code: string | number;

  constructor(sourceError?: JsonRpcError | JsonRpcErrorWrapper | null) {
    super(sourceError?.message);
    this.code = sourceError?.code ?? -32603;
    Object.setPrototypeOf(this, JsonRpcErrorWrapper.prototype);
  }
}

/**
 * A class which standardizes JSON RPC responses to ensure the correct
 * formatting.
 */
export class JsonRpcResponse<ResultType = any> {
  private readonly _jsonrpc: string;
  private readonly _id: string | number | null;
  private _result?: ResultType | null;
  private _error?: JsonRpcError | null;

  constructor(responsePayload: JsonRpcResponsePayload);
  constructor(response: JsonRpcResponse<ResultType>);
  constructor(requestPayload: JsonRpcRequestPayload);
  constructor(responseOrPayload: JsonRpcResponsePayload | JsonRpcResponse<ResultType> | JsonRpcRequestPayload) {
    if (responseOrPayload instanceof JsonRpcResponse) {
      this._jsonrpc = responseOrPayload.payload.jsonrpc;
      this._id = responseOrPayload.payload.id;
      this._result = responseOrPayload.payload.result;
      this._error = responseOrPayload.payload.error;
    } else if (isJsonRpcResponsePayload(responseOrPayload)) {
      this._jsonrpc = responseOrPayload.jsonrpc;
      this._id = responseOrPayload.id;
      this._result = responseOrPayload.result;
      this._error = responseOrPayload.error;
    } else {
      this._jsonrpc = responseOrPayload.jsonrpc;
      this._id = responseOrPayload.id;
      this._result = null;
      this._error = null;
    }
  }

  public applyError(error?: JsonRpcError | null) {
    this._error = error;
    return this;
  }

  public applyResult(result?: ResultType | null) {
    this._result = result;
    return this;
  }

  public get hasError() {
    return !!this._error;
  }

  public get hasResult() {
    return !!this._result;
  }

  public get payload(): JsonRpcResponsePayload {
    return {
      jsonrpc: this._jsonrpc,
      id: this._id,
      result: this._result,
      error: this._error,
    };
  }
}

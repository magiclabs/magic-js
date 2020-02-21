/* eslint-disable no-underscore-dangle */

import { JsonRpcBatchRequestPayload, JsonRpcError, JsonRpcRequestPayload, JsonRpcResponsePayload } from '../types';
import { isJsonRpcResponsePayload } from '../util/type-guards';

/**
 * A class which standardizes JSON RPC responses to ensure the correct
 * formatting.
 */
export class JsonRpcResponse<ResultType = any> {
  private readonly _jsonrpc: string;
  private readonly _id: string | number;
  private _result: ResultType | null;
  private _error: JsonRpcError | null;

  constructor(responsePayload: JsonRpcResponsePayload);
  constructor(response: JsonRpcResponse<ResultType>);
  constructor(payload: JsonRpcRequestPayload | JsonRpcBatchRequestPayload);
  constructor(
    responseOrPayload:
      | JsonRpcResponsePayload
      | JsonRpcResponse<ResultType>
      | JsonRpcRequestPayload
      | JsonRpcBatchRequestPayload,
  ) {
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

  public applyError(error: JsonRpcError | null = null) {
    this._error = error;
    return this;
  }

  public applyResult(result: ResultType | null = null) {
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

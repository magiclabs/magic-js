import { JsonRpcError } from '../types';

/**
 * Wraps JSON RPC errors in a JavaScript `Error` object.
 */
export class JsonRpcErrorWrapper extends Error {
  __proto__ = Error;

  public readonly code: string | number;

  constructor(sourceError: JsonRpcError | JsonRpcErrorWrapper) {
    super(sourceError.message);
    this.code = sourceError.code;
    Object.setPrototypeOf(this, JsonRpcErrorWrapper.prototype);
  }
}

/**
 * This file contains our type guards.
 *
 * Type guards are a feature of TypeScript which narrow the type signature of
 * intesection types (types that can be one thing or another).
 *
 * @see
 * https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types
 */

import {
  FmBatchRequest,
  FmPayloadMethod,
  FmRequest,
  JsonRpcBatchRequestPayload,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
} from '../types';

/**
 * Assert `value` is a `JsonRpcBatchRequestPayload` object.
 */
/* istanbul ignore next */
export function isJsonRpcBatchRequestPayload(
  value?: JsonRpcRequestPayload | JsonRpcBatchRequestPayload,
): value is JsonRpcBatchRequestPayload {
  if (!value) return false;
  return (
    !!value.jsonrpc &&
    !!value.id &&
    !!value.method &&
    !!(value as JsonRpcBatchRequestPayload).batch &&
    !(value as JsonRpcRequestPayload).params
  );
}

/**
 * Assert `value` is a `JsonRpcRequestPayload` object.
 */
/* istanbul ignore next */
export function isJsonRpcRequestPayload(
  value?: JsonRpcRequestPayload | JsonRpcBatchRequestPayload,
): value is JsonRpcRequestPayload {
  if (!value) return false;
  return (
    !!value.jsonrpc &&
    !!value.id &&
    !!value.method &&
    !!(value as JsonRpcRequestPayload).params &&
    !(value as JsonRpcBatchRequestPayload).batch
  );
}

/**
 * Assert `value` is a `JsonRpcResponsePayload` object.
 */
/* istanbul ignore next */
export function isJsonRpcResponsePayload(value: any): value is JsonRpcResponsePayload {
  if (!value) return false;
  return !!value.jsonrpc && !!value.id && (!!value.result || value.result === null || !!value.error);
}

/**
 * Assert `value` is a `FmRequest` object.
 */
/* istanbul ignore next */
export function isFmRequest(value?: FmRequest | FmBatchRequest): value is FmRequest {
  if (!value || !value.payload) return false;
  return isJsonRpcRequestPayload(value.payload);
}

/**
 * Assert `value` is a `FmBatchRequest` object.
 */
/* istanbul ignore next */
export function isFmBatchRequest(value?: FmRequest | FmBatchRequest): value is FmBatchRequest {
  if (!value || !value.payload) return false;
  return isJsonRpcBatchRequestPayload(value.payload);
}

/**
 * Assert `value` is a Fortmatic payload method identifier.
 */
/* istanbul ignore next */
export function isFmPayloadMethod(value?: any): value is FmPayloadMethod {
  if (!value) return false;
  return typeof value === 'string' && Object.values(FmPayloadMethod).includes(value as any);
}

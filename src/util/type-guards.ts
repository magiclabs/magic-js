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
  JsonRpcBatchRequestPayload,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
  MagicPayloadMethod,
} from '../types';

/**
 * Assert `value` is a `JsonRpcRequestPayload` object.
 */
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
export function isJsonRpcResponsePayload(value: any): value is JsonRpcResponsePayload {
  if (!value) return false;
  return !!value.jsonrpc && !!value.id && (!!value.result || value.result === null || !!value.error);
}

/**
 * Assert `value` is a Magic SDK payload method identifier.
 */
export function isMagicPayloadMethod(value?: any): value is MagicPayloadMethod {
  if (!value) return false;
  return typeof value === 'string' && Object.values(MagicPayloadMethod).includes(value as any);
}

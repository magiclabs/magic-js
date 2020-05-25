/**
 * This file contains our type guards.
 *
 * Type guards are a feature of TypeScript which narrow the type signature of
 * intesection types (types that can be one thing or another).
 *
 * @see
 * https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types
 */

import { JsonRpcRequestPayload, JsonRpcResponsePayload, MagicPayloadMethod, RPCErrorCode } from '@magic-sdk/types';

/**
 * Assert `value` is `undefined`.
 */
function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined';
}

/**
 * Assert `value` is `null`.
 */
function isNull(value: any): value is null {
  return value === null;
}

/**
 * Assert `value` is `null` or `undefined`.
 */
function isNil(value: any): value is null | undefined {
  return isNull(value) || isUndefined(value);
}

/**
 * Assert `value` is a `JsonRpcRequestPayload` object.
 */
export function isJsonRpcRequestPayload(value?: JsonRpcRequestPayload): value is JsonRpcRequestPayload {
  if (isNil(value)) return false;
  return (
    !isUndefined(value.jsonrpc) && !isUndefined(value.id) && !isUndefined(value.method) && !isUndefined(value.params)
  );
}

/**
 * Assert `value` is a `JsonRpcResponsePayload` object.
 */
export function isJsonRpcResponsePayload(value: any): value is JsonRpcResponsePayload {
  if (isNil(value)) return false;
  return (
    !isUndefined(value.jsonrpc) && !isUndefined(value.id) && (!isUndefined(value.result) || !isUndefined(value.error))
  );
}

/**
 * Assert `value` is a Magic SDK payload method identifier.
 */
export function isMagicPayloadMethod(value?: any): value is MagicPayloadMethod {
  if (isNil(value)) return false;
  return typeof value === 'string' && Object.values(MagicPayloadMethod).includes(value as any);
}

/**
 * Assert `value` is an expected JSON RPC error code.
 */
export function isJsonRpcErrorCode(value?: any): value is RPCErrorCode {
  if (isNil(value)) return false;
  return typeof value === 'number' && Object.values(RPCErrorCode).includes(value);
}

/**
 * Assert `value` is an empty, plain object.
 */
export function isEmpty(value?: any): value is {} {
  if (!value) return true;

  for (const key in value) {
    /* istanbul ignore else */
    if (Object.hasOwnProperty.call(value, key)) {
      return false;
    }
  }

  return true;
}

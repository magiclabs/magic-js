/* eslint-disable no-param-reassign */

import { ComposeTransactionConfig, JsonRpcBatchRequestPayload, JsonRpcRequestPayload } from '../types';
import { getPayloadId } from './get-payload-id';

export const JSON_RPC_VERSION = '2.0';

/**
 * Build a valid JSON RPC payload for emitting to the Ethereum node or Fortmatic
 * SDK provider.
 */
export function createJsonRpcRequestPayload(
  method: string,
  payloadConfig?: ComposeTransactionConfig,
): JsonRpcRequestPayload;
export function createJsonRpcRequestPayload(method: string, params?: any[]): JsonRpcRequestPayload;
export function createJsonRpcRequestPayload(
  method: string,
  arg?: any[] | ComposeTransactionConfig,
): JsonRpcRequestPayload {
  let params: any = [{}];

  if (arg) {
    if (!Array.isArray(arg)) {
      params = [{ to: arg.to, value: arg.amount }];
    } else {
      params = arg;
    }
  }

  return {
    params,
    method,
    jsonrpc: JSON_RPC_VERSION,
    id: getPayloadId(),
  };
}

/**
 * Build a valid JSON RPC batch payload. The underlying RPC payloads are handled
 * individually by the Ethereum node or Fortmatic SDK provider.
 */
export function createJsonRpcBatchRequestPayload(
  payloads: Partial<JsonRpcRequestPayload> | Partial<JsonRpcRequestPayload>[] = [],
): JsonRpcBatchRequestPayload {
  const payloadsArray = Array.isArray(payloads) ? payloads : [payloads];
  return {
    method: 'eth_batchRequest',
    jsonrpc: JSON_RPC_VERSION,
    id: getPayloadId(),
    batch: payloadsArray.filter(Boolean).map(payload => standardizeRequestPayload(payload)),
  };
}

/**
 * Given a potentially partial JSON RPC request payload, this function populates
 * missing properties to meet the JSON RPC spec (and any deviations we expect).
 *
 * **NOTE:** _This function mutates the payload argument!_ Under the hood, Web3
 * reconciles the payload ID with a response ID, mutating the payload object
 * ensures that any ID assertions pass.
 */
export function standardizeRequestPayload(payload: Partial<JsonRpcRequestPayload>): JsonRpcRequestPayload;
export function standardizeRequestPayload(payload: Partial<JsonRpcBatchRequestPayload>): JsonRpcBatchRequestPayload;
export function standardizeRequestPayload(
  payload: Partial<JsonRpcRequestPayload | JsonRpcBatchRequestPayload>,
): JsonRpcRequestPayload | JsonRpcBatchRequestPayload {
  // Populate common JSON RPC props
  payload.jsonrpc = payload.jsonrpc || JSON_RPC_VERSION;
  payload.id = getPayloadId();

  // Case #1: populate batch JSON RPC props
  if (!!(payload as JsonRpcBatchRequestPayload).batch || payload.method === 'eth_batchRequest') {
    payload.method = 'eth_batchRequest';
    (payload as JsonRpcBatchRequestPayload).batch =
      (payload as JsonRpcBatchRequestPayload).batch?.map(r => standardizeRequestPayload(r)) ?? [];
    return payload as JsonRpcBatchRequestPayload;
  }

  // Case #2: populate non-batch JSON RPC props
  (payload as JsonRpcRequestPayload).params = (payload as JsonRpcRequestPayload).params || [];
  return payload as JsonRpcRequestPayload;
}

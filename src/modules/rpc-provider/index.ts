/* eslint-disable consistent-return */

import { BaseModule } from '../base-module';
import {
  JsonRpcRequestPayload,
  JsonRpcRequestCallback,
  MagicOutgoingWindowMessage,
  JsonRpcBatchRequestCallback,
  JsonRpcResponsePayload,
} from '../../types';
import {
  createInvalidArgumentError,
  MagicRPCError,
  createSynchronousWeb3MethodWarning,
} from '../../core/sdk-exceptions';
import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload, JsonRpcResponse } from '../../core/json-rpc';
import { PromiEvent, EventsDefinition } from '../../util/promise-tools';

/** */
export class RPCProviderModule extends BaseModule {
  // Implements EIP 1193:
  // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md

  public readonly isMagic = true;

  /* eslint-disable prettier/prettier */
  public sendAsync(payload: Partial<JsonRpcRequestPayload>, onRequestComplete: JsonRpcRequestCallback): void;
  public sendAsync(payload: Partial<JsonRpcRequestPayload>[], onRequestComplete: JsonRpcBatchRequestCallback): void;
  public sendAsync(payload: Partial<JsonRpcRequestPayload> | Partial<JsonRpcRequestPayload>[], onRequestComplete: JsonRpcRequestCallback | JsonRpcBatchRequestCallback): void;
  /* eslint-enable prettier/prettier */
  public sendAsync(
    payload: Partial<JsonRpcRequestPayload> | Partial<JsonRpcRequestPayload>[],
    onRequestComplete: JsonRpcRequestCallback | JsonRpcBatchRequestCallback,
  ): void {
    if (!onRequestComplete) {
      throw createInvalidArgumentError({
        procedure: 'Magic.rpcProvider.sendAsync',
        argument: 1,
        expected: 'function',
        received: onRequestComplete === null ? 'null' : typeof onRequestComplete,
      });
    }

    if (Array.isArray(payload)) {
      this.transport
        .post(
          this.overlay,
          MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST,
          payload.map(p => standardizeJsonRpcRequestPayload(p)),
        )
        .then(batchResponse => {
          (onRequestComplete as JsonRpcBatchRequestCallback)(
            null,
            batchResponse.map(response => ({
              ...response.payload,
              error: response.hasError ? new MagicRPCError(response.payload.error) : null,
            })),
          );
        });
    } else {
      const finalPayload = standardizeJsonRpcRequestPayload(payload);
      this.transport
        .post(this.overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, finalPayload)
        .then(response => {
          (onRequestComplete as JsonRpcRequestCallback)(
            response.hasError ? new MagicRPCError(response.payload.error) : null,
            response.payload,
          );
        });
    }
  }

  /* eslint-disable prettier/prettier */
  public send<ResultType = any, Events extends EventsDefinition = {}>(method: string, params?: any[]): PromiEvent<ResultType, Events>;
  public send(payload: JsonRpcRequestPayload | JsonRpcRequestPayload[], onRequestComplete: JsonRpcRequestCallback): void;
  public send<ResultType>(payload: JsonRpcRequestPayload, none: void): JsonRpcResponsePayload<ResultType>;
  /* eslint-enable prettier/prettier */
  public send<ResultType = any, Events extends EventsDefinition = {}>(
    payloadOrMethod: string | JsonRpcRequestPayload | JsonRpcRequestPayload[],
    onRequestCompleteOrParams: JsonRpcRequestCallback | any[] | void,
  ): PromiEvent<ResultType, Events> | JsonRpcResponsePayload<ResultType> | void {
    // Case #1
    // Web3 >= 1.0.0-beta.38 calls `send` with method and parameters.
    if (typeof payloadOrMethod === 'string') {
      const payload = createJsonRpcRequestPayload(
        payloadOrMethod,
        Array.isArray(onRequestCompleteOrParams) ? onRequestCompleteOrParams : [],
      );

      return this.request(payload);
    }

    // Case #2
    // Web3 <= 1.0.0-beta.37 uses `send` with a callback for async queries.
    if (Array.isArray(payloadOrMethod) || !!onRequestCompleteOrParams) {
      this.sendAsync(payloadOrMethod, onRequestCompleteOrParams as any);
      return;
    }

    // Case #3
    // Legacy synchronous methods (unsupported).
    const warning = createSynchronousWeb3MethodWarning();
    warning.log();
    return new JsonRpcResponse(payloadOrMethod).applyError({
      code: -32603,
      message: warning.rawMessage,
    }).payload;
  }

  public enable() {
    const requestPayload = createJsonRpcRequestPayload('eth_accounts');
    return this.request<string[]>(requestPayload);
  }
}

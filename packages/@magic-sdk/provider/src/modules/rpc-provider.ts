import {
  JsonRpcRequestPayload,
  JsonRpcRequestCallback,
  MagicOutgoingWindowMessage,
  JsonRpcBatchRequestCallback,
  JsonRpcResponsePayload,
  ProviderEnableEvents,
  MagicPayloadMethod,
  routeToMagicMethods,
} from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createInvalidArgumentError, MagicRPCError, createSynchronousWeb3MethodWarning } from '../core/sdk-exceptions';
import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload, JsonRpcResponse } from '../core/json-rpc';
import { PromiEvent } from '../util/promise-tools';
import { createTypedEmitter, EventsDefinition, TypedEmitter } from '../util/events';

const { createBoundEmitterMethod, createChainingEmitterMethod } = createTypedEmitter();

export class RPCProviderModule extends BaseModule implements TypedEmitter {
  // Implements EIP 1193:
  // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md

  public readonly isMagic = true;

  public sendAsync(payload: Partial<JsonRpcRequestPayload>, onRequestComplete: JsonRpcRequestCallback): void;
  public sendAsync(payload: Partial<JsonRpcRequestPayload>[], onRequestComplete: JsonRpcBatchRequestCallback): void;
  public sendAsync(
    payload: Partial<JsonRpcRequestPayload> | Partial<JsonRpcRequestPayload>[],
    onRequestComplete: JsonRpcRequestCallback | JsonRpcBatchRequestCallback,
  ): void;

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
      const standardizedPayloads = payload.map(p => {
        const standardizedPayload = standardizeJsonRpcRequestPayload(p);
        return standardizedPayload;
      });

      const requestPromises = standardizedPayloads.map(p =>
        this.request(p)
          .then(result => ({
            jsonrpc: p.jsonrpc ?? '2.0',
            id: p.id ?? null,
            result,
            error: null,
          }))
          .catch(error => ({
            jsonrpc: p.jsonrpc ?? '2.0',
            id: p.id ?? null,
            error,
          })),
      );

      Promise.all(requestPromises).then(batchResponse => {
        (onRequestComplete as JsonRpcBatchRequestCallback)(null, batchResponse);
      });
    } else {
      this.request(standardizeJsonRpcRequestPayload(payload))
        .then(result => {
          (onRequestComplete as JsonRpcRequestCallback)(null, {
            jsonrpc: payload.jsonrpc ?? '2.0',
            id: payload.id ?? null,
            result,
            error: null,
          });
        })
        .catch(error => {
          (onRequestComplete as JsonRpcRequestCallback)(error, {
            jsonrpc: payload.jsonrpc ?? '2.0',
            id: payload.id ?? null,
            error,
          });
        });
    }
  }

  public send<ResultType = any>(method: string, params?: any[]): PromiEvent<ResultType>;
  public send(
    payload: JsonRpcRequestPayload | JsonRpcRequestPayload[],
    onRequestComplete: JsonRpcRequestCallback,
  ): void;
  public send<ResultType>(payload: JsonRpcRequestPayload, none: void): JsonRpcResponsePayload<ResultType>;

  public send<ResultType = any>(
    payloadOrMethod: string | JsonRpcRequestPayload | JsonRpcRequestPayload[],
    onRequestCompleteOrParams: JsonRpcRequestCallback | any[] | void,
  ): PromiEvent<ResultType> | JsonRpcResponsePayload<ResultType> | void {
    // Case #1
    // Web3 >= 1.0.0-beta.38 calls `send` with method and parameters.
    if (typeof payloadOrMethod === 'string') {
      const payload = createJsonRpcRequestPayload(
        payloadOrMethod,
        Array.isArray(onRequestCompleteOrParams) ? onRequestCompleteOrParams : [],
      );
      return this.request(payload) as any;
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
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Login);
    return this.request<string[], ProviderEnableEvents>(requestPayload);
  }

  /**
   * Here, we wrap `BaseModule.request` with an additional check
   * to determine if the RPC method requires a test-mode prefix.
   */
  public request<ResultType = any, Events extends EventsDefinition = void>(payload: Partial<JsonRpcRequestPayload>) {
    this.prefixPayloadMethodForTestMode(payload);
    return super.request<ResultType, Events>(payload);
  }

  /**
   * Prefixes Ethereum RPC methods with a `testMode` identifier. This is done so
   * that Magic's <iframe> can handle signing methods using test-specific keys.
   */
  private prefixPayloadMethodForTestMode(payload: Partial<JsonRpcRequestPayload>) {
    const testModePrefix = 'testMode/eth/';

    // In test mode, we prefix all RPC methods with `test/` so that the
    // Magic <iframe> can handle them without requiring network calls.
    if (this.sdk.testMode) {
      payload.method = `${testModePrefix}${payload.method}`;
    }
  }

  public on = createChainingEmitterMethod('on', this);
  public once = createChainingEmitterMethod('once', this);
  public addListener = createChainingEmitterMethod('addListener', this);

  public off = createChainingEmitterMethod('off', this);
  public removeListener = createChainingEmitterMethod('removeListener', this);
  public removeAllListeners = createChainingEmitterMethod('removeAllListeners', this);

  public emit = createBoundEmitterMethod('emit');
  public eventNames = createBoundEmitterMethod('eventNames');
  public listeners = createBoundEmitterMethod('listeners');
  public listenerCount = createBoundEmitterMethod('listenerCount');
}

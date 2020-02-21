/* eslint-disable consistent-return, prefer-destructuring */

import {
  FmBatchRequest,
  FmIncomingWindowMessage,
  FmOutgoingWindowMessage,
  FmRequest,
  JsonRpcBatchRequestPayload,
  JsonRpcRequestCallback,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
} from '../types';
import { emitWeb3Payload } from '../util/emit-payload-promise';
import { createJsonRpcBatchRequestPayload, standardizeRequestPayload } from '../util/json-rpc-helpers';
import { isJsonRpcBatchRequestPayload, isJsonRpcRequestPayload } from '../util/type-guards';
import { FmIframeController } from './fm-iframe-controller';
import { FmPayloadTransport } from './fm-payload-transport';
import { JsonRpcErrorWrapper } from './json-rpc-error-wrapper';
import { JsonRpcResponse } from './json-rpc-response';
import { createInvalidArgumentError, createSynchronousWeb3MethodWarning } from './sdk-exceptions';

/**
 * Fortmatic's Web3-compliant provider.
 */
export class FmProvider {
  public readonly isFortmatic: boolean = true;
  private readonly overlay: FmIframeController;
  private readonly payloadTransport: FmPayloadTransport;
  private queue: (FmRequest | FmBatchRequest)[] = [];

  constructor(endpoint: string, private readonly apiKey: string, encodedQueryParams: string) {
    this.overlay = new FmIframeController(endpoint, encodedQueryParams);
    this.payloadTransport = new FmPayloadTransport(endpoint, encodedQueryParams);
    this.listen();
  }

  // --- Web3-compliant standard methods

  /**
   * Enqueue a native Web3 payload for asynchronous processing.
   */
  public sendAsync(
    payload: Partial<JsonRpcRequestPayload> | Partial<JsonRpcRequestPayload>[] | Partial<JsonRpcBatchRequestPayload>,
    onRequestComplete: JsonRpcRequestCallback,
  ) {
    if (!onRequestComplete) {
      throw createInvalidArgumentError({
        functionName: 'sendAsync',
        argIndex: 1,
        expected: 'function',
        received: onRequestComplete === null ? 'null' : typeof onRequestComplete,
      });
    }

    // Handle an array of payloads (build a batch request)
    if (Array.isArray(payload)) {
      return this.enqueue({
        onRequestComplete,
        payload: createJsonRpcBatchRequestPayload(payload),
      });
    }

    const finalPayload = standardizeRequestPayload(payload);

    if (isJsonRpcBatchRequestPayload(finalPayload)) {
      return this.enqueue({ onRequestComplete, payload: finalPayload });
    }

    // Handle a vanilla `JsonRpcRequestPayload`
    return this.enqueue({ onRequestComplete, payload: finalPayload });
  }

  /**
   * Enqueue a Fortmatic custom payload for asynchronous processing.
   */
  public sendFortmaticAsync(payload: Partial<JsonRpcRequestPayload>, onRequestComplete: JsonRpcRequestCallback) {
    if (!onRequestComplete) {
      throw createInvalidArgumentError({
        functionName: 'sendFortmaticAsync',
        argIndex: 1,
        expected: 'function',
        received: onRequestComplete === null ? 'null' : typeof onRequestComplete,
      });
    }

    const finalPayload = standardizeRequestPayload(payload);
    this.enqueue({
      onRequestComplete,
      payload: finalPayload,
      isFortmaticMethod: true,
    });
  }

  /**
   * Primary, Web3-compatible send interface. Enqueues a native Web3 payload for
   * processing.
   */
  /* eslint-disable prettier/prettier */
  send<ResultType>(method: string, params?: any[]): Promise<ResultType>;
  send(payload: JsonRpcRequestPayload | JsonRpcBatchRequestPayload, onRequestComplete: JsonRpcRequestCallback): void;
  send<ResultType>(payload: JsonRpcRequestPayload | JsonRpcBatchRequestPayload, none: void): JsonRpcResponsePayload<ResultType>;
  /* eslint-enable prettier/prettier */
  send<ResultType = any>(
    payloadOrMethod: string | JsonRpcRequestPayload | JsonRpcBatchRequestPayload,
    onRequestCompleteOrParams: JsonRpcRequestCallback | any[] | void,
  ): Promise<ResultType> | JsonRpcResponsePayload<ResultType> | void {
    // Case #1
    // Web3 >= 1.0.0-beta.38 calls `send` with method and parameters.
    if (typeof payloadOrMethod === 'string') {
      return emitWeb3Payload<ResultType>(this, payloadOrMethod, onRequestCompleteOrParams as any);
    }

    // Case #2
    // Web3 <= 1.0.0-beta.37 uses `send` with a callback for async queries.
    if (onRequestCompleteOrParams) {
      this.sendAsync(payloadOrMethod, onRequestCompleteOrParams as any);
      return;
    }

    // Case #3
    // Legacy synchronous methods.
    createSynchronousWeb3MethodWarning().log();
    return new JsonRpcResponse(payloadOrMethod).applyError({
      code: -32603,
      message:
        'Non-async web3 methods will be deprecated in web3 > 1.0 and are not supported by the Fortmatic provider. An async method is to be used instead.',
    }).payload;
  }

  /**
   * Enable the provider by invoking the `eth_accounts` RPC method.
   */
  public enable() {
    return emitWeb3Payload(this, 'eth_accounts');
  }

  // --- Queue structure

  /**
   * Enqueue a payload for processing.
   */
  private enqueue(item: FmRequest | FmBatchRequest) {
    if (item) {
      this.queue.push(item);
      // Only start handling queued requests if the overlay is ready!
      if (this.overlay.overlayReady) this.dequeue();
    }
  }

  /**
   * Dequeue the next payload and execute the request.
   */
  private async dequeue() {
    // Optimization: noop if queue is empty.
    if (this.queue.length === 0) return;

    const item = this.queue.shift();
    if (item) {
      const { payload } = item;

      if (isJsonRpcBatchRequestPayload(payload)) {
        // Resolve an empty batch request with empty responses.
        if (payload.batch.length === 0) return item.onRequestComplete(null, []);

        const batchResponse = await this.payloadTransport.post(
          this.overlay,
          FmOutgoingWindowMessage.FORTMATIC_HANDLE_REQUEST,
          payload,
        );

        item.onRequestComplete(null, batchResponse);
      }

      if (isJsonRpcRequestPayload(payload)) {
        const response = await this.payloadTransport.post(
          this.overlay,
          (item as FmRequest).isFortmaticMethod
            ? FmOutgoingWindowMessage.FORTMATIC_HANDLE_FORTMATIC_REQUEST
            : FmOutgoingWindowMessage.FORTMATIC_HANDLE_REQUEST,
          payload,
        );

        if (response.error) item.onRequestComplete(new JsonRpcErrorWrapper(response.error), response);
        else item.onRequestComplete(null, response);
      }

      // Process the next request in queue
      this.dequeue();
    }
  }

  // --- Window message handling

  /**
   * Listen for messages sent from the Fortmatic `<iframe>`.
   */
  private listen() {
    this.payloadTransport.on(FmIncomingWindowMessage.FORTMATIC_OVERLAY_READY, () => {
      // Once the overlay is ready, we start handling queued requests.
      this.dequeue();
    });

    this.payloadTransport.on(FmIncomingWindowMessage.FORTMATIC_USER_DENIED, () => {
      // TODO(smithki#67|11-18-2019): We kill the queue on user denied... is
      // this the behavior we want? We should investigate how this affects users
      // that poll on Web3 methods to find out if bugs are introduced.
      //
      // NOTE: This only affects Widget Mode, Phantom Mode does not make use of
      // the `FORTMATIC_USER_DENIED` event.
      this.queue.forEach(item => {
        const response = new JsonRpcResponse(item.payload);
        const fallbackError = {
          message: 'Fortmatic: Modal was closed without executing action!',
          code: 1,
        };

        item.onRequestComplete(new JsonRpcErrorWrapper(fallbackError), response.applyError(fallbackError).payload);
      });

      // Empty the queue.
      this.queue.slice(0);
    });
  }
}

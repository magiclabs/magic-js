import {
  FmIncomingWindowMessage,
  FmMessageEvent,
  FmOutgoingWindowMessage,
  JsonRpcBatchRequestPayload,
  JsonRpcError,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
} from '../types';
import { isJsonRpcBatchRequestPayload } from '../util/type-guards';
import { FmIframeController } from './fm-iframe-controller';
import { JsonRpcResponse } from './json-rpc-response';
import { createModalNotReadyError } from './sdk-exceptions';

interface RemoveEventListenerFunction {
  /**
   * Stop listening on the event associated with this `FmFetchOffFunction`
   * object.
   */
  (): void;
}

/**
 * Unfortunately, some of our JSON RPC errors are implemented incorrectly by
 * attaching the `error.message` and `error.code` properties at the root of
 * the response. Until that's fixed, we standardize the error here
 * before resolving the data.
 */
/* istanbul ignore next */
function standardizeError(event: FmMessageEvent) {
  const dataContainsError = !!event.data.response.error || !!event.data.response.message || !!event.data.response.code;
  const standardError: JsonRpcError = {
    message:
      event.data.response.error?.message ??
      event.data.response.message ??
      'Fortmatic: Modal was closed without executing action!',
    code: event.data.response.error?.code ?? event.data.response.code ?? 1,
  };
  /* eslint-disable-next-line no-param-reassign */
  event.data.response.error = dataContainsError ? standardError : null;
}

/**
 * Get the originating payload from a batch request using the specified `id`
 * (if `id` is undefined or missing, the original payload is returned).
 */
/* istanbul ignore next */
function getRequestPayloadFromBatch(
  originalRequestPayload: JsonRpcRequestPayload | JsonRpcBatchRequestPayload,
  id?: string | number,
) {
  return id && isJsonRpcBatchRequestPayload(originalRequestPayload)
    ? originalRequestPayload.batch.find(p => p.id === id) || originalRequestPayload
    : originalRequestPayload;
}

/**
 * Ensures the incoming response follows the expected schema and parses for a
 * JSON RPC payload ID.
 */
/* istanbul ignore next */
function standardizeResponse(
  originalPayload: JsonRpcRequestPayload | JsonRpcBatchRequestPayload,
  event: FmMessageEvent,
) {
  standardizeError(event);
  const id = event.data.response?.id ?? undefined;

  // Build a standardized response object
  const response = new JsonRpcResponse(getRequestPayloadFromBatch(originalPayload, id))
    .applyResult(event.data.response?.result)
    .applyError(event.data.response?.error);

  return {
    response,
    id: event.data.response?.id ?? undefined,
  };
}

/**
 * A class of utilities for communicating with Fortmatic iframes via JSON RPC
 * payloads.
 */
export class FmPayloadTransport {
  private messageHandlers = new Set<(event: MessageEvent) => any>();

  constructor(private readonly endpoint: string, private readonly encodedQueryParams: string) {
    this.initMessageListener();
  }

  /**
   * Send a payload to the Fortmatic `<iframe>` for processing and automatically
   * handle the acknowledging follow-up event(s).
   *
   * @param overlay - The `FmIframeController` context to which the event will be posted.
   * @param msgType - The type of message to encode with the data.
   * @param payload - The JSON RPC payload to emit via `window.postMessage`.
   */
  public async post(
    overlay: FmIframeController,
    msgType: FmOutgoingWindowMessage,
    payload: JsonRpcRequestPayload,
  ): Promise<JsonRpcResponsePayload>;
  public async post(
    overlay: FmIframeController,
    msgType: FmOutgoingWindowMessage,
    payload: JsonRpcBatchRequestPayload,
  ): Promise<JsonRpcResponsePayload[]>;
  public async post(
    overlay: FmIframeController,
    msgType: FmOutgoingWindowMessage,
    payload: JsonRpcRequestPayload | JsonRpcBatchRequestPayload,
  ): Promise<JsonRpcResponsePayload | JsonRpcResponsePayload[]> {
    const iframe = await overlay.iframe;
    return new Promise((resolve, reject) => {
      if (iframe.contentWindow) {
        const batchData: JsonRpcResponsePayload[] = [];
        const batchIds = isJsonRpcBatchRequestPayload(payload) ? payload.batch.map(p => p.id) : [];
        iframe.contentWindow.postMessage({ msgType: `${msgType}-${this.encodedQueryParams}`, payload }, '*');

        /*

          Some context on how batch payloads are processed:

          Widget Mode:
          1. The modal receives a payload containing the `batch` property (which
             stores an array of regular JSON RPC payloads).
          2. The modal re-propogates the underlying payloads using window
             messages. This means we can expect multiple response events for
             each batch payload.
          3. In the code below, we acknowledge the response events and collect
             all responses for the batch.

          Phantom Mode:
          1. The modal receives a payload containing the `batch` property (which
             stores an array of regular JSON RPC payloads).
          2. The modal proceses the underlying payloads in memory using a
             JavaScript closure. As in Widget Mode, we can expect multiple
             response events for each batch payload.
          3. In the code below, we acknowledge the response events and collect
             all responses for the batch.

         */

        /** Collect successful RPC responses and resolve. */
        const acknowledgeHandleResponse = (removeEventListener: RemoveEventListenerFunction) => (
          event: FmMessageEvent,
        ) => {
          const { id, response } = standardizeResponse(payload, event);

          if (id && isJsonRpcBatchRequestPayload(payload) && batchIds.includes(id)) {
            batchData.push(response.payload);

            // For batch requests, we wait for all responses before resolving.
            if (batchData.length === payload.batch.length) {
              removeEventListener();
              resolve(batchData);
            }
          } else if (id && id === payload.id) {
            removeEventListener();
            resolve(response.payload);
          }
        };

        /**
         * Capture user denials and resolve with the appropriate error (this
         * occurs when a user closes the modal before completing an action).
         *
         * NOTE: This is relevant only to Widget Mode. Phantom Mode handles
         * errors via `acknowledgeHandleResponse` only.
         */
        const acknowledgeUserDenied = (removeEventListener: RemoveEventListenerFunction) => (event: FmMessageEvent) => {
          const { id, response } = standardizeResponse(payload, event);

          // We must have an error if user denies transaction/signature, so we
          // have this fallback if none exists on the response data.
          const fallbackError: JsonRpcError = {
            message: 'Fortmatic: Modal was closed without executing action!',
            code: 1,
          };

          const responsePayload = response.hasError ? response.payload : response.applyError(fallbackError).payload;

          if (id && isJsonRpcBatchRequestPayload(payload) && batchIds.includes(id)) {
            batchData.push(responsePayload);

            // Apply a standard error to unhandled payloads in the batch
            for (let i = batchData.length; i < payload.batch.length; i++) {
              batchData.push(new JsonRpcResponse(payload.batch[i]).applyError(fallbackError).payload);
            }

            removeEventListener();
            resolve(batchData);
          } else if (id && id === payload.id) {
            removeEventListener();
            resolve(responsePayload);
          }
        };

        // Listen for and handle responses.
        const offHandleResponse = this.on(
          FmIncomingWindowMessage.FORTMATIC_HANDLE_RESPONSE,
          acknowledgeHandleResponse(() => {
            offHandleResponse();
            offUserDenied();
          }),
        );

        // Listen for and handle user denials (Widget Mode only).
        const offUserDenied = this.on(
          FmIncomingWindowMessage.FORTMATIC_USER_DENIED,
          acknowledgeUserDenied(() => {
            offUserDenied();
            offHandleResponse();
          }),
        );
      } else {
        reject(createModalNotReadyError());
      }
    });
  }

  /**
   * Listen for events received with the given `msgType`.
   *
   * @param msgType - The `msgType` encoded with the event data.
   * @param handler - A handler function to execute on each event received.
   * @return A `void` function to remove the attached event.
   */
  public on(
    msgType: FmIncomingWindowMessage,
    handler: (this: Window, event: FmMessageEvent) => any,
  ): RemoveEventListenerFunction {
    const boundHandler = handler.bind(window);
    const listener = (event: MessageEvent) => {
      if (event.data.msgType === `${msgType}-${this.encodedQueryParams}`) boundHandler(event);
    };

    this.messageHandlers.add(listener);
    return () => this.messageHandlers.delete(listener);
  }

  /**
   * Initialize the underlying `Window.onmessage` event listener.
   */
  private initMessageListener() {
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin === this.endpoint) {
        if (event.data && event.data.msgType) {
          if (this.messageHandlers.size) {
            // If the response object is undefined, we ensure it's at least an
            // empty object before passing to the event listener.
            /* eslint-disable-next-line no-param-reassign */
            event.data.response = event.data.response ?? {};
            for (const handler of this.messageHandlers.values()) {
              handler(event);
            }
          }
        }
      }
    });
  }
}

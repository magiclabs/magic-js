import {
  MagicIncomingWindowMessage,
  MagicOutgoingWindowMessage,
  JsonRpcRequestPayload,
  MagicMessageEvent,
} from '../types';
import { JsonRpcResponse } from './json-rpc';
import { ViewController } from './view-controller';
import { createAutoCatchingPromise } from '../util/promise-tools';

interface RemoveEventListenerFunction {
  (): void;
}

interface StandardizedResponse {
  id?: string | number;
  response?: JsonRpcResponse;
}

/**
 * Get the originating payload from a batch request using the specified `id`.
 */
function getRequestPayloadFromBatch(
  requestPayload: JsonRpcRequestPayload | JsonRpcRequestPayload[],
  id?: string | number | null,
): JsonRpcRequestPayload | undefined {
  return id && Array.isArray(requestPayload)
    ? requestPayload.find(p => p.id === id)
    : (requestPayload as JsonRpcRequestPayload);
}

/**
 * Ensures the incoming response follows the expected schema and parses for a
 * JSON RPC payload ID.
 */
function standardizeResponse(
  requestPayload: JsonRpcRequestPayload | JsonRpcRequestPayload[],
  event: MagicMessageEvent,
): StandardizedResponse {
  const { id } = event.data.response;
  const requestPayloadResolved = getRequestPayloadFromBatch(requestPayload, id);

  if (id && requestPayloadResolved) {
    // Build a standardized response object
    const response = new JsonRpcResponse(requestPayloadResolved)
      .applyResult(event.data.response.result)
      .applyError(event.data.response.error);

    return { id, response };
  }

  return {};
}

export abstract class PayloadTransport {
  protected messageHandlers = new Set<(event: MagicMessageEvent) => any>();

  /**
   * Create an instance of `PayloadTransport`
   *
   * @param overlay - The `IframeController` context to which the event will be
   * posted.
   * @param endpoint - The URL for the relevant iframe context.
   * @param encodedQueryParams - The unique, encoded query parameters for the
   * relevant iframe context.
   */
  constructor(protected readonly endpoint: string, protected readonly encodedQueryParams: string) {
    this.init();
  }

  /**
   * Send a payload to the Magic `<iframe>` for processing and automatically
   * handle the acknowledging follow-up event(s).
   *
   * @param msgType - The type of message to encode with the data.
   * @param payload - The JSON RPC payload to emit via `window.postMessage`.
   */
  public async post<ResultType = any>(
    overlay: ViewController,
    msgType: MagicOutgoingWindowMessage,
    payload: JsonRpcRequestPayload[],
  ): Promise<JsonRpcResponse<ResultType>[]>;

  public async post<ResultType = any>(
    overlay: ViewController,
    msgType: MagicOutgoingWindowMessage,
    payload: JsonRpcRequestPayload,
  ): Promise<JsonRpcResponse<ResultType>>;

  public async post<ResultType = any>(
    overlay: ViewController,
    msgType: MagicOutgoingWindowMessage,
    payload: JsonRpcRequestPayload | JsonRpcRequestPayload[],
  ): Promise<JsonRpcResponse<ResultType> | JsonRpcResponse<ResultType>[]> {
    return createAutoCatchingPromise(async resolve => {
      await overlay.ready;

      const batchData: JsonRpcResponse[] = [];
      const batchIds = Array.isArray(payload) ? payload.map(p => p.id) : [];

      await overlay.postMessage({ msgType: `${msgType}-${this.encodedQueryParams}`, payload });

      /** Collect successful RPC responses and resolve. */
      const acknowledgeResponse = (removeEventListener: RemoveEventListenerFunction) => (event: MagicMessageEvent) => {
        const { id, response } = standardizeResponse(payload, event);

        if (id && response && Array.isArray(payload) && batchIds.includes(id)) {
          batchData.push(response);

          // For batch requests, we wait for all responses before resolving.
          if (batchData.length === payload.length) {
            removeEventListener();
            resolve(batchData);
          }
        } else if (id && response && !Array.isArray(payload) && id === payload.id) {
          removeEventListener();
          resolve(response);
        }
      };

      // Listen for and handle responses.
      const removeResponseListener = this.on(
        MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,
        acknowledgeResponse(() => removeResponseListener()),
      );
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
    msgType: MagicIncomingWindowMessage,
    handler: (this: Window, event: MagicMessageEvent) => any,
  ): RemoveEventListenerFunction {
    const boundHandler = handler.bind(window);

    // We cannot effectively cover this function because it never gets reference
    // by value. The functionality of this callback is tested within
    // `initMessageListener`.
    /* istanbul ignore next */
    const listener = (event: MagicMessageEvent) => {
      if (event.data.msgType === `${msgType}-${this.encodedQueryParams}`) boundHandler(event);
    };

    this.messageHandlers.add(listener);
    return () => this.messageHandlers.delete(listener);
  }

  protected abstract init(): void;

  /**
   * Route incoming messages from a React Native `<WebView>`.
   */
  public handleReactNativeWebViewMessage(event: any) {
    if (
      event.nativeEvent &&
      event.nativeEvent.url === `${this.endpoint}/send/?params=${this.encodedQueryParams}` &&
      typeof event.nativeEvent.data === 'string'
    ) {
      const data: any = JSON.parse(event.nativeEvent.data);
      if (data && data.msgType && this.messageHandlers.size) {
        // If the response object is undefined, we ensure it's at least an
        // empty object before passing to the event listener.
        /* eslint-disable-next-line no-param-reassign */
        data.response = data.response ?? {};

        // Reconstruct event from RN event
        const magicEvent: MagicMessageEvent = { data } as MagicMessageEvent;
        for (const handler of this.messageHandlers.values()) {
          handler(magicEvent);
        }
      }
    }
  }

  /**
   * Initialize the underlying `Window.onmessage` event listener.
   */
  private initMessageListener() {
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin === this.endpoint) {
        if (event.data && event.data.msgType && this.messageHandlers.size) {
          // If the response object is undefined, we ensure it's at least an
          // empty object before passing to the event listener.
          /* eslint-disable-next-line no-param-reassign */
          event.data.response = event.data.response ?? {};
          for (const handler of this.messageHandlers.values()) {
            handler(event);
          }
        }
      }
    });
  }
}

import {
  MagicIncomingWindowMessage,
  MagicOutgoingWindowMessage,
  JsonRpcRequestPayload,
  MagicMessageEvent,
} from '../types';
import { IframeController } from './iframe-controller';
import { JsonRpcResponse } from './json-rpc';
import { createModalNotReadyError } from './sdk-exceptions';

interface RemoveEventListenerFunction {
  /**
   * Stop listening on the event associated with this `FmFetchOffFunction`
   * object.
   */
  (): void;
}

/**
 * Ensures the incoming response follows the expected schema and parses for a
 * JSON RPC payload ID.
 */
function standardizeResponse(requestPayload: JsonRpcRequestPayload, event: MagicMessageEvent) {
  // Build a standardized response object
  const response = new JsonRpcResponse(requestPayload)
    .applyResult(event.data.response?.result)
    .applyError(event.data.response?.error);

  return {
    id: event.data.response?.id ?? undefined,
    response,
  };
}

export class PayloadTransport {
  private messageHandlers = new Set<(event: MessageEvent) => any>();

  /**
   * Create an instance of `PayloadTransport`
   *
   * @param overlay - The `IframeController` context to which the event will be
   * posted.
   * @param endpoint - The URL for the relevant iframe context.
   * @param encodedQueryParams - The unique, encoded query parameters for the
   * relevant iframe context.
   */
  constructor(
    private readonly overlay: IframeController,
    private readonly endpoint: string,
    private readonly encodedQueryParams: string,
  ) {
    this.initMessageListener();
  }

  /**
   * Send a payload to the Magic `<iframe>` for processing and automatically
   * handle the acknowledging follow-up event(s).
   *
   * @param msgType - The type of message to encode with the data.
   * @param payload - The JSON RPC payload to emit via `window.postMessage`.
   */
  public async post<ResultType = any>(
    msgType: MagicOutgoingWindowMessage,
    payload: JsonRpcRequestPayload,
  ): Promise<JsonRpcResponse<ResultType>> {
    const iframe = await this.overlay.iframe;
    return new Promise((resolve, reject) => {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ msgType: `${msgType}-${this.encodedQueryParams}`, payload }, '*');

        /** Collect successful RPC responses and resolve. */
        const acknowledgeHandleResponse = (removeEventListener: RemoveEventListenerFunction) => (
          event: MagicMessageEvent,
        ) => {
          const { id, response } = standardizeResponse(payload, event);
          if (id && id === payload.id) {
            removeEventListener();
            resolve(response);
          }
        };

        // Listen for and handle responses.
        const offHandleResponse = this.on(
          MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,
          acknowledgeHandleResponse(() => offHandleResponse()),
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
    msgType: MagicIncomingWindowMessage,
    handler: (this: Window, event: MagicMessageEvent) => any,
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

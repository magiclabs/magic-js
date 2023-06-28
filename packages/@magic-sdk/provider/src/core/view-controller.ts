import {
  MagicIncomingWindowMessage,
  MagicOutgoingWindowMessage,
  JsonRpcRequestPayload,
  MagicMessageEvent,
  MagicMessageRequest,
} from '@magic-sdk/types';
import { JsonRpcResponse } from './json-rpc';
import { createPromise } from '../util/promise-tools';
import { getItem, setItem } from '../util/storage';
import { createJwt } from '../util/web-crypto';
import { SDKEnvironment } from './sdk-environment';

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
  console.log('getRequestPayloadFromBatch() id', id);
  return id && Array.isArray(requestPayload)
    ? requestPayload.find((p) => {
        console.log('requestPayload', p);
        return p.id === id;
      })
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
  console.log('standardizeResponse() event and requestPayload', event, requestPayload);
  const id = event.data.response?.id;
  const requestPayloadResolved = getRequestPayloadFromBatch(requestPayload, id);

  console.log('requestPayloadResolved in standardizeResponse: ', requestPayloadResolved);

  if (id && requestPayloadResolved) {
    // Build a standardized response object
    const response = new JsonRpcResponse(requestPayloadResolved)
      .applyResult(event.data.response.result)
      .applyError(event.data.response.error);
    console.log('return hydrated object');
    return { id, response };
  }
  console.log('return empty object');
  return {};
}

async function createMagicRequest(msgType: string, payload: JsonRpcRequestPayload | JsonRpcRequestPayload[]) {
  const rt = await getItem<string>('rt');
  let jwt;

  // only for webcrypto platforms
  if (SDKEnvironment.platform === 'web') {
    try {
      jwt = await createJwt();
    } catch (e) {
      console.error('webcrypto error', e);
    }
  }

  if (!jwt) {
    return { msgType, payload };
  }

  if (!rt) {
    return { msgType, payload, jwt };
  }

  return { msgType, payload, jwt, rt };
}

async function persistMagicEventRefreshToken(event: MagicMessageEvent) {
  if (!event.data.rt) {
    return;
  }

  await setItem('rt', event.data.rt);
}

export abstract class ViewController {
  public ready: Promise<void>;
  protected readonly messageHandlers = new Set<(event: MagicMessageEvent) => any>();

  /**
   * Create an instance of `ViewController`
   *
   * @param endpoint - The URL for the relevant iframe context.
   * @param parameters - The unique, encoded query parameters for the
   * relevant iframe context.
   */
  constructor(protected readonly endpoint: string, protected readonly parameters: string) {
    this.ready = this.waitForReady();
    this.listen();
  }

  protected abstract init(): void;
  protected abstract _post(data: MagicMessageRequest): Promise<void>;
  protected abstract hideOverlay(): void;
  protected abstract showOverlay(): void;

  /**
   * Send a payload to the Magic `<iframe>` for processing and automatically
   * handle the acknowledging follow-up event(s).
   *
   * @param msgType - The type of message to encode with the data.
   * @param payload - The JSON RPC payload to emit via `window.postMessage`.
   */
  public async post<ResultType = any>(
    msgType: MagicOutgoingWindowMessage,
    payload: JsonRpcRequestPayload[],
  ): Promise<JsonRpcResponse<ResultType>[]>;

  public async post<ResultType = any>(
    msgType: MagicOutgoingWindowMessage,
    payload: JsonRpcRequestPayload,
  ): Promise<JsonRpcResponse<ResultType>>;

  public async post<ResultType = any>(
    msgType: MagicOutgoingWindowMessage,
    payload: JsonRpcRequestPayload | JsonRpcRequestPayload[],
  ): Promise<JsonRpcResponse<ResultType> | JsonRpcResponse<ResultType>[]> {
    return createPromise(async (resolve) => {
      await this.ready;

      const batchData: JsonRpcResponse[] = [];
      const batchIds = Array.isArray(payload) ? payload.map((p) => p.id) : [];
      console.log('post batchIds', batchIds);
      console.log('msgType in post: ', msgType);
      const msg = await createMagicRequest(`${msgType}-${this.parameters}`, payload);

      await this._post(msg);

      /**
       * Collect successful RPC responses and resolve.
       */
      const acknowledgeResponse = (removeEventListener: RemoveEventListenerFunction) => (event: MagicMessageEvent) => {
        console.log('acknowledgeResponse() payload and event', payload, event);
        const { id, response } = standardizeResponse(payload, event);
        console.log('acknowledgeResponse() after standardizeResponse', id, response);
        persistMagicEventRefreshToken(event);

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

    console.log('msgType in on: ', msgType);

    // We cannot effectively cover this function because it never gets reference
    // by value. The functionality of this callback is tested within
    // `initMessageListener`.
    /* istanbul ignore next */
    const listener = (event: MagicMessageEvent) => {
      if (event.data.msgType === `${msgType}-${this.parameters}`) boundHandler(event);
    };

    this.messageHandlers.add(listener);
    return () => this.messageHandlers.delete(listener);
  }

  private waitForReady() {
    return new Promise<void>((resolve) => {
      this.on(MagicIncomingWindowMessage.MAGIC_OVERLAY_READY, () => resolve());
    });
  }

  /**
   * Listen for messages sent from the underlying Magic `<WebView>`.
   */
  private listen() {
    this.on(MagicIncomingWindowMessage.MAGIC_HIDE_OVERLAY, () => {
      this.hideOverlay();
    });

    this.on(MagicIncomingWindowMessage.MAGIC_SHOW_OVERLAY, () => {
      this.showOverlay();
    });
  }
}

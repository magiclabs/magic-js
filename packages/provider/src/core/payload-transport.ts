import {
  MagicIncomingWindowMessage,
  MagicOutgoingWindowMessage,
  JsonRpcRequestPayload,
  MagicMessageEvent,
} from '@magic-sdk/types';
import { JsonRpcResponse } from './json-rpc';
import { ViewController } from './view-controller';
import { createPromise } from '../util/promise-tools';
import { getItem, setItem } from '../util/storage';
import { getPublicKey, signData } from '../util/web-crypto';

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
    ? requestPayload.find((p) => p.id === id)
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
  const id = event.data.response?.id;
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

async function createMagicRequest(msgType: string, payload: JsonRpcRequestPayload | JsonRpcRequestPayload[]) {
  const rtr = await getItem<string>('RTR');
  let webcryptoPublicKey;

  try {
    webcryptoPublicKey = await getPublicKey();
  } catch (e) {
    console.error('web crypto error creating keypair', e);
  }

  if (!rtr || !webcryptoPublicKey) {
    return { msgType, payload };
  }

  const sig = await signData(rtr);

  return { msgType, payload, sig, rtr };
}

async function persistMagicEventRtr(event: MagicMessageEvent) {
  if (!event?.data?.rtr) {
    return;
  }
  await setItem('RTR', event.data.rtr);
}

export abstract class PayloadTransport {
  protected messageHandlers = new Set<(event: MagicMessageEvent) => any>();

  /**
   * Create an instance of `PayloadTransport`
   *
   * @param endpoint - The URL for the relevant iframe context.
   * @param parameters - The unique, encoded query parameters for the
   * relevant iframe context.
   */
  constructor(protected readonly endpoint: string, protected readonly parameters: string) {
    this.init();
  }

  protected abstract init(): void;

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
    return createPromise(async (resolve) => {
      await overlay.ready;

      const batchData: JsonRpcResponse[] = [];
      const batchIds = Array.isArray(payload) ? payload.map((p) => p.id) : [];
      const msg = await createMagicRequest(`${msgType}-${this.parameters}`, payload);
      await overlay.postMessage(msg);

      /** Collect successful RPC responses and resolve. */
      const acknowledgeResponse = (removeEventListener: RemoveEventListenerFunction) => (event: MagicMessageEvent) => {
        const { id, response } = standardizeResponse(payload, event);
        persistMagicEventRtr(event);

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
      if (event.data.msgType === `${msgType}-${this.parameters}`) boundHandler(event);
    };

    this.messageHandlers.add(listener);
    return () => this.messageHandlers.delete(listener);
  }
}

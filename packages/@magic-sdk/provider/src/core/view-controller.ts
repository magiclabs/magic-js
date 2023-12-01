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
import { createModalNotReadyError } from './sdk-exceptions';
import {
  DEVICE_SHARE_KEY,
  ENCRYPTION_KEY_KEY,
  INITIALIZATION_VECTOR_KEY,
  decryptDeviceShare,
  encryptDeviceShare,
} from '../util/device-share-web-crypto';

interface RemoveEventListenerFunction {
  (): void;
}

interface StandardizedResponse {
  id?: string | number;
  response?: JsonRpcResponse;
}

interface StandardizedMagicRequest {
  msgType: string;
  payload: JsonRpcRequestPayload<any> | JsonRpcRequestPayload<any>[];
  jwt?: string;
  rt?: string;
  deviceShare?: string;
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
  const rt = await getItem<string>('rt');
  let jwt;

  // only for webcrypto platforms
  if (SDKEnvironment.platform === 'web') {
    try {
      jwt = (await getItem<string>('jwt')) ?? (await createJwt());
    } catch (e) {
      console.error('webcrypto error', e);
    }
  }

  const request: StandardizedMagicRequest = { msgType, payload };

  if (jwt) {
    request.jwt = jwt;
  }
  if (jwt && rt) {
    request.rt = rt;
  }

  // Retrieve device share
  const deviceShare = await getItem<string>(DEVICE_SHARE_KEY); // device_share
  const ivString = (await getItem(INITIALIZATION_VECTOR_KEY)) as string; // use existing encryption key and initialization vector
  const ek = (await getItem(ENCRYPTION_KEY_KEY)) as CryptoKey;

  if (deviceShare && ivString && ek) {
    const decrypted = await decryptDeviceShare(deviceShare, ek, ivString);
    request.deviceShare = decrypted;
  }

  return request;
}

async function persistMagicEventRefreshToken(event: MagicMessageEvent) {
  if (!event.data.rt) {
    return;
  }

  await setItem('rt', event.data.rt);
}

async function persistDeviceShare(event: MagicMessageEvent) {
  if (!event.data.deviceShare) {
    return;
  }

  // if it comes from the iframe, consider it "plaintext"
  const plaintextDeviceShare = event.data.deviceShare;

  const { encryptionKey, encryptedDeviceShare, iv } = await encryptDeviceShare(plaintextDeviceShare);

  if (!encryptionKey || !encryptedDeviceShare || !iv) {
    return;
  }

  await setItem(DEVICE_SHARE_KEY, encryptedDeviceShare);
  await setItem(ENCRYPTION_KEY_KEY, encryptionKey);
  await setItem(INITIALIZATION_VECTOR_KEY, iv);
}

export abstract class ViewController {
  public checkIsReadyForRequest: Promise<void>;
  protected readonly messageHandlers = new Set<(event: MagicMessageEvent) => any>();
  protected isConnectedToInternet = true;

  /**
   * Create an instance of `ViewController`
   *
   * @param endpoint - The URL for the relevant iframe context.
   * @param parameters - The unique, encoded query parameters for the
   * relevant iframe context.
   */
  constructor(protected readonly endpoint: string, protected readonly parameters: string) {
    this.checkIsReadyForRequest = this.waitForReady();
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
    return createPromise(async (resolve, reject) => {
      if (!this.isConnectedToInternet) {
        const error = createModalNotReadyError();
        reject(error);
      }

      await this.checkIsReadyForRequest;

      const batchData: JsonRpcResponse[] = [];
      const batchIds = Array.isArray(payload) ? payload.map((p) => p.id) : [];
      const msg = await createMagicRequest(`${msgType}-${this.parameters}`, payload);

      await this._post(msg);

      /**
       * Collect successful RPC responses and resolve.
       */
      const acknowledgeResponse = (removeEventListener: RemoveEventListenerFunction) => (event: MagicMessageEvent) => {
        const { id, response } = standardizeResponse(payload, event);
        persistMagicEventRefreshToken(event);
        persistDeviceShare(event);

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

  private waitForReady() {
    return new Promise<void>((resolve) => {
      this.on(MagicIncomingWindowMessage.MAGIC_OVERLAY_READY, () => {
        resolve();
      });
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

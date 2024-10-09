import {
  MagicIncomingWindowMessage,
  MagicOutgoingWindowMessage,
  JsonRpcRequestPayload,
  MagicMessageEvent,
  MagicMessageRequest,
  SDKWarningCode,
} from '@magic-sdk/types';
import { JsonRpcResponse } from './json-rpc';
import { createPromise } from '../util/promise-tools';
import { getItem, setItem } from '../util/storage';
import { createJwt } from '../util/web-crypto';
import { SDKEnvironment } from './sdk-environment';
import { MagicSDKWarning, createModalNotReadyError } from './sdk-exceptions';
import {
  clearDeviceShares,
  encryptAndPersistDeviceShare,
  getDecryptedDeviceShare,
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

async function createMagicRequest(
  msgType: string,
  payload: JsonRpcRequestPayload | JsonRpcRequestPayload[],
  networkHash: string,
) {
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

  // Grab the device share if it exists for the network
  const decryptedDeviceShare = await getDecryptedDeviceShare(networkHash);
  if (decryptedDeviceShare) {
    request.deviceShare = decryptedDeviceShare;
  }

  return request;
}

async function persistMagicEventRefreshToken(event: MagicMessageEvent) {
  if (!event.data.rt) {
    return;
  }

  await setItem('rt', event.data.rt);
}

export abstract class ViewController {
  public checkIsReadyForRequest: Promise<void>;
  public isReadyForRequest: boolean;
  protected readonly messageHandlers = new Set<(event: MagicMessageEvent) => any>();
  protected isConnectedToInternet = true;

  /**
   * Create an instance of `ViewController`
   *
   * @param endpoint - The URL for the relevant iframe context.
   * @param parameters - The unique, encoded query parameters for the
   * relevant iframe context.
   * @param networkHash - The hash of the network that this sdk instance is connected to
   * for multi-chain scenarios
   */
  constructor(
    protected readonly endpoint: string,
    protected readonly parameters: string,
    protected readonly networkHash: string,
  ) {
    this.checkIsReadyForRequest = this.waitForReady();
    this.isReadyForRequest = false;
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

      if (!this.isReadyForRequest) {
        await this.waitForReady();
      }

      const batchData: JsonRpcResponse[] = [];
      const batchIds = Array.isArray(payload) ? payload.map((p) => p.id) : [];
      const msg = await createMagicRequest(`${msgType}-${this.parameters}`, payload, this.networkHash);

      await this._post(msg);

      /**
       * Collect successful RPC responses and resolve.
       */
      const acknowledgeResponse = (removeEventListener: RemoveEventListenerFunction) => (event: MagicMessageEvent) => {
        const { id, response } = standardizeResponse(payload, event);
        persistMagicEventRefreshToken(event);
        if (response?.payload.error?.message === 'User denied account access.') {
          clearDeviceShares();
        } else if (event.data.deviceShare) {
          const { deviceShare } = event.data;
          encryptAndPersistDeviceShare(deviceShare, this.networkHash);
        }
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
      const unsubscribe = this.on(MagicIncomingWindowMessage.MAGIC_OVERLAY_READY, () => {
        this.isReadyForRequest = true;
        resolve();
        unsubscribe();
      });

      // We expect the overlay to be ready within 15 seconds.
      // Sometimes the message is not properly processed due to
      // webview issues. In that case, after 15 seconds we consider
      // the overlay ready, to avoid requests hanging forever.
      setTimeout(() => {
        this.isReadyForRequest = true;
        resolve();
        unsubscribe();
      }, 15000);
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

    this.on(MagicIncomingWindowMessage.MAGIC_SEND_PRODUCT_ANNOUNCEMENT, (event: MagicMessageEvent) => {
      if (event.data.response.result.product_announcement) {
        new MagicSDKWarning(SDKWarningCode.ProductAnnouncement, event.data.response.result.product_announcement).log();
      }
    });
  }
}

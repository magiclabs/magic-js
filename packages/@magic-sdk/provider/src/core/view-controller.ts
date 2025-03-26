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
import { MagicSDKWarning, createModalNotReadyError } from './sdk-exceptions';
import { clearDeviceShares, encryptAndPersistDeviceShare } from '../util/device-share-web-crypto';
import { createURL } from '../util/url';
import { createMagicRequest, persistMagicEventRefreshToken, standardizeResponse } from '../util/view-controller-utils';

interface RemoveEventListenerFunction {
  (): void;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const PING_INTERVAL = 5 * MINUTE; // 5 minutes
const INITIAL_HEARTBEAT_DELAY = 60 * MINUTE; // 1 hour

export abstract class ViewController {
  public isReadyForRequest: boolean;
  protected readonly messageHandlers = new Set<(event: MagicMessageEvent) => any>();
  protected isConnectedToInternet = true;
  protected lastPongTime: null | number = null;
  protected heartbeatIntervalTimer: ReturnType<typeof setInterval> | null = null;
  protected heartbeatDebounce = debounce(() => this.heartBeatCheck(), INITIAL_HEARTBEAT_DELAY);

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
    this.isReadyForRequest = false;
    this.listen();
  }

  protected abstract init(): void;
  protected abstract _post(data: MagicMessageRequest): Promise<void>;
  protected abstract hideOverlay(): void;
  protected abstract showOverlay(): void;
  protected abstract checkRelayerExistsInDOM(): boolean;
  protected abstract reloadRelayer(): Promise<void>;

  protected getRelayerSrc() {
    return createURL(`/send?params=${encodeURIComponent(this.parameters)}`, this.endpoint).href;
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
      const batchIds = Array.isArray(payload) ? payload.map(p => p.id) : [];
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

  waitForReady() {
    const isRelayerExisted = this.checkRelayerExistsInDOM();

    if (!isRelayerExisted) {
      this.init();
    }

    return new Promise<void>(resolve => {
      const unsubscribe = this.on(MagicIncomingWindowMessage.MAGIC_OVERLAY_READY, () => {
        this.isReadyForRequest = true;
        resolve();
        unsubscribe();
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

    this.on(MagicIncomingWindowMessage.MAGIC_SEND_PRODUCT_ANNOUNCEMENT, (event: MagicMessageEvent) => {
      if (event.data.response.result.product_announcement) {
        new MagicSDKWarning(SDKWarningCode.ProductAnnouncement, event.data.response.result.product_announcement).log();
      }
    });
  }

  /**
   * Sends periodic pings to check the connection.
   * If no pong is received or it’s stale, the iframe is reloaded.
   */
  /* istanbul ignore next */
  private heartBeatCheck() {
    let firstPing = true;

    // Helper function to send a ping message.
    const sendPing = async () => {
      const message = {
        msgType: `${MagicOutgoingWindowMessage.MAGIC_PING}-${this.parameters}`,
        payload: [],
      };
      await this._post(message);
    };

    this.heartbeatIntervalTimer = setInterval(async () => {
      // If no pong has ever been received.
      if (!this.lastPongTime) {
        if (!firstPing) {
          // On subsequent ping with no previous pong response, reload the iframe.
          this.reloadRelayer();
          firstPing = true;
          return;
        }
      } else {
        // If we have a pong, check how long ago it was received.
        const timeSinceLastPong = Date.now() - this.lastPongTime;
        if (timeSinceLastPong > PING_INTERVAL * 2) {
          // If the pong is too stale, reload the iframe.
          this.reloadRelayer();
          firstPing = true;
          return;
        }
      }

      // Send a new ping message and update the counter.
      await sendPing();
      firstPing = false;
    }, PING_INTERVAL);
  }

  // Debounce revival mechanism
  // Kill any existing PingPong interval
  protected stopHeartBeat() {
    this.heartbeatDebounce();
    this.lastPongTime = null;

    if (this.heartbeatIntervalTimer) {
      clearInterval(this.heartbeatIntervalTimer);
      this.heartbeatIntervalTimer = null;
    }
  }
}

function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

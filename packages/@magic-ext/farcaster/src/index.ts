import { Extension, FarcasterLoginEventEmit, JsonRpcRequestPayload } from '@magic-sdk/commons';
import type {
  CreateChannelAPIResponse,
  AuthenticateAPIResponse,
  WatchStatusResponse,
  AuthClientError,
} from '@farcaster/auth-client';
import { createAppClient, viemConnector } from '@farcaster/auth-client';
import { FarcasterPayloadMethod } from './types';

type Handle<E extends EventName> = {
  on: Handler<E>;
};

const EVENT = {
  CHANNEL: 'channel',
  DONE: 'done',
  ERROR: 'error',
} as const;

type EventName = typeof EVENT[keyof typeof EVENT];

interface EventMap {
  channel: CreateChannelAPIResponse;
  done: AuthenticateAPIResponse;
  error: AuthClientError;
}

interface Handler<E extends EventName> {
  (event: E, callback: (params: EventMap[E]) => void): Handle<E>;
}

const DEFAULT_RELAY_URL = 'https://relay.farcaster.xyz';
const DEFAULT_SIWE_URI = 'https://example.com/login';
const DEFAULT_TIMEOUT = 60000;
const DEFAULT_INTERVAL = 500;

export class FarcasterExtension extends Extension.Internal<'farcaster', any> {
  name = 'farcaster' as const;
  config: any = {};

  public login = ({ showUI }: { showUI: boolean }): Handle<EventName> => {
    const appClient = createAppClient({
      relay: DEFAULT_RELAY_URL,
      ethereum: viemConnector(),
    });

    const channelPromise = appClient.createChannel({
      siweUri: DEFAULT_SIWE_URI,
      domain: window.location.host,
    });

    const statusPromise: WatchStatusResponse = channelPromise.then(({ data }) => {
      return appClient
        .watchStatus({
          channelToken: data.channelToken,
          timeout: DEFAULT_TIMEOUT,
          interval: DEFAULT_INTERVAL,
        })
        .then((r) => {
          if (r.isError) {
            throw r.error;
          } else {
            return r;
          }
        });
    });

    let requestPayload: JsonRpcRequestPayload;

    const handle = {
      on: <T extends EventName>(event: T, callback: (params: EventMap[T]) => void) => {
        if (event === EVENT.CHANNEL) {
          (async () => {
            const { data } = await channelPromise;

            callback(data as any);

            if (!showUI) return;

            requestPayload = this.utils.createJsonRpcRequestPayload(FarcasterPayloadMethod.FarcasterShowQR, [{ data }]);

            this.request(requestPayload);
          })();
        }
        if (event === EVENT.DONE) {
          (async () => {
            const { data } = await statusPromise;

            if (data.state !== 'completed') return;

            if (showUI && requestPayload) {
              this.createIntermediaryEvent(FarcasterLoginEventEmit.SuccessSignIn, requestPayload.id as any)();
            }

            await this.request(
              this.utils.createJsonRpcRequestPayload(FarcasterPayloadMethod.FarcasterLogin, [
                {
                  channel_token: requestPayload.params[0].data.channelToken,
                  message: data.message,
                  signature: data.signature,
                  fid: data.fid,
                },
              ]),
            );

            callback(data as any);
          })();
        }
        if (event === EVENT.ERROR) {
          statusPromise.catch((e) => {
            callback(e);
          });
        }

        return handle;
      },
    };

    return handle;
  };
}

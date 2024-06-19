import { Extension, FarcasterLoginEventEmit, JsonRpcRequestPayload } from '@magic-sdk/commons';
import type {
  CreateChannelAPIResponse,
  AuthenticateAPIResponse,
  WatchStatusResponse,
  AuthClientError,
} from '@farcaster/auth-client';
import { createAppClient, viemConnector } from '@farcaster/auth-client';
import { FarcasterPayloadMethod } from './types';
import { isMobile } from './utils';

type Handle = {
  on: Handler;
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

interface Handler {
  (event: 'channel', callback: (params: CreateChannelAPIResponse) => void): Handle;
  (event: 'done', callback: (params: AuthenticateAPIResponse) => void): Handle;
  (event: 'error', callback: (params: AuthClientError) => void): Handle;
}

const DEFAULT_RELAY_URL = 'https://relay.farcaster.xyz';
const DEFAULT_SIWE_URI = 'https://example.com/login';
const DEFAULT_TIMEOUT = 60000;
const DEFAULT_INTERVAL = 500;

export class FarcasterExtension extends Extension.Internal<'farcaster', any> {
  name = 'farcaster' as const;
  config: any = {};

  public login = ({ showUI }: { showUI: boolean }): Handle => {
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
    let channel_token: string;

    const handle: Handle = {
      on: (event, callback) => {
        if (event === EVENT.CHANNEL) {
          (async () => {
            const { data } = await channelPromise;

            callback(data as any);
            channel_token = data.channelToken;

            if (isMobile()) {
              console.info(`Info: showUI parameter is ignored on mobile, open URL directly`);
              window.open(data.url, '_blank');
              return;
            }

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
                  channel_token,
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

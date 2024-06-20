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

type ChannelCallback = (params: CreateChannelAPIResponse) => void;
type DoneCallback = (params: AuthenticateAPIResponse) => void;
type ErrorCallback = (params: AuthClientError) => void;

const isChannelCallback = (callback: Function): callback is ChannelCallback => typeof callback === 'function';
const isDoneCallback = (callback: Function): callback is DoneCallback => typeof callback === 'function';
const isErrorCallback = (callback: Function): callback is ErrorCallback => typeof callback === 'function';

interface Handler {
  (event: 'channel', callback: ChannelCallback): Handle;
  (event: 'done', callback: DoneCallback): Handle;
  (event: 'error', callback: ErrorCallback): Handle;
}

const DEFAULT_RELAY_URL = 'https://relay.farcaster.xyz';
const DEFAULT_SIWE_URI = 'https://example.com/login';
const DEFAULT_TIMEOUT = 60000;
const DEFAULT_INTERVAL = 500;

export class FarcasterExtension extends Extension.Internal<'farcaster'> {
  name = 'farcaster' as const;
  config = {};

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
        if (event === 'channel') {
          (async () => {
            const { data } = await channelPromise;

            if (!isChannelCallback(callback)) return;

            callback(data);

            channel_token = data.channelToken;

            if (isMobile()) {
              console.info('Info: showUI parameter is ignored on mobile, open URL directly');
              window.open(data.url, '_blank');
              return;
            }

            requestPayload = this.utils.createJsonRpcRequestPayload(FarcasterPayloadMethod.FarcasterShowQR, [
              { data: { showUI, ...data } },
            ]);

            this.request(requestPayload);
          })();
        }
        if (event === EVENT.DONE) {
          (async () => {
            const { data } = await statusPromise;

            if (data.state !== 'completed') return;

            this.createIntermediaryEvent(
              FarcasterLoginEventEmit.SuccessSignIn,
              requestPayload.id as string,
            )({
              channel_token,
              message: data.message,
              signature: data.signature,
              fid: data.fid,
              username: data.username,
            });

            if (!isDoneCallback(callback)) return;

            callback(data);
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

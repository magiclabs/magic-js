import {Extension, FarcasterLoginEventEmit} from '@magic-sdk/commons';
import { FarcasterPayloadMethod } from './types';
import { isMainFrame, isMobile } from './utils';

const DEFAULT_SHOW_UI = true;

type LoginParams = {
  showUI: boolean;
};

const FarcasterLoginEventOnReceived = {
  OpenChannel: 'channel',
  Success: 'success',
  Failed: 'failed',
} as const;

interface CreateChannelAPIResponse {
  channelToken: string;
  url: string;
  nonce: string;
}

type Hex = `0x${string}`;

interface StatusAPIResponse {
  state: 'pending' | 'completed';
  nonce: string;
  url: string;
  message?: string;
  signature?: `0x${string}`;
  fid?: number;
  username?: string;
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
  verifications?: Hex[];
  custody?: Hex;
}

type AuthClientErrorCode =
  | 'unauthenticated'
  | 'unauthorized'
  | 'bad_request'
  | 'bad_request.validation_failure'
  | 'not_found'
  | 'not_implemented'
  | 'unavailable'
  | 'unknown';

interface AuthClientErrorOpts {
  message: string;
  cause: Error | AuthClientError;
  presentable: boolean;
}

declare class AuthClientError extends Error {
  readonly errCode: AuthClientErrorCode;
  readonly presentable: boolean;
  /**
   * @param errCode - the AuthClientError code for this message
   * @param context - a message, another Error, or a AuthClientErrorOpts
   */
  constructor(errCode: AuthClientErrorCode, context: Partial<AuthClientErrorOpts> | string | Error);
}

type FarcasterLoginEventHandlers = {
  [FarcasterLoginEventOnReceived.OpenChannel]: (channel: CreateChannelAPIResponse) => void;
  [FarcasterLoginEventOnReceived.Success]: (data: StatusAPIResponse) => void;
  [FarcasterLoginEventOnReceived.Failed]: (error: AuthClientError) => void;

  [FarcasterLoginEventEmit.Cancel]: () => void;
};

export class FarcasterExtension extends Extension.Internal<'farcaster'> {
  name = 'farcaster' as const;
  config = {};

  public login = (params?: LoginParams) => {
    const payload = this.utils.createJsonRpcRequestPayload(FarcasterPayloadMethod.FarcasterShowQR, [
      {
        data: {
          showUI: params?.showUI ?? DEFAULT_SHOW_UI,
          domain: window.location.host,
          siweUri: window.location.origin,
        },
      },
    ]);

    const handle = this.request<string, FarcasterLoginEventHandlers>(payload);

    handle.on('channel', (channel: CreateChannelAPIResponse) => {
      if (isMobile() && isMainFrame()) {
        window.location.href = channel.url;
      }
    });

    handle.on(FarcasterLoginEventEmit.Cancel, () => {
      this.createIntermediaryEvent(FarcasterLoginEventEmit.Cancel, payload.id as any)();
    });

    return handle;
  };
}

export { isMobile };

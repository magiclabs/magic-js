import { Extension } from '@magic-sdk/commons';
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
};

const FARCASTER_RELAY_URL = 'https://relay.farcaster.xyz';

export class FarcasterExtension extends Extension.Internal<'farcaster'> {
  name = 'farcaster' as const;
  config = {};
  channel: CreateChannelAPIResponse | null = null;

  constructor() {
    super();

    (async () => {
      this.channel = await fetch(`${FARCASTER_RELAY_URL}/v1/channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: window.location.host,
          siweUri: window.location.origin,
        }),
      }).then<CreateChannelAPIResponse>((r) => r.json());
    })();
  }

  public login = (params?: LoginParams) => {
    if (!this.channel) {
      throw new Error('Channel not created yet.');
    }

    const payload = this.utils.createJsonRpcRequestPayload(FarcasterPayloadMethod.FarcasterShowQR, [
      {
        data: {
          showUI: params?.showUI ?? DEFAULT_SHOW_UI,
          domain: window.location.origin,
          isMobile: isMobile(),
          channel: this.channel,
        },
      },
    ]);

    const handle = this.request<string, FarcasterLoginEventHandlers>(payload);

    if (isMobile() && isMainFrame()) {
      window.location.href = this.channel.url;
    }

    return handle;
  };
}

export { isMobile };

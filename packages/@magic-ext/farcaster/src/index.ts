import { Extension } from '@magic-sdk/commons';
import type { CreateChannelAPIResponse, AuthenticateAPIResponse, AuthClientError } from '@farcaster/auth-client';
import { createAppClient, viemConnector } from '@farcaster/auth-client';
import { FarcasterPayloadMethod } from './types';
import { isMobile } from './utils';

const DEFAULT_SHOW_UI = true;

type LoginParams = {
  showUI: boolean;
};

const FarcasterLoginEventOnReceived = {
  OpenChannel: 'channel',
  Success: 'success',
  Failed: 'failed',
} as const;

type FarcasterLoginEventHandlers = {
  [FarcasterLoginEventOnReceived.OpenChannel]: (channel: CreateChannelAPIResponse) => void;
  [FarcasterLoginEventOnReceived.Success]: (data: AuthenticateAPIResponse) => void;
  [FarcasterLoginEventOnReceived.Failed]: (error: AuthClientError) => void;
};

export class FarcasterExtension extends Extension.Internal<'farcaster'> {
  name = 'farcaster' as const;
  config = {};
  appClient = createAppClient({ ethereum: viemConnector() });
  channel: CreateChannelAPIResponse | null = null;

  constructor() {
    super();
    if (isMobile()) {
      this.appClient
        .createChannel({
          siweUri: `${location.origin}/login`,
          domain: location.host,
        })
        .then(({ data }) => {
          this.channel = data;
        });
    }
  }

  public login = (params?: LoginParams) => {
    const showUI = params?.showUI ?? DEFAULT_SHOW_UI;

    const domain = location.origin;

    const payload = this.utils.createJsonRpcRequestPayload(FarcasterPayloadMethod.FarcasterShowQR, [
      { data: { showUI, domain, channel: this.channel, isMobile: isMobile() } },
    ]);

    const handle = this.request<void, FarcasterLoginEventHandlers>(payload);

    if (isMobile()) {
      if (this.channel) {
        location.href = this.channel.url;
      } else {
        return handle;
      }
    }

    return handle;
  };
}

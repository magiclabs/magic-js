import { Extension } from '@magic-sdk/provider';
import { SiweMessage } from 'siwe';
import { SiwePayloadMethod, SiweGenerateNonceParams, SiweGenerateMessageParams, SiweLoginParams } from './types';

export class SiweExtension extends Extension.Internal<'siwe'> {
  name = 'siwe' as const;
  config = {};

  constructor() {
    super();
  }

  public async generateNonce(params?: SiweGenerateNonceParams): Promise<string> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(SiwePayloadMethod.GenerateNonce, [params]);
    return this.request<string>(requestPayload);
  }

  public async generateMessage(params: SiweGenerateMessageParams): Promise<string> {
    const nonce = await this.generateNonce({ address: params.address });

    const siweMessage = new SiweMessage({
      scheme: window.location.protocol.slice(0, -1),
      domain: window.location.host,
      address: params.address,
      statement: params.statement || 'By signing, you are proving you own this wallet and logging in.',
      uri: window.location.origin,
      version: '1',
      chainId: params.chainId || 1,
      nonce,
    });

    return siweMessage.prepareMessage();
  }

  public async login(params: SiweLoginParams): Promise<string> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(SiwePayloadMethod.Login, [params]);
    return this.request<string>(requestPayload);
  }
}

export * from './types';

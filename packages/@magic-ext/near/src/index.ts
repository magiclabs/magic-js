import { Extension } from '@magic-sdk/commons';
import { NearPayloadMethod, NearConfig } from './types';

export class NearExtension extends Extension.Internal<'near', any> {
  name = 'near' as const;
  config: any = {};

  constructor(public nearConfig: NearConfig) {
    super();

    this.config = {
      rpcUrl: nearConfig.rpcUrl,
      chainType: 'NEAR',
    };
  }

  public async signTransaction(params: any) {
    return this.request(this.utils.createJsonRpcRequestPayload(NearPayloadMethod.NearSignTransaction, params));
  }

  public async getPublicKey() {
    return this.request(this.utils.createJsonRpcRequestPayload(NearPayloadMethod.NearGetPublicKey, []));
  }
}

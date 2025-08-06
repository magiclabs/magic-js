import { MultichainExtension } from '@magic-sdk/commons';
import { NearPayloadMethod, NearConfig } from './types';

export class NearExtension extends MultichainExtension<'near'> {
  name = 'near' as const;

  constructor(public nearConfig: NearConfig) {
    super(
      {
        rpcUrl: nearConfig.rpcUrl,
        chainType: 'NEAR',
      },
      'NEAR',
    );
  }

  public async signTransaction(params: any) {
    return this.request(this.utils.createJsonRpcRequestPayload(NearPayloadMethod.NearSignTransaction, params));
  }

  public async getPublicKey() {
    return this.request(this.utils.createJsonRpcRequestPayload(NearPayloadMethod.NearGetPublicKey, []));
  }
}

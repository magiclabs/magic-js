import { MultichainExtension } from '@magic-sdk/commons';
import { TerraPayloadMethod, TerraConfig } from './types';

export class TerraExtension extends MultichainExtension<'terra'> {
  name = 'terra' as const;

  constructor(public terraConfig: TerraConfig) {
    super({
      rpcUrl: terraConfig.rpcUrl,
      chainType: 'TERRA',
    });
  }

  public async getPublicKey() {
    return this.request(this.utils.createJsonRpcRequestPayload(TerraPayloadMethod.TerraGetPublicKey, []));
  }

  public async sign(payload: Buffer): Promise<Buffer> {
    return this.request(this.utils.createJsonRpcRequestPayload(TerraPayloadMethod.TerraSign, [payload]));
  }
}

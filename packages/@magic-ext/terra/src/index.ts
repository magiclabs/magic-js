import { MagicExtension } from '@magic-sdk/commons';
import { TerraPayloadMethod, TerraConfig } from './types';

export class TerraExtension extends MagicExtension<'terra', any> {
  name = 'terra' as const;
  config: any = {};

  constructor(public terraConfig: TerraConfig) {
    super();

    this.config = {
      rpcUrl: terraConfig.rpcUrl,
    };
  }

  public async getPublicKey() {
    return this.request(this.utils.createJsonRpcRequestPayload(TerraPayloadMethod.TerraGetPublicKey, []));
  }

  public async sign(payload: Buffer): Promise<Buffer> {
    return this.request(this.utils.createJsonRpcRequestPayload(TerraPayloadMethod.TerraSign, [payload]));
  }
}

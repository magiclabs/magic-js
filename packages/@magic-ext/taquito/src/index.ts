import { Extension } from '@magic-sdk/commons';
import { TaquitoConfig, TaquitoPayloadMethod } from './type';
import { MagicSigner } from './MagicSinger';

export class TaquitoExtension extends Extension.Internal<'taquito', any> {
  name = 'taquito' as const;
  config: any = {};

  constructor(public taquitoConfig: TaquitoConfig) {
    super();

    this.config = {
      rpcUrl: taquitoConfig.rpcUrl,
    };
  }

  public async getPublicKey() {
    return this.request(this.utils.createJsonRpcRequestPayload(TaquitoPayloadMethod.TaquitpGetPublicKeyAndHash, []));
  }

  public async sign(bytes: string, watermark?: Uint8Array): Promise<Buffer> {
    return this.request(
      this.utils.createJsonRpcRequestPayload(TaquitoPayloadMethod.TaquitoSign, [
        {
          bytes,
          watermark,
        },
      ]),
    );
  }

  public async createMagicSigner(): Promise<any> {
    const { pk, pkh } = await this.getPublicKey();
    return new MagicSigner(pkh, pk, this);
  }
}

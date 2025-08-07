import { MultichainExtension } from '@magic-sdk/commons';
import { TaquitoConfig, TaquitoPayloadMethod } from './type';
import { MagicSigner } from './MagicSigner';

export class TaquitoExtension extends MultichainExtension<'taquito'> {
  name = 'taquito' as const;

  constructor(public taquitoConfig: TaquitoConfig) {
    super(
      {
        rpcUrl: taquitoConfig.rpcUrl,
        chainType: 'TAQUITO',
      },
      'TAQUITO',
    );
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

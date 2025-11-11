import { Signer } from './SignerInterface';
import { TaquitoPayloadMethod } from './type';

export class MagicSigner implements Signer {
  private magic: any;
  constructor(private pkh: string, private pK: string, magic: any) {
    this.magic = magic;
  }

  async publicKeyHash(): Promise<string> {
    return this.pkh;
  }

  async publicKey(): Promise<string> {
    return this.pK;
  }

  async secretKey(): Promise<string> {
    throw new Error('Secret key cannot be exposed');
  }

  async sign(
    bytes: string,
    watermark?: Uint8Array,
  ): Promise<{
    bytes: string;
    sig: string;
    prefixSig: string;
    sbytes: string;
  }> {
    return this.magic.request(
      this.magic.utils.createJsonRpcRequestPayload(TaquitoPayloadMethod.TaquitoSign, [
        {
          bytes,
          watermark,
        },
      ]),
    );
  }
}

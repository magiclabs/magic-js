import { MultichainExtension } from '@magic-sdk/commons';
import { HederaConfig, HederaPayloadMethod } from './types';

export * from './utils';

export class HederaExtension extends MultichainExtension<'hedera'> {
  name = 'hedera' as const;
  network: string;

  constructor(public hederaConfig: HederaConfig) {
    super({
      chainType: 'HEDERA',
      options: { network: hederaConfig.network },
    });
    this.network = hederaConfig.network;
  }

  public async getPublicKey() {
    return this.request(this.utils.createJsonRpcRequestPayload(HederaPayloadMethod.HederaGetPublicKey, []));
  }

  public async sign(message: Uint8Array) {
    return this.request(this.utils.createJsonRpcRequestPayload(HederaPayloadMethod.HederaSign, [{ message }]));
  }
}

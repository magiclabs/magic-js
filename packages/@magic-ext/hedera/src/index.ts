import { Extension } from '@magic-sdk/commons';
import { HederaConfig, HederaPayloadMethod } from './types';

export * from './utils';

export class HederaExtension extends Extension.Internal<'hedera', any> {
  name = 'hedera' as const;
  config: any = {};
  network: string;

  constructor(public hederaConfig: HederaConfig) {
    super();

    this.network = hederaConfig.network;
    this.config = {
      chainType: 'HEDERA',
      options: {
        network: hederaConfig.network,
      },
    };
  }

  public async getPublicKey() {
    return this.request(this.utils.createJsonRpcRequestPayload(HederaPayloadMethod.HederaGetPublicKey, []));
  }

  public async sign(message: Uint8Array) {
    return this.request(this.utils.createJsonRpcRequestPayload(HederaPayloadMethod.HederaSign, [{ message }]));
  }
}

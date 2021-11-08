import { Extension } from '@magic-sdk/commons';
import { CeloConfig, CeloPayloadMethod } from './types';

export class CeloExtension extends Extension.Internal<'celo', any> {
  name = 'celo' as const;
  config: any = {};

  constructor(public celoConfig: CeloConfig) {
    super();

    this.config = {
      rpcUrl: celoConfig.rpcUrl,
      chainType: 'CELO',
    };
  }

  public sendTransaction = async (params: any) => {
    return this.request(this.utils.createJsonRpcRequestPayload(CeloPayloadMethod.CeloSendTransaction, params));
  };
}

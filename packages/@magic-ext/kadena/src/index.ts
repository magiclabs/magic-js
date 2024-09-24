import { Extension } from '@magic-sdk/commons';
import { KadenaConfig, KadenaPayloadMethod, KadenaSignTransactionResponse } from './types';

export class KadenaExtension extends Extension.Internal<'kadena'> {
  name = 'kadena' as const;
  config = {};
  rpcUrl: string;
  chainId: string;

  constructor(public kadenaConfig: KadenaConfig) {
    super();

    this.rpcUrl = kadenaConfig.rpcUrl;
    this.chainId = kadenaConfig.chainId;
    this.config = {
      chainType: 'KADENA',
    };
  }

  public async signTransaction(hash: string): Promise<KadenaSignTransactionResponse> {
    return this.request(this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaSignTransaction, [{ hash }]));
  }
}

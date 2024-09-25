import { Extension } from '@magic-sdk/commons';
import { ChainId, KadenaConfig, KadenaPayloadMethod, KadenaSignTransactionResponse } from './types';

export class KadenaExtension extends Extension.Internal<'kadena'> {
  name = 'kadena' as const;
  config = {};
  rpcUrl: string;
  chainId: ChainId;

  constructor(public kadenaConfig: KadenaConfig) {
    super();

    this.rpcUrl = kadenaConfig.rpcUrl;
    this.chainId = kadenaConfig.chainId;
    this.config = {
      chainType: 'KADENA',
    };
  }

  public signTransaction(hash: string): Promise<KadenaSignTransactionResponse> {
    return this.request(this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaSignTransaction, [{ hash }]));
  }
}

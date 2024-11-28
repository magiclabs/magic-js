import { Extension } from '@magic-sdk/commons';
import { KadenaConfig, KadenaPayloadMethod, KadenaSignTransactionResponse } from './types';

export class KadenaExtension extends Extension.Internal<'kadena'> {
  name = 'kadena' as const;
  config = {};

  constructor(public kadenaConfig: KadenaConfig) {
    super();

    this.config = {
      chainType: 'KADENA',
      rpcUrl: kadenaConfig.rpcUrl,
      chainId: kadenaConfig.chainId,
      options: {
        network: kadenaConfig.network,
        networkId: kadenaConfig.networkId,
        createAccountsOnChain: Boolean(kadenaConfig.createAccountsOnChain),
      },
    };
  }

  public signTransaction(hash: string): Promise<KadenaSignTransactionResponse> {
    return this.request(this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaSignTransaction, [{ hash }]));
  }
}

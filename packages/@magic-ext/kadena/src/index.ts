import { Extension } from '@magic-sdk/commons';
import { KadenaConfig, KadenaPayloadMethod } from './types';

export class KadenaExtension extends Extension.Internal<'kadena', any> {
  name = 'kadena' as const;
  config: any = {};
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

  public async signTransaction(hash: string): Promise<any> {
    return this.request(this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaSignTransaction, [{ hash }]));
  }
}

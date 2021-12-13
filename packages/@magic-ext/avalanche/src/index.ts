import { Extension } from '@magic-sdk/commons';
import { AvaxConfig } from './types';

export class AvalancheExtension extends Extension.Internal<'avax', any> {
  name = 'avax' as const;
  config: any = {};

  constructor(public avalancheConfig: AvaxConfig) {
    super();

    this.config = {
      rpcUrl: avalancheConfig.rpcUrl,
      chainType: 'AVAX',
      options: {
        chainId: avalancheConfig.chainId,
        networkId: avalancheConfig.networkId,
      },
    };
  }

  public signTransaction = (
    sendAmount: number,
    assetId: string,
    toAddresses: Array<string>,
    fromAddresses: Array<string>,
    changeAddresses: Array<string>,
  ) => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'ava_signTransaction',
      params: {
        sendAmount,
        assetId,
        toAddresses,
        fromAddresses,
        changeAddresses,
      },
    });
  };
}

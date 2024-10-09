import { Extension } from '@magic-sdk/commons';
import { CosmosConfig, CosmosPayloadMethod } from './type';

export class CosmosExtension extends Extension.Internal<'cosmos', any> {
  name = 'cosmos' as const;
  config: any = {};

  constructor(public cosmosConfig: CosmosConfig) {
    super();

    this.config = {
      rpcUrl: cosmosConfig.rpcUrl,
      chainType: 'COSMOS',
      options: {
        chain: cosmosConfig.chain,
      },
    };
  }

  public signAndBroadcast = async (message: any, fee: any) => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: CosmosPayloadMethod.SignAndBroadcast,
      params: { message, fee },
    });
  };

  public sign = async (message: any, fee: any) => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: CosmosPayloadMethod.Sign,
      params: { message, fee },
    });
  };

  public signTypedData = (message: string) => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: CosmosPayloadMethod.SignTypedData,
      params: { message },
    });
  };

  public sendTokens = async (
    recipientAddress: string,
    transferAmount: string | number,
    denom: string,
    memo?: string,
  ) => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: CosmosPayloadMethod.SendTokens,
      params: { recipientAddress, transferAmount, denom, memo },
    });
  };

  public changeAddress = async (prefix: string) => {
    return this.request({
      id: 41,
      jsonrpc: '2.0',
      method: CosmosPayloadMethod.ChangeAddress,
      params: { prefix },
    });
  };
}

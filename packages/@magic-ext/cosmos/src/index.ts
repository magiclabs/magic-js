import { MultichainExtension } from '@magic-sdk/provider';
import { CosmosConfig, CosmosPayloadMethod } from './type';

export class CosmosExtension extends MultichainExtension<'cosmos'> {
  name = 'cosmos' as const;

  constructor(public cosmosConfig: CosmosConfig) {
    super({
      rpcUrl: cosmosConfig.rpcUrl,
      chainType: 'COSMOS',
      options: {
        chain: cosmosConfig.chain,
      },
    });
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

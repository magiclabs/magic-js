import { MultichainExtension } from '@magic-sdk/provider';
import { PolkadotConfig } from './type';

export class PolkadotExtension extends MultichainExtension<'polkadot'> {
  name = 'polkadot' as const;

  constructor(public polkadotConfig: PolkadotConfig) {
    super({
      rpcUrl: polkadotConfig.rpcUrl,
      chainType: 'POLKADOT',
    });
  }

  public sendTransaction = (to: string, value: number): Promise<string> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'pdt_sendTransaction',
      params: { to, value },
    });
  };

  public contractCall = (contractAddress: string, value: number, maxGas: number, data: any): Promise<string> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'pdt_contractCall',
      params: { contractAddress, value, maxGas, data },
    });
  };

  public getAccount = (): Promise<string> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'pdt_getAccount',
      params: [],
    });
  };
}

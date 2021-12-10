import { Extension } from '@magic-sdk/commons';
import { PolkadotConfig, ConfigType } from './type';

export class PolkadotExtension extends Extension.Internal<'polkadot', PolkadotConfig> {
  name = 'polkadot' as const;

  config: ConfigType;

  constructor(public polkadotConfig: PolkadotConfig) {
    super();

    this.config = {
      rpcUrl: polkadotConfig.rpcUrl,
      chainType: 'POLKADOT',
    };
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

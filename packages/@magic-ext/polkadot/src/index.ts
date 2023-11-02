import { Extension } from '@magic-sdk/provider';
import type { ConfigType, PolkadotConfig } from './type';
import { POLKADOT_METHODS } from './type';

export { MagicSigner } from './magic-signer';

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
      method: POLKADOT_METHODS.SEND_TRANSACTION,
      params: { to, value },
    });
  };

  public contractCall = (contractAddress: string, value: number, maxGas: number, data: any): Promise<string> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: POLKADOT_METHODS.CONTRACT_CALL,
      params: { contractAddress, value, maxGas, data },
    });
  };

  public getAccount = (): Promise<string> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: POLKADOT_METHODS.GET_ACCOUNT,
      params: [],
    });
  };
}

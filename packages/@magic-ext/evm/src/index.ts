import { Extension } from '@magic-sdk/commons';
import { EVMNetworkConfig, EVMPayloadMethod } from './types';

export class EVMExtension extends Extension.Internal<'evm', any> {
  name = 'evm' as const;
  config: any = {};

  constructor(public evmConfig: EVMNetworkConfig[]) {
    super();

    this.config = {
      networks: evmConfig,
    };
  }

  public switchEVMChain = (chainId: number) => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: EVMPayloadMethod.SwitchEVMChain,
      params: {
        chainId,
      },
    });
  };
}

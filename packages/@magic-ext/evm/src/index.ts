import { Extension } from '@magic-sdk/provider';
import { EVMNetworkConfig, EVMPayloadMethod, SwitchEVMChainResult } from './types';

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
    return this.request<string | SwitchEVMChainResult>(
      this.utils.createJsonRpcRequestPayload(EVMPayloadMethod.SwitchEVMChain, [chainId]),
    );
  };
}

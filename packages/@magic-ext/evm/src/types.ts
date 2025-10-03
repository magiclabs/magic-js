import { CustomNodeConfiguration } from '@magic-sdk/types';

export enum EVMPayloadMethod {
  SwitchEVMChain = 'evm_switchChain',
}

export interface EVMNetworkConfig extends CustomNodeConfiguration {
  default?: boolean;
}

export interface SwitchEVMChainResult {
  rpcUrl: string;
  chainId?: number;
  chainType?: string;
}

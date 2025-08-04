import { CustomNodeConfiguration } from 'magic-sdk';

export enum EVMPayloadMethod {
  SwitchEVMChain = 'evm_switchChain',
}

export interface EVMNetworkConfig extends CustomNodeConfiguration {
  default?: boolean;
}

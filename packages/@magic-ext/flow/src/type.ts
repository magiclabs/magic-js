export interface FlowConfig {
  rpcUrl: string;
  network: string;
}

export interface ConfigType {
  rpcUrl: string;
  chainType: string;
}

export enum FlowPayloadMethod {
  FlowGetAccount = 'flow_getAccount',
}

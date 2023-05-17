export interface AptosConfig {
  nodeUrl: string;
  rpcUrl?: string;
  network?: string;
}

export interface ConfigType {
  rpcUrl: string;
  nodeUrl: string;
  network: string;
  chainType: string;
}

export enum AptosPayloadMethod {
  AptosGetAccount = 'aptos_getAccount',
}

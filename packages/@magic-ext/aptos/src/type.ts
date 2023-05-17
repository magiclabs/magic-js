export interface AptosConfig {
  nodeUrl: string;
  rpcUrl?: string;
  network?: string;
  chainId?: number;
}

export interface ConfigType {
  rpcUrl: string;
  nodeUrl: string;
  network: string;
  chainType: string;
  chainId: number;
}

export enum AptosPayloadMethod {
  AptosGetAccount = 'aptos_getAccount',
}

export interface AptosConfig {
  nodeUrl: string;
}

export interface ConfigType {
  nodeUrl: string;
  chainType: string;
}

export enum AptosPayloadMethod {
  AptosGetAccount = 'aptos_getAccount',
}

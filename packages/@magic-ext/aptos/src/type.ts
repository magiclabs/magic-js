export interface AptosConfig {
  nodeUrl: string;
}

export enum AptosPayloadMethod {
  AptosGetAccount = 'aptos_getAccount',
  AptosSignTransaction = 'aptos_signTransaction',
}

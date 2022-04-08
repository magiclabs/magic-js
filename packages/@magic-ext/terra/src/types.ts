export enum TerraPayloadMethod {
  TerraSign = 'terra_sign',
  TerraGetPublicKey = 'terra_getPublicKey',
}

export interface TerraConfig {
  rpcUrl?: string;
}

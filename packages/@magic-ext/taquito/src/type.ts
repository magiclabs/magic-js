export interface TaquitoConfig {
  rpcUrl: string;
}

export enum TaquitoPayloadMethod {
  TaquitoSign = 'taquito_sign',
  TaquitpGetPublicKeyAndHash = 'taquito_getPublicKeyAndHash',
}

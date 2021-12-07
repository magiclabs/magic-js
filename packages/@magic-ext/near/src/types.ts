export enum NearPayloadMethod {
  NearSignTransaction = 'near_signTransaction',
  NearGetPublicKey = 'near_getPublicKey',
}

export interface NearConfig {
  rpcUrl: string;
}

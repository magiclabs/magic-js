export interface ConfluxConfig {
  rpcUrl: string;
  chainId: number;
  defaultGasPrice?: number;
  defaultGasRatio?: number;
  defaultStorageRatio?: number;
}

export enum ConfluxPayloadMethod {
  ConfluxSendTransaction = 'cfx_sendTransaction',
}

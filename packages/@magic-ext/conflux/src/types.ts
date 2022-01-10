export interface ConfluxConfig {
  rpcUrl: string;
  chainId: number;
}

export enum ConfluxPayloadMethod {
  ConfluxSendTransaction = 'cfx_sendTransaction',
}

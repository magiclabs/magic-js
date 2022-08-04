export interface ConfluxConfig {
  rpcUrl: string;
  networkId?: number;
}

export enum ConfluxPayloadMethod {
  ConfluxSendTransaction = 'cfx_sendTransaction',
}

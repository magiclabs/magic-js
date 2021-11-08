export enum CeloPayloadMethod {
  CeloSendTransaction = 'celo_signTransaction',
}

export interface CeloConfig {
  rpcUrl: string;
}

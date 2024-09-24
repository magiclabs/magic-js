export interface KadenaConfig {
  rpcUrl: string;
  chainId: string;
}

export enum KadenaPayloadMethod {
  KadenaSignTransaction = 'kda_signTransaction',
}

export interface KadenaSignTransactionResponse {
  sig: string;
  pubKey: string;
}

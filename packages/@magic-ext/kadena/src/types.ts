export interface KadenaConfig {
  rpcUrl: string;
  chainId: ChainId;
  network: 'testnet' | 'mainnet';
  networkId: string;
  createAccountsOnChain?: boolean;
}

export enum KadenaPayloadMethod {
  KadenaSignTransaction = 'kda_signTransaction',
}

export interface KadenaSignTransactionResponse {
  sig: string;
  pubKey: string;
}

export type ChainId =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16'
  | '17'
  | '18'
  | '19';

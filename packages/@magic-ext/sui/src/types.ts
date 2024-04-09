export enum SuiPayloadMethod {
  SuiSignAndSendTransaction = 'sui_signAndSendTransaction',
}

export interface SuiConfig {
  rpcUrl?: string;
  network?: 'testnet' | 'devnet' | 'mainnet';
}

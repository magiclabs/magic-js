export enum SuiPayloadMethod {
  SuiSignAndSendTransaction = 'sui_signAndSendTransaction',
}

export interface SuiConfig {
  rpcUrl: 'testnet' | 'devnet' | 'mainnet' | string;
}

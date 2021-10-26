export interface BitcoinConfig {
  rpcUrl: string;
  network: string;
}

export enum BitcoinPayloadMethod {
  BitcoinSignTransaction = 'btc_signTransaction',
}

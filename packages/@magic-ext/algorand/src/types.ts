export interface AlgorandConfig {
  rpcUrl: string;
}

export interface ConfigType {
  rpcUrl: string;
  chainType: string;
}

export enum AlgorandPayloadMethod {
  AlgorandSignTransaction = 'algod_signTransaction',
  AlgorandSignBid = 'algod_signBid',
  AlgorandGetWallet = 'algod_getWallet',
  AlgorandSignGroupTransaction = 'algod_signGroupTransaction',
  AlgorandSignGroupTransactionV2 = 'algod_signGroupTransactionV2',
}

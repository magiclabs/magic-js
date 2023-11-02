export interface PolkadotConfig {
  rpcUrl: string;
}

export interface ConfigType {
  rpcUrl: string;
  chainType: string;
}

export const POLKADOT_METHODS = {
  SIGN: 'pdt_sign',
  SEND_TRANSACTION: 'pdt_sendTransaction',
  CONTRACT_CALL: 'pdt_contractCall',
  GET_ACCOUNT: 'pdt_getAccount',
} as const;

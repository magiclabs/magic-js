export enum ChainType {
  Harmony = 'HARMONY',
}

export type EthNetworkConfiguration =
  | string
  | { rpcUrl: string; chainId?: number }
  | { rpcUrl: string; chainId?: number; chainType: ChainType };

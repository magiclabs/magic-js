export enum ChainType {
  Harmony = 'HARMONY',
}

export type EthNetworkName = 'mainnet' | 'rinkeby' | 'ropsten' | 'kovan';

export interface CustomNodeConfiguration {
  rpcUrl: string;
  chainId?: number;
  chainType?: ChainType;
}

export type EthNetworkConfiguration = EthNetworkName | CustomNodeConfiguration;

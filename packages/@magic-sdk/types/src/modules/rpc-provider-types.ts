export type EthNetworkName = 'mainnet' | 'goerli';

export enum EthChainType {
  Harmony = 'HARMONY',
}

export interface CustomNodeConfiguration {
  rpcUrl: string;
  chainId?: number;
  chainType?: EthChainType;
}

export type EthNetworkConfiguration = EthNetworkName | CustomNodeConfiguration;

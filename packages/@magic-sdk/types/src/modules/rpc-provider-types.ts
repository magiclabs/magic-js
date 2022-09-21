// add goerli support
export type EthNetworkName = 'mainnet' | 'goerli' | 'rinkeby' | 'ropsten' | 'kovan';

export enum EthChainType {
  Harmony = 'HARMONY',
}

export interface CustomNodeConfiguration {
  rpcUrl: string;
  chainId?: number;
  chainType?: EthChainType;
}

export type EthNetworkConfiguration = EthNetworkName | CustomNodeConfiguration;

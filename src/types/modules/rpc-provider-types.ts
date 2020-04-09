export type EthNetworkName = 'mainnet' | 'rinkeby' | 'ropsten' | 'kovan';

export interface CustomNodeConfiguration {
  rpcUrl: string;
  chainId?: number;
}

export type EthNetworkConfiguration = EthNetworkName | CustomNodeConfiguration;

export type EthNetworkName = 'mainnet' | 'goerli' | 'sepolia';

export enum EthChainType {
  Harmony = 'HARMONY',
}

export interface CustomNodeConfiguration {
  rpcUrl: string;
  chainId?: number;
  chainType?: EthChainType;
}

export type NetworkConfigurationItem = EthNetworkName | CustomNodeConfiguration;

export type EthNetworkConfiguration = NetworkConfigurationItem | NetworkConfigurationItem[];

export type ProviderEnableEvents = {
  'id-token-created': (params: { idToken: string }) => void;
};

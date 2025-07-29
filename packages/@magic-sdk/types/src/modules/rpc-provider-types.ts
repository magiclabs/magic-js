export type EthNetworkName = 'mainnet' | 'goerli' | 'sepolia';

export enum EthChainType {
  Harmony = 'HARMONY',
}

export interface CustomNodeConfiguration {
  rpcUrl: string;
  chainId?: number;
  chainType?: EthChainType;
}

type EthNetworkConfigurationItem = EthNetworkName | CustomNodeConfiguration;

export type EthNetworkConfiguration = EthNetworkConfigurationItem | EthNetworkConfigurationItem[];

export type ProviderEnableEvents = {
  'id-token-created': (params: { idToken: string }) => void;
};

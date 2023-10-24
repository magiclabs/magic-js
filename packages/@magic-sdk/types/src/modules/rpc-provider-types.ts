export type EthNetworkName = 'mainnet' | 'goerli' | 'sepolia';

export enum EthChainType {
  Harmony = 'HARMONY',
}

export interface CustomNodeConfiguration {
  rpcUrl: string;
  chainId?: number;
  chainType?: EthChainType;
}

export type EthNetworkConfiguration = EthNetworkName | CustomNodeConfiguration;

export type ProviderEnableEvents = {
  'id-token-created': (params: { idToken: string }) => void;
};

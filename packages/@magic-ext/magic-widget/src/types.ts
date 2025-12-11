import { ComponentType } from 'react';

export enum ThirdPartyWallets {
  METAMASK = 'metamask',
  WALLETCONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  PHANTOM = 'phantom',
  RABBY = 'rabby',
}

export interface ProviderMetadata {
  displayName: string;
  Icon: ComponentType<{ width?: number; height?: number; className?: string }>;
}

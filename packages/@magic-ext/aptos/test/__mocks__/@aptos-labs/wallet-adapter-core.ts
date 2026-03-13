// Mock for @aptos-labs/wallet-adapter-core
export enum NetworkName {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  Devnet = 'devnet',
}

export enum WalletReadyState {
  Installed = 'Installed',
  NotDetected = 'NotDetected',
  Loadable = 'Loadable',
  Unsupported = 'Unsupported',
}

export interface AccountInfo {
  address: string;
  publicKey: string | string[];
  minKeysRequired?: number;
  ansName?: string | null;
}

export interface NetworkInfo {
  name: NetworkName;
  chainId?: number;
  url?: string;
}

export interface WalletInfo {
  name: string;
  icon: string;
  url: string;
}

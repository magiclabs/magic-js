// Store for WalletConnect Ethereum provider
// Used to access the provider for SIWE signing when not using wagmi connector
import type { EthereumProvider } from '@walletconnect/ethereum-provider';

let walletConnectProvider: Awaited<ReturnType<typeof EthereumProvider.init>> | null = null;

export function setWalletConnectProvider(provider: Awaited<ReturnType<typeof EthereumProvider.init>> | null) {
  walletConnectProvider = provider;
}

export function getWalletConnectProvider(): Awaited<ReturnType<typeof EthereumProvider.init>> | null {
  return walletConnectProvider;
}

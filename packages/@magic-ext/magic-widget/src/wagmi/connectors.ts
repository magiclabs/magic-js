import { ThirdPartyWallet, ThirdPartyWallets } from '../types';

/**
 * Map wallet types to wagmi connector IDs
 */
export const CONNECTOR_IDS: Record<ThirdPartyWallet, string> = {
  [ThirdPartyWallets.METAMASK]: 'metaMaskSDK',
  [ThirdPartyWallets.COINBASE]: 'coinbaseWalletSDK',
  [ThirdPartyWallets.WALLETCONNECT]: 'walletConnect',
  [ThirdPartyWallets.PHANTOM]: 'app.phantom',
  [ThirdPartyWallets.RABBY]: 'io.rabby',
};

/**
 * Alternative names to match connectors by name if ID doesn't match
 */
export const CONNECTOR_NAME_PATTERNS: Record<ThirdPartyWallet, string> = {
  [ThirdPartyWallets.METAMASK]: 'metamask',
  [ThirdPartyWallets.COINBASE]: 'coinbase',
  [ThirdPartyWallets.WALLETCONNECT]: 'walletconnect',
  [ThirdPartyWallets.PHANTOM]: 'phantom',
  [ThirdPartyWallets.RABBY]: 'rabby',
};

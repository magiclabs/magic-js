import { ThirdPartyWallets } from '../types';

/**
 * Map ThirdPartyWallets enum to wagmi connector IDs
 */
export const CONNECTOR_IDS: Record<ThirdPartyWallets, string> = {
  [ThirdPartyWallets.METAMASK]: 'metaMaskSDK',
  [ThirdPartyWallets.COINBASE]: 'coinbaseWalletSDK',
  [ThirdPartyWallets.WALLETCONNECT]: 'walletConnect',
  [ThirdPartyWallets.PHANTOM]: 'phantom', // TODO: verify connector ID
  [ThirdPartyWallets.RABBY]: 'rabby', // TODO: verify connector ID
};

/**
 * Alternative names to match connectors by name if ID doesn't match
 */
export const CONNECTOR_NAME_PATTERNS: Record<ThirdPartyWallets, string> = {
  [ThirdPartyWallets.METAMASK]: 'metamask',
  [ThirdPartyWallets.COINBASE]: 'coinbase',
  [ThirdPartyWallets.WALLETCONNECT]: 'walletconnect',
  [ThirdPartyWallets.PHANTOM]: 'phantom',
  [ThirdPartyWallets.RABBY]: 'rabby',
};


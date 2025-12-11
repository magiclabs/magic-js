import { ProviderMetadata, ThirdPartyWallets } from './types';
import { LogoWalletConnect, WltMetamask, WltCoinbase, WltPhantom, WltRabby } from '@magiclabs/ui-components';

export const WALLET_METADATA: Record<ThirdPartyWallets, ProviderMetadata> = {
  [ThirdPartyWallets.WALLETCONNECT]: { displayName: 'WalletConnect', Icon: LogoWalletConnect },
  [ThirdPartyWallets.METAMASK]: { displayName: 'MetaMask', Icon: WltMetamask },
  [ThirdPartyWallets.COINBASE]: { displayName: 'Coinbase Wallet', Icon: WltCoinbase },
  [ThirdPartyWallets.PHANTOM]: { displayName: 'Phantom', Icon: WltPhantom },
  [ThirdPartyWallets.RABBY]: { displayName: 'Rabby', Icon: WltRabby },
};

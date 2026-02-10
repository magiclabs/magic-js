import { OAuthProvider, ProviderMetadata, ThirdPartyWallet, ThirdPartyWallets } from './types';
import {
  LogoWalletConnect,
  WltMetamask,
  WltCoinbase,
  WltPhantom,
  WltRabby,
  LogoDiscord,
  LogoBitBucket,
  LogoTwitch,
  LogoTwitter,
  LogoApple,
  LogoFacebook,
  LogoGitHub,
  LogoLinkedIn,
  LogoMicrosoft,
  LogoGitLab,
  LogoGoogle,
  LogoTelegram,
  LogoAppleMono,
  LogoTwitterMono,
  LogoGitHubMono,
  LogoWarpcast,
} from '@magiclabs/ui-components';

export const WALLET_METADATA: Record<ThirdPartyWallet, ProviderMetadata> = {
  [ThirdPartyWallets.WALLETCONNECT]: { displayName: 'WalletConnect', Icon: LogoWalletConnect },
  [ThirdPartyWallets.METAMASK]: { displayName: 'MetaMask', Icon: WltMetamask },
  [ThirdPartyWallets.COINBASE]: { displayName: 'Coinbase Wallet', Icon: WltCoinbase },
  [ThirdPartyWallets.PHANTOM]: { displayName: 'Phantom', Icon: WltPhantom },
  [ThirdPartyWallets.RABBY]: { displayName: 'Rabby', Icon: WltRabby },
};

export const OAUTH_METADATA: Record<OAuthProvider, ProviderMetadata> = {
  [OAuthProvider.GOOGLE]: { displayName: 'Google', Icon: LogoGoogle },
  [OAuthProvider.APPLE]: { displayName: 'Apple', Icon: LogoApple },
  [OAuthProvider.FACEBOOK]: { displayName: 'Facebook', Icon: LogoFacebook },
  [OAuthProvider.GITHUB]: { displayName: 'GitHub', Icon: LogoGitHub },
  [OAuthProvider.TWITTER]: { displayName: 'Twitter', Icon: LogoTwitter },
  [OAuthProvider.LINKEDIN]: { displayName: 'LinkedIn', Icon: LogoLinkedIn },
  [OAuthProvider.MICROSOFT]: { displayName: 'Microsoft', Icon: LogoMicrosoft },
  [OAuthProvider.TWITCH]: { displayName: 'Twitch', Icon: LogoTwitch },
  [OAuthProvider.BITBUCKET]: { displayName: 'Bitbucket', Icon: LogoBitBucket },
  [OAuthProvider.DISCORD]: { displayName: 'Discord', Icon: LogoDiscord },
  [OAuthProvider.GITLAB]: { displayName: 'GitLab', Icon: LogoGitLab },
  [OAuthProvider.TELEGRAM]: { displayName: 'Telegram', Icon: LogoTelegram },
};

export const DARK_MODE_ICON_OVERRIDES: Partial<Record<OAuthProvider, ProviderMetadata['Icon']>> = {
  [OAuthProvider.APPLE]: LogoAppleMono,
  [OAuthProvider.TWITTER]: LogoTwitterMono,
  [OAuthProvider.GITHUB]: LogoGitHubMono,
};

export const FARCASTER_METADATA: ProviderMetadata = {
  displayName: 'Farcaster',
  Icon: LogoWarpcast,
};

export const FARCASTER_BRAND_COLOR = '#855DCD';

// Farcaster logo for QR code center image
export const FARCASTER_LOGO_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI2IiBmaWxsPSIjODU1RENEIi8+PHBhdGggZD0iTTcuNSA4LjVoMTdWMTBoLTEuNWwxIDMuNWgtLjVhMyAzIDAgMCAwLTMgM3YyaC0ydi0yYTMgMyAwIDAgMC0zLTNoLS41bDEtMy41SDEzLjVsMS0xLjVoM2wxIDEuNWgtMS41bDEgMy41SC4wMDFhMyAzIDAgMCAwLTMgM3YyaC0ydi0yYTMgMyAwIDAgMC0zLTNoLS41bDEtMy41SDcuNVY4LjV6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==';

import { LoginProvider, ProviderConfig, ThirdPartyWallet, OAuthProvider } from '../types';
import { OAUTH_METADATA, WALLET_METADATA, FARCASTER_METADATA } from '../constants';

export function getProviderConfig(provider: LoginProvider | 'farcaster'): ProviderConfig {
  if (provider === 'farcaster') {
    return {
      title: `Sign in with ${FARCASTER_METADATA.displayName}`,
      description: `Scan QR code with Farcaster`,
      Icon: FARCASTER_METADATA.Icon,
    };
  }

  const isOAuth = Object.values(OAuthProvider).includes(provider as OAuthProvider);
  const metadata = isOAuth ? OAUTH_METADATA[provider as OAuthProvider] : WALLET_METADATA[provider as ThirdPartyWallet];

  const { displayName, Icon } = metadata;

  if (isOAuth) {
    return {
      title: `Log in with ${displayName}`,
      description: `Continue in ${displayName}`,
      Icon,
    };
  }

  return {
    title: `Continue in ${displayName}`,
    description: `Approve request in ${displayName}`,
    Icon,
  };
}

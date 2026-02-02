import { LoginProvider, ProviderConfig, ThirdPartyWallet, OAuthProvider } from '../types';
import { OAUTH_METADATA, WALLET_METADATA } from '../constants';

export function getProviderConfig(provider: LoginProvider): ProviderConfig {
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
